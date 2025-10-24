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
  runTransaction,
} from 'firebase/firestore';
import { db } from '../../../services/firebase/config';
import type { Streaks, CheckIn, Relapse } from '../types/kamehameha.types';
import { createJourney, incrementJourneyViolations } from './journeyService';

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
    // Create initial journey (Phase 5.1 Refactor)
    console.log('Creating initial journey for user:', userId);
    const journey = await createJourney(userId);
    
    // Simplified streaks document (no timing data, just journey reference)
    const defaultStreaks: Streaks = {
      currentJourneyId: journey.id,
      main: {
        longestSeconds: 0, // All-time record
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
 * Phase 5.1: Only saves main streak now
 * 
 * @param userId User ID from Firebase Auth
 * @param mainCurrent Current main streak seconds
 * @returns Promise that resolves when save is complete
 */
// ============================================================================
// Reset Operations
// ============================================================================

/**
 * Reset main streak (marks relapse) - ATOMIC TRANSACTION
 * 
 * Uses Firestore transaction to ensure atomicity:
 * - End current journey
 * - Create new journey
 * - Update longest streak if needed
 * - Update streaks document
 * 
 * All operations succeed or fail together (no intermediate states)
 * 
 * @param userId User ID from Firebase Auth
 * @param previousSeconds Duration of the journey being ended
 * @returns Promise resolving to new streaks
 * @throws Error if reset fails
 */
export async function resetMainStreak(userId: string, previousSeconds: number): Promise<Streaks> {
  try {
    console.log('🔄 resetMainStreak START (TRANSACTION):', { userId, previousSeconds });
    
    const now = Date.now();
    
    // Use Firestore transaction for atomicity
    const result = await runTransaction(db, async (transaction) => {
      // 1. Read current streaks
      const streaksRef = doc(db, getStreaksDocPath(userId));
      const streaksSnap = await transaction.get(streaksRef);
      
      if (!streaksSnap.exists()) {
        throw new Error('Streaks document not found');
      }
      
      const currentStreaks = streaksSnap.data() as Streaks;
      const currentJourneyId = currentStreaks.currentJourneyId;
      
      // 2. End current journey if exists
      if (currentJourneyId) {
        console.log('   ⚠️ Ending journey:', currentJourneyId, `(${previousSeconds}s)`);
        const journeyRef = doc(db, `users/${userId}/kamehameha_journeys/${currentJourneyId}`);
        
        transaction.update(journeyRef, {
          endDate: now,
          endReason: 'relapse',
          finalSeconds: previousSeconds,
          updatedAt: now,
        });
      }
      
      // 3. Create new journey (within transaction)
      const newJourneyRef = doc(collection(db, `users/${userId}/kamehameha_journeys`));
      const newJourney = {
        startDate: now,
        endDate: null,
        endReason: 'active',
        finalSeconds: 0,
        achievementsCount: 0,
        violationsCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      
      transaction.set(newJourneyRef, newJourney);
      console.log('   🆕 Creating new journey:', newJourneyRef.id);
      
      // 4. Update longest streak if this journey beat the record
      const newLongestSeconds = Math.max(
        currentStreaks.main.longestSeconds,
        previousSeconds
      );
      
      // 5. Update streaks document with new journey reference
      const updatedStreaks: Streaks = {
        ...currentStreaks,
        currentJourneyId: newJourneyRef.id,
        main: {
          longestSeconds: newLongestSeconds,
        },
        lastUpdated: now,
      };
      
      transaction.set(streaksRef, updatedStreaks);
      console.log('   💾 Updating streaks document with new journey');
      
      // Return updated streaks
      return updatedStreaks;
    });
    
    console.log('✅ resetMainStreak TRANSACTION COMPLETE');
    
    return result;
  } catch (error) {
    console.error('❌ Failed to reset main streak:', error);
    throw new Error('Failed to reset main streak');
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
    
    // Reset streak or log violation
    const previousSeconds = relapseData.previousStreakSeconds;
    
    if (relapseData.streakType === 'main') {
      // PMO relapse - reset main streak and end journey
      await resetMainStreak(userId, previousSeconds); // ← Phase 5.1: Pass previousSeconds
      console.log('PMO relapse saved:', docRef.id, 'Journey ended:', currentJourneyId);
    } else {
      // Rule violation - just increment journey violations count (no streak reset)
      if (currentJourneyId) {
        console.log('Rule violation logged in journey:', currentJourneyId);
        await incrementJourneyViolations(userId, currentJourneyId);
      }
      console.log('Rule violation saved:', docRef.id, 'Journey continues:', currentJourneyId);
    }
    
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

