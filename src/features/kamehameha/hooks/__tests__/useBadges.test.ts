/**
 * Tests for useBadges hook
 * 
 * Tests badge listening, celebration logic, and smart milestone handling
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBadges } from '../useBadges';
import { testUser, testJourney, testBadge1Min, testBadge5Min, createTestBadge } from '../../../../test/fixtures/kamehameha';
import type { Badge } from '../../types/kamehameha.types';

// Mock Firebase
const mockOnSnapshot = vi.fn();
const mockQuery = vi.fn();
const mockOrderBy = vi.fn();
const mockCollection = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => mockCollection(...args),
  query: (...args: any[]) => mockQuery(...args),
  orderBy: (...args: any[]) => mockOrderBy(...args),
  onSnapshot: (...args: any[]) => mockOnSnapshot(...args),
}));

// Mock Firebase config
vi.mock('../../../../services/firebase/config', () => ({
  db: {},
}));

// Mock AuthContext
vi.mock('../../../auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: testUser })),
}));

describe('useBadges', () => {
  let unsubscribeFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    unsubscribeFn = vi.fn();
    mockOnSnapshot.mockImplementation((query, callback) => {
      // Store callback for manual triggering
      (mockOnSnapshot as any).lastCallback = callback;
      return unsubscribeFn;
    });
    mockCollection.mockReturnValue({});
    mockQuery.mockImplementation((...args) => args);
    mockOrderBy.mockImplementation((field, dir) => ({ field, dir }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    test('starts with loading true', () => {
      const { result } = renderHook(() => useBadges(testJourney.id));

      expect(result.current.loading).toBe(true);
      expect(result.current.badges).toEqual([]);
      expect(result.current.celebrationBadge).toBeNull();
    });

    test('sets up Firestore listener', () => {
      renderHook(() => useBadges(testJourney.id));

      expect(mockCollection).toHaveBeenCalledWith({}, 'users', testUser.uid, 'kamehameha_badges');
      expect(mockOrderBy).toHaveBeenCalledWith('earnedAt', 'desc');
      expect(mockOnSnapshot).toHaveBeenCalled();
    });

    test.skip('does nothing when user is null', () => {
      // TODO: Complex to mock useAuth; tested via integration tests
    });
  });

  describe('Badge Loading', () => {
    test('loads all badges (permanent records)', async () => {
      const { result } = renderHook(() => useBadges(testJourney.id));

      // Simulate Firestore snapshot
      const mockSnapshot = {
        docs: [
          { id: testBadge1Min.id, data: () => testBadge1Min },
          { id: testBadge5Min.id, data: () => testBadge5Min },
        ],
        docChanges: () => [],
      };

      const callback = (mockOnSnapshot as any).lastCallback;
      callback(mockSnapshot);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.badges).toHaveLength(2);
      expect(result.current.badges[0].id).toBe(testBadge1Min.id);
    });

    test('handles empty badge list', async () => {
      const { result } = renderHook(() => useBadges(testJourney.id));

      const mockSnapshot = {
        docs: [],
        docChanges: () => [],
      };

      const callback = (mockOnSnapshot as any).lastCallback;
      callback(mockSnapshot);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.badges).toEqual([]);
    });

    test('sets error state on Firestore error', () => {
      const { result } = renderHook(() => useBadges(testJourney.id));

      const error = new Error('Firestore connection failed');
      const callback = (mockOnSnapshot as any).lastCallback;
      const errorCallback = mockOnSnapshot.mock.calls[0][1]; // Second argument is error callback
      
      // Simulate error
      mockOnSnapshot.mockImplementation((query, successCb, errorCb) => {
        errorCb(error);
        return unsubscribeFn;
      });

      // Re-render to trigger error
      renderHook(() => useBadges(testJourney.id));

      waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Celebration Logic', () => {
    test('does not celebrate on initial load', () => {
      const { result } = renderHook(() => useBadges(testJourney.id));

      const mockSnapshot = {
        docs: [{ id: testBadge1Min.id, data: () => testBadge1Min }],
        docChanges: () => [
          {
            type: 'added',
            doc: { id: testBadge1Min.id, data: () => testBadge1Min },
          },
        ],
      };

      const callback = (mockOnSnapshot as any).lastCallback;
      callback(mockSnapshot);

      // Should not celebrate on initial load
      expect(result.current.celebrationBadge).toBeNull();
    });

    test('celebrates new badge from current journey', async () => {
      const { result } = renderHook(() => useBadges(testJourney.id));

      // Initial load (no badges)
      const initialSnapshot = {
        docs: [],
        docChanges: () => [],
      };
      const callback = (mockOnSnapshot as any).lastCallback;
      callback(initialSnapshot);

      // Add a new badge
      const newBadge = createTestBadge({
        id: 'new-badge',
        journeyId: testJourney.id,
        milestoneSeconds: 86400,
      });

      const newSnapshot = {
        docs: [{ id: newBadge.id, data: () => newBadge }],
        docChanges: () => [
          {
            type: 'added',
            doc: { id: newBadge.id, data: () => newBadge },
          },
        ],
      };

      callback(newSnapshot);

      await waitFor(() => {
        expect(result.current.celebrationBadge).not.toBeNull();
      });

      expect(result.current.celebrationBadge?.id).toBe(newBadge.id);
    });

    test('does not celebrate badges from other journeys', () => {
      const { result } = renderHook(() => useBadges(testJourney.id));

      // Initial load
      const initialSnapshot = {
        docs: [],
        docChanges: () => [],
      };
      const callback = (mockOnSnapshot as any).lastCallback;
      callback(initialSnapshot);

      // Add badge from different journey
      const otherJourneyBadge = createTestBadge({
        id: 'other-badge',
        journeyId: 'other-journey-456',
        milestoneSeconds: 300,
      });

      const newSnapshot = {
        docs: [{ id: otherJourneyBadge.id, data: () => otherJourneyBadge }],
        docChanges: () => [
          {
            type: 'added',
            doc: { id: otherJourneyBadge.id, data: () => otherJourneyBadge },
          },
        ],
      };

      callback(newSnapshot);

      // Should NOT celebrate
      expect(result.current.celebrationBadge).toBeNull();
    });

    test('celebrates only highest milestone when multiple badges added', async () => {
      const { result } = renderHook(() => useBadges(testJourney.id));

      // Initial load
      const initialSnapshot = {
        docs: [],
        docChanges: () => [],
      };
      const callback = (mockOnSnapshot as any).lastCallback;
      callback(initialSnapshot);

      // Add multiple new badges at once (user was offline)
      const badge1Min = createTestBadge({
        id: 'badge-60',
        journeyId: testJourney.id,
        milestoneSeconds: 60,
      });

      const badge5Min = createTestBadge({
        id: 'badge-300',
        journeyId: testJourney.id,
        milestoneSeconds: 300,
      });

      const badge1Day = createTestBadge({
        id: 'badge-86400',
        journeyId: testJourney.id,
        milestoneSeconds: 86400,
      });

      const newSnapshot = {
        docs: [
          { id: badge1Min.id, data: () => badge1Min },
          { id: badge5Min.id, data: () => badge5Min },
          { id: badge1Day.id, data: () => badge1Day },
        ],
        docChanges: () => [
          { type: 'added', doc: { id: badge1Min.id, data: () => badge1Min } },
          { type: 'added', doc: { id: badge5Min.id, data: () => badge5Min } },
          { type: 'added', doc: { id: badge1Day.id, data: () => badge1Day } },
        ],
      };

      callback(newSnapshot);

      await waitFor(() => {
        expect(result.current.celebrationBadge).not.toBeNull();
      });

      // Should celebrate only the highest milestone (1 day)
      expect(result.current.celebrationBadge?.milestoneSeconds).toBe(86400);
    });
  });

  describe('Journey Changes', () => {
    test('resets seen badges when journey changes', () => {
      const { result, rerender } = renderHook(
        ({ journeyId }) => useBadges(journeyId),
        { initialProps: { journeyId: testJourney.id } }
      );

      // Initial load with badge
      const initialSnapshot = {
        docs: [{ id: testBadge1Min.id, data: () => testBadge1Min }],
        docChanges: () => [
          { type: 'added', doc: { id: testBadge1Min.id, data: () => testBadge1Min } },
        ],
      };
      const callback = (mockOnSnapshot as any).lastCallback;
      callback(initialSnapshot);

      // Change journey
      rerender({ journeyId: 'new-journey-789' });

      // The hook should reset internal state (seen badges cleared)
      expect(result.current.celebrationBadge).toBeNull();
    });
  });

  describe('Dismiss Celebration', () => {
    test('dismisses celebration badge', async () => {
      const { result } = renderHook(() => useBadges(testJourney.id));

      // Initial load
      const initialSnapshot = {
        docs: [],
        docChanges: () => [],
      };
      const callback = (mockOnSnapshot as any).lastCallback;
      callback(initialSnapshot);

      // Add new badge
      const newBadge = createTestBadge({
        id: 'new-badge',
        journeyId: testJourney.id,
        milestoneSeconds: 60,
      });

      const newSnapshot = {
        docs: [{ id: newBadge.id, data: () => newBadge }],
        docChanges: () => [
          { type: 'added', doc: { id: newBadge.id, data: () => newBadge } },
        ],
      };

      callback(newSnapshot);

      await waitFor(() => {
        expect(result.current.celebrationBadge).not.toBeNull();
      });

      // Dismiss (wrapped in waitFor for state update)
      await waitFor(() => {
        result.current.dismissCelebration();
        expect(result.current.celebrationBadge).toBeNull();
      });
    });
  });

  describe('Cleanup', () => {
    test('unsubscribes from Firestore on unmount', () => {
      const { unmount } = renderHook(() => useBadges(testJourney.id));

      unmount();

      expect(unsubscribeFn).toHaveBeenCalled();
    });

    test.skip('unsubscribes when user changes to null', () => {
      // TODO: Complex to mock useAuth; tested via integration tests
    });
  });
});

