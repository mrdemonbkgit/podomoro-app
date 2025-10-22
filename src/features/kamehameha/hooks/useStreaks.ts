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
  resetDisciplineStreak as resetDisciplineStreakService,
  saveStreakState,
  updateLongestStreak,
} from '../services/firestoreService';
import {
  calculateStreakFromStart,
  updateStreakData,
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
  const [disciplineDisplay, setDisciplineDisplay] = useState<StreakDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
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
      
      // Calculate initial displays
      const mainDisp = calculateStreakFromStart(loadedStreaks.main.startDate);
      const discDisp = calculateStreakFromStart(loadedStreaks.discipline.startDate);
      
      setMainDisplay(mainDisp);
      setDisciplineDisplay(discDisp);
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
    const discDisp = calculateStreakFromStart(streaks.discipline.startDate);
    
    setMainDisplay(mainDisp);
    setDisciplineDisplay(discDisp);
    
    // Update streak data object (for longest tracking)
    const updatedMain = updateStreakData(streaks.main);
    const updatedDiscipline = updateStreakData(streaks.discipline);
    
    setStreaks({
      main: updatedMain,
      discipline: updatedDiscipline,
      lastUpdated: Date.now(),
    });
  }, [streaks]);
  
  // ============================================================================
  // Save to Firestore (Every Minute)
  // ============================================================================
  
  const saveToFirestore = useCallback(async () => {
    if (!user || !streaks) return;
    
    try {
      // Calculate current seconds directly from start date to avoid dependency issues
      const mainCurrent = Math.floor((Date.now() - streaks.main.startDate) / 1000);
      const disciplineCurrent = Math.floor((Date.now() - streaks.discipline.startDate) / 1000);
      
      console.log('[useStreaks] Auto-saving to Firestore:', new Date().toLocaleTimeString());
      await saveStreakState(user.uid, mainCurrent, disciplineCurrent);
    } catch (err) {
      console.error('Failed to auto-save streaks:', err);
      // Don't set error state - this is a background operation
    }
  }, [user, streaks]); // Removed mainDisplay and disciplineDisplay dependencies!
  
  // ============================================================================
  // Update Longest Streak (Every 5 Minutes)
  // ============================================================================
  
  const updateLongest = useCallback(async () => {
    if (!user || !streaks) return;
    
    try {
      // Calculate current seconds directly from start date to avoid dependency issues
      const mainCurrent = Math.floor((Date.now() - streaks.main.startDate) / 1000);
      const disciplineCurrent = Math.floor((Date.now() - streaks.discipline.startDate) / 1000);
      
      if (mainCurrent > streaks.main.longestSeconds) {
        await updateLongestStreak(user.uid, 'main', mainCurrent);
      }
      if (disciplineCurrent > streaks.discipline.longestSeconds) {
        await updateLongestStreak(user.uid, 'discipline', disciplineCurrent);
      }
    } catch (err) {
      console.error('Failed to update longest streaks:', err);
    }
  }, [user, streaks]); // Removed mainDisplay and disciplineDisplay dependencies!
  
  // ============================================================================
  // Reset Streak Functions
  // ============================================================================
  
  const resetMainStreak = useCallback(async () => {
    if (!user) return;
    
    try {
      setError(null);
      const updatedStreaks = await resetMainStreakService(user.uid);
      setStreaks(updatedStreaks);
      
      const mainDisp = calculateStreakFromStart(updatedStreaks.main.startDate);
      setMainDisplay(mainDisp);
    } catch (err) {
      console.error('Failed to reset main streak:', err);
      setError(err as Error);
      throw err;
    }
  }, [user]);
  
  const resetDisciplineStreak = useCallback(async () => {
    if (!user) return;
    
    try {
      setError(null);
      const updatedStreaks = await resetDisciplineStreakService(user.uid);
      setStreaks(updatedStreaks);
      
      const discDisp = calculateStreakFromStart(updatedStreaks.discipline.startDate);
      setDisciplineDisplay(discDisp);
    } catch (err) {
      console.error('Failed to reset discipline streak:', err);
      setError(err as Error);
      throw err;
    }
  }, [user]);
  
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
    disciplineDisplay,
    loading,
    error,
    resetMainStreak,
    resetDisciplineStreak,
    refreshStreaks,
  };
}

