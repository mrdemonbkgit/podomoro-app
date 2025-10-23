# Journey-Based Achievement System - Refactor Plan

## Overview
Restructure the achievement system to be journey-based, where each PMO streak period (from start to relapse) is a distinct "journey" with its own achievements and violation history.

---

## Problem with Current System
- Badges are global and persist across relapses
- After relapse, reaching the same milestone triggers celebration for old badge
- No concept of "attempts" or "journey" history
- Confusing UX: "You earned this before, why celebrate again?"
- No connection between violations and journey context

---

## New Journey-Based System (Simplified)

### Core Concept
**Journey** = One PMO streak period from start to end (main streak only)
- **ONE journey type**: PMO abstinence journey (main streak)
- **Discipline violations**: Logged events WITHIN the journey (informational only)
- Each journey has its own achievements (badges)
- Each journey logs all violations that occurred during it
- When main streak resets (relapse), the journey ends
- A new journey begins immediately
- Old journey achievements don't celebrate in new journeys
- Users can view their journey history with full violation details

---

## Data Schema Changes

### 1. New Collection: `kamehameha_journeys`

**Path:** `users/{userId}/kamehameha_journeys/{journeyId}`

```typescript
interface Journey {
  id: string;                    // Auto-generated
  startDate: number;             // Timestamp when journey started
  endDate: number | null;        // null if current journey, timestamp if ended
  endReason: 'active' | 'relapse'; // Why journey ended (active or relapse)
  finalSeconds: number;          // How long the journey lasted
  achievementsCount: number;     // Number of milestones reached
  violationsCount: number;       // Number of discipline violations during journey
  createdAt: number;
  updatedAt: number;
}
```

**Example (Active Journey):**
```javascript
{
  id: "journey_123",
  startDate: 1729612800000,
  endDate: null,                 // Current journey (active)
  endReason: "active",
  finalSeconds: 1296000,         // 15 days
  achievementsCount: 4,          // Earned 4 badges
  violationsCount: 2,            // Had 2 discipline violations
  createdAt: 1729612800000,
  updatedAt: 1729698800000
}
```

**Example (Completed Journey):**
```javascript
{
  id: "journey_456",
  startDate: 1729000000000,
  endDate: 1729612800000,        // Journey ended
  endReason: "relapse",
  finalSeconds: 612800,          // ~7 days
  achievementsCount: 3,
  violationsCount: 1,
  createdAt: 1729000000000,
  updatedAt: 1729612800000
}
```

### 2. Update Collection: `kamehameha_badges`

**Add `journeyId` field to link badges to journeys:**

```typescript
interface Badge {
  id: string;
  journeyId: string;             // ← NEW: Links badge to journey
  milestoneSeconds: number;      // PMO milestone only
  earnedAt: number;
  badgeEmoji: string;
  badgeName: string;
  congratsMessage: string;
}
```

**Note:** `streakType` removed - all badges are for PMO journey (main streak)

### 3. Update Collection: `kamehameha_relapses`

**Add `journeyId` field to link violations to journeys:**

```typescript
interface Relapse {
  id: string;
  journeyId: string;             // ← NEW: Links violation to journey
  userId: string;
  timestamp: number;
  trigger: string;
  mood: string;
  thoughts: string;
  whatNext: string;
  createdAt: number;
}
```

**Purpose:** Track which violations occurred during which journey for:
- Journey history display
- AI context ("In Journey #3, you had triggers related to...")
- Pattern analysis across journeys

### 4. Update Collection: `kamehameha/streaks`

**Add current journey ID (main streak only):**

```typescript
interface Streaks {
  currentJourneyId: string;      // ← NEW: Current PMO journey ID
  main: {
    startDate: number;
    currentSeconds: number;
    longestSeconds: number;
    lastUpdated: number;
  };
  discipline: {
    startDate: number;
    currentSeconds: number;       // Still tracked for "days since last violation"
    longestSeconds: number;
    lastUpdated: number;
  };
  lastUpdated: number;
}
```

**Note:** `currentJourneyId` is at the top level since there's only one journey type (PMO journey)

---

## UI Examples

### Dashboard (Option B - Selected)

