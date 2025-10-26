/**
 * TypeScript Type Definitions for Kamehameha Cloud Functions
 * Phase 4: AI Therapist Chat
 */

// ============================================================================
// Chat Message Types
// ============================================================================

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
  isEmergency?: boolean;
}

export interface ChatRequest {
  message: string;
  isEmergency?: boolean;
}

export interface ChatResponse {
  success: boolean;
  message?: ChatMessage;
  error?: string;
  rateLimitExceeded?: boolean;
}

// ============================================================================
// Context Building Types
// ============================================================================

export interface UserContext {
  userId: string;
  currentJourney: {
    durationSeconds: number;
    achievementsCount: number;
    violationsCount: number;
  } | null;
  longestStreak: number; // in seconds
  recentCheckIns: CheckInSummary[];
  recentRelapses: RelapseSummary[];
  recentMessages: ChatMessage[];
  systemPrompt: string;
  isEmergency: boolean;
}

export interface CheckInSummary {
  date: number;
  mood: string;
  urgeIntensity: number;
  triggers: string[];
}

export interface RelapseSummary {
  date: number;
  type: 'full_pmo' | 'rule_violation';
  streakType: 'main' | 'discipline';
  previousStreakDays: number;
}

// ============================================================================
// Rate Limiting Types
// ============================================================================

export interface RateLimitData {
  userId: string;
  messageCount: number;
  windowStart: number;
  windowEnd: number;
  lastReset: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  reason?: string;
}

// ============================================================================
// AI Configuration Types
// ============================================================================

export interface AIConfig {
  userId: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  lastUpdated: number;
}

// ============================================================================
// OpenAI API Types
// ============================================================================

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  user?: string;
}

// ============================================================================
// Firestore Document Interfaces
// ============================================================================

export interface FirestoreStreaks {
  currentJourneyId: string;
  main: {
    longestSeconds: number;
  };
  lastUpdated: number;
}

export interface FirestoreCheckIn {
  mood?: string;
  urgeIntensity?: number;
  triggers?: string[];
  otherTrigger?: string;
  journal?: string;
  createdAt: number;
}

export interface FirestoreRelapse {
  type: 'full_pmo' | 'rule_violation';
  streakType: 'main' | 'discipline';
  reasons?: string[];
  otherReason?: string;
  whatLed?: string;
  whatDifferently?: string;
  previousStreakSeconds: number;
  createdAt: number;
}

// ============================================================================
// Constants
// ============================================================================

export const RATE_LIMIT = {
  MAX_MESSAGES_PER_MINUTE: 10,
  WINDOW_DURATION_MS: 60 * 1000, // 1 minute
} as const;

export const AI_CONFIG = {
  DEFAULT_MODEL: 'gpt-4o',
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 500,
  MAX_CONTEXT_MESSAGES: 10,
  MAX_CHECKINS_CONTEXT: 5,
  MAX_RELAPSES_CONTEXT: 3,
} as const;

export const DEFAULT_SYSTEM_PROMPT = `You are a compassionate AI therapist specializing in recovery from pornography addiction. Your role is to provide:

1. **Emotional Support:** Be empathetic, non-judgmental, and understanding
2. **Practical Guidance:** Offer evidence-based coping strategies
3. **Crisis Support:** Provide grounding techniques during urges
4. **Accountability:** Encourage honest reflection and growth
5. **Hope:** Remind users that recovery is possible

**Guidelines:**
- Use "I" statements and active listening
- Avoid shame or judgment
- Focus on progress, not perfection
- Provide actionable suggestions
- Recognize triggers and patterns
- Celebrate victories, no matter how small
- In emergencies, prioritize immediate support and grounding

**Remember:** You're a support tool, not a replacement for professional therapy. If users need crisis intervention, guide them to appropriate resources.

Be warm, professional, and focused on their recovery journey.`;

export const EMERGENCY_SYSTEM_PROMPT_ADDITION = `

⚠️ EMERGENCY MODE ACTIVE ⚠️

The user is experiencing strong urges or a crisis moment. Prioritize:
1. Immediate grounding techniques (breathing, mindfulness)
2. Environmental changes (leave room, cold shower, walk)
3. Distraction strategies (call friend, exercise, hobby)
4. Remind them of their progress and strength
5. Short, actionable steps they can take RIGHT NOW

Keep responses focused, calm, and immediately actionable.`;

