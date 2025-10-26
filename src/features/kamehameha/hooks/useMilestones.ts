/**
 * Client-side milestone detection for real-time badge creation.
 * Monitors journey elapsed time and creates badges when thresholds are crossed.
 */

import { useEffect, useRef } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { doc, runTransaction, increment } from 'firebase/firestore';
import { db } from '../../../services/firebase/config';
import { getDocPath } from '../services/paths';
import { INTERVALS } from '../constants/app.constants';
import { MILESTONE_SECONDS, getMilestoneConfig } from '../constants/milestones';
import { logger } from '../../../utils/logger';
import type { MilestoneConfig } from '../types/kamehameha.types';

interface UseMilestonesProps {
  currentJourneyId: string | null;
  journeyStartDate: number | null;
}

/**
 * Create badge atomically with journey achievement count increment.
 * Uses Firestore transaction to prevent race conditions between client and server.
 * 
 * @param userId - User ID
 * @param journeyId - Current journey ID
 * @param milestoneSeconds - Milestone threshold in seconds
 * @param badgeConfig - Badge configuration (emoji, name, message)
 * @returns Promise that resolves when badge is created
 * 
 * @remarks
 * - Uses deterministic badge ID: {journeyId}_{milestoneSeconds}
 * - Idempotent: Won't create duplicate badges
 * - Atomic: Badge creation and count increment happen together
 */
export async function createBadgeAtomic(
  userId: string,
  journeyId: string,
  milestoneSeconds: number,
  badgeConfig: MilestoneConfig
): Promise<void> {
  // Deterministic badge ID ensures idempotency
  const badgeId = `${journeyId}_${milestoneSeconds}`;
  const badgeRef = doc(db, getDocPath.badge(userId, badgeId));
  const journeyRef = doc(db, getDocPath.journey(userId, journeyId));

  try {
    await runTransaction(db, async (transaction) => {
      // Read badge to check if it exists
      const badgeSnap = await transaction.get(badgeRef);

      if (badgeSnap.exists()) {
        logger.info(`Badge ${badgeId} already exists, skipping`);
        return; // Already awarded (idempotent)
      }

      // Atomic: Create badge + increment achievements
      transaction.set(badgeRef, {
        journeyId,
        milestoneSeconds,
        earnedAt: Date.now(),
        badgeEmoji: badgeConfig.emoji,
        badgeName: badgeConfig.name,
        congratsMessage: badgeConfig.message,
        streakType: 'main',
        createdBy: 'client',
        createdAt: Date.now(),
      });

      transaction.update(journeyRef, {
        achievementsCount: increment(1),
        updatedAt: Date.now(),
      });

      logger.debug(`✅ Badge created atomically (client): ${badgeConfig.name}`);
    });
  } catch (error) {
    logger.error('Failed to create badge atomically', { error, badgeId });
    throw error;
  }
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

    const checkMilestones = async () => {
      const currentSeconds = Math.floor((Date.now() - journeyStartDate) / 1000);

      // Find milestones that were just crossed
      for (const milestone of MILESTONE_SECONDS) {
        if (lastCheckedSecond.current < milestone && currentSeconds >= milestone) {
          logger.debug(`🎯 Client detected milestone: ${milestone}s`);

          try {
            const badgeConfig = getMilestoneConfig(milestone);
            
            // Create badge atomically (prevents race conditions)
            await createBadgeAtomic(user.uid, currentJourneyId, milestone, badgeConfig);
            
            logger.debug(`✅ Badge created atomically: ${badgeConfig.name}`);
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

