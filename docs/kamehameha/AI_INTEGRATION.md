# Kamehameha - AI Integration Guide

**Last Updated:** October 21, 2025  
**Version:** 1.0

## Overview

This document covers the integration of OpenAI's GPT-5 API for the AI therapist chat feature, including:
- Firebase Cloud Functions setup
- OpenAI API integration
- Context building strategy
- Rate limiting and cost control
- Error handling
- Testing

---

## Architecture

### High-Level Flow

```
User sends message
    ↓
Frontend → Firebase Cloud Function
    ↓
Cloud Function:
  1. Verifies user authentication
  2. Retrieves user context from Firestore
  3. Builds conversation context
  4. Calls OpenAI API
  5. Saves messages to Firestore
    ↓
Response → Frontend
```

### Why Cloud Functions?

1. **Security:** API keys never exposed to client
2. **Rate Limiting:** Enforce limits server-side
3. **Cost Control:** Monitor and limit usage
4. **Context Building:** Access Firestore securely
5. **Preprocessing:** Sanitize inputs, format outputs

---

## Setup

### Prerequisites

- Firebase project created
- Firebase CLI installed: `npm install -g firebase-tools`
- OpenAI API key
- Node.js 18+ (for Cloud Functions)

### Initialize Firebase Functions

```bash
# In project root
firebase init functions

# Select:
# - TypeScript
# - ESLint
# - Install dependencies
```

This creates:
```
functions/
├── src/
│   └── index.ts
├── package.json
├── tsconfig.json
└── .eslintrc.js
```

### Install Dependencies

```bash
cd functions
npm install openai
npm install firebase-admin
npm install firebase-functions
```

---

## Cloud Functions Implementation

### Main Chat Function

**File:** `functions/src/index.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import OpenAI from 'openai';

admin.initializeApp();
const db = admin.firestore();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: functions.config().openai.key,
});

export const chatWithTherapist = functions.https.onCall(
  async (data, context) => {
    // 1. Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const userId = context.auth.uid;
    const { message, emergency = false } = data;

    // 2. Validate input
    if (!message || typeof message !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Message is required'
      );
    }

    if (message.length > 2000) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Message too long (max 2000 characters)'
      );
    }

    try {
      // 3. Check rate limit
      await checkRateLimit(userId);

      // 4. Build context
      const contextData = await buildContext(userId, emergency);

      // 5. Save user message
      const userMessageRef = await db
        .collection(`users/${userId}/kamehameha/chatHistory`)
        .add({
          role: 'user',
          content: message,
          timestamp: Date.now(),
          emergency,
        });

      // 6. Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4', // or 'gpt-5' when available
        messages: [
          { role: 'system', content: contextData.systemPrompt },
          ...contextData.chatHistory,
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const aiResponse = completion.choices[0].message.content;

      // 7. Save AI response
      await db
        .collection(`users/${userId}/kamehameha/chatHistory`)
        .add({
          role: 'assistant',
          content: aiResponse,
          timestamp: Date.now(),
          emergency,
          tokenCount: completion.usage?.total_tokens,
        });

      // 8. Return response
      return {
        response: aiResponse,
        messageId: userMessageRef.id,
      };
    } catch (error: any) {
      console.error('Error in chatWithTherapist:', error);
      
      if (error.code === 'rate_limit_exceeded') {
        throw new functions.https.HttpsError(
          'resource-exhausted',
          'Rate limit exceeded. Please wait before sending more messages.'
        );
      }
      
      throw new functions.https.HttpsError(
        'internal',
        'Failed to process chat message'
      );
    }
  }
);
```

---

## Context Building

### Context Builder Function

**File:** `functions/src/contextBuilder.ts`

