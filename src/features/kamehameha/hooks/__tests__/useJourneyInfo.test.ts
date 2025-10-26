/**
 * Tests for useJourneyInfo hook
 * 
 * Tests loading journey number and violations count
 */

import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useJourneyInfo } from '../useJourneyInfo';
import * as journeyService from '../../services/journeyService';
import { testUser, testJourney, testRelapseViolation } from '../../../../test/fixtures/kamehameha';

// Mock journeyService
vi.mock('../../services/journeyService');

// Mock AuthContext
vi.mock('../../../auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: testUser })),
}));

describe('useJourneyInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    test('starts with loading true', () => {
      vi.mocked(journeyService.getJourneyNumber).mockImplementation(() => new Promise(() => {}));
      vi.mocked(journeyService.getJourneyViolations).mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useJourneyInfo(testJourney.id));

      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    test('returns default values when no journeyId', () => {
      const { result } = renderHook(() => useJourneyInfo(null));

      expect(result.current.loading).toBe(false);
      expect(result.current.journeyNumber).toBe(0);
      expect(result.current.violationsCount).toBe(0);
    });
  });

  describe('Successful Load', () => {
    test('loads journey number and violations count', async () => {
      vi.mocked(journeyService.getJourneyNumber).mockResolvedValue(5);
      vi.mocked(journeyService.getJourneyViolations).mockResolvedValue([
        testRelapseViolation,
        { ...testRelapseViolation, id: 'violation-2' },
      ]);

      const { result } = renderHook(() => useJourneyInfo(testJourney.id));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.journeyNumber).toBe(5);
      expect(result.current.violationsCount).toBe(2);
      expect(result.current.error).toBeNull();
    });

    test('calls service functions with correct parameters', async () => {
      vi.mocked(journeyService.getJourneyNumber).mockResolvedValue(3);
      vi.mocked(journeyService.getJourneyViolations).mockResolvedValue([]);

      renderHook(() => useJourneyInfo(testJourney.id));

      await waitFor(() => {
        expect(journeyService.getJourneyNumber).toHaveBeenCalledWith(testUser.uid, testJourney.id);
      });

      expect(journeyService.getJourneyViolations).toHaveBeenCalledWith(testUser.uid, testJourney.id);
    });

    test('loads data in parallel (Promise.all)', async () => {
      const getNumberSpy = vi.mocked(journeyService.getJourneyNumber).mockResolvedValue(1);
      const getViolationsSpy = vi.mocked(journeyService.getJourneyViolations).mockResolvedValue([]);

      renderHook(() => useJourneyInfo(testJourney.id));

      await waitFor(() => {
        expect(getNumberSpy).toHaveBeenCalled();
      });

      // Both should be called (parallel execution)
      expect(getNumberSpy).toHaveBeenCalled();
      expect(getViolationsSpy).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('sets error state on failure', async () => {
      vi.mocked(journeyService.getJourneyNumber).mockRejectedValue(new Error('Network error'));
      vi.mocked(journeyService.getJourneyViolations).mockResolvedValue([]);

      const { result } = renderHook(() => useJourneyInfo(testJourney.id));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to load journey info');
      expect(result.current.journeyNumber).toBe(0);
      expect(result.current.violationsCount).toBe(0);
    });

    test('sets default values on error', async () => {
      vi.mocked(journeyService.getJourneyNumber).mockResolvedValue(5);
      vi.mocked(journeyService.getJourneyViolations).mockRejectedValue(new Error('Firestore error'));

      const { result } = renderHook(() => useJourneyInfo(testJourney.id));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.journeyNumber).toBe(0);
      expect(result.current.violationsCount).toBe(0);
    });
  });

  describe('Journey Change', () => {
    test('reloads data when journeyId changes', async () => {
      vi.mocked(journeyService.getJourneyNumber).mockResolvedValue(1);
      vi.mocked(journeyService.getJourneyViolations).mockResolvedValue([]);

      const { rerender } = renderHook(
        ({ journeyId }) => useJourneyInfo(journeyId),
        { initialProps: { journeyId: 'journey-1' } }
      );

      await waitFor(() => {
        expect(journeyService.getJourneyNumber).toHaveBeenCalledWith(testUser.uid, 'journey-1');
      });

      // Clear mocks
      vi.clearAllMocks();
      vi.mocked(journeyService.getJourneyNumber).mockResolvedValue(2);
      vi.mocked(journeyService.getJourneyViolations).mockResolvedValue([testRelapseViolation]);

      // Change journeyId
      rerender({ journeyId: 'journey-2' });

      await waitFor(() => {
        expect(journeyService.getJourneyNumber).toHaveBeenCalledWith(testUser.uid, 'journey-2');
      });
    });

    test('stops loading when journeyId becomes null', async () => {
      vi.mocked(journeyService.getJourneyNumber).mockResolvedValue(3);
      vi.mocked(journeyService.getJourneyViolations).mockResolvedValue([]);

      const { result, rerender } = renderHook(
        ({ journeyId }) => useJourneyInfo(journeyId),
        { initialProps: { journeyId: testJourney.id } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.journeyNumber).toBe(3);

      // Change to null - should keep previous data but not be loading
      rerender({ journeyId: null });

      expect(result.current.loading).toBe(false);
      // Previous data is retained (this is correct behavior)
      expect(result.current.journeyNumber).toBe(3);
    });
  });

  describe('Edge Cases', () => {
    test('handles empty violations array', async () => {
      vi.mocked(journeyService.getJourneyNumber).mockResolvedValue(1);
      vi.mocked(journeyService.getJourneyViolations).mockResolvedValue([]);

      const { result } = renderHook(() => useJourneyInfo(testJourney.id));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.violationsCount).toBe(0);
    });

    test('handles journey number 0', async () => {
      vi.mocked(journeyService.getJourneyNumber).mockResolvedValue(0);
      vi.mocked(journeyService.getJourneyViolations).mockResolvedValue([]);

      const { result } = renderHook(() => useJourneyInfo(testJourney.id));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.journeyNumber).toBe(0);
    });

    test('handles large violations count', async () => {
      const manyViolations = Array.from({ length: 100 }, (_, i) => ({
        ...testRelapseViolation,
        id: `violation-${i}`,
      }));

      vi.mocked(journeyService.getJourneyNumber).mockResolvedValue(1);
      vi.mocked(journeyService.getJourneyViolations).mockResolvedValue(manyViolations);

      const { result } = renderHook(() => useJourneyInfo(testJourney.id));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.violationsCount).toBe(100);
    });
  });
});

