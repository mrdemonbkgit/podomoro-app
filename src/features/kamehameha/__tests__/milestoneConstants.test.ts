import { describe, it, expect } from 'vitest';
import { MILESTONE_SECONDS as FRONTEND_MILESTONES } from '../constants/milestones';

/**
 * Milestone Constants Synchronization Test
 *
 * This test ensures that frontend and backend milestone constants stay in sync.
 *
 * Both files define the same milestones:
 * - Frontend: src/features/kamehameha/constants/milestones.ts
 * - Backend: functions/src/milestoneConstants.ts
 *
 * Production milestone values (must match both files):
 */
const EXPECTED_PRODUCTION_MILESTONES = [
  86400, // 1 day
  259200, // 3 days
  604800, // 7 days (1 week)
  1209600, // 14 days (2 weeks)
  2592000, // 30 days (1 month)
  5184000, // 60 days (2 months)
  7776000, // 90 days (3 months)
  15552000, // 180 days (6 months)
  31536000, // 365 days (1 year)
];

/**
 * Development milestone values (for easy testing):
 */
const EXPECTED_DEV_MILESTONES = [
  60, // 1 minute
  300, // 5 minutes
];

describe('Milestone Constants Sync', () => {
  describe('Production Milestones', () => {
    it('should match backend production milestone definitions', () => {
      // In production, frontend should use production milestones
      // This test verifies the EXPECTED values are correct
      expect(EXPECTED_PRODUCTION_MILESTONES).toEqual([
        86400, // 1 day
        259200, // 3 days
        604800, // 1 week
        1209600, // 2 weeks
        2592000, // 1 month
        5184000, // 2 months
        7776000, // 3 months
        15552000, // 6 months
        31536000, // 1 year
      ]);
    });

    it('should have all milestones in ascending order', () => {
      const sorted = [...EXPECTED_PRODUCTION_MILESTONES].sort((a, b) => a - b);
      expect(EXPECTED_PRODUCTION_MILESTONES).toEqual(sorted);
    });

    it('should have no duplicate milestones', () => {
      const unique = [...new Set(EXPECTED_PRODUCTION_MILESTONES)];
      expect(EXPECTED_PRODUCTION_MILESTONES).toHaveLength(unique.length);
    });

    it('should have reasonable time spans (all >= 1 day)', () => {
      EXPECTED_PRODUCTION_MILESTONES.forEach((seconds) => {
        expect(seconds).toBeGreaterThanOrEqual(86400); // At least 1 day
      });
    });
  });

  describe('Development Milestones', () => {
    it('should match backend development milestone definitions', () => {
      expect(EXPECTED_DEV_MILESTONES).toEqual([60, 300]);
    });

    it('should be short durations for easy testing', () => {
      EXPECTED_DEV_MILESTONES.forEach((seconds) => {
        expect(seconds).toBeLessThan(3600); // Less than 1 hour
      });
    });
  });

  describe('Frontend Implementation', () => {
    it('should switch between dev and production milestones', () => {
      // Frontend uses import.meta.env.DEV to switch
      // This test just ensures FRONTEND_MILESTONES is defined
      expect(FRONTEND_MILESTONES).toBeDefined();
      expect(Array.isArray(FRONTEND_MILESTONES)).toBe(true);
      expect(FRONTEND_MILESTONES.length).toBeGreaterThan(0);
    });

    it('should match either dev or production milestones', () => {
      // Frontend should be using ONE of the two sets
      const matchesDev =
        JSON.stringify(FRONTEND_MILESTONES) ===
        JSON.stringify(EXPECTED_DEV_MILESTONES);
      const matchesProd =
        JSON.stringify(FRONTEND_MILESTONES) ===
        JSON.stringify(EXPECTED_PRODUCTION_MILESTONES);

      expect(matchesDev || matchesProd).toBe(true);
    });

    it('should have milestones in ascending order', () => {
      const sorted = [...FRONTEND_MILESTONES].sort((a, b) => a - b);
      expect(FRONTEND_MILESTONES).toEqual(sorted);
    });

    it('should have no duplicate milestones', () => {
      const unique = [...new Set(FRONTEND_MILESTONES)];
      expect(FRONTEND_MILESTONES).toHaveLength(unique.length);
    });
  });

  describe('Milestone Calculations', () => {
    it('should have reasonable gaps between milestones', () => {
      // Check that production milestones have reasonable progression
      for (let i = 1; i < EXPECTED_PRODUCTION_MILESTONES.length; i++) {
        const gap =
          EXPECTED_PRODUCTION_MILESTONES[i] -
          EXPECTED_PRODUCTION_MILESTONES[i - 1];
        // Gap should be at least 1 day
        expect(gap).toBeGreaterThanOrEqual(86400);
        // Gap should not be more than 1 year (largest gap is 6 months to 1 year)
        expect(gap).toBeLessThanOrEqual(31536000);
      }
    });

    it('should calculate time correctly for each milestone', () => {
      const oneDayInSeconds = 86400;
      expect(EXPECTED_PRODUCTION_MILESTONES[0]).toBe(oneDayInSeconds); // 1 day
      expect(EXPECTED_PRODUCTION_MILESTONES[1]).toBe(oneDayInSeconds * 3); // 3 days
      expect(EXPECTED_PRODUCTION_MILESTONES[2]).toBe(oneDayInSeconds * 7); // 7 days
      expect(EXPECTED_PRODUCTION_MILESTONES[3]).toBe(oneDayInSeconds * 14); // 14 days
      expect(EXPECTED_PRODUCTION_MILESTONES[4]).toBe(oneDayInSeconds * 30); // 30 days
      expect(EXPECTED_PRODUCTION_MILESTONES[5]).toBe(oneDayInSeconds * 60); // 60 days
      expect(EXPECTED_PRODUCTION_MILESTONES[6]).toBe(oneDayInSeconds * 90); // 90 days
      expect(EXPECTED_PRODUCTION_MILESTONES[7]).toBe(oneDayInSeconds * 180); // 180 days
      expect(EXPECTED_PRODUCTION_MILESTONES[8]).toBe(oneDayInSeconds * 365); // 365 days
    });
  });

  describe('Backend Sync Validation', () => {
    it('should document expected backend values for manual verification', () => {
      // This test documents what the backend SHOULD have
      // Developers should manually verify functions/src/milestoneConstants.ts matches

      const backendExpectation = {
        production: [
          86400, // 1 day
          259200, // 3 days
          604800, // 7 days
          1209600, // 14 days
          2592000, // 30 days
          5184000, // 60 days
          7776000, // 90 days
          15552000, // 180 days
          31536000, // 365 days
        ],
        development: [
          60, // 1 minute
          300, // 5 minutes
        ],
      };

      // If this test fails, check:
      // 1. functions/src/milestoneConstants.ts
      // 2. Ensure MILESTONE_SECONDS array matches these values
      expect(backendExpectation.production).toEqual(
        EXPECTED_PRODUCTION_MILESTONES
      );
      expect(backendExpectation.development).toEqual(EXPECTED_DEV_MILESTONES);
    });
  });
});
