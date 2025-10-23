/**
 * Kamehameha - Journey Service
 * 
 * Manages journey lifecycle (create, end, query) for the journey-based achievement system.
 * Each journey represents one PMO streak period from start to relapse.
 * 
 * Phase 5.1 - Journey System Refactor
 */

import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  increment,
  deleteDoc,
} from 'firebase/firestore';
import type { Journey, Relapse } from '../types/kamehameha.types';

/**
 * Create a new PMO journey
 * Called when user initializes streaks or when a new streak starts after relapse
 * 
 * @param userId - User ID
 * @returns Newly created journey
 */
export async function createJourney(userId: string): Promise<Journey> {
  const db = getFirestore();
  const journeysRef = collection(db, `users/${userId}/kamehameha_journeys`);
  const now = Date.now();

  const journeyData: Omit<Journey, 'id'> = {
    startDate: now,
    endDate: null,
    endReason: 'active',
    finalSeconds: 0,
    achievementsCount: 0, // ← IMPORTANT: Always start at 0
    violationsCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  console.log('📝 Creating new journey for user:', userId, 'with data:', journeyData);
  
  const docRef = await addDoc(journeysRef, journeyData);

  const journey: Journey = {
    id: docRef.id,
    ...journeyData,
  };

  console.log('✅ Journey created in Firestore:', {
    id: journey.id,
    achievementsCount: journey.achievementsCount,
    violationsCount: journey.violationsCount
  });

  return journey;
}

/**
 * End the current journey (called on PMO relapse)
 * Deletes all badges for this journey since they're temporary
 * 
 * @param userId - User ID
 * @param journeyId - Journey ID to end
 * @param finalSeconds - Final duration of the journey in seconds
 */
export async function endJourney(
  userId: string,
  journeyId: string,
  finalSeconds: number
): Promise<void> {
  const db = getFirestore();
  const journeyRef = doc(db, `users/${userId}/kamehameha_journeys/${journeyId}`);

  console.log('⏹️ Ending journey:', journeyId, 'Duration:', finalSeconds, 'seconds');

  // Read current journey data before ending
  const journeySnap = await getDoc(journeyRef);
  if (journeySnap.exists()) {
    const currentData = journeySnap.data();
    console.log('   Current journey achievementsCount:', currentData.achievementsCount);
  }

  // Update journey document
  await updateDoc(journeyRef, {
    endDate: Date.now(),
    endReason: 'relapse',
    finalSeconds,
    updatedAt: Date.now(),
  });

  // Delete all badges for this journey (badges are temporary)
  console.log('🗑️ Starting badge deletion for journey:', journeyId);
  await deleteBadgesForJourney(userId, journeyId);
  
  // Verify badges are deleted
  const remainingBadgesQuery = query(
    collection(db, `users/${userId}/kamehameha_badges`),
    where('journeyId', '==', journeyId)
  );
  const remainingBadges = await getDocs(remainingBadgesQuery);
  if (remainingBadges.size > 0) {
    console.error(`⚠️ WARNING: ${remainingBadges.size} badge(s) still exist for journey ${journeyId} after deletion!`);
    remainingBadges.forEach(doc => {
      console.error(`   Remaining badge: ${doc.id}`, doc.data());
    });
  } else {
    console.log('✅ Verified: All badges deleted for journey:', journeyId);
  }

  console.log('✅ Journey ended:', journeyId);
}

/**
 * Delete all badges for a specific journey
 * Called when a journey ends (badges are temporary)
 * 
 * IMPORTANT: This deletes badges in two passes:
 * 1. Badges with matching journeyId
 * 2. Badges without journeyId (legacy badges from before Phase 5.1)
 * 
 * @param userId - User ID
 * @param journeyId - Journey ID
 */
async function deleteBadgesForJourney(userId: string, journeyId: string): Promise<void> {
  const db = getFirestore();
  const badgesRef = collection(db, `users/${userId}/kamehameha_badges`);
  
  console.log(`🗑️ Deleting badges for journey: ${journeyId}`);
  
  // Pass 1: Delete badges with matching journeyId
  const qWithJourney = query(badgesRef, where('journeyId', '==', journeyId));
  const snapshotWithJourney = await getDocs(qWithJourney);
  
  console.log(`   Found ${snapshotWithJourney.size} badge(s) with journeyId`);
  
  if (snapshotWithJourney.size > 0) {
    const deletePromises = snapshotWithJourney.docs.map(doc => {
      console.log(`   Deleting badge: ${doc.id} (${doc.data().badgeName})`);
      return deleteDoc(doc.ref);
    });
    await Promise.all(deletePromises);
    console.log(`   ✅ Deleted ${snapshotWithJourney.size} badge(s) with journeyId`);
  }
  
  // Pass 2: Delete ALL badges without journeyId (legacy cleanup)
  // These are orphaned badges from before the journey system
  const allBadgesSnapshot = await getDocs(badgesRef);
  const badgesWithoutJourney = allBadgesSnapshot.docs.filter(doc => !doc.data().journeyId);
  
  if (badgesWithoutJourney.length > 0) {
    console.log(`   Found ${badgesWithoutJourney.length} legacy badge(s) without journeyId`);
    const deletePromises = badgesWithoutJourney.map(doc => {
      console.log(`   Deleting legacy badge: ${doc.id} (${doc.data().badgeName})`);
      return deleteDoc(doc.ref);
    });
    await Promise.all(deletePromises);
    console.log(`   ✅ Deleted ${badgesWithoutJourney.length} legacy badge(s)`);
  }
  
  const totalDeleted = snapshotWithJourney.size + badgesWithoutJourney.length;
  console.log(`✅ Total badges deleted: ${totalDeleted}`);
}

/**
 * Get the current active journey for a user
 * 
 * @param userId - User ID
 * @returns Active journey or null if none exists
 */
export async function getCurrentJourney(userId: string): Promise<Journey | null> {
  const db = getFirestore();
  const journeysRef = collection(db, `users/${userId}/kamehameha_journeys`);

  const q = query(
    journeysRef,
    where('endReason', '==', 'active'),
    limit(1)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log('No active journey found for user:', userId);
    return null;
  }

  const docData = snapshot.docs[0];
  const journey: Journey = {
    id: docData.id,
    ...docData.data(),
  } as Journey;

  console.log('Found active journey:', journey.id);

  return journey;
}

/**
 * Get all journeys for a user (for journey history page)
 * 
 * @param userId - User ID
 * @param limitCount - Optional limit on number of journeys to return
 * @returns Array of journeys, ordered by start date (newest first)
 */
export async function getJourneyHistory(
  userId: string,
  limitCount?: number
): Promise<Journey[]> {
  const db = getFirestore();
  const journeysRef = collection(db, `users/${userId}/kamehameha_journeys`);

  let q = query(
    journeysRef,
    orderBy('startDate', 'desc')
  );

  if (limitCount) {
    q = query(q, limit(limitCount));
  }

  const snapshot = await getDocs(q);

  const journeys: Journey[] = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Journey));

  console.log('Loaded journey history:', journeys.length, 'journeys');

  return journeys;
}

