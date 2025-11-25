/**
 * Tests for useStreaks hook
 *
 * Tests streak state management, display updates, and reset functionality
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useStreaks } from '../useStreaks';
import {
  testUser,
  testJourney,
  testStreaks,
} from '../../../../test/fixtures/kamehameha';
import * as firestoreService from '../../services/firestoreService';
import * as journeyService from '../../services/journeyService';

// Mock services
vi.mock('../../services/firestoreService');
vi.mock('../../services/journeyService');

// Mock AuthContext
vi.mock('../../../auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: testUser })),
}));

describe('useStreaks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Use real timers for simpler async testing
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    test('starts with loading true', () => {
      vi.mocked(firestoreService.getStreaks).mockImplementation(
        () => new Promise(() => {})
      );
      vi.mocked(journeyService.getCurrentJourney).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useStreaks());

      expect(result.current.loading).toBe(true);
      expect(result.current.streaks).toBeNull();
      expect(result.current.mainDisplay).toBeNull();
    });

    test('loads streaks and journey on mount', async () => {
      vi.mocked(firestoreService.getStreaks).mockResolvedValue(testStreaks);
      vi.mocked(journeyService.getCurrentJourney).mockResolvedValue(
        testJourney
      );

      const { result } = renderHook(() => useStreaks());

      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 10000 }
      );

      expect(result.current.streaks).toEqual(testStreaks);
      expect(result.current.currentJourneyId).toBe(testJourney.id);
      expect(result.current.journeyStartDate).toBe(testJourney.startDate);
    });

    test('handles missing current journey', async () => {
      const streaksWithoutJourney = { ...testStreaks, currentJourneyId: null };
      vi.mocked(firestoreService.getStreaks).mockResolvedValue(
        streaksWithoutJourney
      );
      vi.mocked(journeyService.getCurrentJourney).mockResolvedValue(null);

      const { result } = renderHook(() => useStreaks());

      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 10000 }
      );

      expect(result.current.mainDisplay).toBeNull();
    });

    test('sets error state on load failure', async () => {
      vi.mocked(firestoreService.getStreaks).mockRejectedValue(
        new Error('Network error')
      );
      vi.mocked(journeyService.getCurrentJourney).mockResolvedValue(
        testJourney
      );

      const { result } = renderHook(() => useStreaks());

      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 10000 }
      );

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Display Updates', () => {
    test('provides mainDisplay when journey is loaded', async () => {
      vi.mocked(firestoreService.getStreaks).mockResolvedValue(testStreaks);
      vi.mocked(journeyService.getCurrentJourney).mockResolvedValue(
        testJourney
      );

      const { result } = renderHook(() => useStreaks());

      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 10000 }
      );

      // Should have main display
      expect(result.current.mainDisplay).not.toBeNull();
      expect(result.current.mainDisplay?.totalSeconds).toBeGreaterThan(0);
    });

    test('calculates display from journey startDate', async () => {
      const mockJourney = {
        ...testJourney,
        startDate: Date.now() - 3600000, // 1 hour ago
      };

      vi.mocked(firestoreService.getStreaks).mockResolvedValue(testStreaks);
      vi.mocked(journeyService.getCurrentJourney).mockResolvedValue(
        mockJourney
      );

      const { result } = renderHook(() => useStreaks());

      await waitFor(
        () => {
          expect(result.current.mainDisplay).not.toBeNull();
        },
        { timeout: 10000 }
      );

      // Should calculate from journey start
      const expectedSeconds = Math.floor(
        (Date.now() - mockJourney.startDate) / 1000
      );
      expect(result.current.mainDisplay?.totalSeconds).toBeCloseTo(
        expectedSeconds,
        -1
      ); // Allow 1s margin
    });
  });

  describe('Reset Streak', () => {
    test('resets main streak and reloads data', async () => {
      const initialStreaks = testStreaks;
      const newStreaks = {
        ...testStreaks,
        currentJourneyId: 'new-journey-789',
      };
      const newJourney = {
        ...testJourney,
        id: 'new-journey-789',
        startDate: Date.now(),
      };

      vi.mocked(firestoreService.getStreaks).mockResolvedValueOnce(
        initialStreaks
      );
      vi.mocked(journeyService.getCurrentJourney).mockResolvedValueOnce(
        testJourney
      );

      const { result } = renderHook(() => useStreaks());

      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 10000 }
      );

      // Mock reset
      vi.mocked(firestoreService.resetMainStreak).mockResolvedValue(newStreaks);
      vi.mocked(journeyService.getCurrentJourney).mockResolvedValue(newJourney);

      // Perform reset
      await result.current.resetMainStreak();

      await waitFor(
        () => {
          expect(result.current.currentJourneyId).toBe('new-journey-789');
        },
        { timeout: 10000 }
      );

      expect(firestoreService.resetMainStreak).toHaveBeenCalled();
    });

    test('handles reset errors gracefully', async () => {
      vi.mocked(firestoreService.getStreaks).mockResolvedValue(testStreaks);
      vi.mocked(journeyService.getCurrentJourney).mockResolvedValue(
        testJourney
      );

      const { result } = renderHook(() => useStreaks());

      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 10000 }
      );

      // Mock reset failure
      vi.mocked(firestoreService.resetMainStreak).mockRejectedValue(
        new Error('Reset failed')
      );

      // Attempt reset
      await expect(result.current.resetMainStreak()).rejects.toThrow(
        'Reset failed'
      );

      // Error state should be set
      await waitFor(
        () => {
          expect(result.current.error).toBeTruthy();
        },
        { timeout: 10000 }
      );
    });

    test('does not reset when streaks or mainDisplay is null', async () => {
      vi.mocked(firestoreService.getStreaks).mockResolvedValue(testStreaks);
      vi.mocked(journeyService.getCurrentJourney).mockResolvedValue(null);

      const { result } = renderHook(() => useStreaks());

      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 10000 }
      );

      // mainDisplay should be null
      expect(result.current.mainDisplay).toBeNull();

      // Try to reset (should do nothing)
      await result.current.resetMainStreak();

      expect(firestoreService.resetMainStreak).not.toHaveBeenCalled();
    });
  });

  describe('Refresh Streaks', () => {
    test('reloads streak data', async () => {
      vi.mocked(firestoreService.getStreaks).mockResolvedValue(testStreaks);
      vi.mocked(journeyService.getCurrentJourney).mockResolvedValue(
        testJourney
      );

      const { result } = renderHook(() => useStreaks());

      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 10000 }
      );

      // Clear mocks and setup new data
      vi.clearAllMocks();
      const newStreaks = { ...testStreaks, main: { longestSeconds: 200000 } };
      vi.mocked(firestoreService.getStreaks).mockResolvedValue(newStreaks);
      vi.mocked(journeyService.getCurrentJourney).mockResolvedValue(
        testJourney
      );

      // Refresh
      await result.current.refreshStreaks();

      await waitFor(
        () => {
          expect(result.current.streaks?.main.longestSeconds).toBe(200000);
        },
        { timeout: 10000 }
      );
    });
  });

  describe('Cleanup', () => {
    test('unmounts without errors', async () => {
      vi.mocked(firestoreService.getStreaks).mockResolvedValue(testStreaks);
      vi.mocked(journeyService.getCurrentJourney).mockResolvedValue(
        testJourney
      );

      const { unmount } = renderHook(() => useStreaks());

      // Unmount should not throw
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('User Changes', () => {
    test.skip('reloads when user changes', async () => {
      // TODO: Complex to mock useAuth; tested via integration tests
    });

    test.skip('stops loading when user becomes null', async () => {
      // TODO: Complex to mock useAuth; tested via integration tests
    });
  });

  describe('Edge Cases', () => {
    test('handles journey with no startDate', async () => {
      const journeyWithoutStart = {
        ...testJourney,
        startDate: undefined as any,
      };
      vi.mocked(firestoreService.getStreaks).mockResolvedValue(testStreaks);
      vi.mocked(journeyService.getCurrentJourney).mockResolvedValue(
        journeyWithoutStart
      );

      const { result } = renderHook(() => useStreaks());

      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 10000 }
      );

      // Should handle gracefully (mainDisplay might be null or have invalid data)
      // Just ensure no crash
      expect(result.current.error).toBeFalsy();
    });

    test('handles very long streak (> 1 year)', async () => {
      const longJourney = {
        ...testJourney,
        startDate: Date.now() - 400 * 24 * 60 * 60 * 1000, // 400 days ago
      };

      vi.mocked(firestoreService.getStreaks).mockResolvedValue(testStreaks);
      vi.mocked(journeyService.getCurrentJourney).mockResolvedValue(
        longJourney
      );

      const { result } = renderHook(() => useStreaks());

      await waitFor(
        () => {
          expect(result.current.mainDisplay).not.toBeNull();
        },
        { timeout: 10000 }
      );

      // Should handle large numbers
      expect(result.current.mainDisplay?.days).toBeGreaterThan(365);
    });
  });
});
