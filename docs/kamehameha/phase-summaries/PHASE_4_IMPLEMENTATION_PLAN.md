# Phase 4: AI Therapist Chat - Implementation Plan

**Date:** October 21, 2025  
**Status:** Planning → Implementation  
**Estimated Duration:** 4-5 hours (following Phase 3 efficiency)

---

## 🎯 Goals

Build a compassionate AI therapist chat that:
1. Provides 24/7 support during urges and difficult moments
2. Uses context from user's streaks, check-ins, and relapses
3. Includes emergency mode for crisis support
4. Maintains conversation history
5. Allows customizable system prompts

---

## 📋 Implementation Steps

### Part 1: Firebase Cloud Functions Setup (45 min)

**Step 1.1: Initialize Firebase Functions**
```bash
firebase init functions
# Select TypeScript, ESLint, install dependencies
```

**Step 1.2: Install Dependencies**
```bash
cd functions
npm install openai firebase-admin firebase-functions
```

**Step 1.3: Set OpenAI API Key**
```bash
firebase functions:config:set openai.key="sk-..."
```

**Files to Create:**
- `functions/src/index.ts` - Main chat function
- `functions/src/contextBuilder.ts` - Build conversation context
- `functions/src/rateLimit.ts` - Rate limiting logic
- `functions/src/types.ts` - TypeScript types

---

### Part 2: Cloud Function Implementation (1.5 hours)

**2.1: Main Chat Function**
- HTTP callable function
- Verify user authentication
- Rate limiting (10 messages/min per user)
- Call OpenAI API with context
- Save messages to Firestore
- Stream responses (optional)

**2.2: Context Builder**
- Fetch user's current streaks
- Get recent check-ins (last 7 days)
- Get recent relapses (if any)
- Get last 10 chat messages
- Build system prompt with context
- Handle emergency mode flag

**2.3: Rate Limiting**
- Track messages per user per time window
- Return error if rate exceeded
- Store rate limit data in Firestore

**Firestore Collections:**
- `users/{userId}/kamehameha_chatHistory` - Chat messages
- `users/{userId}/kamehameha_rateLimits` - Rate limit tracking
- `users/{userId}/kamehameha_config` - System prompt config

---

### Part 3: Frontend Chat Interface (1.5 hours)

**3.1: Chat Page (`ChatPage.tsx`)**
- Full-page layout with header
- Emergency button in header
- Messages area (scrollable)
- Input area at bottom
- Loading states
- Error handling

**3.2: Chat Messages (`ChatMessages.tsx`)**
- Display user and AI messages
- WhatsApp-like bubbles (user right, AI left)
- Timestamps
- Auto-scroll to latest
- Loading indicator for AI response

**3.3: Chat Input (`ChatInput.tsx`)**
- Textarea with auto-expand
- Send button
- Enter to send, Shift+Enter for new line
- Character limit (2000)
- Disable during loading

**3.4: Emergency Button (`EmergencyButton.tsx`)**
- Toggle emergency mode
- Visual indicator when active
- Adds flag to context

---

### Part 4: Chat Service (30 min)

**4.1: AI Chat Service (`aiChatService.ts`)**
- `sendMessage(userId, message, isEmergency)` - Send to Cloud Function
- `getChatHistory(userId)` - Fetch messages
- `deleteMessage(userId, messageId)` - Delete message
- `clearChatHistory(userId)` - Clear all messages
- Real-time listener for new messages

---

### Part 5: System Prompt Management (30 min)

**5.1: AI Config Component (`AIConfig.tsx`)**
- Modal or settings section
- Large textarea for system prompt
- Character count
- Preview mode (future)
- Save to Firestore
- Reset to default button

**5.2: Default System Prompt**
- Compassionate, non-judgmental tone
- Recovery-focused guidance
- Grounding techniques for urges
- Encouragement and support

---

### Part 6: Integration & Testing (1 hour)

**6.1: Add Chat Route**
- Update React Router with `/kamehameha/chat`
- Link from KamehamehaPage
- Protected route (auth required)

