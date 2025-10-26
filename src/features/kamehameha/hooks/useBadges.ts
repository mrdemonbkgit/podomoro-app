/**
 * useBadges Hook
 * 
 * Listens to user's badge collection and detects new badges for celebration
 * Badges are permanent historical records, stored with their journeyId
 * Only celebrates badges from the CURRENT journey
 */

import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../services/firebase/config';
import { useAuth } from '../../auth/context/AuthContext';
import type { Badge, UseBadgesReturn } from '../types/kamehameha.types';
import { logger } from '../../../utils/logger';

/**
 * Hook to manage ALL badges (permanent records)
 * @param currentJourneyId - Current journey ID (for celebration filtering)
 */
export function useBadges(currentJourneyId: string | null): UseBadgesReturn {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [celebrationBadge, setCelebrationBadge] = useState<Badge | null>(null);
  
  // Track badge IDs we've already seen to prevent duplicate celebrations
  const seenBadgeIds = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    logger.debug('useBadges: Listening for ALL badges (permanent records)');

    const badgesRef = collection(db, 'users', user.uid, 'kamehameha_badges');
    
    // Load ALL badges (permanent historical records)
    const q = query(
      badgesRef,
      orderBy('earnedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const badgesList: Badge[] = [];
        
        // Collect new badges from current journey
        const newBadgesFromCurrentJourney: Badge[] = [];
        
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const badge: Badge = {
              id: change.doc.id,
              ...change.doc.data(),
            } as Badge;

            badgesList.push(badge);

            // Check if this is a NEW badge from CURRENT journey
            const isCurrentJourney = badge.journeyId === currentJourneyId;
            const isNew = !seenBadgeIds.current.has(badge.id);
            
            if (isNew && isCurrentJourney) {
              newBadgesFromCurrentJourney.push(badge);
            }

            // Mark as seen
            seenBadgeIds.current.add(badge.id);
          }
        });
        
        // Celebrate only the HIGHEST milestone if we have new badges
        if (!isInitialLoad.current && newBadgesFromCurrentJourney.length > 0) {
          // Find the badge with highest milestoneSeconds
          const highestMilestone = newBadgesFromCurrentJourney.reduce((highest, badge) =>
            badge.milestoneSeconds > highest.milestoneSeconds ? badge : highest
          );
          
          logger.debug(`🎉 Celebrating highest milestone: ${highestMilestone.badgeName} (${highestMilestone.milestoneSeconds}s)`);
          if (newBadgesFromCurrentJourney.length > 1) {
            logger.debug(`   ⏭️ Skipping ${newBadgesFromCurrentJourney.length - 1} lower milestone(s)`);
          }
          
          setCelebrationBadge(highestMilestone);
        }

        // Update badges list
        const allBadges = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Badge[];

        setBadges(allBadges);
        setLoading(false);
        isInitialLoad.current = false;
      },
      (err) => {
        console.error('Error fetching badges:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);
  
  // Reset seen badges when journey changes to prevent memory leaks
  useEffect(() => {
    if (currentJourneyId) {
      logger.debug('useBadges: Journey changed, clearing seen badges set for new journey:', currentJourneyId);
      seenBadgeIds.current.clear();
      isInitialLoad.current = true;
    }
  }, [currentJourneyId]);

  const dismissCelebration = () => {
    setCelebrationBadge(null);
  };

  return {
    badges,
    loading,
    error,
    celebrationBadge,
    dismissCelebration,
  };
}

