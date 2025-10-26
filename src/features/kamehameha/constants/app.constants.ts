/**
 * Application Constants - Named constants for timing, limits, and timeouts.
 */

/** Time intervals for operations (milliseconds) */
export const INTERVALS = {
  /** Display update interval (1 second) */
  UPDATE_DISPLAY_MS: 1000,
  
  /** Milestone check interval (1 second) */
  MILESTONE_CHECK_MS: 1000,
} as const;

/** Feature limits */
export const LIMITS = {
  /** Maximum AI chat message length */
  MAX_MESSAGE_LENGTH: 2000,
  
  /** Rate limit: messages per minute */
  RATE_LIMIT_MESSAGES_PER_MIN: 10,
} as const;

/** UI feedback timeouts (milliseconds) */
export const TIMEOUTS = {
  /** Success message display duration */
  SUCCESS_MESSAGE_MS: 3000,
  
  /** Error message display duration */
  ERROR_MESSAGE_MS: 5000,
  
  /** Toast notification duration */
  TOAST_DURATION_MS: 3000,
  
  /** Celebration modal auto-close duration */
  CELEBRATION_DURATION_MS: 5000,
} as const;

/**
 * Time conversions (for calculations)
 */
export const TIME = {
  /** Milliseconds in one second */
  MS_PER_SECOND: 1000,
  
  /** Seconds in one minute */
  SECONDS_PER_MINUTE: 60,
  
  /** Minutes in one hour */
  MINUTES_PER_HOUR: 60,
  
  /** Hours in one day */
  HOURS_PER_DAY: 24,
  
  /** Days in one week */
  DAYS_PER_WEEK: 7,
  
  /** Seconds in one day */
  SECONDS_PER_DAY: 86400,
} as const;