```
┌─────────────────────────────────────────┐
│  Journey #5: 15 days                    │
│  ├─ 8 days since last violation         │
│  └─ 2 violations total                  │
│                                         │
│  ⚡ One Minute Wonder                    │
│  🌱 First Step                          │
│  💪 Building Momentum                   │
│  ⚔️ One Week Warrior                    │
│  👑 Two Week Champion                   │
│                                         │
│  [📅 Daily Check-In]                    │
│  [💬 AI Therapist]                      │
│  [🏆 View Badges]                       │
│  [⚠️ Report Relapse]                    │
└─────────────────────────────────────────┘
```

### Journey History Page

```
┌─────────────────────────────────────────────┐
│  Journey History                            │
│                                             │
│  ► Journey #5 (Current)                     │
│    Oct 22 - Present | 15 days               │
│    Achievements: 5 badges                   │
│    Violations: 2                            │
│     • Oct 24 (Day 3): Work stress...        │
│     • Oct 29 (Day 8): Social media...       │
│                                             │
│  ○ Journey #4                               │
│    Oct 10 - Oct 22 | 12 days                │
│    Achievements: 4 badges                   │
│    Violations: 1                            │
│     • Oct 18 (Day 9): Boredom...            │
│                                             │
│  ○ Journey #3                               │
│    Oct 3 - Oct 10 | 7 days                  │
│    Achievements: 3 badges                   │
│    Violations: 3                            │
│     • Oct 5 (Day 3): Idle time...           │
│     • Oct 7 (Day 5): Late night...          │
│     • Oct 9 (Day 7): Weekend trigger...     │
└─────────────────────────────────────────────┘
```

### Badge Gallery (Current Journey Default)

```
┌─────────────────────────────────────────┐
│  Badges - Journey #5                    │
│  [ Current Journey | All Journeys ]     │
│                                         │
│  ⚡ ⚡ ⚡ ⚡ ⚡   Earned (5)              │
│  🔒 🔒 🔒 🔒   Locked (4)              │
│                                         │
│  [View Past Journeys →]                 │
└─────────────────────────────────────────┘
```

---

## Implementation Steps

### Phase 1: Data Structure (Backend)

#### Step 1.1: Create Journey Service
**File:** `src/features/kamehameha/services/journeyService.ts`

```typescript
/**
 * Create a new PMO journey when user starts
 */
export async function createJourney(
  userId: string
): Promise<Journey>;

/**
 * End current journey (on PMO relapse)
 */
export async function endJourney(
  userId: string,
  journeyId: string,
  finalSeconds: number
): Promise<void>;

/**
 * Get current active journey
 */
export async function getCurrentJourney(
  userId: string
): Promise<Journey | null>;

/**
 * Get all journeys (for history view)
 */
export async function getJourneyHistory(
  userId: string,
  limit?: number
): Promise<Journey[]>;

/**
 * Increment violation count for current journey
 */
export async function incrementJourneyViolations(
  userId: string,
  journeyId: string
): Promise<void>;

/**
 * Get violations for a specific journey
 */
export async function getJourneyViolations(
  userId: string,
  journeyId: string
): Promise<Relapse[]>;
```

#### Step 1.2: Update Firestore Service
**File:** `src/features/kamehameha/services/firestoreService.ts`

- **`initializeUserStreaks()`**: Create initial PMO journey
- **`resetMainStreak()`**: End current journey, create new journey
- **`resetDisciplineStreak()`**: Reset discipline counter, increment journey violations count
- **`createRelapse()`**: Add `journeyId` to relapse document

#### Step 1.3: Update Cloud Function
**File:** `functions/src/milestones.ts`

Change badge creation to include `journeyId` (only for main streak):

