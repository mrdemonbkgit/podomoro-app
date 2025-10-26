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
  UpdateData,
} from 'firebase/firestore';
import { db } from '../../../services/firebase/config';
import type { Streaks, CheckIn, Relapse } from '../types/kamehameha.types';
import { createJourney, incrementJourneyViolations } from './journeyService';
import { COLLECTION_PATHS, DOCUMENT_PATHS, getDocPath } from './paths';
import { logger } from '../../../utils/logger';

// ============================================================================
// Path Helpers
// ============================================================================

/**
 * Get path to user's streaks document
 * Returns path string for use with doc()
 */
function getStreaksDocPath(userId: string): string {
  return DOCUMENT_PATHS.streak(userId);
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize default streaks for a new user
 * 
 * Creates the first journey and initializes the streaks document.
 * This function is automatically called when a new user logs in for the first time.
 * 
 * **Phase 5.1 Journey System:**
 * - Creates initial journey with startDate = now
 * - Links journey ID to streaks document
 * - Sets longestSeconds to 0 (no history yet)
 * 
 * @param userId - User ID from Firebase Auth
 * @returns Promise resolving to initialized Streaks object
 * @throws {Error} If Firestore operations fail
 * 
 * @example
 * ```typescript
 * // Automatically called by getStreaks() for new users
 * const streaks = await initializeUserStreaks(user.uid);
 * console.log(streaks.currentJourneyId); // "journey-abc123"
 * ```
 * 
 * @see {@link getStreaks} - Main function that calls this for new users
 * @see {@link createJourney} - Journey creation logic
 */
export async function initializeUserStreaks(userId: string): Promise<Streaks> {
  const now = Date.now();
  
  try {
    // Create initial journey (Phase 5.1 Refactor)
    logger.debug('Creating initial journey for user:', userId);
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
    
    logger.debug('Streaks initialized with journey:', journey.id);
    
    return defaultStreaks;
  } catch (error) {
    logger.error('Failed to initialize user streaks:', error);
    throw new Error('Failed to initialize streaks');
  }
}

// ============================================================================
// Read Operations
// ============================================================================

/**
 * Get user's current streaks from Firestore
 * 
 * This is the main function for loading streak data. For new users,
 * it automatically calls `initializeUserStreaks()` to create the first journey.
 * 
 * **What it returns:**
 * - `currentJourneyId`: Reference to active journey
 * - `main.longestSeconds`: All-time record streak duration
 * - `lastUpdated`: Timestamp of last modification
 * 
 * @param userId - User ID from Firebase Auth
 * @returns Promise resolving to Streaks object
 * @throws {Error} If Firestore read fails
 * 
 * @example
 * ```typescript
 * // Load user's streaks
 * const streaks = await getStreaks(user.uid);
 * 
 * if (streaks.currentJourneyId) {
 *   console.log('Active journey:', streaks.currentJourneyId);
 *   console.log('Record:', streaks.main.longestSeconds, 'seconds');
 * }
 * ```
 * 
 * @see {@link initializeUserStreaks} - Called automatically for new users
 * @see {@link useStreaks} - React hook that uses this function
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
    logger.error('Failed to get streaks:', error);
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
    logger.error('Failed to check existing streaks:', error);
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
    
    await updateDoc(streaksRef, updatedStreaks as UpdateData<Streaks>);
  } catch (error) {
    logger.error('Failed to update streaks:', error);
    throw new Error('Failed to save streaks');
  }
}

// ============================================================================
// Reset Operations
// ============================================================================

/**
 * Reset main streak (marks relapse) - ATOMIC TRANSACTION
 * 
 * **⚠️ CRITICAL FUNCTION** - Uses Firestore transaction to prevent race conditions
 * 
 * This function is called when a user logs a PMO relapse. It performs multiple
 * operations atomically to ensure data consistency:
 * 
 * 1. End current journey (set endDate, endReason, finalSeconds)
 * 2. Create new journey (fresh start)
 * 3. Update longest streak if this journey beat the record
 * 4. Update streaks document with new journey reference
 * 
 * **All operations succeed or fail together** - no intermediate states possible.
 * 
 * **Transaction guarantees:**
 * - No duplicate journeys can be created
 * - longestSeconds is always accurate
 * - currentJourneyId always points to valid journey
 * 
 * @param userId - User ID from Firebase Auth
 * @param previousSeconds - Duration of the journey being ended (in seconds)
 * @returns Promise resolving to updated Streaks object with new journey
 * @throws {Error} If transaction fails or streaks document not found
 * 
 * @example
 * ```typescript
 * // User logs a relapse after 7 days (604800 seconds)
 * const updatedStreaks = await resetMainStreak(user.uid, 604800);
 * 
 * console.log('Old journey ended, new journey:', updatedStreaks.currentJourneyId);
 * console.log('Record streak:', updatedStreaks.main.longestSeconds, 'seconds');
 * ```
 * 
 * @see {@link useStreaks} - Hook that calls this function
 * @see {@link saveRelapse} - Function that uses this for PMO relapses
 */
export async function resetMainStreak(userId: string, previousSeconds: number): Promise<Streaks> {
  try {
    logger.debug('🔄 resetMainStreak START (TRANSACTION):', { userId, previousSeconds });
    
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
              logger.debug('   ⚠️ Ending journey:', currentJourneyId, `(${previousSeconds}s)`);
              const journeyRef = doc(db, getDocPath.journey(userId, currentJourneyId));
        
        transaction.update(journeyRef, {
          endDate: now,
          endReason: 'relapse',
          finalSeconds: previousSeconds,
          updatedAt: now,
        });
      }
      
      // 3. Create new journey (within transaction)
      const newJourneyRef = doc(collection(db, COLLECTION_PATHS.journeys(userId)));
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
      logger.debug('   🆕 Creating new journey:', newJourneyRef.id);
      
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
      logger.debug('   💾 Updating streaks document with new journey');
      
      // Return updated streaks
      return updatedStreaks;
    });
    
    logger.debug('✅ resetMainStreak TRANSACTION COMPLETE');
    
    return result;
  } catch (error) {
    logger.error('❌ Failed to reset main streak:', error);
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
    const checkInsRef = collection(db, COLLECTION_PATHS.checkIns(userId));
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
    logger.error('Failed to save check-in:', error);
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
    const checkInsRef = collection(db, COLLECTION_PATHS.checkIns(userId));
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
    logger.error('Failed to get recent check-ins:', error);
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
    const checkInRef = doc(db, getDocPath.checkIn(userId, checkInId));
    await deleteDoc(checkInRef);
  } catch (error) {
    logger.error('Failed to delete check-in:', error);
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
    const relapsesRef = collection(db, COLLECTION_PATHS.relapses(userId));
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
      logger.debug('PMO relapse saved:', docRef.id, 'Journey ended:', currentJourneyId);
    } else {
      // Rule violation - just increment journey violations count (no streak reset)
      if (currentJourneyId) {
        logger.debug('Rule violation logged in journey:', currentJourneyId);
        await incrementJourneyViolations(userId, currentJourneyId);
      }
      logger.debug('Rule violation saved:', docRef.id, 'Journey continues:', currentJourneyId);
    }
    
    return {
      ...relapse,
      id: docRef.id,
    };
  } catch (error) {
    logger.error('Failed to save relapse:', error);
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
    const relapsesRef = collection(db, COLLECTION_PATHS.relapses(userId));
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
    logger.error('Failed to get recent relapses:', error);
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
    const relapseRef = doc(db, getDocPath.relapse(userId, relapseId));
    await deleteDoc(relapseRef);
  } catch (error) {
    logger.error('Failed to delete relapse:', error);
    throw new Error('Failed to delete relapse');
  }
}

