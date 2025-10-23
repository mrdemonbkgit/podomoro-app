/**
 * useBadges Hook
 * 
 * Listens to user's badge collection and detects new badges for celebration
 * Phase 5.1: Only loads badges for the current journey
 */

import { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../services/firebase/config';
import { useAuth } from '../../auth/context/AuthContext';
import type { Badge, UseBadgesReturn } from '../types/kamehameha.types';

/**
 * Hook to manage badges for the current journey
 * @param currentJourneyId - Current journey ID (Phase 5.1)
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
    if (!user?.uid || !currentJourneyId) {
      setLoading(false);
      return;
    }

    console.log('useBadges: Listening for badges in journey:', currentJourneyId);

    const badgesRef = collection(db, 'users', user.uid, 'kamehameha_badges');
    
    // Phase 5.1: Only load badges for current journey
    const q = query(
      badgesRef,
      where('journeyId', '==', currentJourneyId),
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

            // Only celebrate badges earned in the last 10 seconds (prevents old badges from celebrating on remount)
            const wasEarnedRecently = Date.now() - badge.earnedAt < 10000; // 10 seconds
            
            // Only celebrate NEW badges after initial load AND recently earned
            if (!isInitialLoad.current && !seenBadgeIds.current.has(badge.id) && wasEarnedRecently) {
              console.log('🎉 New badge detected:', badge.badgeName);
              setCelebrationBadge(badge);
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
  }, [user?.uid, currentJourneyId]); // ← Phase 5.1: Also depend on currentJourneyId
  
  // Phase 5.1: Reset seen badges when journey changes
  useEffect(() => {
    if (currentJourneyId) {
      console.log('useBadges: Journey changed, resetting seen badges:', currentJourneyId);
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

