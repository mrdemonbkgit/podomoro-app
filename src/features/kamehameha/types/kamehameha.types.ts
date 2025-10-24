/**
 * Kamehameha - TypeScript Type Definitions
 * 
 * This file contains all type definitions for the Kamehameha recovery tool.
 */

// ============================================================================
// Streak Types
// ============================================================================

/**
 * Core streak data stored in Firestore (Simplified in Phase 5.1 Refactor)
 * 
 * No longer stores current timing data - timing calculated from journey.startDate
 */
export interface StreakData {
  /** Longest streak ever achieved in seconds (all-time record) */
  longestSeconds: number;
}

/**
 * Complete streaks document structure (Simplified in Phase 5.1 Refactor)
 * 
 * Acts as a pointer to the current journey + historical records
 * All timing data calculated from journey.startDate
 */
export interface Streaks {
  /** Current journey ID (Phase 5.1) */
  currentJourneyId?: string;
  /** PMO (Porn, Masturbation, Orgasm) streak record */
  main: StreakData;
  /** Last update timestamp for the entire document */
  lastUpdated: number;
}

/**
 * Formatted streak display for UI
 */
export interface StreakDisplay {
  /** Number of complete days */
  days: number;
  /** Remaining hours (0-23) */
  hours: number;
  /** Remaining minutes (0-59) */
  minutes: number;
  /** Remaining seconds (0-59) */
  seconds: number;
  /** Total duration in seconds */
  totalSeconds: number;
  /** Formatted string for display: "15d 4h 23m 15s" */
  formatted: string;
  /** Human-readable format: "15 days, 4 hours, 23 minutes" */
  humanReadable: string;
}

// ============================================================================
// Check-In Types (Phase 3)
// ============================================================================

/**
 * Mood rating for check-ins (1-5 scale)
 */
export type Mood = 'veryBad' | 'bad' | 'neutral' | 'good' | 'veryGood';

/**
 * Common triggers for urges
 */
export type Trigger = 
  | 'stress' 
  | 'boredom' 
  | 'loneliness' 
  | 'anger' 
  | 'tired'
  | 'other';

/**
 * Mood emoji mapping for UI
 */
export const MOOD_EMOJIS: Record<Mood, string> = {
  veryBad: '😢',
  bad: '😕',
  neutral: '😐',
  good: '🙂',
  veryGood: '😊',
};

/**
 * Daily check-in data
 * All fields except timestamp are optional
 */
export interface CheckIn {
  /** Unique ID */
  id: string;
  /** When check-in was created (milliseconds) */
  timestamp: number;
  /** User's mood (optional) */
  mood?: Mood;
  /** Urge intensity 0-10 (optional) */
  urgeIntensity?: number;
  /** Experienced triggers (optional) */
  triggers?: Trigger[];
  /** Other trigger description (if 'other' selected) */
  otherTrigger?: string;
  /** Journal entry (optional) */
  journalEntry?: string;
  /** Firestore creation timestamp */
  createdAt: number;
}

// ============================================================================
// Relapse Types (Phase 3)
// ============================================================================

/**
 * Type of relapse event
 */
export type RelapseType = 'fullPMO' | 'ruleViolation';

/**
 * Which streak is affected (legacy field - only 'main' actually resets now)
 * 'discipline' is for categorization only
 */
export type StreakType = 'main' | 'discipline';

/**
 * Default rule violation options
 */
export const DEFAULT_RULE_VIOLATIONS = [
  'Viewed pornography',
  'Used AI sex chatbot',
  'Generated AI softcore porn',
  'Consumed text/audio erotica',
  'TikTok/social media triggers',
  'Other',
] as const;

/**
 * Relapse tracking data
 */
export interface Relapse {
  /** Unique ID */
  id: string;
  /** Journey this relapse belongs to (Phase 5.1) */
  journeyId?: string;
  /** When relapse occurred (milliseconds) */
  timestamp: number;
  /** Type of relapse */
  type: RelapseType;
  /** Which streak resets */
  streakType: StreakType;
  /** Previous streak length in seconds (before reset) */
  previousStreakSeconds: number;
  /** Reasons for rule violation (if type is ruleViolation) */
  reasons?: string[];
  /** Optional reflection on the relapse */
  reflection?: {
    /** What led to this moment */
    whatLed: string;
    /** What will you do differently next time */
    whatNext: string;
  };
  /** Firestore creation timestamp */
  createdAt: number;
}

