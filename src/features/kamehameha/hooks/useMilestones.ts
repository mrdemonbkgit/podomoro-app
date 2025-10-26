/**
 * useMilestones Hook
 * 
 * Client-side milestone detection for real-time badge creation
 * Works alongside scheduled Cloud Function as backup
 * 
 * This ensures milestones are detected immediately when app is open,
 * while scheduled function handles offline scenarios
 */

import { useEffect, useRef } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { doc, setDoc, getFirestore, increment, updateDoc } from 'firebase/firestore';
import { getDocPath } from '../services/paths';
import { logger } from '../../../utils/logger';

// Milestone thresholds in seconds
const MILESTONE_SECONDS = [
  60,      // 1 minute (dev)
  300,     // 5 minutes (dev)
  86400,   // 1 day
  259200,  // 3 days
  604800,  // 7 days
  1209600, // 14 days
  2592000, // 30 days
  5184000, // 60 days
  7776000, // 90 days
  15552000, // 180 days
  31536000, // 365 days
];

// Badge configurations
const BADGE_CONFIGS: Record<number, { emoji: string; name: string; message: string }> = {
  60: { emoji: '⚡', name: 'One Minute Wonder', message: "You've reached 1 minute! Every second counts." },
  300: { emoji: '💪', name: 'Five Minute Fighter', message: "5 minutes strong! You're building momentum." },
  86400: { emoji: '🌱', name: 'First Step', message: "You've completed your first day! This is the beginning of something great." },
  259200: { emoji: '💪', name: 'Building Momentum', message: "3 days strong! You're proving your commitment." },
  604800: { emoji: '⚔️', name: 'One Week Warrior', message: "A full week! You're a warrior on this journey." },
  1209600: { emoji: '🏆', name: 'Two Week Champion', message: "2 weeks of dedication! You're unstoppable." },
  2592000: { emoji: '👑', name: 'Monthly Master', message: "30 days! You've mastered the first month." },
  5184000: { emoji: '🌟', name: 'Two Month Legend', message: "60 days of strength! You're becoming legendary." },
  7776000: { emoji: '💎', name: 'Three Month Diamond', message: "90 days! Your dedication shines like a diamond." },
  15552000: { emoji: '🦅', name: 'Half Year Hero', message: "180 days! You're soaring to new heights." },
  31536000: { emoji: '🔥', name: 'One Year Phoenix', message: "365 days! You've risen like a phoenix. Incredible!" },
};

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
            
            const badgeConfig = BADGE_CONFIGS[milestone] || {
              emoji: '🎯',
              name: 'Achievement Unlocked',
              message: 'Congratulations on reaching this milestone!',
            };

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
    checkIntervalRef.current = setInterval(checkMilestones, 1000);

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

