/**
 * Frontend Milestone Constants
 * 
 * Defines milestone thresholds and configurations for the UI
 * 
 * ⚠️ SYNC WARNING: This file must be kept in sync with:
 * Backend: functions/src/milestoneConstants.ts
 * 
 * When updating milestones:
 * 1. Update BOTH files (frontend + backend)
 * 2. Run: npm run test:milestones
 * 3. Ensure test passes before committing
 * 
 * DO NOT modify one without the other!
 */

import type { MilestoneConfig } from '../types/kamehameha.types';

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

/**
 * Milestone thresholds in seconds
 * Development: 1 min, 5 min for easy testing
 * Production: 1 day, 3 days, 7 days, etc.
 */
export const MILESTONE_SECONDS = isDevelopment
  ? [60, 300] // Dev: 1 min, 5 min
  : [
      86400,    // 1 day
      259200,   // 3 days
      604800,   // 7 days
      1209600,  // 14 days
      2592000,  // 30 days
      5184000,  // 60 days
      7776000,  // 90 days
      15552000, // 180 days
      31536000, // 365 days
    ];

/**
 * Milestone configurations for UI display
 */
export const MILESTONE_CONFIGS: Record<number, MilestoneConfig> = {
  // Development badges
  60: {
    seconds: 60,
    emoji: '⚡',
    name: 'One Minute Wonder',
    message: "You've reached 1 minute! Every second counts.",
  },
  300: {
    seconds: 300,
    emoji: '💪',
    name: 'Five Minute Fighter',
    message: "5 minutes strong! You're building momentum.",
  },
  // Production badges
  86400: {
    seconds: 86400,
    emoji: '🌱',
    name: 'First Step',
    message: "You've completed your first day! This is the beginning of something great.",
  },
  259200: {
    seconds: 259200,
    emoji: '💪',
    name: 'Building Momentum',
    message: "3 days strong! You're proving your commitment.",
  },
  604800: {
    seconds: 604800,
    emoji: '⚔️',
    name: 'One Week Warrior',
    message: "A full week! You're a warrior on this journey.",
  },
  1209600: {
    seconds: 1209600,
    emoji: '🏆',
    name: 'Two Week Champion',
    message: "2 weeks of dedication! You're unstoppable.",
  },
  2592000: {
    seconds: 2592000,
    emoji: '👑',
    name: 'Monthly Master',
    message: "30 days! You've mastered the first month.",
  },
  5184000: {
    seconds: 5184000,
    emoji: '🌟',
    name: 'Two Month Legend',
    message: "60 days of strength! You're becoming legendary.",
  },
  7776000: {
    seconds: 7776000,
    emoji: '💎',
    name: 'Three Month Diamond',
    message: "90 days! Your dedication shines like a diamond.",
  },
  15552000: {
    seconds: 15552000,
    emoji: '🦅',
    name: 'Half Year Hero',
    message: "180 days! You're soaring to new heights.",
  },
  31536000: {
    seconds: 31536000,
    emoji: '🔥',
    name: 'One Year Phoenix',
    message: "365 days! You've risen like a phoenix. Incredible!",
  },
};

/**
 * Get milestone configuration by seconds
 */
export function getMilestoneConfig(milestoneSeconds: number): MilestoneConfig {
  return MILESTONE_CONFIGS[milestoneSeconds] || {
    seconds: milestoneSeconds,
    emoji: '🎯',
    name: 'Achievement Unlocked',
    message: 'Congratulations on reaching this milestone!',
  };
}

/**
 * Get next milestone for a given streak duration
 */
export function getNextMilestone(currentSeconds: number): MilestoneConfig | null {
  const nextThreshold = MILESTONE_SECONDS.find((m) => m > currentSeconds);
  return nextThreshold ? getMilestoneConfig(nextThreshold) : null;
}

/**
 * Calculate progress to next milestone (0-1)
 */
export function getMilestoneProgress(currentSeconds: number): {
  current: number;
  next: MilestoneConfig | null;
  progress: number; // 0-1
  previousMilestone: number;
} {
  const nextMilestone = getNextMilestone(currentSeconds);
  
  if (!nextMilestone) {
    // Already at max milestone
    return {
      current: currentSeconds,
      next: null,
      progress: 1,
      previousMilestone: MILESTONE_SECONDS[MILESTONE_SECONDS.length - 1] || 0,
    };
  }

  // Find the previous milestone threshold
  const previousThreshold = MILESTONE_SECONDS
    .filter((m) => m <= currentSeconds)
    .pop() || 0;

  const progressRange = nextMilestone.seconds - previousThreshold;
  const progressMade = currentSeconds - previousThreshold;
  const progress = progressRange > 0 ? progressMade / progressRange : 0;

  return {
    current: currentSeconds,
    next: nextMilestone,
    progress: Math.min(Math.max(progress, 0), 1),
    previousMilestone: previousThreshold,
  };
}

/**
 * Format seconds for milestone display (used for milestone names)
 */
export function formatMilestoneTime(seconds: number): string {
  if (isDevelopment) {
    // Development: show in minutes
    const minutes = Math.floor(seconds / 60);
    return minutes === 1 ? '1 minute' : `${minutes} minutes`;
  }

  // Production: show in days
  const days = Math.floor(seconds / 86400);
  return days === 1 ? '1 day' : `${days} days`;
}

/**
 * Format remaining time with precision based on duration
 */
export function formatRemainingTime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  // Less than 1 minute: show seconds only
  if (seconds < 60) {
    return secs === 1 ? '1 second' : `${secs} seconds`;
  }

  // Less than 1 hour: show minutes and seconds
  if (seconds < 3600) {
    const minText = minutes === 1 ? '1 minute' : `${minutes} minutes`;
    const secText = secs === 1 ? '1 second' : `${secs} seconds`;
    return `${minText} ${secText}`;
  }

  // Less than 1 day: show hours and minutes
  if (seconds < 86400) {
    const hourText = hours === 1 ? '1 hour' : `${hours} hours`;
    const minText = minutes === 1 ? '1 minute' : `${minutes} minutes`;
    return `${hourText} ${minText}`;
  }

  // 1 day or more: show days and hours
  const dayText = days === 1 ? '1 day' : `${days} days`;
  const hourText = hours === 1 ? '1 hour' : `${hours} hours`;
  return `${dayText} ${hourText}`;
}

/**
 * Calculate time remaining to next milestone
 */
export function getTimeToNextMilestone(currentSeconds: number): {
  seconds: number;
  formatted: string;
} | null {
  const nextMilestone = getNextMilestone(currentSeconds);
  
  if (!nextMilestone) {
    return null;
  }

  const remainingSeconds = nextMilestone.seconds - currentSeconds;

  return {
    seconds: remainingSeconds,
    formatted: formatRemainingTime(remainingSeconds),
  };
}

