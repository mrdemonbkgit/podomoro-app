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
} from 'firebase/firestore';
import type { Journey, Relapse } from '../types/kamehameha.types';
import { COLLECTION_PATHS, getDocPath } from './paths';
import { logger } from '../../../utils/logger';

/**
 * Create a new PMO journey
 * Called when user initializes streaks or when a new streak starts after relapse
 *
 * @param userId - User ID
 * @returns Newly created journey
 */
export async function createJourney(userId: string): Promise<Journey> {
  const db = getFirestore();
  const journeysRef = collection(db, COLLECTION_PATHS.journeys(userId));
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

  logger.debug(
    '📝 Creating new journey for user:',
    userId,
    'with data:',
    journeyData
  );

  const docRef = await addDoc(journeysRef, journeyData);

  const journey: Journey = {
    id: docRef.id,
    ...journeyData,
  };

  logger.debug('✅ Journey created in Firestore:', {
    id: journey.id,
    achievementsCount: journey.achievementsCount,
    violationsCount: journey.violationsCount,
  });

  return journey;
}

/**
 * End the current journey (called on PMO relapse)
 * Badges are preserved as historical records
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
  const journeyRef = doc(db, getDocPath.journey(userId, journeyId));

  logger.debug(
    '⏹️ Ending journey:',
    journeyId,
    'Duration:',
    finalSeconds,
    'seconds'
  );

  // Read current journey data before ending
  const journeySnap = await getDoc(journeyRef);
  if (journeySnap.exists()) {
    const currentData = journeySnap.data();
    logger.debug(
      '   Current journey achievementsCount:',
      currentData.achievementsCount
    );
  }

  // Update journey document
  await updateDoc(journeyRef, {
    endDate: Date.now(),
    endReason: 'relapse',
    finalSeconds,
    updatedAt: Date.now(),
  });

  logger.debug(
    '✅ Journey ended:',
    journeyId,
    '(badges preserved for history)'
  );
}

/**
 * Get the current active journey for a user
 *
 * @param userId - User ID
 * @returns Active journey or null if none exists
 */
export async function getCurrentJourney(
  userId: string
): Promise<Journey | null> {
  const db = getFirestore();
  const journeysRef = collection(db, COLLECTION_PATHS.journeys(userId));

  const q = query(journeysRef, where('endReason', '==', 'active'), limit(1));

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    logger.debug('No active journey found for user:', userId);
    return null;
  }

  const docData = snapshot.docs[0];
  const journey: Journey = {
    id: docData.id,
    ...docData.data(),
  } as Journey;

  logger.debug('Found active journey:', journey.id);

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
  const journeysRef = collection(db, COLLECTION_PATHS.journeys(userId));

  let q = query(journeysRef, orderBy('startDate', 'desc'));

  if (limitCount) {
    q = query(q, limit(limitCount));
  }

  const snapshot = await getDocs(q);

  const journeys: Journey[] = snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as Journey
  );

  logger.debug('Loaded journey history:', journeys.length, 'journeys');

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
  const journeyRef = doc(db, getDocPath.journey(userId, journeyId));

  logger.debug('Incrementing violations for journey:', journeyId);

  await updateDoc(journeyRef, {
    violationsCount: increment(1),
    updatedAt: Date.now(),
  });

  logger.debug('Violations incremented for journey:', journeyId);
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
  const journeyRef = doc(db, getDocPath.journey(userId, journeyId));

  logger.debug('Incrementing achievements for journey:', journeyId);

  await updateDoc(journeyRef, {
    achievementsCount: increment(1),
    updatedAt: Date.now(),
  });

  logger.debug('Achievements incremented for journey:', journeyId);
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
  const relapsesRef = collection(db, COLLECTION_PATHS.relapses(userId));

  const q = query(
    relapsesRef,
    where('journeyId', '==', journeyId),
    where('streakType', '==', 'discipline'), // Only discipline violations
    orderBy('timestamp', 'desc')
  );

  try {
    const snapshot = await getDocs(q);

    const violations: Relapse[] = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Relapse
    );

    logger.debug(
      'Loaded violations for journey:',
      journeyId,
      'Count:',
      violations.length
    );

    return violations;
  } catch (error) {
    console.error('Failed to get journey violations:', error);
    // If query fails (e.g., missing index), fall back to fetching all and filtering
    logger.warn('Falling back to client-side filtering (may be slow)');

    const allRelapsesSnapshot = await getDocs(relapsesRef);
    const violations = allRelapsesSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as Relapse)
      .filter((r) => r.journeyId === journeyId && r.streakType === 'discipline')
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
  const journeyRef = doc(db, getDocPath.journey(userId, journeyId));
  const journeyDoc = await getDoc(journeyRef);

  if (!journeyDoc.exists()) {
    console.error('Journey not found:', journeyId);
    return 0;
  }

  const journeyStartDate = journeyDoc.data().startDate;

  // Count all journeys with start date <= this journey's start date
  const journeysRef = collection(db, COLLECTION_PATHS.journeys(userId));
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

    logger.debug('Journey number:', journeyNumber, 'for journey:', journeyId);

    return journeyNumber;
  } catch (error) {
    console.error('Failed to get journey number:', error);
    // Fallback: just return 1
    return 1;
  }
}
