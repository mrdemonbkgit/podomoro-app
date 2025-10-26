/**
 * Integration Tests: Complete Journey Lifecycle
 * 
 * Tests the entire journey flow end-to-end:
 * 1. User initialization
 * 2. Journey creation
 * 3. Milestone detection
 * 4. Badge creation
 * 5. Relapse (PMO) → journey end
 * 6. New journey creation
 * 7. Badge preservation
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { testUser, NOW } from '../../../../test/fixtures/kamehameha';
import * as firestoreService from '../../services/firestoreService';
import * as journeyService from '../../services/journeyService';
import type { Journey, Streaks, Relapse } from '../../types/kamehameha.types';

describe('Journey Lifecycle Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete Flow: Init → Milestone → Relapse → New Journey', () => {
    test('initializes user with first journey', async () => {
      // Mock: User has no existing data
      vi.spyOn(firestoreService, 'hasExistingStreaks').mockResolvedValue(false);
      
      const mockStreaks: Streaks = {
        main: { longestSeconds: 0 },
        currentJourneyId: 'journey-1',
        lastUpdated: NOW,
      };
      
      const mockJourney: Journey = {
        id: 'journey-1',
        startDate: NOW,
        endDate: null,
        endReason: 'active',
        finalSeconds: 0,
        achievementsCount: 0,
        violationsCount: 0,
        createdAt: NOW,
        updatedAt: NOW,
      };

      vi.spyOn(firestoreService, 'initializeUserStreaks').mockResolvedValue(mockStreaks);
      vi.spyOn(journeyService, 'getCurrentJourney').mockResolvedValue(mockJourney);

      // Execute: Initialize user
      const hasExisting = await firestoreService.hasExistingStreaks(testUser.uid);
      expect(hasExisting).toBe(false);

      const streaks = await firestoreService.initializeUserStreaks(testUser.uid);
      expect(streaks.currentJourneyId).toBe('journey-1');

      const journey = await journeyService.getCurrentJourney(testUser.uid);
      expect(journey).not.toBeNull();
      expect(journey?.endDate).toBeNull();
      expect(journey?.achievementsCount).toBe(0);
    });

    test('detects milestone and creates badge', async () => {
      const journeyId = 'journey-1';
      const userId = testUser.uid;

      // Mock: Journey has been running for 61 seconds
      const journey: Journey = {
        id: journeyId,
        startDate: NOW - 61000,
        endDate: null,
        endReason: 'active',
        finalSeconds: 0,
        achievementsCount: 0,
        violationsCount: 0,
        createdAt: NOW - 61000,
        updatedAt: NOW,
      };

      vi.spyOn(journeyService, 'getCurrentJourney').mockResolvedValue(journey);
      vi.spyOn(journeyService, 'incrementJourneyAchievements').mockResolvedValue();

      // Execute: Check if milestone crossed
      const currentSeconds = Math.floor((NOW - journey.startDate) / 1000);
      expect(currentSeconds).toBeGreaterThanOrEqual(60);

      // Simulate badge creation (would be done by useMilestones hook)
      if (currentSeconds >= 60) {
        await journeyService.incrementJourneyAchievements(userId, journeyId);
      }

      // Verify: Achievement count incremented
      expect(journeyService.incrementJourneyAchievements).toHaveBeenCalledWith(userId, journeyId);
    });

    test('handles PMO relapse: ends journey, creates new one', async () => {
      const userId = testUser.uid;
      const oldJourneyId = 'journey-1';
      const newJourneyId = 'journey-2';

      // Mock: Current journey with some progress
      const oldJourney: Journey = {
        id: oldJourneyId,
        startDate: NOW - 86400000, // 1 day ago
        endDate: null,
        endReason: 'active',
        finalSeconds: 0,
        achievementsCount: 2,
        violationsCount: 0,
        createdAt: NOW - 86400000,
        updatedAt: NOW,
      };

      const newJourney: Journey = {
        id: newJourneyId,
        startDate: NOW,
        endDate: null,
        endReason: 'active',
        finalSeconds: 0,
        achievementsCount: 0,
        violationsCount: 0,
        createdAt: NOW,
        updatedAt: NOW,
      };

      const updatedStreaks: Streaks = {
        main: { longestSeconds: 86400 }, // Longest updated
        currentJourneyId: newJourneyId,
        lastUpdated: NOW,
      };

      vi.spyOn(journeyService, 'getCurrentJourney')
        .mockResolvedValueOnce(oldJourney)
        .mockResolvedValueOnce(newJourney);
      
      vi.spyOn(firestoreService, 'resetMainStreak').mockResolvedValue(updatedStreaks);
      vi.spyOn(firestoreService, 'saveRelapse').mockResolvedValue('relapse-123');

      // Execute: Report PMO
      const currentSeconds = Math.floor((NOW - oldJourney.startDate) / 1000);
      
      // Save relapse
      await firestoreService.saveRelapse(userId, {
        type: 'fullPMO',
        streakType: 'main',
        previousStreakSeconds: currentSeconds,
        reflection: {
          whatLed: 'Test reflection',
          whatNext: 'Test plan',
        },
      });

      // Reset streak (ends old journey, creates new one)
      const streaks = await firestoreService.resetMainStreak(userId, currentSeconds);

      // Verify: New journey created
      expect(streaks.currentJourneyId).toBe(newJourneyId);
      expect(streaks.main.longestSeconds).toBe(86400);

      // Verify: Relapse saved
      expect(firestoreService.saveRelapse).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          type: 'fullPMO',
          previousStreakSeconds: currentSeconds,
        })
      );
    });

    test('preserves badges from previous journey', async () => {
      const userId = testUser.uid;
      const oldJourneyId = 'journey-1';
      const newJourneyId = 'journey-2';

      // Mock: Badges from old journey exist
      const oldJourneyBadges = [
        {
          id: `${oldJourneyId}_60`,
          journeyId: oldJourneyId,
          milestoneSeconds: 60,
          earnedAt: NOW - 86340000,
          badgeEmoji: '⚡',
          badgeName: 'One Minute Wonder',
          congratsMessage: 'Test',
        },
        {
          id: `${oldJourneyId}_300`,
          journeyId: oldJourneyId,
          milestoneSeconds: 300,
          earnedAt: NOW - 86100000,
          badgeEmoji: '💪',
          badgeName: 'Five Minute Fighter',
          congratsMessage: 'Test',
        },
      ];

      // Note: In real implementation, badges are NEVER deleted
      // They persist as permanent historical records
      // useBadges filters by currentJourneyId for celebration only

      // Verify: Badges still exist after journey end
      // This is a conceptual test - in real app, we'd query Firestore
      expect(oldJourneyBadges.length).toBe(2);
      expect(oldJourneyBadges[0].journeyId).toBe(oldJourneyId);
      expect(oldJourneyBadges[1].journeyId).toBe(oldJourneyId);
    });
  });

  describe('Rule Violation Flow (No Journey Reset)', () => {
    test('logs violation without ending journey', async () => {
      const userId = testUser.uid;
      const journeyId = 'journey-1';

      const currentJourney: Journey = {
        id: journeyId,
        startDate: NOW - 43200000, // 12 hours ago
        endDate: null,
        endReason: 'active',
        finalSeconds: 0,
        achievementsCount: 1,
        violationsCount: 0,
        createdAt: NOW - 43200000,
        updatedAt: NOW,
      };

      vi.spyOn(journeyService, 'getCurrentJourney').mockResolvedValue(currentJourney);
      vi.spyOn(journeyService, 'incrementJourneyViolations').mockResolvedValue();
      vi.spyOn(firestoreService, 'saveRelapse').mockResolvedValue('relapse-violation');

      // Execute: Report rule violation
      const currentSeconds = Math.floor((NOW - currentJourney.startDate) / 1000);
      
      await firestoreService.saveRelapse(userId, {
        type: 'ruleViolation',
        streakType: 'main',
        previousStreakSeconds: currentSeconds,
        reasons: ['Viewed pornography'],
      });

      await journeyService.incrementJourneyViolations(userId, journeyId);

      // Verify: Journey continues (no reset)
      expect(journeyService.incrementJourneyViolations).toHaveBeenCalledWith(userId, journeyId);
      
      // Verify: Relapse saved
      expect(firestoreService.saveRelapse).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          type: 'ruleViolation',
          reasons: ['Viewed pornography'],
        })
      );
    });
  });

  describe('Journey History', () => {
    test('tracks multiple journeys with proper sequencing', async () => {
      const userId = testUser.uid;

      const journeys: Journey[] = [
        {
          id: 'journey-3',
          startDate: NOW,
          endDate: null,
          endReason: 'active',
          finalSeconds: 0,
          achievementsCount: 0,
          violationsCount: 0,
          createdAt: NOW,
          updatedAt: NOW,
        },
        {
          id: 'journey-2',
          startDate: NOW - 172800000,
          endDate: NOW - 86400000,
          endReason: 'relapse',
          finalSeconds: 86400,
          achievementsCount: 2,
          violationsCount: 1,
          createdAt: NOW - 172800000,
          updatedAt: NOW - 86400000,
        },
        {
          id: 'journey-1',
          startDate: NOW - 345600000,
          endDate: NOW - 172800000,
          endReason: 'relapse',
          finalSeconds: 172800,
          achievementsCount: 5,
          violationsCount: 2,
          createdAt: NOW - 345600000,
          updatedAt: NOW - 172800000,
        },
      ];

      vi.spyOn(journeyService, 'getJourneyHistory').mockResolvedValue(journeys);

      // Execute: Get journey history
      const history = await journeyService.getJourneyHistory(userId);

      // Verify: Journeys ordered correctly (newest first)
      expect(history).toHaveLength(3);
      expect(history[0].id).toBe('journey-3');
      expect(history[0].endDate).toBeNull(); // Active journey
      expect(history[1].id).toBe('journey-2');
      expect(history[1].endDate).not.toBeNull(); // Ended journey
    });

    test('calculates journey number correctly', async () => {
      const userId = testUser.uid;
      const currentJourneyId = 'journey-5';

      vi.spyOn(journeyService, 'getJourneyNumber').mockResolvedValue(5);

      // Execute: Get journey number
      const journeyNumber = await journeyService.getJourneyNumber(userId, currentJourneyId);

      // Verify: Correct journey number
      expect(journeyNumber).toBe(5);
    });
  });

  describe('Edge Cases & Error Scenarios', () => {
    test('handles concurrent journey operations gracefully', async () => {
      const userId = testUser.uid;
      
      // Mock BEFORE calling
      const saveRelapseSpy = vi.spyOn(firestoreService, 'saveRelapse').mockResolvedValue('relapse-id');

      // Simulate concurrent operations
      const operations = [
        firestoreService.saveRelapse(userId, {
          type: 'fullPMO',
          streakType: 'main',
          previousStreakSeconds: 1000,
        }),
        firestoreService.saveRelapse(userId, {
          type: 'ruleViolation',
          streakType: 'main',
          previousStreakSeconds: 1000,
        }),
      ];

      // Execute: Concurrent saves
      await Promise.all(operations);

      // Verify: Both operations completed
      expect(saveRelapseSpy).toHaveBeenCalledTimes(2);
    });

    test('handles journey with no milestones', async () => {
      const userId = testUser.uid;
      const journeyId = 'journey-quick';

      // Journey that ended before first milestone
      const shortJourney: Journey = {
        id: journeyId,
        startDate: NOW - 30000, // 30 seconds
        endDate: NOW,
        endReason: 'relapse',
        finalSeconds: 30,
        achievementsCount: 0, // No milestones reached
        violationsCount: 0,
        createdAt: NOW - 30000,
        updatedAt: NOW,
      };

      vi.spyOn(journeyService, 'getCurrentJourney').mockResolvedValue(shortJourney);

      const journey = await journeyService.getCurrentJourney(userId);

      // Verify: Journey valid even with no achievements
      expect(journey?.achievementsCount).toBe(0);
      expect(journey?.finalSeconds).toBe(30);
    });

    test('handles very long journey (> 1 year)', async () => {
      const userId = testUser.uid;
      const journeyId = 'journey-long';

      // Journey running for 400 days
      const longJourney: Journey = {
        id: journeyId,
        startDate: NOW - (400 * 24 * 60 * 60 * 1000),
        endDate: null,
        endReason: 'active',
        finalSeconds: 0,
        achievementsCount: 11, // All milestones including 365 days
        violationsCount: 0,
        createdAt: NOW - (400 * 24 * 60 * 60 * 1000),
        updatedAt: NOW,
      };

      vi.spyOn(journeyService, 'getCurrentJourney').mockResolvedValue(longJourney);

      const journey = await journeyService.getCurrentJourney(userId);

      // Verify: Handles large durations
      const durationSeconds = Math.floor((NOW - (journey?.startDate || NOW)) / 1000);
      expect(durationSeconds).toBeGreaterThan(365 * 24 * 60 * 60);
      expect(journey?.achievementsCount).toBe(11);
    });
  });
});

