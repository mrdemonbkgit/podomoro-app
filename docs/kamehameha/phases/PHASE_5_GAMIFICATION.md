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

---

## 🎯 Celebration Trigger Events

### Primary Trigger: Real-Time Milestone Detection

The celebration triggers when the streak **transitions through a milestone threshold**:

```typescript
// In useStreaks.ts or new useMilestoneDetection.ts hook

useEffect(() => {
  if (!mainDisplay || !disciplineDisplay) return;
  
  // Calculate current days
  const mainDays = Math.floor(mainDisplay.totalSeconds / 86400);
  const disciplineDays = Math.floor(disciplineDisplay.totalSeconds / 86400);
  
  // Previous days (from ref to detect transition)
  const prevMainDays = prevMainDaysRef.current;
  const prevDisciplineDays = prevDisciplineDaysRef.current;
  
  // Check if we just crossed a milestone
  const milestones = [1, 3, 7, 14, 30, 60, 90, 180, 365];
  
  // Main streak milestone check
  if (prevMainDays !== null && mainDays > prevMainDays) {
    if (milestones.includes(mainDays)) {
      // 🎉 TRIGGER CELEBRATION!
      checkAndShowCelebration('main', mainDays);
    }
  }
  
  // Discipline streak milestone check
  if (prevDisciplineDays !== null && disciplineDays > prevDisciplineDays) {
    if (milestones.includes(disciplineDays)) {
      // 🎉 TRIGGER CELEBRATION!
      checkAndShowCelebration('discipline', disciplineDays);
    }
  }
  
  // Update refs for next check
  prevMainDaysRef.current = mainDays;
  prevDisciplineDaysRef.current = disciplineDays;
  
}, [mainDisplay, disciplineDisplay]); // Runs every second!
```

### Specific Trigger Scenarios

#### 1. Real-Time While App is Open ⭐ (Most Common)
**When:** User is actively using the app and their streak naturally increments

**Example:**
- User's Main Streak: 6 days, 23 hours, 59 minutes, 58 seconds
- One second passes...
- **Now: 7 days exactly** → 🎉 **CELEBRATION TRIGGERS!**

#### 2. On App Load 📱 (Catch Missed Milestones)
**When:** User opens the app and has reached a milestone while away

**Example:**
- User last opened app at Day 6
- User returns 3 days later (now Day 9)
- Missed milestone: Day 7
- **Show celebration for Day 7** on app load

```typescript
useEffect(() => {
  const checkMissedMilestones = async () => {
    const earnedBadges = await getEarnedBadges(userId);
    const currentDays = Math.floor(mainDisplay.totalSeconds / 86400);
    
    // Find any milestones between last earned and current
    const lastEarnedDay = Math.max(...earnedBadges.map(b => b.milestoneDay), 0);
    const missedMilestones = MILESTONE_DAYS.filter(
      m => m > lastEarnedDay && m <= currentDays
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
  days: number
) {
  // Check if badge already earned
  const badgeExists = await checkBadgeExists(userId, streakType, days);
  
  if (badgeExists) {
    console.log(`Badge for ${streakType} Day ${days} already earned`);
    return; // Don't show again!
  }
  
  // Show celebration
  showCelebrationModal({
    streakType,
    days,
    badgeEmoji: getBadgeEmoji(days),
    badgeName: getBadgeName(days),
    message: getCongratulationsMessage(days),
  });
  
  // Save badge to Firestore
  await saveBadge(userId, streakType, days);
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

**1. Use a Ref to Track Previous Days**
```typescript
const prevMainDaysRef = useRef<number | null>(null);
const prevDisciplineDaysRef = useRef<number | null>(null);
```

**2. Debounce the Check**
```typescript
// Only check on day transitions, not every second
if (mainDays !== prevMainDays) {
  checkMilestone();
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