```typescript
import * as admin from 'firebase-admin';

const db = admin.firestore();

interface UserContext {
  systemPrompt: string;
  chatHistory: Array<{ role: string; content: string }>;
  streakInfo: string;
  recentCheckIns: string;
  recentRelapses: string;
  emergency: boolean;
}

export async function buildContext(
  userId: string,
  emergency: boolean
): Promise<UserContext> {
  // 1. Get user config (system prompt)
  const configDoc = await db
    .doc(`users/${userId}/kamehameha/config`)
    .get();
  const config = configDoc.data();
  let systemPrompt = config?.systemPrompt || getDefaultSystemPrompt();

  // 2. Get streaks
  const streaksDoc = await db
    .doc(`users/${userId}/kamehameha/streaks`)
    .get();
  const streaks = streaksDoc.data();
  const streakInfo = formatStreakInfo(streaks);

  // 3. Get recent check-ins (last 7 days)
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const checkInsSnapshot = await db
    .collection(`users/${userId}/kamehameha/checkIns`)
    .where('timestamp', '>=', sevenDaysAgo)
    .orderBy('timestamp', 'desc')
    .limit(10)
    .get();
  const recentCheckIns = formatCheckIns(checkInsSnapshot.docs);

  // 4. Get recent relapses (last 30 days)
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const relapsesSnapshot = await db
    .collection(`users/${userId}/kamehameha/relapses`)
    .where('timestamp', '>=', thirtyDaysAgo)
    .orderBy('timestamp', 'desc')
    .limit(5)
    .get();
  const recentRelapses = formatRelapses(relapsesSnapshot.docs);

  // 5. Get recent chat history (last 10 messages)
  const chatSnapshot = await db
    .collection(`users/${userId}/kamehameha/chatHistory`)
    .orderBy('timestamp', 'desc')
    .limit(10)
    .get();
  const chatHistory = chatSnapshot.docs
    .reverse()
    .map(doc => {
      const data = doc.data();
      return {
        role: data.role,
        content: data.content,
      };
    });

  // 6. Append context to system prompt
  const contextualPrompt = `${systemPrompt}

CURRENT USER CONTEXT:
${streakInfo}

${recentCheckIns}

${recentRelapses}

${emergency ? '\n⚠️ EMERGENCY MODE: User is experiencing high urges. Provide immediate support, grounding techniques, and crisis management.' : ''}
`;

  return {
    systemPrompt: contextualPrompt,
    chatHistory: chatHistory.slice(-10), // Last 10 messages
    streakInfo,
    recentCheckIns,
    recentRelapses,
    emergency,
  };
}

function formatStreakInfo(streaks: any): string {
  if (!streaks) return 'No streak data available.';

  const mainDays = Math.floor(streaks.main.currentSeconds / 86400);
  const disciplineDays = Math.floor(
    streaks.discipline.currentSeconds / 86400
  );

  return `User's Streaks:
- Main Streak: ${mainDays} days (longest: ${Math.floor(streaks.main.longestSeconds / 86400)} days)
- Discipline Streak: ${disciplineDays} days (longest: ${Math.floor(streaks.discipline.longestSeconds / 86400)} days)`;
}

function formatCheckIns(docs: any[]): string {
  if (docs.length === 0) return 'No recent check-ins.';

  const checkIns = docs.map(doc => {
    const data = doc.data();
    const date = new Date(data.timestamp).toLocaleDateString();
    const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];
    return `- ${date}: Mood ${moodEmojis[data.mood - 1]}, Urges ${data.urgeIntensity}/10, Triggers: ${data.triggers.join(', ')}`;
  });

  return `Recent Check-ins (last 7 days):
${checkIns.join('\n')}`;
}

function formatRelapses(docs: any[]): string {
  if (docs.length === 0) return 'No recent relapses (great job!).';

  const relapses = docs.map(doc => {
    const data = doc.data();
    const date = new Date(data.timestamp).toLocaleDateString();
    return `- ${date}: ${data.type} relapse, Reasons: ${data.reasons.join(', ')}`;
  });

  return `Recent Relapses (last 30 days):
${relapses.join('\n')}`;
}

function getDefaultSystemPrompt(): string {
  return `You are a compassionate and professional PMO (Pornography-Masturbation-Orgasm) recovery therapist with expertise in:
- Addiction recovery and relapse prevention
- Cognitive Behavioral Therapy (CBT)
- Mindfulness and meditation techniques
- Habit formation and breaking
- Emotional regulation
- Shame resilience

