/**
 * Kamehameha - Firestore Service
 * 
 * This module handles all Firestore database operations for Kamehameha.
 * All functions are type-safe and include error handling.
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../../../services/firebase/config';
import type { Streaks, CheckIn, Relapse } from '../types/kamehameha.types';
import { resetStreak } from './streakCalculations';
import { createJourney, endJourney, incrementJourneyViolations } from './journeyService';

// ============================================================================
// Constants
// ============================================================================

const USERS_COLLECTION = 'users';
const KAMEHAMEHA_COLLECTION = 'kamehameha';
const STREAKS_DOC = 'streaks';
const CHECKINS_COLLECTION = 'kamehameha_checkIns';
const RELAPSES_COLLECTION = 'kamehameha_relapses';

// ============================================================================
// Path Helpers
// ============================================================================

/**
 * Get path to user's streaks document
 * Returns path string for use with doc()
 */
function getStreaksDocPath(userId: string): string {
  return `${USERS_COLLECTION}/${userId}/${KAMEHAMEHA_COLLECTION}/${STREAKS_DOC}`;
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize default streaks for a new user
 * Also creates the initial journey (Phase 5.1)
 * 
 * @param userId User ID from Firebase Auth
 * @returns Promise that resolves when initialization is complete
 * @throws Error if initialization fails
 */
export async function initializeUserStreaks(userId: string): Promise<Streaks> {
  const now = Date.now();
  
  try {
    // Create initial journey (Phase 5.1)
    console.log('Creating initial journey for user:', userId);
    const journey = await createJourney(userId);
    
    const defaultStreaks: Streaks = {
      currentJourneyId: journey.id, // ← Phase 5.1: Link to journey
      main: {
        startDate: now,
        currentSeconds: 0,
        longestSeconds: 0,
        lastUpdated: now,
      },
      discipline: {
        startDate: now,
        currentSeconds: 0,
        longestSeconds: 0,
        lastUpdated: now,
      },
      lastUpdated: now,
    };
    
    const streaksRef = doc(db, getStreaksDocPath(userId));
    await setDoc(streaksRef, defaultStreaks);
    
    console.log('Streaks initialized with journey:', journey.id);
    
    return defaultStreaks;
  } catch (error) {
    console.error('Failed to initialize user streaks:', error);
    throw new Error('Failed to initialize streaks');
  }
}

// ============================================================================
// Read Operations
// ============================================================================

/**
 * Get user's current streaks from Firestore
 * 
 * @param userId User ID from Firebase Auth
 * @returns Promise resolving to Streaks object
 * @throws Error if fetch fails
 */
export async function getStreaks(userId: string): Promise<Streaks> {
  try {
    const streaksRef = doc(db, getStreaksDocPath(userId));
    const streaksDoc = await getDoc(streaksRef);
    
    if (!streaksDoc.exists()) {
      // First time user - initialize with default streaks
      return await initializeUserStreaks(userId);
    }
    
    return streaksDoc.data() as Streaks;
  } catch (error) {
    console.error('Failed to get streaks:', error);
    throw new Error('Failed to load streaks');
  }
}

/**
 * Check if user has existing streaks
 * 
 * @param userId User ID from Firebase Auth
 * @returns Promise resolving to boolean
 */
export async function hasExistingStreaks(userId: string): Promise<boolean> {
  try {
    const streaksRef = doc(db, getStreaksDocPath(userId));
    const streaksDoc = await getDoc(streaksRef);
    return streaksDoc.exists();
  } catch (error) {
    console.error('Failed to check existing streaks:', error);
    return false;
  }
}

// ============================================================================
// Write Operations
// ============================================================================

/**
 * Update user's streaks in Firestore
 * 
 * @param userId User ID from Firebase Auth
 * @param streaks Updated streaks object
 * @returns Promise that resolves when update is complete
 * @throws Error if update fails
 */
export async function updateStreaks(
  userId: string,
  streaks: Streaks
): Promise<void> {
  try {
    const streaksRef = doc(db, getStreaksDocPath(userId));
    const updatedStreaks = {
      ...streaks,
      lastUpdated: Date.now(),
    };
    
    await updateDoc(streaksRef, updatedStreaks as any);
  } catch (error) {
    console.error('Failed to update streaks:', error);
    throw new Error('Failed to save streaks');
  }
}

/**
 * Save current streak state (called periodically)
 * 
 * @param userId User ID from Firebase Auth
 * @param mainCurrent Current main streak seconds
 * @param disciplineCurrent Current discipline streak seconds
 * @returns Promise that resolves when save is complete
 */
export async function saveStreakState(
  userId: string,
  mainCurrent: number,
  disciplineCurrent: number
): Promise<void> {
  try {
    const streaksRef = doc(db, getStreaksDocPath(userId));
    const now = Date.now();
    
    // Use setDoc with merge and nested objects (NOT dot notation!)
    // setDoc with merge: true and dot notation creates flat keys, not nested paths
    await setDoc(streaksRef, {
      main: {
        currentSeconds: mainCurrent,
        lastUpdated: now,
      },
      discipline: {
        currentSeconds: disciplineCurrent,
        lastUpdated: now,
      },
      lastUpdated: now,
    }, { merge: true });
  } catch (error) {
    console.error('Failed to save streak state:', error);
    // Don't throw - silent fail for auto-save
  }
}

// ============================================================================
// Reset Operations
// ============================================================================

/**
 * Reset main streak (marks relapse)
 * 
 * @param userId User ID from Firebase Auth
 * @returns Promise resolving to new streaks
 * @throws Error if reset fails
 */
export async function resetMainStreak(userId: string, previousSeconds: number): Promise<Streaks> {
  try {
    const currentStreaks = await getStreaks(userId);
    const now = Date.now();
    
    // Phase 5.1: End current journey and create new one
    const currentJourneyId = currentStreaks.currentJourneyId;
    if (currentJourneyId) {
      console.log('Ending journey due to PMO relapse:', currentJourneyId);
      await endJourney(userId, currentJourneyId, previousSeconds);
    }
    
    // Create new journey
    console.log('Creating new journey after PMO relapse');
    const newJourney = await createJourney(userId);
    
    const newMainStreak = resetStreak(currentStreaks.main.longestSeconds);
    
    const updatedStreaks: Streaks = {
      ...currentStreaks,
      currentJourneyId: newJourney.id, // ← Phase 5.1: Link to new journey
      main: newMainStreak,
      lastUpdated: now,
    };
    
    const streaksRef = doc(db, getStreaksDocPath(userId));
    await setDoc(streaksRef, updatedStreaks);
    
    console.log('Main streak reset, new journey:', newJourney.id);
    
    return updatedStreaks;
  } catch (error) {
    console.error('Failed to reset main streak:', error);
    throw new Error('Failed to reset main streak');
  }
}

/**
 * Reset discipline streak (marks rule violation)
 * Phase 5.1: Also increments journey violations count (journey continues)
 * 
 * @param userId User ID from Firebase Auth
 * @returns Promise resolving to new streaks
 * @throws Error if reset fails
 */
export async function resetDisciplineStreak(userId: string): Promise<Streaks> {
  try {
    const currentStreaks = await getStreaks(userId);
    const now = Date.now();
    
    // Phase 5.1: Increment journey violations (journey continues, not ended)
    const currentJourneyId = currentStreaks.currentJourneyId;
    if (currentJourneyId) {
      console.log('Incrementing violations for journey:', currentJourneyId);
      await incrementJourneyViolations(userId, currentJourneyId);
    }
    
    const newDisciplineStreak = resetStreak(currentStreaks.discipline.longestSeconds);
    
    const updatedStreaks: Streaks = {
      ...currentStreaks,
      discipline: newDisciplineStreak,
      lastUpdated: now,
    };
    
    const streaksRef = doc(db, getStreaksDocPath(userId));
    await setDoc(streaksRef, updatedStreaks);
    
    console.log('Discipline streak reset, violation logged in journey');
    
    return updatedStreaks;
  } catch (error) {
    console.error('Failed to reset discipline streak:', error);
    throw new Error('Failed to reset discipline streak');
  }
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Reset both streaks (complete reset)
 * Phase 5.1: Ends current journey and creates new one (since main streak resets)
 * 
 * @param userId User ID from Firebase Auth
 * @param previousMainSeconds Previous main streak seconds
 * @returns Promise resolving to new streaks
 * @throws Error if reset fails
 */
export async function resetBothStreaks(userId: string, previousMainSeconds: number): Promise<Streaks> {
  try {
    const currentStreaks = await getStreaks(userId);
    const now = Date.now();
    
    // Phase 5.1: End current journey (main streak reset = journey ends)
    const currentJourneyId = currentStreaks.currentJourneyId;
    if (currentJourneyId) {
      console.log('Ending journey due to both streaks reset:', currentJourneyId);
      await endJourney(userId, currentJourneyId, previousMainSeconds);
    }
    
    // Create new journey
    console.log('Creating new journey after both streaks reset');
    const newJourney = await createJourney(userId);
    
    const newMainStreak = resetStreak(currentStreaks.main.longestSeconds);
    const newDisciplineStreak = resetStreak(currentStreaks.discipline.longestSeconds);
    
    const updatedStreaks: Streaks = {
      currentJourneyId: newJourney.id, // ← Phase 5.1: Link to new journey
      main: newMainStreak,
      discipline: newDisciplineStreak,
      lastUpdated: now,
    };
    
    const streaksRef = doc(db, getStreaksDocPath(userId));
    await setDoc(streaksRef, updatedStreaks);
    
    console.log('Both streaks reset, new journey:', newJourney.id);
    
    return updatedStreaks;
  } catch (error) {
    console.error('Failed to reset both streaks:', error);
    throw new Error('Failed to reset streaks');
  }
}

// ============================================================================
// Update Longest Streak
// ============================================================================

/**
 * Update longest streak if current is greater
 * 
 * @param userId User ID from Firebase Auth
 * @param streakType 'main' or 'discipline'
 * @param currentSeconds Current streak in seconds
 */
export async function updateLongestStreak(
  userId: string,
  streakType: 'main' | 'discipline',
  currentSeconds: number
): Promise<void> {
  try {
    const streaksRef = doc(db, getStreaksDocPath(userId));
    const streaksDoc = await getDoc(streaksRef);
    
    if (!streaksDoc.exists()) return;
    
    const streaks = streaksDoc.data() as Streaks;
    const currentLongest = streaks[streakType].longestSeconds;
    
    if (currentSeconds > currentLongest) {
      await updateDoc(streaksRef, {
        [`${streakType}.longestSeconds`]: currentSeconds,
        [`${streakType}.lastUpdated`]: Date.now(),
      });
    }
  } catch (error) {
    console.error('Failed to update longest streak:', error);
    // Silent fail
  }
}

// ============================================================================
// Check-In Operations (Phase 3)
// ============================================================================

/**
 * Save a new check-in
 * 
 * @param userId User ID from Firebase Auth
 * @param checkInData Check-in data (without id and createdAt)
 * @returns Promise resolving to created check-in with ID
 * @throws Error if save fails
 */
export async function saveCheckIn(
  userId: string,
  checkInData: Omit<CheckIn, 'id' | 'createdAt'>
): Promise<CheckIn> {
  try {
    // Use collection with proper path segments
    const checkInsRef = collection(db, 'users', userId, CHECKINS_COLLECTION);
    const now = Date.now();
    
    const checkIn: Omit<CheckIn, 'id'> = {
      ...checkInData,
      createdAt: now,
    };
    
    const docRef = await addDoc(checkInsRef, checkIn);
    
    return {
      ...checkIn,
      id: docRef.id,
    };
  } catch (error) {
    console.error('Failed to save check-in:', error);
    throw new Error('Failed to save check-in');
  }
}

/**
 * Get recent check-ins for a user
 * 
 * @param userId User ID from Firebase Auth
 * @param limitCount Maximum number of check-ins to retrieve
 * @returns Promise resolving to array of check-ins
 * @throws Error if fetch fails
 */
export async function getRecentCheckIns(
  userId: string,
  limitCount: number = 10
): Promise<CheckIn[]> {
  try {
    const checkInsRef = collection(db, 'users', userId, CHECKINS_COLLECTION);
    const q = query(checkInsRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    
    const checkIns: CheckIn[] = [];
    querySnapshot.forEach((doc) => {
      checkIns.push({
        id: doc.id,
        ...doc.data(),
      } as CheckIn);
    });
    
    return checkIns;
  } catch (error) {
    console.error('Failed to get recent check-ins:', error);
    throw new Error('Failed to load check-ins');
  }
}

/**
 * Delete a check-in
 * 
 * @param userId User ID from Firebase Auth
 * @param checkInId Check-in document ID
 * @returns Promise that resolves when deletion is complete
 * @throws Error if deletion fails
 */
export async function deleteCheckIn(
  userId: string,
  checkInId: string
): Promise<void> {
  try {
    const checkInRef = doc(db, 'users', userId, 'kamehameha', CHECKINS_COLLECTION, checkInId);
    await deleteDoc(checkInRef);
  } catch (error) {
    console.error('Failed to delete check-in:', error);
    throw new Error('Failed to delete check-in');
  }
}

// ============================================================================
// Relapse Operations (Phase 3)
// ============================================================================

/**
 * Save a new relapse and reset appropriate streak
 * 
 * @param userId User ID from Firebase Auth
 * @param relapseData Relapse data (without id and createdAt)
 * @returns Promise resolving to created relapse with ID
 * @throws Error if save fails
 */
export async function saveRelapse(
  userId: string,
  relapseData: Omit<Relapse, 'id' | 'createdAt' | 'journeyId'>
): Promise<Relapse> {
  try {
    // Phase 5.1: Get current journey ID
    const currentStreaks = await getStreaks(userId);
    const currentJourneyId = currentStreaks.currentJourneyId;
    
    // Save relapse to history
    const relapsesRef = collection(db, 'users', userId, RELAPSES_COLLECTION);
    const now = Date.now();
    
    const relapse: Omit<Relapse, 'id'> = {
      ...relapseData,
      journeyId: currentJourneyId, // ← Phase 5.1: Link to journey
      createdAt: now,
    };
    
    const docRef = await addDoc(relapsesRef, relapse);
    
    // Reset appropriate streak
    const previousSeconds = relapseData.previousStreakSeconds;
    
    if (relapseData.streakType === 'main') {
      await resetMainStreak(userId, previousSeconds); // ← Phase 5.1: Pass previousSeconds
    } else {
      await resetDisciplineStreak(userId);
    }
    
    console.log('Relapse saved:', docRef.id, 'Type:', relapseData.streakType, 'Journey:', currentJourneyId);
    
    return {
      ...relapse,
      id: docRef.id,
    };
  } catch (error) {
    console.error('Failed to save relapse:', error);
    throw new Error('Failed to save relapse');
  }
}

/**
 * Get recent relapses for a user
 * 
 * @param userId User ID from Firebase Auth
 * @param limitCount Maximum number of relapses to retrieve
 * @returns Promise resolving to array of relapses
 * @throws Error if fetch fails
 */
export async function getRecentRelapses(
  userId: string,
  limitCount: number = 10
): Promise<Relapse[]> {
  try {
    const relapsesRef = collection(db, 'users', userId, RELAPSES_COLLECTION);
    const q = query(relapsesRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    
    const relapses: Relapse[] = [];
    querySnapshot.forEach((doc) => {
      relapses.push({
        id: doc.id,
        ...doc.data(),
      } as Relapse);
    });
    
    return relapses;
  } catch (error) {
    console.error('Failed to get recent relapses:', error);
    throw new Error('Failed to load relapses');
  }
}

/**
 * Delete a relapse
 * 
 * @param userId User ID from Firebase Auth
 * @param relapseId Relapse document ID
 * @returns Promise that resolves when deletion is complete
 * @throws Error if deletion fails
 */
export async function deleteRelapse(
  userId: string,
  relapseId: string
): Promise<void> {
  try {
    const relapseRef = doc(db, 'users', userId, 'kamehameha', RELAPSES_COLLECTION, relapseId);
    await deleteDoc(relapseRef);
  } catch (error) {
    console.error('Failed to delete relapse:', error);
    throw new Error('Failed to delete relapse');
  }
}

