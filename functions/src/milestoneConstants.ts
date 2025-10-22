/**
 * Milestone definitions for badge system
 */

// Check if running in emulator (for development)
const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';

// Milestone tiers in seconds
export const MILESTONE_SECONDS = isEmulator
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

// Badge configurations
interface BadgeConfig {
  emoji: string;
  name: string;
  message: string;
}

export const BADGE_CONFIGS: Record<number, BadgeConfig> = {
  // Development badges
  60: {
    emoji: '⚡',
    name: 'One Minute Wonder',
    message: "You've reached 1 minute! Every second counts.",
  },
  300: {
    emoji: '💪',
    name: 'Five Minute Fighter',
    message: "5 minutes strong! You're building momentum.",
  },
  // Production badges
  86400: {
    emoji: '🌱',
    name: 'First Step',
    message: "You've completed your first day! This is the beginning of something great.",
  },
  259200: {
    emoji: '💪',
    name: 'Building Momentum',
    message: "3 days strong! You're proving your commitment.",
  },
  604800: {
    emoji: '⚔️',
    name: 'One Week Warrior',
    message: "A full week! You're a warrior on this journey.",
  },
  1209600: {
    emoji: '🏆',
    name: 'Two Week Champion',
    message: "2 weeks of dedication! You're unstoppable.",
  },
  2592000: {
    emoji: '👑',
    name: 'Monthly Master',
    message: "30 days! You've mastered the first month.",
  },
  5184000: {
    emoji: '🌟',
    name: 'Two Month Legend',
    message: "60 days of strength! You're becoming legendary.",
  },
  7776000: {
    emoji: '💎',
    name: 'Three Month Diamond',
    message: "90 days! Your dedication shines like a diamond.",
  },
  15552000: {
    emoji: '🦅',
    name: 'Half Year Hero',
    message: "180 days! You're soaring to new heights.",
  },
  31536000: {
    emoji: '🔥',
    name: 'One Year Phoenix',
    message: "365 days! You've risen like a phoenix. Incredible!",
  },
};

export function getBadgeConfig(milestoneSeconds: number): BadgeConfig {
  return BADGE_CONFIGS[milestoneSeconds] || {
    emoji: '🎯',
    name: 'Achievement Unlocked',
    message: 'Congratulations on reaching this milestone!',
  };
}

