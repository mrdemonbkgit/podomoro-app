# Phase 5: Milestones & Gamification

**Status:** Ready to Start  
**Estimated Duration:** 2-3 days  
**Last Updated:** October 22, 2025

---

## Quick Reference

For detailed guidance on Phase 5, refer to:

- **[QUICKSTART.md](../QUICKSTART.md#phase-5-gamification)** - Step-by-step quick start
- **[SPEC.md](../SPEC.md)** - Feature 5: Milestones & Gamification
- **[DATA_SCHEMA.md](../DATA_SCHEMA.md)** - Badge data structure
- **[FILE_STRUCTURE.md](../FILE_STRUCTURE.md)** - Component organization
- **[PROGRESS.md](../PROGRESS.md)** - Task checklist for Phase 5

---

## Overview

This phase adds motivation through milestones and achievements:
- Define milestone tiers (1, 3, 7, 14, 30, 60, 90, 180, 365 days)
- Implement milestone detection logic
- Create celebration animations
- Build badge gallery
- Add progress visualizations

### 🧪 Development Testing Strategy

**For rapid testing, use shorter milestone intervals:**

**Production Milestones (Days):**
```typescript
const PROD_MILESTONES = [1, 3, 7, 14, 30, 60, 90, 180, 365]; // in days
```

**Development Milestones (Minutes):**
```typescript
const DEV_MILESTONES = [1, 5]; // in minutes (60 seconds, 300 seconds)
```

**Implementation:**
```typescript
// In streakCalculations.ts or milestoneService.ts
export const MILESTONE_DAYS = import.meta.env.DEV 
  ? [1/1440, 5/1440] // Convert minutes to fractional days (1min = 1/1440 day)
  : [1, 3, 7, 14, 30, 60, 90, 180, 365]; // Production: days

// OR better: work in seconds
export const MILESTONE_SECONDS = import.meta.env.DEV
  ? [60, 300] // Dev: 1 min, 5 min
  : [86400, 259200, 604800, 1209600, 2592000, 5184000, 7776000, 15552000, 31536000]; // Prod: days in seconds
```

**Badge Names (Development):**
```typescript
const DEV_BADGE_NAMES = {
  60: { name: "One Minute Wonder", emoji: "⚡" },
  300: { name: "Five Minute Fighter", emoji: "💪" },
};

const PROD_BADGE_NAMES = {
  1: { name: "First Step", emoji: "🌱" },
  3: { name: "Building Momentum", emoji: "💪" },
  7: { name: "One Week Warrior", emoji: "⚔️" },
  // ... etc
};
```

**Why This Matters:**
- ✅ Test celebration animations immediately (wait 1 minute, not 1 day!)
- ✅ Verify badge saving/loading works correctly
- ✅ Test "missed milestone" detection on app reload
- ✅ Iterate quickly on confetti animations and modal design
- ✅ Switch to production milestones when deploying

---

## 🎯 Celebration Trigger Events

### Primary Trigger: Real-Time Milestone Detection

The celebration triggers when the streak **transitions through a milestone threshold**:

```typescript
// In useStreaks.ts or new useMilestoneDetection.ts hook

useEffect(() => {
  if (!mainDisplay || !disciplineDisplay) return;
  
  // Work in seconds for more flexibility (supports dev milestones)
  const mainSeconds = mainDisplay.totalSeconds;
  const disciplineSeconds = disciplineDisplay.totalSeconds;
  
  // Previous seconds (from ref to detect transition)
  const prevMainSeconds = prevMainSecondsRef.current;
  const prevDisciplineSeconds = prevDisciplineSecondsRef.current;
  
  // Milestones in seconds (switches based on environment)
  const milestones = import.meta.env.DEV
    ? [60, 300] // Dev: 1 min, 5 min
    : [86400, 259200, 604800, 1209600, 2592000, 5184000, 7776000, 15552000, 31536000]; // Prod: days
  
  // Main streak milestone check
  if (prevMainSeconds !== null) {
    // Check if we crossed any milestone
    const crossedMilestone = milestones.find(
      m => prevMainSeconds < m && mainSeconds >= m
    );
    
    if (crossedMilestone) {
      // 🎉 TRIGGER CELEBRATION!
      checkAndShowCelebration('main', crossedMilestone);
    }
  }
  
  // Discipline streak milestone check
  if (prevDisciplineSeconds !== null) {
    const crossedMilestone = milestones.find(
      m => prevDisciplineSeconds < m && disciplineSeconds >= m
    );
    
    if (crossedMilestone) {
      // 🎉 TRIGGER CELEBRATION!
      checkAndShowCelebration('discipline', crossedMilestone);
    }
  }
  
  // Update refs for next check
  prevMainSecondsRef.current = mainSeconds;
  prevDisciplineSecondsRef.current = disciplineSeconds;
  
}, [mainDisplay, disciplineDisplay]); // Runs every second!
```

**Key Changes for Dev Testing:**
- ✅ Use `totalSeconds` instead of calculating days
- ✅ Check for any milestone crossed (not just day boundaries)
- ✅ Pass milestone value (in seconds) to celebration function
- ✅ Badge service converts seconds to appropriate display (1 min vs 1 day)

### Specific Trigger Scenarios

#### 1. Real-Time While App is Open ⭐ (Most Common)
**When:** User is actively using the app and their streak naturally increments

**Production Example:**
- User's Main Streak: 6 days, 23 hours, 59 minutes, 58 seconds
- One second passes...
- **Now: 7 days exactly** → 🎉 **CELEBRATION TRIGGERS!**

**Development Example (1 min milestone):**
- User's Main Streak: 59 seconds
- One second passes...
- **Now: 60 seconds (1 minute)** → 🎉 **CELEBRATION TRIGGERS!**

#### 2. On App Load 📱 (Catch Missed Milestones)
**When:** User opens the app and has reached a milestone while away

**Production Example:**
- User last opened app at Day 6
- User returns 3 days later (now Day 9)
- Missed milestone: Day 7
- **Show celebration for Day 7** on app load

**Development Example (Testing):**
- Start timer, wait 30 seconds
- Close browser tab
- Wait 35 more seconds (total: 65 seconds, passed 1 min milestone)
- Reopen app
- **Show celebration for 1 minute milestone** on app load

```typescript
useEffect(() => {
  const checkMissedMilestones = async () => {
    const earnedBadges = await getEarnedBadges(userId);
    const currentSeconds = mainDisplay.totalSeconds;
    
    // Get milestones in seconds (dev or prod)
    const milestones = import.meta.env.DEV
      ? [60, 300] // Dev: 1 min, 5 min
      : [86400, 259200, 604800, 1209600, 2592000, 5184000, 7776000, 15552000, 31536000]; // Prod: days
    
    // Find any milestones between last earned and current
    const lastEarnedSeconds = Math.max(...earnedBadges.map(b => b.milestoneSeconds), 0);
    const missedMilestones = milestones.filter(
      m => m > lastEarnedSeconds && m <= currentSeconds
    );
    
    // Show celebrations for missed milestones (with delay between)
    for (const milestone of missedMilestones) {
      await showCelebration('main', milestone);
      await delay(2000); // Space them out
    }
  };
  
  checkMissedMilestones();
}, []); // On mount
```

#### 3. After Check-In ✅ (Bonus Trigger)
**When:** User completes a daily check-in and it pushes their discipline streak to a milestone

Already handled by real-time detection above.

#### 4. NOT on Relapse Reset ❌
**When NOT to trigger:**
- When user relapses and streak resets to 0
- Don't show "Day 1" celebration on a relapse (feels bad)

**Exception:** Show "Day 1" celebration only on:
- First time ever (genuine first step)
- After a successful recovery from relapse (wait 24 hours?)

---

## 🔐 Idempotent Check (Critical!)

**Problem:** User refreshes page at Day 7 → celebration shows again

**Solution:** Check Firestore before showing celebration

```typescript
async function checkAndShowCelebration(
  streakType: 'main' | 'discipline',
  milestoneSeconds: number // Pass seconds (60, 300, or 86400, etc.)
) {
  // Check if badge already earned
  const badgeExists = await checkBadgeExists(userId, streakType, milestoneSeconds);
  
  if (badgeExists) {
    console.log(`Badge for ${streakType} at ${milestoneSeconds}s already earned`);
    return; // Don't show again!
  }
  
  // Show celebration
  showCelebrationModal({
    streakType,
    milestoneSeconds,
    badgeEmoji: getBadgeEmoji(milestoneSeconds),
    badgeName: getBadgeName(milestoneSeconds),
    message: getCongratulationsMessage(milestoneSeconds),
  });
  
  // Save badge to Firestore
  await saveBadge(userId, streakType, milestoneSeconds);
}
```

---

## 📊 Trigger Flow Summary

```
┌─────────────────────────────────────────┐
│  Every Second (useEffect):             │
│  - Calculate current days               │
│  - Compare to previous days             │
│  - If increased AND is milestone:       │
│    └─> Check if badge exists            │
│        ├─> Exists: Do nothing           │
│        └─> New: SHOW CELEBRATION! 🎉   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  On App Load (useEffect with []):      │
│  - Get all earned badges                │
│  - Compare to current days              │
│  - Find missed milestones               │
│  - Show celebration for each (delayed)  │
└─────────────────────────────────────────┘
```

---

## 💡 Implementation Best Practices

**1. Use a Ref to Track Previous Seconds**
```typescript
const prevMainSecondsRef = useRef<number | null>(null);
const prevDisciplineSecondsRef = useRef<number | null>(null);
```

**2. Check for Threshold Crossing**
```typescript
// Detect when streak crosses a milestone threshold
const crossedMilestone = milestones.find(
  m => prevSeconds < m && currentSeconds >= m
);
if (crossedMilestone) {
  checkAndShowCelebration(streakType, crossedMilestone);
}
```

**3. Queue Multiple Celebrations**
```typescript
// If user earns 2 milestones at once (rare but possible)
const celebrationQueue = [];
// Show them sequentially with 2s delay
```

**4. Persist Last Shown Milestone** (belt & suspenders)
```typescript
// In case Firestore write fails
localStorage.setItem('lastShownMilestone', `${streakType}-${days}`);
```

---

## 🎯 Recommended Implementation Approach

**Best approach:**
1. ✅ Real-time detection in `useStreaks` hook
2. ✅ Check on app load for missed milestones
3. ✅ Idempotent check via Firestore
4. ✅ Use refs to track day transitions

**This ensures:**
- ✅ User sees celebration immediately when milestone is reached
- ✅ User sees celebration even if app was closed
- ✅ Celebration only shows once per milestone
- ✅ No false positives (badge already earned)

---

## 📦 Components to Create

1. `useMilestoneDetection.ts` - Hook for milestone detection logic
2. `MilestoneCard.tsx` - Display milestone info
3. `BadgeDisplay.tsx` - Badge icon + details
4. `CelebrationModal.tsx` - Celebration popup with confetti
5. `ProgressBar.tsx` - Visual progress indicator
6. `BadgeGallery.tsx` - Gallery view of all badges
7. `StreakChart.tsx` - Graph showing streak history (optional)

**New Services:**
1. `milestoneService.ts` - Badge CRUD operations
2. `celebrationService.ts` - Confetti and celebration logic

---

## Next Steps

1. Read the QUICKSTART.md guide linked above
2. Check off tasks in PROGRESS.md as you complete them
3. Reference existing confetti animations in codebase
4. Use `canvas-confetti` library (already used in main timer)
5. Follow existing glass morphism patterns for UI consistency

---

**Ready to make recovery fun!** 🎮

