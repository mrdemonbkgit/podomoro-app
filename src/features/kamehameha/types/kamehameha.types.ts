/**
 * Kamehameha - TypeScript Type Definitions
 * 
 * This file contains all type definitions for the Kamehameha recovery tool.
 */

// ============================================================================
// Streak Types
// ============================================================================

/**
 * Core streak data stored in Firestore
 */
export interface StreakData {
  /** Unix timestamp when streak started (milliseconds) */
  startDate: number;
  /** Current streak length in seconds */
  currentSeconds: number;
  /** Longest streak ever achieved in seconds */
  longestSeconds: number;
  /** Last time this streak was calculated/updated */
  lastUpdated: number;
}

/**
 * Complete streaks document structure
 */
export interface Streaks {
  /** PMO (Porn, Masturbation, Orgasm) main recovery streak */
  main: StreakData;
  /** Discipline streak (resets on any rule violation) */
  discipline: StreakData;
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
 * Which streak is affected by relapse
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
// Milestone Types (Phase 5)
// ============================================================================

export interface Milestone {
  id: string;
  streakType: 'main' | 'discipline';
  days: number; // 1, 3, 7, 14, 30, 60, 90, 180, 365
  achievedAt: number;
  badge: string; // Badge emoji/icon
  title: string;
  description: string;
}

// ============================================================================
// Config Types
// ============================================================================

export interface KamehamehaConfig {
  /** Custom rules for discipline streak */
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
  /** Formatted discipline streak for display */
  disciplineDisplay: StreakDisplay | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Reset main streak (marks relapse) */
  resetMainStreak: () => Promise<void>;
  /** Reset discipline streak (marks rule violation) */
  resetDisciplineStreak: () => Promise<void>;
  /** Manually refresh streaks from Firestore */
  refreshStreaks: () => Promise<void>;
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

