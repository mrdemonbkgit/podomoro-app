/**
 * useRelapses Hook
 * 
 * Manages relapse operations and streak resets
 * Handles creating relapses and automatically resetting appropriate streaks
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { saveRelapse, getRecentRelapses } from '../services/firestoreService';
import type { Relapse } from '../types/kamehameha.types';

export interface UseRelapsesReturn {
  /** Recent relapses */
  relapses: Relapse[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Create a new relapse (automatically resets appropriate streak) */
  createRelapse: (relapseData: Omit<Relapse, 'id' | 'createdAt' | 'timestamp'>) => Promise<void>;
  /** Refresh relapses from Firestore */
  refreshRelapses: () => Promise<void>;
}

export function useRelapses(): UseRelapsesReturn {
  const { user } = useAuth();
  const [relapses, setRelapses] = useState<Relapse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load recent relapses from Firestore
   */
  const refreshRelapses = useCallback(async () => {
    if (!user) {
      setError(new Error('User not authenticated'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const recentRelapses = await getRecentRelapses(user.uid, 10);
      setRelapses(recentRelapses);
    } catch (err) {
      const error = err as Error;
      console.error('Failed to load relapses:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Create a new relapse and reset appropriate streak
   */
  const createRelapse = useCallback(
    async (relapseData: Omit<Relapse, 'id' | 'createdAt' | 'timestamp'>) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      setLoading(true);
      setError(null);

      try {
        const now = Date.now();
        
        // Create relapse with timestamp
        // saveRelapse will automatically reset the appropriate streak
        const newRelapse = await saveRelapse(user.uid, {
          ...relapseData,
          timestamp: now,
        });

        // Add to local state (prepend to beginning)
        setRelapses((prev) => [newRelapse, ...prev]);
      } catch (err) {
        const error = err as Error;
        console.error('Failed to create relapse:', error);
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return {
    relapses,
    loading,
    error,
    createRelapse,
    refreshRelapses,
  };
}