Your approach:
1. Be non-judgmental and supportive
2. Validate user's feelings and struggles
3. Provide practical, actionable strategies
4. Encourage self-compassion and progress over perfection
5. Help identify triggers and patterns
6. Teach coping mechanisms
7. Celebrate successes, no matter how small

When user is in crisis:
- Provide immediate grounding techniques
- Offer breathing exercises
- Help them delay and distract
- Remind them of their progress and reasons for recovery
- Be a calm, reassuring presence

Remember:
- Recovery is not linear; setbacks are learning opportunities
- Every day clean is a victory
- The user is already taking positive steps by being here`;
}
```

---

## Rate Limiting

### Implementation

**File:** `functions/src/rateLimit.ts`

```typescript
import * as admin from 'firebase-admin';

const db = admin.firestore();

interface RateLimitData {
  count: number;
  resetAt: number;
}

// Limits: 50 messages per hour per user
const MESSAGE_LIMIT = 50;
const LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

export async function checkRateLimit(userId: string): Promise<void> {
  const rateLimitRef = db.doc(`rateLimits/chat_${userId}`);
  const now = Date.now();

  await db.runTransaction(async transaction => {
    const doc = await transaction.get(rateLimitRef);

    if (!doc.exists) {
      // First message, create rate limit record
      transaction.set(rateLimitRef, {
        count: 1,
        resetAt: now + LIMIT_WINDOW,
      });
      return;
    }

    const data = doc.data() as RateLimitData;

    // Check if window has expired
    if (now > data.resetAt) {
      // Reset the counter
      transaction.set(rateLimitRef, {
        count: 1,
        resetAt: now + LIMIT_WINDOW,
      });
      return;
    }

    // Check if limit exceeded
    if (data.count >= MESSAGE_LIMIT) {
      const waitTime = Math.ceil((data.resetAt - now) / 1000 / 60);
      throw new Error(
        `Rate limit exceeded. Please wait ${waitTime} minutes.`
      );
    }

    // Increment counter
    transaction.update(rateLimitRef, {
      count: data.count + 1,
    });
  });
}
```

---

## Configuration

### Setting API Key

```bash
# Set OpenAI API key
firebase functions:config:set openai.key="sk-..."

# Verify
firebase functions:config:get
```

### Environment Variables

For local development, create `functions/.env`:

```
OPENAI_API_KEY=sk-...
```

And update local config:

```typescript
// functions/src/index.ts
import * as dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || functions.config().openai.key,
});
```

---

## Cost Optimization

### Strategies

1. **Limit Token Usage:**
   - Max tokens per response: 500
   - Truncate long chat histories
   - Summarize old context

2. **Cache Responses:**
   - Cache system prompts
   - Cache user context for 1 minute
   - Reuse context within same session

3. **Model Selection:**
   - Use GPT-4 Turbo for better cost/performance
   - Consider GPT-3.5 Turbo for non-critical responses

4. **Rate Limiting:**
   - 50 messages/hour per user
   - Daily limits per account
   - Warn users of approaching limits

### Cost Estimation

**GPT-4 Pricing (as of 2025):**
- Input: $0.03 per 1K tokens
- Output: $0.06 per 1K tokens

**Average Chat Session:**
- System prompt + context: ~500 tokens
- User message: ~50 tokens
- AI response: ~200 tokens
- Total: ~750 tokens per exchange

**Cost per message:** ~$0.035

**Monthly cost (50 users, 10 messages/week each):**
- 50 users × 10 messages/week × 4 weeks = 2,000 messages/month
- 2,000 × $0.035 = **$70/month**

---

## Error Handling

### Common Errors

```typescript
try {
  const completion = await openai.chat.completions.create({...});
} catch (error: any) {
  if (error.code === 'rate_limit_exceeded') {
    // OpenAI rate limit
    return {
      error: 'OpenAI API rate limit exceeded. Please try again in a moment.'
    };
  }
  
  if (error.code === 'insufficient_quota') {
    // No credits
    return {
      error: 'OpenAI API quota exceeded. Please contact support.'
    };
  }
  
  if (error.code === 'invalid_api_key') {
    // Bad API key
    console.error('Invalid OpenAI API key');
    return {
      error: 'Service configuration error. Please contact support.'
    };
  }
  
  // Generic error
  console.error('OpenAI API error:', error);
  return {
    error: 'Failed to generate response. Please try again.'
  };
}
```