// ============================================================================
// Milestone & Badge Types (Phase 5)
// ============================================================================

/**
 * Badge earned when reaching a milestone
 * Stored in Firestore: users/{userId}/kamehameha_badges/{badgeId}
 */
export interface Badge {
  /** Document ID */
  id: string;
  /** Journey this badge belongs to (Phase 5.1) */
  journeyId?: string;
  /** Which streak this badge is for (deprecated - all badges are for main streak now) */
  streakType?: 'main' | 'discipline';
  /** Milestone threshold in seconds */
  milestoneSeconds: number;
  /** When the badge was earned (milliseconds) */
  earnedAt: number;
  /** Badge emoji (e.g., '🌱', '💪') */
  badgeEmoji: string;
  /** Badge name (e.g., 'First Step', 'One Week Warrior') */
  badgeName: string;
  /** Congratulations message */
  congratsMessage: string;
}

/**
 * Milestone configuration for UI
 */
export interface MilestoneConfig {
  /** Milestone threshold in seconds */
  seconds: number;
  /** Milestone name */
  name: string;
  /** Badge emoji */
  emoji: string;
  /** Congratulations message */
  message: string;
}

/**
 * @deprecated Use Badge instead (Phase 5.1: Only main streak badges now)
 */
export interface Milestone {
  id: string;
  days: number; // 1, 3, 7, 14, 30, 60, 90, 180, 365
  achievedAt: number;
  badge: string; // Badge emoji/icon
  title: string;
  description: string;
}

// ============================================================================
// Journey Types (Phase 5.1)
// ============================================================================

/**
 * Journey represents one complete PMO streak period from start to end
 * Each journey has its own badges and tracks violations for context
 * Stored in Firestore: users/{userId}/kamehameha_journeys/{journeyId}
 */
export interface Journey {
  /** Document ID */
  id: string;
  /** When journey started (milliseconds) */
  startDate: number;
  /** When journey ended (null if currently active) */
  endDate: number | null;
  /** Why the journey ended */
  endReason: 'active' | 'relapse';
  /** Final duration in seconds */
  finalSeconds: number;
  /** Number of badges earned during this journey */
  achievementsCount: number;
  /** Number of rule violations logged during this journey (for analysis) */
  violationsCount: number;
  /** Firestore creation timestamp */
  createdAt: number;
  /** Firestore last update timestamp */
  updatedAt: number;
}

// ============================================================================
// Config Types
// ============================================================================

export interface KamehamehaConfig {
  /** Custom rule violations (for logging and AI context) */
  customRules: string[];
  /** AI system prompt (Phase 4) */
  aiSystemPrompt: string;
  /** Notification preferences */
  notifications: {
    checkInReminders: boolean;
    milestoneAlerts: boolean;
    emergencyMode: boolean;
  };
  /** Created/updated timestamps */
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// Chat Types (Phase 4)
// ============================================================================

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
  /** Emergency mode flag for crisis situations */
  isEmergency?: boolean;
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseStreaksReturn {
  /** Current streak data */
  streaks: Streaks | null;
  /** Formatted main streak for display */
  mainDisplay: StreakDisplay | null;
  /** Current journey ID (Phase 5.1) */
  currentJourneyId: string | null;
  /** Current journey start date (Phase 5.1 Refactor) */
  journeyStartDate: number | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Reset main streak (marks relapse) */
  resetMainStreak: () => Promise<void>;
  /** Manually refresh streaks from Firestore */
  refreshStreaks: () => Promise<void>;
}

export interface UseBadgesReturn {
  /** All earned badges */
  badges: Badge[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Current celebration badge (if any) */
  celebrationBadge: Badge | null;
  /** Dismiss the celebration modal */
  dismissCelebration: () => void;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Firestore timestamp (milliseconds since epoch)
 */
export type Timestamp = number;

/**
 * Streak variant for styling (alias of StreakType)
 */
export type StreakVariant = StreakType;

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark';

