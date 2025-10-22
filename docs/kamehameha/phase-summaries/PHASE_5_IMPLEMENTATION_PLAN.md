# Phase 5: Milestones & Gamification - Implementation Plan

**Status:** Ready to Implement  
**Estimated Duration:** 2-3 days  
**Approach:** Cloud Function Trigger (Recommended)  
**Created:** October 22, 2025

---

## 📋 Overview

This phase adds motivation through achievements and gamification:
- Automatic milestone detection via Cloud Functions
- Celebration animations with confetti
- Badge gallery to view earned achievements
- Progress visualization to next milestone

**Key Decision:** Using **Firestore Cloud Function triggers** for reliable, server-side milestone detection.

---

## 🎯 Objectives

**Primary Goals:**
1. ✅ Detect milestones automatically (server-side)
2. ✅ Celebrate achievements with confetti
3. ✅ Display earned badges in a gallery
4. ✅ Show progress to next milestone

**Success Criteria:**
- Milestones detected within 1 minute of reaching them
- Celebration appears automatically (no manual trigger)
- Badges persist and display correctly
- No duplicate celebrations
- Works with dev milestones (1 min, 5 min)

---

## 📊 Implementation Steps

### Part 1: Cloud Function - Milestone Detection (1 hour)

#### 1.1: Create Milestone Constants

**File:** `functions/src/milestoneConstants.ts`

```typescript
/**
 * Milestone definitions for badge system
 */

// Milestone tiers in seconds
export const MILESTONE_SECONDS = process.env.NODE_ENV === 'development'
  ? [60, 300] // Dev: 1 min, 5 min
  : [
      86400,    // 1 day
      259200,   // 3 days
      604800,   // 7 days
      1209600,  // 14 days
      2592000,  // 30 days
      5184000,  // 60 days
      7776000,  // 90 days
      15552000, // 180 days
      31536000, // 365 days
    ];

// Badge configurations
interface BadgeConfig {
  emoji: string;
  name: string;
  message: string;
}

export const BADGE_CONFIGS: Record<number, BadgeConfig> = {
  // Development badges
  60: {
    emoji: '⚡',
    name: 'One Minute Wonder',
    message: "You've reached 1 minute! Every second counts.",
  },
  300: {
    emoji: '💪',
    name: 'Five Minute Fighter',
    message: "5 minutes strong! You're building momentum.",
  },
  // Production badges
  86400: {
    emoji: '🌱',
    name: 'First Step',
    message: "You've completed your first day! This is the beginning of something great.",
  },
  259200: {
    emoji: '💪',
    name: 'Building Momentum',
    message: "3 days strong! You're proving your commitment.",
  },
  604800: {
    emoji: '⚔️',
    name: 'One Week Warrior',
    message: "A full week! You're a warrior on this journey.",
  },
  1209600: {
    emoji: '🏆',
    name: 'Two Week Champion',
    message: "2 weeks of dedication! You're unstoppable.",
  },
  2592000: {
    emoji: '👑',
    name: 'Monthly Master',
    message: "30 days! You've mastered the first month.",
  },
  5184000: {
    emoji: '🌟',
    name: 'Two Month Legend',
    message: "60 days of strength! You're becoming legendary.",
  },
  7776000: {
    emoji: '💎',
    name: 'Three Month Diamond',
    message: "90 days! Your dedication shines like a diamond.",
  },
  15552000: {
    emoji: '🦅',
    name: 'Half Year Hero',
    message: "180 days! You're soaring to new heights.",
  },
  31536000: {
    emoji: '🔥',
    name: 'One Year Phoenix',
    message: "365 days! You've risen like a phoenix. Incredible!",
  },
};

export function getBadgeConfig(milestoneSeconds: number): BadgeConfig {
  return BADGE_CONFIGS[milestoneSeconds] || {
    emoji: '🎯',
    name: 'Achievement Unlocked',
    message: 'Congratulations on reaching this milestone!',
  };
}
```

---