---

## Testing

### Local Testing

```bash
# Start Firebase emulators
firebase emulators:start --only functions,firestore

# Test function
curl -X POST \
  http://localhost:5001/YOUR_PROJECT/us-central1/chatWithTherapist \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "message": "Hello, I need support",
      "emergency": false
    }
  }'
```

### Unit Tests

**File:** `functions/src/test/chatWithTherapist.test.ts`

```typescript
import { chatWithTherapist } from '../index';
import * as admin from 'firebase-admin';

describe('chatWithTherapist', () => {
  beforeAll(() => {
    admin.initializeApp();
  });

  it('should require authentication', async () => {
    const context = { auth: null };
    const data = { message: 'Hello' };

    await expect(
      chatWithTherapist(data, context as any)
    ).rejects.toThrow('unauthenticated');
  });

  it('should validate message length', async () => {
    const context = { auth: { uid: 'test-user' } };
    const data = { message: 'a'.repeat(2001) };

    await expect(
      chatWithTherapist(data, context as any)
    ).rejects.toThrow('Message too long');
  });

  // More tests...
});
```

---

## Deployment

### Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:chatWithTherapist
```

### Monitor Logs

```bash
# View logs
firebase functions:log

# Follow logs in real-time
firebase functions:log --follow
```

### Monitoring

Use Firebase Console to monitor:
- Invocations count
- Error rate
- Execution time
- Memory usage

Set up alerts for:
- Error rate > 5%
- Cost > $100/month
- Latency > 5 seconds

---

## Frontend Integration

### Calling Cloud Function

**File:** `src/features/kamehameha/services/aiChatService.ts`

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const chatWithTherapist = httpsCallable(functions, 'chatWithTherapist');

export async function sendChatMessage(
  message: string,
  emergency: boolean = false
): Promise<string> {
  try {
    const result = await chatWithTherapist({
      message,
      emergency,
    });

    return (result.data as any).response;
  } catch (error: any) {
    if (error.code === 'unauthenticated') {
      throw new Error('Please sign in to use chat');
    }

    if (error.code === 'resource-exhausted') {
      throw new Error('Rate limit exceeded. Please wait before sending more messages.');
    }

    throw new Error('Failed to send message. Please try again.');
  }
}
```

### Usage in Component

```typescript
// src/features/kamehameha/components/ChatInput.tsx
import { sendChatMessage } from '../services/aiChatService';

const [message, setMessage] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const handleSend = async () => {
  if (!message.trim()) return;

  setLoading(true);
  setError('');

  try {
    const response = await sendChatMessage(message, emergencyMode);
    
    // Add messages to UI
    addMessage({ role: 'user', content: message });
    addMessage({ role: 'assistant', content: response });
    
    setMessage('');
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

---

## Security Best Practices

1. **Never Expose API Key:**
   - Store in Cloud Functions config only
   - Never commit to version control
   - Never send to frontend

2. **Validate All Inputs:**
   - Message length
   - User authentication
   - Rate limits

3. **Sanitize User Data:**
   - Remove PII from logs
   - Encrypt sensitive data
   - Validate context data

4. **Monitor Usage:**
   - Track API calls
   - Alert on unusual patterns
   - Set spending limits

5. **Handle Errors Gracefully:**
   - Don't expose internal errors to users
   - Log errors for debugging
   - Provide helpful error messages

---

## Related Documentation

- [DATA_SCHEMA.md](DATA_SCHEMA.md) - Firestore structure
- [SECURITY.md](SECURITY.md) - Security and privacy
- [SPEC.md](SPEC.md) - Feature requirements
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Firebase Functions Docs](https://firebase.google.com/docs/functions)

---

**Next:** Read [SECURITY.md](SECURITY.md) for security and privacy considerations.

