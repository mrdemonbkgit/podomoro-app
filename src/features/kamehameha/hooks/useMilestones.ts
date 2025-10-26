/**
 * Client-side milestone detection for real-time badge creation.
 * Monitors journey elapsed time and creates badges when thresholds are crossed.
 * @see docs/API_REFERENCE.md for complete documentation
 */

import { useEffect, useRef } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { doc, setDoc, getFirestore, increment, updateDoc } from 'firebase/firestore';
import { getDocPath } from '../services/paths';
import { INTERVALS } from '../constants/app.constants';
import { MILESTONE_SECONDS, getMilestoneConfig } from '../constants/milestones';
import { logger } from '../../../utils/logger';

interface UseMilestonesProps {
  currentJourneyId: string | null;
  journeyStartDate: number | null;
}

/**
 * Hook to detect milestones in real-time (client-side)
 */
export function useMilestones({ currentJourneyId, journeyStartDate }: UseMilestonesProps) {
  const { user } = useAuth();
  const lastCheckedSecond = useRef<number>(0);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user || !currentJourneyId || !journeyStartDate) {
      return;
    }

    const db = getFirestore();

    const checkMilestones = async () => {
      const currentSeconds = Math.floor((Date.now() - journeyStartDate) / 1000);

      // Find milestones that were just crossed
      for (const milestone of MILESTONE_SECONDS) {
        if (lastCheckedSecond.current < milestone && currentSeconds >= milestone) {
          logger.debug(`🎯 Client detected milestone: ${milestone}s`);

          try {
            // Create badge with deterministic ID (idempotent)
            const badgeId = `${currentJourneyId}_${milestone}`;
            const badgeRef = doc(db, getDocPath.badge(user.uid, badgeId));
            
            const badgeConfig = getMilestoneConfig(milestone);

            // Use setDoc for idempotency (won't duplicate if already exists)
            await setDoc(badgeRef, {
              journeyId: currentJourneyId,
              milestoneSeconds: milestone,
              earnedAt: Date.now(),
              badgeEmoji: badgeConfig.emoji,
              badgeName: badgeConfig.name,
              congratsMessage: badgeConfig.message,
              createdBy: 'client',
            });

            // Increment journey achievements count
            const journeyRef = doc(db, getDocPath.journey(user.uid, currentJourneyId));
            await updateDoc(journeyRef, {
              achievementsCount: increment(1),
              updatedAt: Date.now(),
            });

            logger.debug(`✅ Badge created (client): ${badgeConfig.name}`);
          } catch (error) {
            logger.error(`Failed to create badge for ${milestone}s:`, error);
            // Don't throw - just log and continue
          }
        }
      }

      lastCheckedSecond.current = currentSeconds;
    };

    // Check immediately
    checkMilestones();

    // Then check every second
    checkIntervalRef.current = setInterval(checkMilestones, INTERVALS.MILESTONE_CHECK_MS);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [user, currentJourneyId, journeyStartDate]);

  // Reset when journey changes
  useEffect(() => {
    lastCheckedSecond.current = 0;
  }, [currentJourneyId]);
}