/**
 * Increment the violations count for a journey
 * Called when user reports a discipline relapse
 * 
 * @param userId - User ID
 * @param journeyId - Journey ID
 */
export async function incrementJourneyViolations(
  userId: string,
  journeyId: string
): Promise<void> {
  const db = getFirestore();
  const journeyRef = doc(db, `users/${userId}/kamehameha_journeys/${journeyId}`);

  console.log('Incrementing violations for journey:', journeyId);

  await updateDoc(journeyRef, {
    violationsCount: increment(1),
    updatedAt: Date.now(),
  });

  console.log('Violations incremented for journey:', journeyId);
}

/**
 * Increment the achievements count for a journey
 * Called when user earns a badge (milestone reached)
 * 
 * @param userId - User ID
 * @param journeyId - Journey ID
 */
export async function incrementJourneyAchievements(
  userId: string,
  journeyId: string
): Promise<void> {
  const db = getFirestore();
  const journeyRef = doc(db, `users/${userId}/kamehameha_journeys/${journeyId}`);

  console.log('Incrementing achievements for journey:', journeyId);

  await updateDoc(journeyRef, {
    achievementsCount: increment(1),
    updatedAt: Date.now(),
  });

  console.log('Achievements incremented for journey:', journeyId);
}

/**
 * Get all violations (discipline relapses) for a specific journey
 * Used in Journey History page to show violation details
 * 
 * @param userId - User ID
 * @param journeyId - Journey ID
 * @returns Array of relapses for this journey
 */
export async function getJourneyViolations(
  userId: string,
  journeyId: string
): Promise<Relapse[]> {
  const db = getFirestore();
  const relapsesRef = collection(db, `users/${userId}/kamehameha_relapses`);

  const q = query(
    relapsesRef,
    where('journeyId', '==', journeyId),
    where('streakType', '==', 'discipline'), // Only discipline violations
    orderBy('timestamp', 'desc')
  );

  try {
    const snapshot = await getDocs(q);

    const violations: Relapse[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Relapse));

    console.log('Loaded violations for journey:', journeyId, 'Count:', violations.length);

    return violations;
  } catch (error) {
    console.error('Failed to get journey violations:', error);
    // If query fails (e.g., missing index), fall back to fetching all and filtering
    console.warn('Falling back to client-side filtering (may be slow)');
    
    const allRelapsesSnapshot = await getDocs(relapsesRef);
    const violations = allRelapsesSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Relapse))
      .filter(r => r.journeyId === journeyId && r.streakType === 'discipline')
      .sort((a, b) => b.timestamp - a.timestamp);
    
    return violations;
  }
}

/**
 * Get the journey number (1-indexed) for a specific journey
 * Used to display "Journey #5" in the UI
 * 
 * @param userId - User ID
 * @param journeyId - Journey ID
 * @returns Journey number (1 = first journey, 2 = second, etc.)
 */
export async function getJourneyNumber(
  userId: string,
  journeyId: string
): Promise<number> {
  const db = getFirestore();
  
  // Get the journey's start date
  const journeyRef = doc(db, `users/${userId}/kamehameha_journeys/${journeyId}`);
  const journeyDoc = await getDoc(journeyRef);
  
  if (!journeyDoc.exists()) {
    console.error('Journey not found:', journeyId);
    return 0;
  }
  
  const journeyStartDate = journeyDoc.data().startDate;
  
  // Count all journeys with start date <= this journey's start date
  const journeysRef = collection(db, `users/${userId}/kamehameha_journeys`);
  const q = query(
    journeysRef,
    where('startDate', '<=', journeyStartDate),
    orderBy('startDate', 'asc')
  );
  
  try {
    const snapshot = await getDocs(q);
    
    // Find the index of this journey in the list
    let journeyNumber = 0;
    snapshot.docs.forEach((doc, index) => {
      if (doc.id === journeyId) {
        journeyNumber = index + 1; // 1-indexed
      }
    });
    
    console.log('Journey number:', journeyNumber, 'for journey:', journeyId);
    
    return journeyNumber;
  } catch (error) {
    console.error('Failed to get journey number:', error);
    // Fallback: just return 1
    return 1;
  }
}