```typescript
// Only check main streak milestones (not discipline)
const beforeMain = beforeData?.main;
const afterMain = afterData.main;

if (beforeMain && afterMain) {
  const prevSeconds = beforeMain.currentSeconds || 0;
  const currentSeconds = afterMain.currentSeconds || 0;
  
  const crossedMilestone = detectMilestoneCrossing(prevSeconds, currentSeconds);
  
  if (crossedMilestone) {
    // Get current journey ID from top-level field
    const currentJourneyId = afterData.currentJourneyId;
    
    // Create badge linked to journey
    await db.collection('users').doc(userId)
      .collection('kamehameha_badges')
      .add({
        journeyId: currentJourneyId,  // ← Link to current PMO journey
        milestoneSeconds: crossedMilestone,
        earnedAt: Date.now(),
        badgeEmoji: config.emoji,
        badgeName: config.name,
        congratsMessage: config.message,
      });
  }
}
```

**Note:** Remove `streakType` field from badges - all badges are for PMO journey

### Phase 2: Frontend Updates

#### Step 2.1: Update Types
**File:** `src/features/kamehameha/types/kamehameha.types.ts`

Add `Journey` interface and update `Badge` and `Streaks` interfaces.

#### Step 2.2: Update useBadges Hook
**File:** `src/features/kamehameha/hooks/useBadges.ts`

**Key Change:** Only listen to badges for the current journey:

```typescript
useEffect(() => {
  if (!user || !currentJourneyId) return;

  const badgesQuery = query(
    collection(db, `users/${user.uid}/kamehameha_badges`),
    where('journeyId', '==', currentJourneyId),  // ← Only current journey
    orderBy('earnedAt', 'desc')
  );

  const unsubscribe = onSnapshot(badgesQuery, (snapshot) => {
    // ... handle new badges for current journey only
  });

  return unsubscribe;
}, [user, currentJourneyId]);  // ← Add currentJourneyId dependency
```

#### Step 2.3: Update BadgeGallery
**File:** `src/features/kamehameha/components/BadgeGallery.tsx`

Add journey filter:
- Option 1: Show only current journey badges (default)
- Option 2: Show all journeys with journey grouping
- Option 3: Journey selector dropdown

#### Step 2.4: Update Dashboard (Option B)
**File:** `src/features/kamehameha/pages/KamehamehaPage.tsx`

Display journey info above timer:
```tsx
<div className="journey-info">
  <h2>Journey #{journeyNumber}: {formatDuration(mainDisplay)}</h2>
  <div>├─ {formatDuration(disciplineDisplay)} since last violation</div>
  <div>└─ {violationsCount} violations total</div>
</div>
```

#### Step 2.5: Create Journey History Page
**File:** `src/features/kamehameha/pages/JourneyHistoryPage.tsx`

Display:
- List of all journeys (current + past)
- Journey duration, achievements count, violations count
- Expandable violations list with full details
- Timeline view of milestones (optional)

### Phase 3: Migration

#### Step 3.1: Data Migration Script (Dev)

For existing users with badges:
1. Create a "legacy" journey for the current streak
2. Assign all existing badges to the legacy journey
3. Create new "current" journey starting now

**File:** `scripts/migrateToJourneySystem.ts`

```typescript
async function migrateUserData(userId: string) {
  // 1. Get existing streaks
  const streaks = await getStreaks(userId);
  
  // 2. Create legacy journey (for existing badges)
  const legacyJourney = await createJourney(userId, {
    startDate: streaks.main.startDate,
    endDate: Date.now(),
    endReason: 'migration',
    finalSeconds: streaks.main.currentSeconds,
  });
  
  // 3. Update all existing badges with journeyId
  const badges = await getAllBadges(userId);
  for (const badge of badges) {
    await updateBadge(badge.id, {
      journeyId: legacyJourney.id
    });
  }
  
  // 4. Update all existing relapses with journeyId
  const relapses = await getAllRelapses(userId);
  for (const relapse of relapses) {
    await updateRelapse(relapse.id, {
      journeyId: legacyJourney.id
    });
  }
  
  // 5. Create new current journey
  const newJourney = await createJourney(userId);
  
  // 6. Update streaks with current journey ID
  await updateStreaks(userId, {
    currentJourneyId: newJourney.id
  });
}
```

**Note:** For dev/testing, you can skip migration and just reset all data

#### Step 3.2: Backward Compatibility

Add fallback logic for users who haven't been migrated:
- If `currentJourneyId` is missing, create it on the fly
- If badges have no `journeyId`, assign them to a legacy journey

---

## Benefits