#### 1.2: Create Milestone Detection Function

**File:** `functions/src/milestones.ts`

```typescript
/**
 * Milestone Detection Cloud Function
 * Triggers when user streak data updates
 */

import {onDocumentWritten} from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import {MILESTONE_SECONDS, getBadgeConfig} from './milestoneConstants';

export const checkMilestones = onDocumentWritten(
  'users/{userId}/kamehameha/streaks',
  async (event) => {
    const userId = event.params.userId;
    const beforeData = event.data?.before?.data();
    const afterData = event.data?.after?.data();

    // Skip if document was deleted or created (not updated)
    if (!beforeData || !afterData) {
      console.log('Skipping: Document created or deleted');
      return;
    }

    const db = admin.firestore();

    // Check Main Streak
    await checkStreakMilestone(
      db,
      userId,
      'main',
      beforeData.main?.currentSeconds || 0,
      afterData.main?.currentSeconds || 0
    );

    // Check Discipline Streak
    await checkStreakMilestone(
      db,
      userId,
      'discipline',
      beforeData.discipline?.currentSeconds || 0,
      afterData.discipline?.currentSeconds || 0
    );
  }
);

/**
 * Check if a streak crossed a milestone threshold
 */
async function checkStreakMilestone(
  db: admin.firestore.Firestore,
  userId: string,
  streakType: 'main' | 'discipline',
  prevSeconds: number,
  currentSeconds: number
): Promise<void> {
  // Find milestone that was crossed
  const crossedMilestone = MILESTONE_SECONDS.find(
    (m) => prevSeconds < m && currentSeconds >= m
  );

  if (!crossedMilestone) {
    return; // No milestone crossed
  }

  console.log(
    `Milestone detected: User ${userId}, ${streakType}, ${crossedMilestone}s`
  );

  // Check if badge already exists (idempotent)
  const existingBadges = await db
    .collection('users')
    .doc(userId)
    .collection('kamehameha_badges')
    .where('streakType', '==', streakType)
    .where('milestoneSeconds', '==', crossedMilestone)
    .limit(1)
    .get();

  if (!existingBadges.empty) {
    console.log('Badge already exists, skipping');
    return; // Badge already earned
  }

  // Create badge
  const badgeConfig = getBadgeConfig(crossedMilestone);
  await db
    .collection('users')
    .doc(userId)
    .collection('kamehameha_badges')
    .add({
      streakType,
      milestoneSeconds: crossedMilestone,
      earnedAt: Date.now(),
      badgeEmoji: badgeConfig.emoji,
      badgeName: badgeConfig.name,
      congratsMessage: badgeConfig.message,
    });

  console.log(`🎉 Badge created: ${badgeConfig.name} for ${streakType} streak`);
}
```

---

#### 1.3: Export Function

**File:** `functions/src/index.ts`

```typescript
// Add to existing exports
export {checkMilestones} from './milestones';
```

**Deploy:**
```bash
cd functions
npm run build
cd ..
firebase deploy --only functions:checkMilestones
```

**Or test locally:**
```bash
firebase emulators:start
```

---

### Part 2: Frontend - Badge Types (15 min)

**File:** `src/features/kamehameha/types/kamehameha.types.ts`

Add to existing types:

```typescript
/**
 * Badge earned for reaching a milestone
 */
export interface Badge {
  id: string;
  streakType: 'main' | 'discipline';
  milestoneSeconds: number;
  earnedAt: number;
  badgeEmoji: string;
  badgeName: string;
  congratsMessage: string;
}

/**
 * Hook return type for badges
 */
export interface UseBadgesReturn {
  badges: Badge[];
  loading: boolean;
  error: Error | null;
  latestBadge: Badge | null; // For showing celebration
}
```

---

### Part 3: Frontend - Badge Hook (30 min)

**File:** `src/features/kamehameha/hooks/useBadges.ts`

