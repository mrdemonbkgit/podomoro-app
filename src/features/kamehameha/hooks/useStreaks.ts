/**
 * Kamehameha - useStreaks Hook
 * 
 * Main state management hook for streak tracking.
 * Handles loading, real-time updates, and persistence.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import type { Streaks, StreakDisplay, UseStreaksReturn } from '../types/kamehameha.types';
import {
  getStreaks,
  resetMainStreak as resetMainStreakService,
  saveStreakState,
  updateLongestStreak,
} from '../services/firestoreService';
import {
  calculateStreakFromStart,
} from '../services/streakCalculations';

// ============================================================================
// Constants
// ============================================================================

const UPDATE_INTERVAL = 1000; // Update display every second
const SAVE_INTERVAL = 60000; // Save to Firestore every minute
const LONGEST_UPDATE_INTERVAL = 300000; // Update longest every 5 minutes

// ============================================================================
// useStreaks Hook
// ============================================================================

export function useStreaks(): UseStreaksReturn {
  const { user } = useAuth();
  const [streaks, setStreaks] = useState<Streaks | null>(null);
  const [mainDisplay, setMainDisplay] = useState<StreakDisplay | null>(null);
  const [currentJourneyId, setCurrentJourneyId] = useState<string | null>(null); // ← Phase 5.1
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Lock to prevent auto-save during reset operations (race condition fix)
  const isResettingRef = useRef(false);
  
  // Refs for intervals
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const longestIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // ============================================================================
  // Load Streaks from Firestore
  // ============================================================================
  
  const loadStreaks = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setError(null);
      const loadedStreaks = await getStreaks(user.uid);
      setStreaks(loadedStreaks);
      
      // Phase 5.1: Set current journey ID
      setCurrentJourneyId(loadedStreaks.currentJourneyId || null);
      
      // Calculate initial display
      const mainDisp = calculateStreakFromStart(loadedStreaks.main.startDate);
      
      setMainDisplay(mainDisp);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load streaks:', err);
      setError(err as Error);
      setLoading(false);
    }
  }, [user]);
  
  // ============================================================================
  // Update Display (Every Second)
  // ============================================================================
  
  const updateDisplay = useCallback(() => {
    if (!streaks) return;
    
    const mainDisp = calculateStreakFromStart(streaks.main.startDate);
    
    setMainDisplay(mainDisp);
    
    // DON'T update streaks state here - it causes the save interval to reset every second!
    // The streaks state only needs to update when loading from Firestore or resetting.
    // For longest streak tracking, we'll check at save time using current calculated values.
  }, [streaks]);
  
  // ============================================================================
  // Save to Firestore (Every Minute)
  // ============================================================================
  
  const saveToFirestore = useCallback(async () => {
    if (!user || !streaks) return;
    
    // CRITICAL: Skip auto-save if we're in the middle of a reset operation
    // This prevents race condition where old startDate calculates wrong currentSeconds
    if (isResettingRef.current) {
      console.log('[useStreaks] ⏭️ Skipping auto-save (reset in progress)');
      return;
    }
    
    try {
      // Calculate current seconds directly from start date
      const mainCurrent = Math.floor((Date.now() - streaks.main.startDate) / 1000);
      
      console.log('[useStreaks] Auto-saving to Firestore:', new Date().toLocaleTimeString());
      await saveStreakState(user.uid, mainCurrent);
    } catch (err) {
      console.error('Failed to auto-save streaks:', err);
      // Don't set error state - this is a background operation
    }
  }, [user, streaks]);
  
  // ============================================================================
  // Update Longest Streak (Every 5 Minutes)
  // ============================================================================
  
  const updateLongest = useCallback(async () => {
    if (!user || !streaks) return;
    
    // Skip if resetting (same race condition prevention)
    if (isResettingRef.current) {
      console.log('[useStreaks] ⏭️ Skipping longest update (reset in progress)');
      return;
    }
    
    try {
      // Calculate current seconds directly from start date
      const mainCurrent = Math.floor((Date.now() - streaks.main.startDate) / 1000);
      
      // Check if main streak reached new longest
      if (mainCurrent > streaks.main.longestSeconds) {
        await updateLongestStreak(user.uid, mainCurrent);
        const updatedStreaks = { ...streaks };
        updatedStreaks.main = { ...updatedStreaks.main, longestSeconds: mainCurrent };
        setStreaks(updatedStreaks);
      }
    } catch (err) {
      console.error('Failed to update longest streak:', err);
    }
  }, [user, streaks]);
  
  // ============================================================================
  // Reset Streak Functions
  // ============================================================================
  
  const resetMainStreak = useCallback(async () => {
    if (!user || !streaks) return;
    
    try {
      setError(null);
      
      // CRITICAL: Set lock to prevent auto-save race condition
      console.log('[useStreaks] 🔒 Locking auto-save during reset');
      isResettingRef.current = true;
      
      const updatedStreaks = await resetMainStreakService(user.uid, streaks.main.currentSeconds);
      setStreaks(updatedStreaks);
      
      const mainDisp = calculateStreakFromStart(updatedStreaks.main.startDate);
      setMainDisplay(mainDisp);
      
      // Release lock after state is updated
      console.log('[useStreaks] 🔓 Unlocking auto-save after reset');
      isResettingRef.current = false;
    } catch (err) {
      console.error('Failed to reset main streak:', err);
      setError(err as Error);
      // Release lock even on error
      isResettingRef.current = false;
      throw err;
    }
  }, [user, streaks]);
  
  const refreshStreaks = useCallback(async () => {
    await loadStreaks();
  }, [loadStreaks]);
  
  // ============================================================================
  // Effects
  // ============================================================================
  
  // Load streaks on mount or when user changes
  useEffect(() => {
    loadStreaks();
  }, [loadStreaks]);
  
  // Set up real-time update interval (every second)
  useEffect(() => {
    if (!streaks) return;
    
    updateIntervalRef.current = setInterval(() => {
      updateDisplay();
    }, UPDATE_INTERVAL);
    
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [streaks, updateDisplay]);
  
  // Set up auto-save interval (every minute)
  useEffect(() => {
    if (!user || !streaks) return;
    
    saveIntervalRef.current = setInterval(() => {
      saveToFirestore();
    }, SAVE_INTERVAL);
    
    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [user, streaks, saveToFirestore]);
  
  // Set up longest streak update interval (every 5 minutes)
  useEffect(() => {
    if (!user || !streaks) return;
    
    longestIntervalRef.current = setInterval(() => {
      updateLongest();
    }, LONGEST_UPDATE_INTERVAL);
    
    return () => {
      if (longestIntervalRef.current) {
        clearInterval(longestIntervalRef.current);
      }
    };
  }, [user, streaks, updateLongest]);
  
  // Save on unmount (before page closes)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Note: navigator.sendBeacon would need a server endpoint.
      // For now, we rely on periodic saves.
      // TODO: Implement beacon endpoint in Phase 4
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Final save before unmount
      if (user && streaks) {
        saveToFirestore();
      }
    };
  }, [user, streaks, saveToFirestore]);
  
  // ============================================================================
  // Return Hook Interface
  // ============================================================================
  
  return {
    streaks,
    mainDisplay,
    currentJourneyId, // ← Phase 5.1
    loading,
    error,
    resetMainStreak,
    refreshStreaks,
  };
}

