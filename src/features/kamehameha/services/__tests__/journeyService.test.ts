/**
 * Tests for journey service
 * 
 * Note: These tests use Vitest mocks for Firestore operations.
 * For integration tests with real Firestore, see integration test suite.
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { testUser, testJourney, testEndedJourney, createTestJourney, testRelapseViolation, NOW } from '../../../../test/fixtures/kamehameha';

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  increment: vi.fn((n) => ({ _increment: n })),
}));

// Import after mocking
import * as firestore from 'firebase/firestore';
import {
  createJourney,
  endJourney,
  getCurrentJourney,
  getJourneyHistory,
  incrementJourneyViolations,
  incrementJourneyAchievements,
  getJourneyViolations,
  getJourneyNumber,
} from '../journeyService';

describe('journeyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  describe('createJourney', () => {
    test('creates journey with correct initial values', async () => {
      const mockDocRef = { id: 'new-journey-123' };
      vi.mocked(firestore.addDoc).mockResolvedValue(mockDocRef as any);

      const journey = await createJourney(testUser.uid);

      expect(journey.id).toBe('new-journey-123');
      expect(journey.achievementsCount).toBe(0);
      expect(journey.violationsCount).toBe(0);
      expect(journey.endDate).toBeNull();
      expect(journey.endReason).toBe('active');
      expect(journey.finalSeconds).toBe(0);
      expect(journey.startDate).toBe(NOW);
      expect(journey.createdAt).toBe(NOW);
      expect(journey.updatedAt).toBe(NOW);
    });

    test('calls Firestore with correct collection path', async () => {
      const mockDocRef = { id: 'journey-456' };
      vi.mocked(firestore.addDoc).mockResolvedValue(mockDocRef as any);
      vi.mocked(firestore.collection).mockReturnValue('journeys-collection' as any);

      await createJourney(testUser.uid);

      // Check collection was called with correct path
      const collectionCalls = vi.mocked(firestore.collection).mock.calls;
      expect(collectionCalls[0][1]).toBe(`users/${testUser.uid}/kamehameha_journeys`);
      
      // Check addDoc was called with correct data
      expect(firestore.addDoc).toHaveBeenCalledWith(
        'journeys-collection',
        expect.objectContaining({
          achievementsCount: 0,
          violationsCount: 0,
          endDate: null,
          endReason: 'active',
        })
      );
    });

    test('handles Firestore errors gracefully', async () => {
      vi.mocked(firestore.addDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(createJourney(testUser.uid)).rejects.toThrow('Firestore error');
    });
  });

  describe('endJourney', () => {
    test('ends journey with correct fields', async () => {
      const mockDoc = { exists: () => true, data: () => ({ achievementsCount: 3 }) };
      vi.mocked(firestore.getDoc).mockResolvedValue(mockDoc as any);
      vi.mocked(firestore.updateDoc).mockResolvedValue(undefined as any);

      await endJourney(testUser.uid, testJourney.id, 86400);

      // Check updateDoc was called with correct data
      const updateCalls = vi.mocked(firestore.updateDoc).mock.calls;
      const updateData = updateCalls[0][1];
      expect(updateData).toEqual({
        endDate: NOW,
        endReason: 'relapse',
        finalSeconds: 86400,
        updatedAt: NOW,
      });
    });

    test('preserves achievementsCount when ending', async () => {
      const mockDoc = { exists: () => true, data: () => ({ achievementsCount: 5 }) };
      vi.mocked(firestore.getDoc).mockResolvedValue(mockDoc as any);
      vi.mocked(firestore.updateDoc).mockResolvedValue(undefined as any);

      await endJourney(testUser.uid, testJourney.id, 86400);

      // Verify updateDoc does NOT modify achievementsCount
      const updateCall = vi.mocked(firestore.updateDoc).mock.calls[0][1];
      expect(updateCall).not.toHaveProperty('achievementsCount');
    });

    test('uses correct document path', async () => {
      const mockDoc = { exists: () => true, data: () => ({}) };
      vi.mocked(firestore.getDoc).mockResolvedValue(mockDoc as any);
      vi.mocked(firestore.doc).mockReturnValue('journey-doc-ref' as any);

      await endJourney(testUser.uid, testJourney.id, 86400);

      // Check doc was called with correct path
      const docCalls = vi.mocked(firestore.doc).mock.calls;
      expect(docCalls[0][1]).toBe(`users/${testUser.uid}/kamehameha_journeys/${testJourney.id}`);
    });
  });

  describe('getCurrentJourney', () => {
    test('returns active journey when exists', async () => {
      const mockSnapshot = {
        empty: false,
        docs: [{
          id: testJourney.id,
          data: () => ({
            startDate: testJourney.startDate,
            endDate: null,
            endReason: 'active',
            finalSeconds: 0,
            achievementsCount: 2,
            violationsCount: 0,
            createdAt: testJourney.createdAt,
            updatedAt: testJourney.updatedAt,
          }),
        }],
      };

      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot as any);

      const journey = await getCurrentJourney(testUser.uid);

      expect(journey).not.toBeNull();
      expect(journey?.id).toBe(testJourney.id);
      expect(journey?.endReason).toBe('active');
      expect(journey?.endDate).toBeNull();
    });

    test('returns null when no active journey', async () => {
      const mockSnapshot = { empty: true, docs: [] };
      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot as any);

      const journey = await getCurrentJourney(testUser.uid);

      expect(journey).toBeNull();
    });

    test('queries with correct filters', async () => {
      const mockQuery = vi.fn();
      vi.mocked(firestore.query).mockReturnValue(mockQuery as any);
      vi.mocked(firestore.where).mockReturnValue('where-clause' as any);
      vi.mocked(firestore.limit).mockReturnValue('limit-clause' as any);

      const mockSnapshot = { empty: true, docs: [] };
      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot as any);

      await getCurrentJourney(testUser.uid);

      expect(firestore.where).toHaveBeenCalledWith('endReason', '==', 'active');
      expect(firestore.limit).toHaveBeenCalledWith(1);
    });
  });

  describe('getJourneyHistory', () => {
    test('returns all journeys ordered by start date', async () => {
      const mockSnapshot = {
        docs: [
          { id: testJourney.id, data: () => testJourney },
          { id: testEndedJourney.id, data: () => testEndedJourney },
        ],
      };

      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot as any);

      const journeys = await getJourneyHistory(testUser.uid);

      expect(journeys).toHaveLength(2);
      expect(journeys[0].id).toBe(testJourney.id);
      expect(journeys[1].id).toBe(testEndedJourney.id);
    });

    test('respects limit parameter', async () => {
      vi.mocked(firestore.query).mockReturnValue('mock-query' as any);
      vi.mocked(firestore.limit).mockReturnValue('limit-query' as any);
      
      const mockSnapshot = { docs: [{ id: testJourney.id, data: () => testJourney }] };
      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot as any);

      await getJourneyHistory(testUser.uid, 10);

      expect(firestore.limit).toHaveBeenCalledWith(10);
    });

    test('orders by startDate descending', async () => {
      vi.mocked(firestore.orderBy).mockReturnValue('orderby-clause' as any);
      
      const mockSnapshot = { docs: [] };
      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot as any);

      await getJourneyHistory(testUser.uid);

      expect(firestore.orderBy).toHaveBeenCalledWith('startDate', 'desc');
    });

    test('returns empty array when no journeys', async () => {
      const mockSnapshot = { docs: [] };
      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot as any);

      const journeys = await getJourneyHistory(testUser.uid);

      expect(journeys).toEqual([]);
    });
  });

  describe('incrementJourneyViolations', () => {
    test('increments violations count atomically', async () => {
      vi.mocked(firestore.updateDoc).mockResolvedValue(undefined as any);

      await incrementJourneyViolations(testUser.uid, testJourney.id);

      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          violationsCount: { _increment: 1 },
          updatedAt: NOW,
        })
      );
    });

    test('uses correct document path', async () => {
      vi.mocked(firestore.doc).mockReturnValue('journey-doc' as any);

      await incrementJourneyViolations(testUser.uid, testJourney.id);

      // Check doc was called with correct path
      const docCalls = vi.mocked(firestore.doc).mock.calls;
      expect(docCalls[0][1]).toBe(`users/${testUser.uid}/kamehameha_journeys/${testJourney.id}`);
    });
  });

  describe('incrementJourneyAchievements', () => {
    test('increments achievements count atomically', async () => {
      vi.mocked(firestore.updateDoc).mockResolvedValue(undefined as any);

      await incrementJourneyAchievements(testUser.uid, testJourney.id);

      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          achievementsCount: { _increment: 1 },
          updatedAt: NOW,
        })
      );
    });

    test('uses correct document path', async () => {
      vi.mocked(firestore.doc).mockReturnValue('journey-doc' as any);

      await incrementJourneyAchievements(testUser.uid, testJourney.id);

      // Check doc was called with correct path
      const docCalls = vi.mocked(firestore.doc).mock.calls;
      expect(docCalls[0][1]).toBe(`users/${testUser.uid}/kamehameha_journeys/${testJourney.id}`);
    });
  });

  describe('getJourneyViolations', () => {
    test('returns violations for specific journey', async () => {
      const mockSnapshot = {
        docs: [
          { id: testRelapseViolation.id, data: () => testRelapseViolation },
        ],
      };

      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot as any);

      const violations = await getJourneyViolations(testUser.uid, testJourney.id);

      expect(violations).toHaveLength(1);
      expect(violations[0].id).toBe(testRelapseViolation.id);
      expect(violations[0].type).toBe('ruleViolation');
    });

    test('queries with correct filters', async () => {
      vi.mocked(firestore.where).mockReturnValue('where-clause' as any);
      vi.mocked(firestore.orderBy).mockReturnValue('orderby-clause' as any);

      const mockSnapshot = { docs: [] };
      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot as any);

      await getJourneyViolations(testUser.uid, testJourney.id);

      expect(firestore.where).toHaveBeenCalledWith('journeyId', '==', testJourney.id);
      expect(firestore.where).toHaveBeenCalledWith('streakType', '==', 'discipline');
      expect(firestore.orderBy).toHaveBeenCalledWith('timestamp', 'desc');
    });

    test('falls back to client-side filtering on query error', async () => {
      // First getDocs call fails (missing index)
      // Second call gets all relapses for client-side filtering
      const mockViolation1 = { ...testRelapseViolation, id: '1', journeyId: testJourney.id, streakType: 'discipline', timestamp: NOW - 1000 };
      const mockViolation2 = { ...testRelapseViolation, id: '2', journeyId: 'other-journey', streakType: 'discipline', timestamp: NOW - 2000 };
      const mockViolation3 = { ...testRelapseViolation, id: '3', journeyId: testJourney.id, streakType: 'main', timestamp: NOW - 3000 };
      
      vi.mocked(firestore.getDocs)
        .mockRejectedValueOnce(new Error('Missing index'))
        .mockResolvedValueOnce({
          docs: [
            { id: '1', data: () => mockViolation1 },
            { id: '2', data: () => mockViolation2 },
            { id: '3', data: () => mockViolation3 },
          ],
        } as any);

      const violations = await getJourneyViolations(testUser.uid, testJourney.id);

      // Should only return violations matching both journeyId AND streakType === 'discipline'
      expect(violations).toHaveLength(1);
      expect(violations[0].journeyId).toBe(testJourney.id);
      expect(violations[0].streakType).toBe('discipline');
    });
  });

  describe('getJourneyNumber', () => {
    test('returns correct journey number for first journey', async () => {
      const mockJourneyDoc = {
        exists: () => true,
        data: () => ({ startDate: NOW - 1000 }),
      };

      const mockSnapshot = {
        docs: [
          { id: testJourney.id, data: () => ({ startDate: NOW - 1000 }) },
        ],
      };

      vi.mocked(firestore.getDoc).mockResolvedValue(mockJourneyDoc as any);
      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot as any);

      const journeyNumber = await getJourneyNumber(testUser.uid, testJourney.id);

      expect(journeyNumber).toBe(1);
    });

    test('returns correct journey number for third journey', async () => {
      const mockJourneyDoc = {
        exists: () => true,
        data: () => ({ startDate: NOW - 1000 }),
      };

      const mockSnapshot = {
        docs: [
          { id: 'journey-1', data: () => ({ startDate: NOW - 3000 }) },
          { id: 'journey-2', data: () => ({ startDate: NOW - 2000 }) },
          { id: testJourney.id, data: () => ({ startDate: NOW - 1000 }) },
        ],
      };

      vi.mocked(firestore.getDoc).mockResolvedValue(mockJourneyDoc as any);
      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot as any);

      const journeyNumber = await getJourneyNumber(testUser.uid, testJourney.id);

      expect(journeyNumber).toBe(3);
    });

    test('returns 0 when journey not found', async () => {
      const mockJourneyDoc = { exists: () => false };
      vi.mocked(firestore.getDoc).mockResolvedValue(mockJourneyDoc as any);

      const journeyNumber = await getJourneyNumber(testUser.uid, 'nonexistent-id');

      expect(journeyNumber).toBe(0);
    });

    test('returns 1 on query error (fallback)', async () => {
      const mockJourneyDoc = {
        exists: () => true,
        data: () => ({ startDate: NOW }),
      };

      vi.mocked(firestore.getDoc).mockResolvedValue(mockJourneyDoc as any);
      vi.mocked(firestore.getDocs).mockRejectedValue(new Error('Query error'));

      const journeyNumber = await getJourneyNumber(testUser.uid, testJourney.id);

      expect(journeyNumber).toBe(1);
    });

    test('queries with correct filters', async () => {
      const mockJourneyDoc = {
        exists: () => true,
        data: () => ({ startDate: NOW - 1000 }),
      };

      const mockSnapshot = { docs: [] };

      vi.mocked(firestore.getDoc).mockResolvedValue(mockJourneyDoc as any);
      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot as any);
      vi.mocked(firestore.where).mockReturnValue('where-clause' as any);
      vi.mocked(firestore.orderBy).mockReturnValue('orderby-clause' as any);

      await getJourneyNumber(testUser.uid, testJourney.id);

      expect(firestore.where).toHaveBeenCalledWith('startDate', '<=', NOW - 1000);
      expect(firestore.orderBy).toHaveBeenCalledWith('startDate', 'asc');
    });
  });
});