```typescript
/**
 * useBadges Hook
 * Listens for new badges and returns earned badges
 */

import {useState, useEffect, useCallback, useRef} from 'react';
import {collection, onSnapshot, query, orderBy} from 'firebase/firestore';
import {db} from '../../../services/firebase/config';
import {useAuth} from '../../auth/context/AuthContext';
import type {Badge, UseBadgesReturn} from '../types/kamehameha.types';

export function useBadges(): UseBadgesReturn {
  const {user} = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [latestBadge, setLatestBadge] = useState<Badge | null>(null);
  
  // Track if this is the initial load
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const badgesRef = collection(
        db,
        `users/${user.uid}/kamehameha_badges`
      );
      const badgesQuery = query(badgesRef, orderBy('earnedAt', 'desc'));

      const unsubscribe = onSnapshot(
        badgesQuery,
        (snapshot) => {
          const badgeList: Badge[] = [];

          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const badge: Badge = {
                id: change.doc.id,
                ...change.doc.data(),
              } as Badge;

              badgeList.push(badge);

              // Only show celebration for new badges (not on initial load)
              if (!isInitialLoad.current) {
                console.log('🎉 New badge earned!', badge);
                setLatestBadge(badge);
              }
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
          console.error('Error listening to badges:', err);
          setError(err as Error);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error('Error setting up badge listener:', err);
      setError(err as Error);
      setLoading(false);
    }
  }, [user]);

  return {
    badges,
    loading,
    error,
    latestBadge,
  };
}
```

---

### Part 4: Frontend - Celebration Modal (1 hour)

**File:** `src/features/kamehameha/components/CelebrationModal.tsx`

```typescript
/**
 * Celebration Modal Component
 * Shows confetti and badge when milestone reached
 */

import {useEffect, useCallback} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import confetti from 'canvas-confetti';
import type {Badge} from '../types/kamehameha.types';

interface CelebrationModalProps {
  badge: Badge | null;
  onClose: () => void;
}

export function CelebrationModal({badge, onClose}: CelebrationModalProps) {
  // Trigger confetti animation
  const celebrate = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: {x: 0, y: 0.8},
        colors: ['#a855f7', '#8b5cf6', '#7c3aed'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: {x: 1, y: 0.8},
        colors: ['#6366f1', '#4f46e5', '#4338ca'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  useEffect(() => {
    if (badge) {
      celebrate();
    }
  }, [badge, celebrate]);

  if (!badge) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        exit={{opacity: 0}}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-md p-8 text-center glass rounded-2xl"
          initial={{opacity: 0, scale: 0.8, y: 20}}
          animate={{opacity: 1, scale: 1, y: 0}}
          exit={{opacity: 0, scale: 0.8, y: 20}}
          transition={{type: 'spring', duration: 0.5}}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Badge Emoji */}
          <motion.div
            className="mb-4 text-8xl"
            initial={{scale: 0}}
            animate={{scale: 1}}
            transition={{
              type: 'spring',
              delay: 0.2,
              stiffness: 200,
              damping: 10,
            }}
          >
            {badge.badgeEmoji}
          </motion.div>

          {/* Title */}
          <motion.h2
            className="mb-2 text-3xl font-bold text-white"
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.3}}
          >
            {badge.badgeName}
          </motion.h2>

          {/* Streak Type */}
          <motion.p
            className="mb-4 text-sm text-white/60"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{delay: 0.4}}
          >
            {badge.streakType === 'main' ? '🏆 Main Streak' : '⚡ Discipline Streak'}
          </motion.p>

          {/* Message */}
          <motion.p
            className="mb-6 text-lg text-white/80"
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.5}}
          >
            {badge.congratsMessage}
          </motion.p>

          {/* Close Button */}
          <motion.button
            onClick={onClose}
            className="px-6 py-3 font-medium text-white transition-all bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg hover:from-purple-600 hover:to-indigo-700"
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.6}}
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.95}}
          >
            Awesome! 🎉
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
```

---

### Part 5: Frontend - Badge Gallery (45 min)