**6.2: Test Chat Flow**
- Send basic messages
- Test emergency mode
- Verify context is included
- Check message history persists
- Test rate limiting

**6.3: Error Handling**
- Network errors
- Rate limit errors
- OpenAI API errors
- Empty message validation

---

## 🏗️ File Structure

```
functions/
├── src/
│   ├── index.ts                 # Main chat function
│   ├── contextBuilder.ts        # Build AI context
│   ├── rateLimit.ts            # Rate limiting
│   └── types.ts                # TypeScript types
├── package.json
└── tsconfig.json

src/features/kamehameha/
├── pages/
│   └── ChatPage.tsx            # Main chat page
├── components/
│   ├── ChatMessages.tsx        # Message display
│   ├── ChatInput.tsx           # Input area
│   ├── EmergencyButton.tsx     # Emergency toggle
│   └── AIConfig.tsx            # System prompt editor
├── services/
│   └── aiChatService.ts        # Chat API service
└── types/
    └── (update kamehameha.types.ts with chat types)
```

---

## 📊 Data Schema Additions

### ChatMessage
```typescript
interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  isEmergency?: boolean;
}
```

### AIConfig
```typescript
interface AIConfig {
  userId: string;
  systemPrompt: string;
  lastUpdated: number;
}
```

### RateLimit
```typescript
interface RateLimit {
  userId: string;
  messageCount: number;
  windowStart: number;
  windowEnd: number;
}
```

---

## 🔐 Security Considerations

1. **API Key Protection:**
   - Never expose OpenAI key in frontend
   - Use Firebase Functions Config
   - Only callable by authenticated users

2. **Rate Limiting:**
   - 10 messages per minute per user
   - Prevent abuse and control costs
   - Track in Firestore

3. **Input Validation:**
   - Sanitize user messages
   - Character limits (2000 per message)
   - Reject empty/whitespace-only messages

4. **Firestore Rules:**
   - Users can only read/write their own chat history
   - System prompts user-specific
   - Rate limits server-enforced

---

## 💰 Cost Management

**OpenAI Pricing (GPT-4/5):**
- Input: ~$0.03 per 1K tokens
- Output: ~$0.06 per 1K tokens

**Estimated Usage:**
- Average message: 100 tokens input + 200 tokens output = 300 tokens
- Cost per message: ~$0.015
- 100 messages/day = $1.50/day = $45/month per active user

**Cost Control Measures:**
1. Rate limiting (10 msg/min)
2. Context pruning (last 10 messages only)
3. Token limits in API calls
4. Monitor usage via Firebase Console

---

## ✅ Acceptance Criteria

- [ ] Firebase Functions initialized and deployed
- [ ] OpenAI API key configured
- [ ] Chat function accepts messages and returns responses
- [ ] Context includes streaks, check-ins, relapses
- [ ] Chat UI displays messages correctly
- [ ] User and AI messages visually distinct
- [ ] Emergency button works and affects responses
- [ ] Message history persists across sessions
- [ ] Rate limiting prevents abuse
- [ ] System prompt editable and saveable
- [ ] Works on mobile and desktop
- [ ] Loading states during API calls
- [ ] Error handling for all edge cases

---

## 🎯 Success Metrics

**Phase 4 Complete When:**
1. ✅ User can send messages to AI therapist
2. ✅ AI responds with contextual, compassionate replies
3. ✅ Emergency mode provides immediate support
4. ✅ Chat history saved and retrievable
5. ✅ System prompt customizable
6. ✅ All TypeScript checks passing
7. ✅ Zero console errors
8. ✅ Deployed to Firebase

---

## 🚀 Next Steps After Phase 4

**Phase 5: Milestones & Gamification**
- Milestone tiers and detection
- Celebration animations
- Badge gallery
- Progress visualizations

---

## 📝 Notes

- **Budget:** User is budget-conscious, monitor OpenAI costs
- **Privacy:** User is privacy-focused, ensure data security
- **New to Firebase:** Provide clear explanations for Cloud Functions
- **OpenAI Key Ready:** User has API key prepared

---

**Let's build a compassionate AI therapist! 💜**

