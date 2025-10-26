/**
 * Kamehameha - useStreaks Hook (Simplified)
 * 
 * Manages streak state by loading journey data and calculating display in real-time.
 * NO AUTO-SAVE: All timing calculated from immutable journey.startDate
 * 
 * Phase 5.1 Refactor: Removed auto-save intervals and race condition locks
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import type { Streaks, StreakDisplay, UseStreaksReturn } from '../types/kamehameha.types';
import { logger } from '../../../utils/logger';
import { INTERVALS } from '../constants/app.constants';
import {
  getStreaks,
  resetMainStreak as resetMainStreakService,
} from '../services/firestoreService';
import { getCurrentJourney } from '../services/journeyService';
import {
  calculateStreakFromStart,
} from '../services/streakCalculations';

// ============================================================================
// useStreaks Hook
// ============================================================================

export function useStreaks(): UseStreaksReturn {
  const { user } = useAuth();
  const [streaks, setStreaks] = useState<Streaks | null>(null);
  const [mainDisplay, setMainDisplay] = useState<StreakDisplay | null>(null);
  const [currentJourneyId, setCurrentJourneyId] = useState<string | null>(null);
  const [journeyStartDate, setJourneyStartDate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Ref for update interval
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // ============================================================================
  // Load Streaks and Journey from Firestore
  // ============================================================================
  
  const loadStreaks = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setError(null);
      
      // Load streaks document (contains journey reference)
      const loadedStreaks = await getStreaks(user.uid);
      setStreaks(loadedStreaks);
      setCurrentJourneyId(loadedStreaks.currentJourneyId || null);
      
      // Load current journey to get startDate
      if (loadedStreaks.currentJourneyId) {
        const journey = await getCurrentJourney(user.uid);
        if (journey) {
          setJourneyStartDate(journey.startDate);
          
          // Calculate initial display from journey startDate
          const mainDisp = calculateStreakFromStart(journey.startDate);
          setMainDisplay(mainDisp);
        } else {
          logger.warn('No active journey found');
          setMainDisplay(null);
        }
      } else {
        setMainDisplay(null);
      }
      
      setLoading(false);
    } catch (err) {
      logger.error('Failed to load streaks:', err);
      setError(err as Error);
      setLoading(false);
    }
  }, [user]);
  
  // ============================================================================
  // Update Display (Every Second)
  // ============================================================================
  
  const updateDisplay = useCallback(() => {
    if (!journeyStartDate) return;
    
    // Calculate display from journey startDate (source of truth)
    const mainDisp = calculateStreakFromStart(journeyStartDate);
    setMainDisplay(mainDisp);
  }, [journeyStartDate]);
  
  // ============================================================================
  // Reset Streak Function
  // ============================================================================
  
  const resetMainStreak = useCallback(async () => {
    if (!user || !streaks || !mainDisplay) return;
    
    try {
      setError(null);
      
      logger.debug('[useStreaks] Resetting main streak...');
      
      // Reset journey (transaction-based, atomic)
      const updatedStreaks = await resetMainStreakService(user.uid, mainDisplay.totalSeconds);
      
      // Reload everything to get fresh journey
      setStreaks(updatedStreaks);
      setCurrentJourneyId(updatedStreaks.currentJourneyId || null);
      
      // Load new journey
      if (updatedStreaks.currentJourneyId) {
        const journey = await getCurrentJourney(user.uid);
        if (journey) {
          setJourneyStartDate(journey.startDate);
          const mainDisp = calculateStreakFromStart(journey.startDate);
          setMainDisplay(mainDisp);
        }
      }
      
      logger.debug('[useStreaks] Reset complete');
    } catch (err) {
      logger.error('Failed to reset main streak:', err);
      setError(err as Error);
      throw err;
    }
  }, [user, streaks, mainDisplay]);
  
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
  
  // Set up real-time display update interval (every second)
  useEffect(() => {
    if (!journeyStartDate) return;
    
    // Update immediately
    updateDisplay();
    
    // Then update every second
    updateIntervalRef.current = setInterval(() => {
      updateDisplay();
    }, INTERVALS.UPDATE_DISPLAY_MS);
    
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [journeyStartDate, updateDisplay]);
  
  // ============================================================================
  // Return Hook Interface
  // ============================================================================
  
  return {
    streaks,
    mainDisplay,
    currentJourneyId,
    journeyStartDate,
    loading,
    error,
    resetMainStreak,
    refreshStreaks,
  };
}