**File:** `src/features/kamehameha/components/BadgeGallery.tsx`

```typescript
/**
 * Badge Gallery Component
 * Displays all earned badges and locked future badges
 */

import {motion} from 'framer-motion';
import type {Badge} from '../types/kamehameha.types';
import {MILESTONE_SECONDS, getBadgeConfig} from '../constants/milestoneConstants';

interface BadgeGalleryProps {
  badges: Badge[];
  streakType?: 'main' | 'discipline' | 'all';
}

export function BadgeGallery({badges, streakType = 'all'}: BadgeGalleryProps) {
  // Filter badges by streak type
  const filteredBadges = streakType === 'all'
    ? badges
    : badges.filter((b) => b.streakType === streakType);

  // Create map of earned milestones
  const earnedMilestones = new Set(
    filteredBadges.map((b) => b.milestoneSeconds)
  );

  // Get all possible milestones for this streak
  const allMilestones = MILESTONE_SECONDS.map((seconds) => {
    const earned = filteredBadges.find((b) => b.milestoneSeconds === seconds);
    const config = getBadgeConfig(seconds);

    return {
      seconds,
      earned: !!earned,
      earnedAt: earned?.earnedAt || null,
      ...config,
    };
  });

  return (
    <div className="w-full max-w-4xl p-6 mx-auto glass rounded-2xl">
      {/* Header */}
      <h2 className="mb-6 text-2xl font-bold text-white">
        🏆 Your Badges
      </h2>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {/* Add filter buttons here if needed */}
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {allMilestones.map((milestone, index) => (
          <motion.div
            key={milestone.seconds}
            className={`relative p-4 text-center transition-all rounded-xl ${
              milestone.earned
                ? 'bg-gradient-to-br from-purple-500/20 to-indigo-600/20 border-2 border-purple-500/50'
                : 'bg-white/5 border-2 border-white/10 opacity-50'
            }`}
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: index * 0.05}}
            whileHover={{scale: milestone.earned ? 1.05 : 1}}
          >
            {/* Badge Emoji */}
            <div
              className={`mb-2 text-4xl ${
                milestone.earned ? '' : 'grayscale opacity-30'
              }`}
            >
              {milestone.earned ? milestone.emoji : '🔒'}
            </div>

            {/* Badge Name */}
            <div className={`text-sm font-medium ${
              milestone.earned ? 'text-white' : 'text-white/30'
            }`}>
              {milestone.name}
            </div>

            {/* Earned Date */}
            {milestone.earned && milestone.earnedAt && (
              <div className="mt-1 text-xs text-white/60">
                {new Date(milestone.earnedAt).toLocaleDateString()}
              </div>
            )}

            {/* Locked Indicator */}
            {!milestone.earned && (
              <div className="mt-1 text-xs text-white/30">
                Locked
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBadges.length === 0 && (
        <div className="py-12 text-center text-white/60">
          <div className="mb-2 text-4xl">🏆</div>
          <p>Start your journey to earn badges!</p>
        </div>
      )}
    </div>
  );
}
```

**File:** `src/features/kamehameha/constants/milestoneConstants.ts`

