/**
 * Test: Badge awarding race condition prevention
 * 
 * Prerequisites:
 * - Firebase emulator must be running
 * - Run with: firebase emulators:exec "npm test badge-race-condition"
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase/config';
import { createBadgeAtomic } from '../hooks/useMilestones';
import { getMilestoneConfig } from '../constants/milestones';

describe('Badge Race Condition Prevention', () => {
  const userId = 'test-user-concurrent';
  const journeyId = 'test-journey-123';
  const milestoneSeconds = 60; // 1 minute (dev milestone)
  
  beforeEach(async () => {
    // Clean up any existing badge from previous test
    const badgeId = `${journeyId}_${milestoneSeconds}`;
    const badgeRef = doc(db, `users/${userId}/kamehameha_badges/${badgeId}`);
    try {
      await deleteDoc(badgeRef);
    } catch (error) {
      // Badge doesn't exist yet, that's fine
    }
    
    // Seed journey document with fresh state (required for transaction)
    const journeyRef = doc(db, `users/${userId}/kamehameha_journeys/${journeyId}`);
    await setDoc(journeyRef, {
      id: journeyId,
      startDate: Date.now() - 70000, // Started 70 seconds ago
      achievementsCount: 0, // Reset to 0 for clean test
      violationsCount: 0,
      isActive: true,
      createdAt: Date.now() - 70000,
      updatedAt: Date.now(),
    });
  });
  
  it('should not double-increment achievementsCount when awarded concurrently', async () => {
    const badgeConfig = getMilestoneConfig(milestoneSeconds);
    
    // Simulate concurrent awarding (client + server scenario)
    const award1 = createBadgeAtomic(userId, journeyId, milestoneSeconds, badgeConfig);
    const award2 = createBadgeAtomic(userId, journeyId, milestoneSeconds, badgeConfig);
    
    // Both calls execute simultaneously
    await Promise.all([award1, award2]);
    
    // Verify: Only 1 badge created (deterministic ID prevents duplicates)
    const badgeId = `${journeyId}_${milestoneSeconds}`;
    const badgeSnap = await getDoc(doc(db, `users/${userId}/kamehameha_badges/${badgeId}`));
    expect(badgeSnap.exists()).toBe(true);
    
    // Verify: achievementsCount incremented ONLY ONCE (atomic transaction)
    const journeySnap = await getDoc(doc(db, `users/${userId}/kamehameha_journeys/${journeyId}`));
    const journey = journeySnap.data();
    expect(journey?.achievementsCount).toBe(1); // Not 2! Transaction prevents race
    
    // Verify: Badge has metadata
    const badge = badgeSnap.data();
    expect(badge?.createdBy).toBeDefined();
    expect(badge?.journeyId).toBe(journeyId);
  });
  
  it('should handle three concurrent awards correctly', async () => {
    const badgeConfig = getMilestoneConfig(milestoneSeconds);
    
    // Test extreme concurrency
    const awards = [
      createBadgeAtomic(userId, journeyId, milestoneSeconds, badgeConfig),
      createBadgeAtomic(userId, journeyId, milestoneSeconds, badgeConfig),
      createBadgeAtomic(userId, journeyId, milestoneSeconds, badgeConfig),
    ];
    
    await Promise.all(awards);
    
    const journeySnap = await getDoc(doc(db, `users/${userId}/kamehameha_journeys/${journeyId}`));
    const journey = journeySnap.data();
    expect(journey?.achievementsCount).toBe(1); // Still 1, not 3!
  });
});

