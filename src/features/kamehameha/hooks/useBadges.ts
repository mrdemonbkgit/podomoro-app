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

    console.log('useBadges: Listening for ALL badges (permanent records)');

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
        
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const badge: Badge = {
              id: change.doc.id,
              ...change.doc.data(),
            } as Badge;

            badgesList.push(badge);

            // Only celebrate badges from the CURRENT journey
            const isCurrentJourney = badge.journeyId === currentJourneyId;
            
            // Only celebrate badges earned in the last 10 seconds (prevents old badges from celebrating on remount)
            const wasEarnedRecently = Date.now() - badge.earnedAt < 10000; // 10 seconds
            
            // Only celebrate if: after initial load, not seen before, recently earned, AND from current journey
            if (!isInitialLoad.current && !seenBadgeIds.current.has(badge.id) && wasEarnedRecently && isCurrentJourney) {
              console.log('🎉 New badge detected (current journey):', badge.badgeName, `Journey: ${badge.journeyId}`);
              setCelebrationBadge(badge);
            } else if (!isInitialLoad.current && !seenBadgeIds.current.has(badge.id) && wasEarnedRecently && !isCurrentJourney) {
              console.log('⏭️ Skipping celebration for badge from old journey:', badge.badgeName, `Badge journey: ${badge.journeyId}, Current: ${currentJourneyId}`);
            }

            seenBadgeIds.current.add(badge.id);
          }
        });

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
      console.log('useBadges: Journey changed, clearing seen badges set for new journey:', currentJourneyId);
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