```typescript
/**
 * Milestone constants (mirrors functions/src/milestoneConstants.ts)
 */

export const MILESTONE_SECONDS = import.meta.env.DEV
  ? [60, 300] // Dev: 1 min, 5 min
  : [86400, 259200, 604800, 1209600, 2592000, 5184000, 7776000, 15552000, 31536000];

// Badge configurations (same as Cloud Function)
export const BADGE_CONFIGS = {
  60: {emoji: '⚡', name: 'One Minute Wonder', message: "You've reached 1 minute!"},
  300: {emoji: '💪', name: 'Five Minute Fighter', message: "5 minutes strong!"},
  86400: {emoji: '🌱', name: 'First Step', message: "Your first day!"},
  259200: {emoji: '💪', name: 'Building Momentum', message: "3 days strong!"},
  604800: {emoji: '⚔️', name: 'One Week Warrior', message: "A full week!"},
  1209600: {emoji: '🏆', name: 'Two Week Champion', message: "2 weeks!"},
  2592000: {emoji: '👑', name: 'Monthly Master', message: "30 days!"},
  5184000: {emoji: '🌟', name: 'Two Month Legend', message: "60 days!"},
  7776000: {emoji: '💎', name: 'Three Month Diamond', message: "90 days!"},
  15552000: {emoji: '🦅', name: 'Half Year Hero', message: "180 days!"},
  31536000: {emoji: '🔥', name: 'One Year Phoenix', message: "365 days!"},
};

export function getBadgeConfig(seconds: number) {
  return BADGE_CONFIGS[seconds as keyof typeof BADGE_CONFIGS] || {
    emoji: '🎯',
    name: 'Achievement',
    message: 'Milestone reached!',
  };
}
```

---

### Part 6: Frontend - Progress Bar (30 min)

**File:** `src/features/kamehameha/components/MilestoneProgress.tsx`

```typescript
/**
 * Milestone Progress Component
 * Shows progress to next milestone
 */

import {motion} from 'framer-motion';
import {MILESTONE_SECONDS, getBadgeConfig} from '../constants/milestoneConstants';

interface MilestoneProgressProps {
  currentSeconds: number;
  streakType: 'main' | 'discipline';
}

export function MilestoneProgress({currentSeconds, streakType}: MilestoneProgressProps) {
  // Find next milestone
  const nextMilestone = MILESTONE_SECONDS.find((m) => m > currentSeconds);

  if (!nextMilestone) {
    // Max milestone reached!
    return (
      <div className="p-4 text-center glass rounded-xl">
        <div className="mb-2 text-3xl">🏆</div>
        <div className="font-medium text-white">
          All milestones completed!
        </div>
        <div className="text-sm text-white/60">
          You're a legend!
        </div>
      </div>
    );
  }

  // Find previous milestone (for progress calculation)
  const milestoneIndex = MILESTONE_SECONDS.indexOf(nextMilestone);
  const prevMilestone = milestoneIndex > 0 ? MILESTONE_SECONDS[milestoneIndex - 1] : 0;

  // Calculate progress percentage
  const progress = ((currentSeconds - prevMilestone) / (nextMilestone - prevMilestone)) * 100;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  // Get badge info
  const badgeConfig = getBadgeConfig(nextMilestone);

  // Calculate time remaining
  const remainingSeconds = nextMilestone - currentSeconds;
  const days = Math.floor(remainingSeconds / 86400);
  const hours = Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);

  let timeRemaining = '';
  if (import.meta.env.DEV) {
    // Dev: show minutes and seconds
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    timeRemaining = `${mins}m ${secs}s`;
  } else {
    // Prod: show days/hours
    if (days > 0) {
      timeRemaining = `${days}d ${hours}h`;
    } else if (hours > 0) {
      timeRemaining = `${hours}h ${minutes}m`;
    } else {
      timeRemaining = `${minutes}m`;
    }
  }

  return (
    <div className="p-6 glass rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-white/60">Next Milestone</div>
          <div className="flex items-center gap-2 text-lg font-medium text-white">
            <span className="text-2xl">{badgeConfig.emoji}</span>
            {badgeConfig.name}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/60">Time Remaining</div>
          <div className="text-lg font-medium text-white">{timeRemaining}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 overflow-hidden bg-white/10 rounded-full">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600"
          initial={{width: 0}}
          animate={{width: `${clampedProgress}%`}}
          transition={{duration: 1, ease: 'easeOut'}}
        />
      </div>

      {/* Percentage */}
      <div className="mt-2 text-center">
        <span className="text-2xl font-bold text-white">
          {clampedProgress.toFixed(0)}%
        </span>
        <span className="ml-2 text-sm text-white/60">complete</span>
      </div>
    </div>
  );
}
```

---

### Part 7: Integration with KamehamehaPage (30 min)

