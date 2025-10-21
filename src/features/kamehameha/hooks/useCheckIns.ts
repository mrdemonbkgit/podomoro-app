/**
 * useCheckIns Hook
 * 
 * Manages check-in operations and state
 * Handles creating and fetching check-ins from Firestore
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { saveCheckIn, getRecentCheckIns } from '../services/firestoreService';
import type { CheckIn } from '../types/kamehameha.types';

export interface UseCheckInsReturn {
  /** Recent check-ins */
  checkIns: CheckIn[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Create a new check-in */
  createCheckIn: (checkInData: Omit<CheckIn, 'id' | 'createdAt' | 'timestamp'>) => Promise<void>;
  /** Refresh check-ins from Firestore */
  refreshCheckIns: () => Promise<void>;
}

export function useCheckIns(): UseCheckInsReturn {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load recent check-ins from Firestore
   */
  const refreshCheckIns = useCallback(async () => {
    if (!user) {
      setError(new Error('User not authenticated'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const recentCheckIns = await getRecentCheckIns(user.uid, 10);
      setCheckIns(recentCheckIns);
    } catch (err) {
      const error = err as Error;
      console.error('Failed to load check-ins:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Create a new check-in
   */
  const createCheckIn = useCallback(
    async (checkInData: Omit<CheckIn, 'id' | 'createdAt' | 'timestamp'>) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      setLoading(true);
      setError(null);

      try {
        const now = Date.now();
        
        // Create check-in with timestamp
        const newCheckIn = await saveCheckIn(user.uid, {
          ...checkInData,
          timestamp: now,
        });

        // Add to local state (prepend to beginning)
        setCheckIns((prev) => [newCheckIn, ...prev]);
      } catch (err) {
        const error = err as Error;
        console.error('Failed to create check-in:', error);
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return {
    checkIns,
    loading,
    error,
    createCheckIn,
    refreshCheckIns,
  };
}