1. **Clear Mental Model**: Each attempt is a distinct journey
2. **No Celebration Bugs**: Old achievements don't trigger in new journeys
3. **Progress Tracking**: Users can see improvement across journeys
4. **Motivational**: "Journey #5 was my best! 15 days!"
5. **Historical Data**: Rich data for analytics and insights
6. **Scalable**: Easy to add journey-specific features later

---

## Testing Checklist

### Unit Tests
- [ ] Create journey
- [ ] End journey
- [ ] Get current journey
- [ ] Badge creation with journeyId
- [ ] Migration script

### Integration Tests
- [ ] Start streak → creates journey
- [ ] Reach milestone → badge linked to journey
- [ ] Relapse → journey ends, new journey starts
- [ ] Celebration only for current journey badges
- [ ] Badge gallery filters by journey

### E2E Tests
- [ ] Full user flow: start → achieve → relapse → restart
- [ ] Verify no old badge celebrations
- [ ] Journey history displays correctly

---

## Rollout Plan

### Development (Current Phase)
1. Implement data structure changes
2. Update Cloud Functions
3. Update frontend hooks
4. Create migration script
5. Test thoroughly

### Staging
1. Run migration on test accounts
2. Verify data integrity
3. Test all user flows
4. Performance testing

### Production
1. Announce feature to users
2. Run migration for existing users (background job)
3. Monitor for issues
4. Collect user feedback

---

## Timeline Estimate

| Phase | Task | Time |
|-------|------|------|
| 1 | Backend data structure | 2-3 hours |
| 2 | Cloud Function updates | 1-2 hours |
| 3 | Frontend hooks | 2-3 hours |
| 4 | UI updates | 2-3 hours |
| 5 | Migration script | 2 hours |
| 6 | Testing | 2-3 hours |
| **Total** | | **11-16 hours** |

---

## Alternative: Simpler Fix (Quick Win)

If full journey system is too complex right now, a **simpler fix** could be:

### Option A: Delete Old Badges on Relapse
When user reports relapse, delete all badges for that streak type:

```typescript
async function resetMainStreak(userId: string) {
  // 1. Reset streak
  await updateStreak(userId, 'main', { currentSeconds: 0, startDate: Date.now() });
  
  // 2. Delete all main streak badges
  const badges = await query(
    collection(db, `users/${userId}/kamehameha_badges`),
    where('streakType', '==', 'main')
  ).get();
  
  const batch = db.batch();
  badges.forEach(badge => batch.delete(badge.ref));
  await batch.commit();
}
```

**Pros:** Quick fix (30 minutes)
**Cons:** Lose achievement history

### Option B: Add "Active" Flag to Badges
Add `isActive: boolean` to badges, set to false on relapse:

```typescript
interface Badge {
  // ... existing fields
  isActive: boolean;  // false if from a previous streak
}

// On relapse:
- Set all current streak's badges to isActive: false
- Frontend only shows/celebrates isActive badges
```

**Pros:** Quick fix (1 hour), keeps history
**Cons:** Not as clean as journey system

---

## Decision: Full Journey System (Selected) ✅

**User chose:** Option 1 - Full Journey System with simplifications

### Simplifications Applied:
1. **Single Journey Type**: Only PMO journey (main streak)
2. **Discipline as Info**: Violations logged within journey (not separate journey)
3. **Dashboard Layout**: Option B (journey info, days since last violation, violation count)
4. **Journey History**: Shows full violation details for each journey

### Timeline:
- **Estimated:** 11-16 hours
- **Status:** Documentation phase (in progress)
- **Next:** Backend implementation → Frontend → Testing

---

## Next Steps

1. ✅ Update documentation (JOURNEY_SYSTEM_REFACTOR.md) - **IN PROGRESS**
2. ⏳ Update DATA_SCHEMA.md
3. ⏳ Update PROGRESS.md
4. ⏳ Update SPEC.md
5. ⏳ Implement backend (journey service, Cloud Functions)
6. ⏳ Implement frontend (hooks, components, pages)
7. ⏳ Test end-to-end
8. ⏳ Document & commit

🚀 **Starting implementation after documentation updates!**