**File:** `src/features/kamehameha/pages/KamehamehaPage.tsx`

Add imports and integration:

```typescript
import {useBadges} from '../hooks/useBadges';
import {CelebrationModal} from '../components/CelebrationModal';
import {MilestoneProgress} from '../components/MilestoneProgress';
// ... existing imports

export function KamehamehaPage() {
  // ... existing hooks
  const {badges, latestBadge, loading: badgesLoading} = useBadges();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationBadge, setCelebrationBadge] = useState<Badge | null>(null);

  // Show celebration when new badge earned
  useEffect(() => {
    if (latestBadge) {
      setCelebrationBadge(latestBadge);
      setShowCelebration(true);
    }
  }, [latestBadge]);

  // ... rest of component

  return (
    <div>
      {/* ... existing UI */}
      
      {/* Milestone Progress */}
      <MilestoneProgress
        currentSeconds={activeStreak === 'main' ? mainDisplay.totalSeconds : disciplineDisplay.totalSeconds}
        streakType={activeStreak}
      />

      {/* Celebration Modal */}
      <CelebrationModal
        badge={showCelebration ? celebrationBadge : null}
        onClose={() => setShowCelebration(false)}
      />
    </div>
  );
}
```

---

### Part 8: Badge Gallery Page (30 min)

**File:** `src/features/kamehameha/pages/BadgesPage.tsx`

