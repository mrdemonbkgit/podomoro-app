/**
 * Test fixtures for Kamehameha feature
 * Standard test data for consistent testing
 */

import type {
  Journey,
  Badge,
  Relapse,
  CheckIn,
  Streaks,
} from '../../features/kamehameha/types/kamehameha.types';

/**
 * Test user data
 */
export const testUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
};

/**
 * Current timestamp for consistent testing
 */
export const NOW = 1729900000000; // Fixed timestamp: Oct 26, 2025

/**
 * Test journey (active)
 */
export const testJourney: Journey = {
  id: 'journey-123',
  startDate: NOW - 86400000, // 1 day ago
  endDate: null,
  endReason: 'active',
  finalSeconds: 0,
  achievementsCount: 2,
  violationsCount: 0,
  createdAt: NOW - 86400000,
  updatedAt: NOW,
};

/**
 * Test journey (ended)
 */
export const testEndedJourney: Journey = {
  id: 'journey-ended-456',
  startDate: NOW - 172800000, // 2 days ago
  endDate: NOW - 86400000, // ended 1 day ago
  endReason: 'relapse',
  finalSeconds: 86400, // 1 day
  achievementsCount: 3,
  violationsCount: 1,
  createdAt: NOW - 172800000,
  updatedAt: NOW - 86400000,
};

/**
 * Test badge (1 minute milestone)
 */
export const testBadge1Min: Badge = {
  id: 'badge-1min',
  journeyId: 'journey-123',
  milestoneSeconds: 60,
  earnedAt: NOW - 86340000, // 1 day ago + 1 minute
  badgeEmoji: '⚡',
  badgeName: 'One Minute Wonder',
  congratsMessage: "You've reached 1 minute! Every second counts.",
};

/**
 * Test badge (5 minute milestone)
 */
export const testBadge5Min: Badge = {
  id: 'badge-5min',
  journeyId: 'journey-123',
  milestoneSeconds: 300,
  earnedAt: NOW - 86100000, // 1 day ago + 5 minutes
  badgeEmoji: '💪',
  badgeName: 'Five Minute Fighter',
  congratsMessage: "5 minutes strong! You're building momentum.",
};

/**
 * Test relapse (full PMO)
 */
export const testRelapsePMO: Relapse = {
  id: 'relapse-pmo',
  journeyId: 'journey-ended-456',
  timestamp: NOW - 86400000,
  type: 'fullPMO',
  streakType: 'main',
  previousStreakSeconds: 86400, // 1 day
  reflection: {
    whatLed: 'Had a stressful day at work, felt anxious',
    whatNext: 'Will practice meditation when stressed',
  },
  createdAt: NOW - 86400000,
};

/**
 * Test relapse (rule violation)
 */
export const testRelapseViolation: Relapse = {
  id: 'relapse-violation',
  journeyId: 'journey-123',
  timestamp: NOW - 43200000, // 12 hours ago
  type: 'ruleViolation',
  streakType: 'main',
  previousStreakSeconds: 43200, // 12 hours
  reasons: ['Viewed pornography', 'TikTok/social media triggers'],
  createdAt: NOW - 43200000,
};

/**
 * Test check-in
 */
export const testCheckIn: CheckIn = {
  id: 'checkin-123',
  timestamp: NOW - 3600000, // 1 hour ago
  mood: 'veryGood',
  urgeIntensity: 2,
  triggers: ['stress'],
  journalEntry: 'Feeling strong today',
  createdAt: NOW - 3600000,
};

/**
 * Test streaks document
 */
export const testStreaks: Streaks = {
  main: {
    longestSeconds: 172800, // 2 days
  },
  currentJourneyId: 'journey-123',
  lastUpdated: NOW,
};

/**
 * Helper to create a journey at a specific time
 */
export const createTestJourney = (options: {
  id?: string;
  startDate?: number;
  endDate?: number | null;
  achievementsCount?: number;
  violationsCount?: number;
}): Journey => ({
  id: options.id || `journey-${Date.now()}`,
  startDate: options.startDate || NOW,
  endDate: options.endDate === undefined ? null : options.endDate,
  endReason: options.endDate ? 'relapse' : 'active',
  finalSeconds: options.endDate
    ? (options.endDate - (options.startDate || NOW)) / 1000
    : 0,
  achievementsCount: options.achievementsCount || 0,
  violationsCount: options.violationsCount || 0,
  createdAt: options.startDate || NOW,
  updatedAt: NOW,
});

/**
 * Helper to create a badge
 */
export const createTestBadge = (options: {
  id?: string;
  journeyId?: string;
  milestoneSeconds: number;
  earnedAt?: number;
}): Badge => ({
  id: options.id || `badge-${Date.now()}`,
  journeyId: options.journeyId || 'journey-123',
  milestoneSeconds: options.milestoneSeconds,
  earnedAt: options.earnedAt || NOW,
  badgeEmoji: '🎯',
  badgeName: `${options.milestoneSeconds}s Milestone`,
  congratsMessage: 'Congratulations!',
});
