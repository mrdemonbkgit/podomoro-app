/**
 * useJourneyInfo Hook
 *
 * Provides information about the current journey for display in the dashboard
 * Phase 5.1 - Journey System
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { logger } from '../../../utils/logger';
import {
  getJourneyNumber,
  getJourneyViolations,
} from '../services/journeyService';

interface UseJourneyInfoReturn {
  /** Journey number (1-indexed, e.g., Journey #5) */
  journeyNumber: number;
  /** Number of discipline violations in this journey */
  violationsCount: number;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
}

/**
 * Hook to load journey information for display
 *
 * @param journeyId - Current journey ID
 * @returns Journey info (number, violations count, loading, error)
 */
export function useJourneyInfo(journeyId: string | null): UseJourneyInfoReturn {
  const { user } = useAuth();
  const [journeyNumber, setJourneyNumber] = useState(0);
  const [violationsCount, setViolationsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !journeyId) {
      setLoading(false);
      return;
    }

    async function loadJourneyInfo() {
      try {
        setLoading(true);
        setError(null);

        logger.debug('Loading journey info for:', journeyId);

        // Load journey number and violations in parallel
        const [number, violations] = await Promise.all([
          getJourneyNumber(user!.uid, journeyId!),
          getJourneyViolations(user!.uid, journeyId!),
        ]);

        setJourneyNumber(number);
        setViolationsCount(violations.length);

        logger.debug('Journey info loaded:', {
          number,
          violations: violations.length,
        });
      } catch (err) {
        console.error('Failed to load journey info:', err);
        setError('Failed to load journey info');
        // Set default values on error
        setJourneyNumber(0);
        setViolationsCount(0);
      } finally {
        setLoading(false);
      }
    }

    loadJourneyInfo();
  }, [user, journeyId]);

  return {
    journeyNumber,
    violationsCount,
    loading,
    error,
  };
}