```typescript
/**
 * Badges Page
 * Dedicated page for viewing all badges
 */

import {useState} from 'react';
import {Link} from 'react-router-dom';
import {BadgeGallery} from '../components/BadgeGallery';
import {useBadges} from '../hooks/useBadges';

export function BadgesPage() {
  const {badges, loading} = useBadges();
  const [filter, setFilter] = useState<'all' | 'main' | 'discipline'>('all');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading badges...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      {/* Back Button */}
      <Link
        to="/kamehameha"
        className="inline-flex items-center gap-2 mb-6 text-white/60 hover:text-white"
      >
        ← Back to Dashboard
      </Link>

      {/* Title */}
      <h1 className="mb-8 text-4xl font-bold text-center text-white">
        🏆 Your Achievements
      </h1>

      {/* Filter Tabs */}
      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-all ${
            filter === 'all'
              ? 'bg-purple-500 text-white'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          All Badges
        </button>
        <button
          onClick={() => setFilter('main')}
          className={`px-4 py-2 rounded-lg transition-all ${
            filter === 'main'
              ? 'bg-purple-500 text-white'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          🏆 Main Streak
        </button>
        <button
          onClick={() => setFilter('discipline')}
          className={`px-4 py-2 rounded-lg transition-all ${
            filter === 'discipline'
              ? 'bg-purple-500 text-white'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          ⚡ Discipline Streak
        </button>
      </div>

      {/* Badge Gallery */}
      <BadgeGallery badges={badges} streakType={filter} />

      {/* Stats */}
      <div className="mt-8 text-center text-white/60">
        <p>
          You've earned {badges.length} of {import.meta.env.DEV ? 4 : 18} total badges
        </p>
      </div>
    </div>
  );
}
```

**Add route:** `src/main.tsx`

```typescript
<Route path="/kamehameha/badges" element={<BadgesPage />} />
```

---

## 🧪 Testing Strategy

### Manual Testing Checklist

**1. Cloud Function Testing (Local Emulator):**
```bash
# Terminal 1: Start emulators
firebase emulators:start

# Terminal 2: Start dev server
npm run dev

# Test:
1. Start app, wait 60 seconds (1 min milestone)
2. Check emulator logs for "Badge created" message
3. Check Firestore emulator UI for badge document
4. Verify celebration modal appears in app
```

**2. Badge Creation Testing:**
- [ ] Reach 1 min milestone → Badge created
- [ ] Reach 5 min milestone → Badge created
- [ ] Refresh page → Badges still shown
- [ ] No duplicate badges created

**3. Celebration Modal Testing:**
- [ ] Confetti animation plays
- [ ] Badge emoji displayed correctly
- [ ] Badge name and message shown
- [ ] Close button works
- [ ] Modal appears only once per badge

**4. Badge Gallery Testing:**
- [ ] Earned badges shown with color
- [ ] Locked badges shown grayed out
- [ ] Filter by streak type works
- [ ] Earned date displayed correctly
- [ ] Empty state shown if no badges

**5. Progress Bar Testing:**
- [ ] Shows correct next milestone
- [ ] Progress percentage accurate
- [ ] Time remaining calculated correctly
- [ ] Animates smoothly
- [ ] Shows "All milestones complete" when max reached

**6. Edge Cases:**
- [ ] App closed at 30 seconds, reopened at 70 seconds → Badge created
- [ ] Multiple users → Each gets own badges
- [ ] Relapse → Old badges persist (not deleted)
- [ ] Switch between Main/Discipline streaks → Separate badges

---

## 📊 Timeline

**Day 1 (4-5 hours):**
- Part 1: Cloud Function (1 hour)
- Part 2: Types (15 min)
- Part 3: Badge Hook (30 min)
- Part 4: Celebration Modal (1 hour)
- Part 5: Badge Gallery (45 min)
- Deploy and test locally (1 hour)

**Day 2 (3-4 hours):**
- Part 6: Progress Bar (30 min)
- Part 7: Integration (30 min)
- Part 8: Badge Page (30 min)
- Testing and bug fixes (2 hours)

**Day 3 (Optional - Polish):**
- Sound effects for celebration
- Sharing badges (future)
- Streak chart/graph (optional)

**Total: 2-3 days**

---

## 🎯 Success Metrics

**Phase 5 is complete when:**
- ✅ Milestones automatically detected (wait 1 min in dev)
- ✅ Celebration modal appears with confetti
- ✅ Badges saved to Firestore
- ✅ Badge gallery displays earned and locked badges
- ✅ Progress bar shows accurate progress
- ✅ Works for both Main and Discipline streaks
- ✅ No duplicate celebrations
- ✅ Works on mobile and desktop
- ✅ Dark mode support
- ✅ All tests passing

---

## 📝 Documentation Updates

After completion:
- [ ] Update `PROGRESS.md` - Phase 5 marked complete
- [ ] Update `CHANGELOG.md` - Add Phase 5 entry
- [ ] Update `SPEC.md` - Mark Feature 5 complete
- [ ] Create `PHASE_5_COMPLETE.md` summary
- [ ] Update `DEVELOPER_NOTES.md` with learnings

---

## 🔍 Troubleshooting

**Cloud Function not firing:**
- Check emulator logs for trigger registration
- Verify Firestore path matches exactly
- Ensure function is deployed: `firebase deploy --only functions:checkMilestones`

**Badge not appearing:**
- Check browser console for errors
- Verify Firestore listener is active
- Check Firestore emulator UI for badge document
- Ensure user is authenticated

**Celebration shows on page refresh:**
- Add flag to track shown celebrations
- Use `isInitialLoad` ref in useBadges hook
- Only show celebration for new badges (not on mount)

**Confetti not working:**
- Ensure `canvas-confetti` is installed: `npm install canvas-confetti`
- Check if confetti function is imported correctly
- Verify no z-index issues hiding confetti

---

## 💰 Cost Estimate

**Cloud Function Invocations:**
- Triggers on every streak update (every minute while app open)
- 10 users × 60 min/hour × 8 hours/day = 4,800/day
- 144,000/month
- **Free tier: 2M/month** → **Still well within limits!** ✅

**Firestore Reads/Writes:**
- Badge creation: 1 read (check existing) + 1 write = 2 operations per milestone
- Badge gallery load: ~10 reads per page load
- **Still within free tier** ✅

---

**Ready to build Phase 5!** 🚀 Follow this plan step-by-step and you'll have a fully functional gamification system with automatic milestone detection!

