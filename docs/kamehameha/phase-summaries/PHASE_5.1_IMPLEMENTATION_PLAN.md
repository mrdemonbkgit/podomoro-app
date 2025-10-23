# Phase 5.1: Journey System Refactor - Implementation Plan

**Created:** October 22, 2025  
**Status:** READY TO IMPLEMENT  
**Estimated Duration:** 11-16 hours  
**Priority:** P0 (Critical Bug Fix)

---

## Table of Contents

1. [Overview](#overview)
2. [Implementation Order](#implementation-order)
3. [Step-by-Step Guide](#step-by-step-guide)
4. [Code Examples](#code-examples)
5. [Testing Strategy](#testing-strategy)
6. [Migration Plan](#migration-plan)
7. [Rollback Plan](#rollback-plan)

---

## Overview

### Problem
- Bug: Old badges trigger celebrations after relapse
- Root cause: Badges are global, not scoped to streak periods
- Impact: Confusing UX, breaks gamification

### Solution
Journey-based achievement system where each PMO streak period is a separate journey with its own badges and violations.

### Key Design Decisions
1. **Single Journey Type:** Only PMO journey (main streak)
2. **Violations as Events:** Discipline relapses logged within journey (informational)
3. **Dashboard Layout:** Option B (journey info + violation tracking)
4. **Journey History:** Full violation details per journey

---

## Implementation Order

### Phase 1: Backend Foundation (3-4 hours)
1. Update TypeScript types
2. Create journey service
3. Update Firestore service
4. Update Cloud Functions

### Phase 2: Frontend Integration (4-5 hours)
5. Update hooks (useStreaks, useBadges)
6. Update Dashboard UI (journey info)
7. Update Badge Gallery (filter by journey)

### Phase 3: Journey History (3-4 hours)
8. Create Journey History page
9. Add navigation/routing

### Phase 4: Testing & Polish (1-3 hours)
10. End-to-end testing
11. Bug fixes
12. Documentation updates

**Total:** 11-16 hours

---

## Step-by-Step Guide

### Step 1: Update TypeScript Types (30 min)

**File:** `src/features/kamehameha/types/kamehameha.types.ts`

**Changes:**
1. Add `Journey` interface
2. Update `Badge` interface (add `journeyId`, remove `streakType`)
3. Update `Relapse` interface (add `journeyId`)
4. Update `Streaks` interface (add `currentJourneyId`)
5. Add utility type exports

**Dependencies:** None

**Testing:**
- TypeScript compilation passes
- No type errors in existing code

---

### Step 2: Create Journey Service (1-1.5 hours)

**File:** `src/features/kamehameha/services/journeyService.ts` (NEW)

**Functions to implement:**
1. `createJourney(userId: string): Promise<Journey>`
   - Create new journey document
   - Set startDate, endReason: 'active'
   - Return journey object

2. `endJourney(userId: string, journeyId: string, finalSeconds: number): Promise<void>`
   - Update journey: endDate, endReason: 'relapse', finalSeconds
   - Called when PMO relapse occurs

3. `getCurrentJourney(userId: string): Promise<Journey | null>`
   - Query journeys where endReason === 'active'
   - Return active journey or null

4. `getJourneyHistory(userId: string, limit?: number): Promise<Journey[]>`
   - Query all journeys, ordered by startDate desc
   - Support pagination with limit

5. `incrementJourneyViolations(userId: string, journeyId: string): Promise<void>`
   - Increment violationsCount field
   - Called when discipline relapse occurs

6. `incrementJourneyAchievements(userId: string, journeyId: string): Promise<void>`
   - Increment achievementsCount field
   - Called when badge is earned (or do this in Cloud Function?)

7. `getJourneyViolations(userId: string, journeyId: string): Promise<Relapse[]>`
   - Query relapses where journeyId matches
   - Order by timestamp desc

8. `getJourneyNumber(userId: string, journeyId: string): Promise<number>`
   - Count journeys with startDate <= current journey startDate
   - Return journey number (1-indexed)

**Dependencies:** 
- Step 1 (types)
- Firebase Firestore

**Testing:**
- Unit tests for each function
- Mock Firestore in tests
- Test error handling

---

### Step 3: Update Firestore Service (1.5-2 hours)

**File:** `src/features/kamehameha/services/firestoreService.ts`

**Changes:**

#### 3.1: `initializeUserStreaks()`
```typescript
// BEFORE
await setDoc(streaksRef, {
  main: { startDate, currentSeconds: 0, longestSeconds: 0, lastUpdated: now },
  discipline: { startDate, currentSeconds: 0, longestSeconds: 0, lastUpdated: now },
  lastUpdated: now
});

// AFTER
const journey = await createJourney(userId); // Create initial journey
await setDoc(streaksRef, {
  currentJourneyId: journey.id, // ← Add this
  main: { startDate, currentSeconds: 0, longestSeconds: 0, lastUpdated: now },
  discipline: { startDate, currentSeconds: 0, longestSeconds: 0, lastUpdated: now },
  lastUpdated: now
});
```

#### 3.2: `resetMainStreak()`
```typescript
// BEFORE
await setDoc(streaksRef, {
  main: { startDate: newStartDate, currentSeconds: 0, lastUpdated: now },
  lastUpdated: now
}, { merge: true });

// AFTER
// 1. Get current journey ID
const streaks = await getDoc(streaksRef);
const currentJourneyId = streaks.data()?.currentJourneyId;

// 2. End current journey
if (currentJourneyId) {
  await endJourney(userId, currentJourneyId, previousSeconds);
}

// 3. Create new journey
const newJourney = await createJourney(userId);

// 4. Reset streak with new journey ID
await setDoc(streaksRef, {
  currentJourneyId: newJourney.id, // ← New journey
  main: { startDate: newStartDate, currentSeconds: 0, lastUpdated: now },
  lastUpdated: now
}, { merge: true });
```

#### 3.3: `resetDisciplineStreak()`
```typescript
// BEFORE
await setDoc(streaksRef, {
  discipline: { startDate: newStartDate, currentSeconds: 0, lastUpdated: now },
  lastUpdated: now
}, { merge: true });

// AFTER
// 1. Get current journey ID
const streaks = await getDoc(streaksRef);
const currentJourneyId = streaks.data()?.currentJourneyId;

// 2. Increment journey violations count
if (currentJourneyId) {
  await incrementJourneyViolations(userId, currentJourneyId);
}

// 3. Reset discipline streak (keep journey ID)
await setDoc(streaksRef, {
  discipline: { startDate: newStartDate, currentSeconds: 0, lastUpdated: now },
  lastUpdated: now
}, { merge: true });
```

#### 3.4: `createRelapse()`
```typescript
// Add journeyId parameter
export async function createRelapse(
  userId: string,
  journeyId: string, // ← Add this
  relapseData: {
    type: 'main' | 'discipline';
    reasons: string[];
    reflection: { whatLed: string; willDoDifferently: string };
    previousStreakSeconds: number;
  }
): Promise<Relapse> {
  // ... existing code
  const relapse: Relapse = {
    id: relapseRef.id,
    journeyId, // ← Add this
    userId,
    timestamp: now,
    type: relapseData.type,
    // ... rest of fields
  };
  // ...
}
```

**Dependencies:**
- Step 1 (types)
- Step 2 (journey service)

**Testing:**
- Test journey creation on initialization
- Test journey ending on PMO relapse
- Test violation increment on discipline relapse
- Test error handling

---

### Step 4: Update Cloud Functions (1-1.5 hours)

**File:** `functions/src/milestones.ts`

**Changes:**

#### 4.1: Only check main streak milestones
```typescript
export const checkMilestones = onDocumentWritten(
  'users/{userId}/kamehameha/streaks',
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    
    if (!afterData) return;
    
    const userId = event.params.userId;
    const db = admin.firestore();
    
    // ONLY check main streak (remove discipline checking)
    const beforeMain = beforeData?.main;
    const afterMain = afterData.main;
    
    if (beforeMain && afterMain) {
      await checkStreakMilestone(
        db,
        userId,
        'main',
        beforeMain.currentSeconds || 0,
        afterMain.currentSeconds || 0,
        afterData.currentJourneyId // ← Pass journey ID
      );
    }
  }
);
```

#### 4.2: Update `checkStreakMilestone` signature
```typescript
async function checkStreakMilestone(
  db: admin.firestore.Firestore,
  userId: string,
  streakType: 'main', // Only 'main' now
  prevSeconds: number,
  currentSeconds: number,
  journeyId: string // ← Add this
): Promise<void> {
  // ... milestone detection logic ...
  
  if (crossedMilestone) {
    // ... deduplication check ...
    
    // Create badge with journey link
    await db.collection('users').doc(userId)
      .collection('kamehameha_badges')
      .add({
        journeyId, // ← Link to journey
        milestoneSeconds: crossedMilestone,
        earnedAt: Date.now(),
        badgeEmoji: config.emoji,
        badgeName: config.name,
        congratsMessage: config.message,
      });
    
    // Optional: Increment journey achievements count
    await db.collection('users').doc(userId)
      .collection('kamehameha_journeys')
      .doc(journeyId)
      .update({
        achievementsCount: admin.firestore.FieldValue.increment(1)
      });
  }
}
```

**Dependencies:**
- Step 1 (types)
- Step 2 (journey service)

**Testing:**
- Deploy to emulator
- Test milestone detection creates badge with journeyId
- Test journey achievementsCount increments
- Verify no discipline milestones

---

### Step 5: Update useStreaks Hook (1 hour)

**File:** `src/features/kamehameha/hooks/useStreaks.ts`

**Changes:**

#### 5.1: Add journey state
```typescript
const [currentJourneyId, setCurrentJourneyId] = useState<string | null>(null);

// Add to return type
return {
  streaks,
  mainDisplay,
  disciplineDisplay,
  currentJourneyId, // ← Add this
  loading,
  error,
  refreshStreaks,
  resetMainStreak,
  resetDisciplineStreak,
  resetBothStreaks,
};
```

#### 5.2: Read currentJourneyId from Firestore
```typescript
useEffect(() => {
  if (!user) return;

  const streaksRef = doc(db, getStreaksDocPath(user.uid));

  const unsubscribe = onSnapshot(streaksRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data() as Streaks;
      setStreaks(data);
      setCurrentJourneyId(data.currentJourneyId || null); // ← Add this
      setLoading(false);
    } else {
      // Initialize
      initializeUserStreaks(user.uid);
    }
  }, (error) => {
    console.error('Failed to listen to streaks:', error);
    setError('Failed to load streaks');
    setLoading(false);
  });

  return unsubscribe;
}, [user]);
```

#### 5.3: Update reset functions to pass journeyId
```typescript
const resetMainStreak = useCallback(async (previousSeconds: number) => {
  if (!user || !currentJourneyId) return; // ← Check journeyId
  
  try {
    // Create relapse with journeyId
    await createRelapse(user.uid, currentJourneyId, {
      type: 'main',
      reasons: ['PMO Relapse'],
      reflection: { whatLed: '', willDoDifferently: '' },
      previousStreakSeconds: previousSeconds,
    });
    
    await firestoreService.resetMainStreak(user.uid, previousSeconds);
    await refreshStreaks();
  } catch (error) {
    console.error('Failed to reset main streak:', error);
    throw error;
  }
}, [user, currentJourneyId, refreshStreaks]);
```

**Dependencies:**
- Step 1 (types)
- Step 3 (Firestore service)

**Testing:**
- Test currentJourneyId loads from Firestore
- Test reset functions pass journeyId to createRelapse
- Test error handling

---

### Step 6: Update useBadges Hook (1 hour)

**File:** `src/features/kamehameha/hooks/useBadges.ts`

**Changes:**

#### 6.1: Add currentJourneyId prop
```typescript
export function useBadges(currentJourneyId: string | null) {
  // ... existing state ...
  
  useEffect(() => {
    if (!user || !currentJourneyId) return; // ← Check journeyId
    
    const badgesQuery = query(
      collection(db, `users/${user.uid}/kamehameha_badges`),
      where('journeyId', '==', currentJourneyId), // ← Filter by journey
      orderBy('earnedAt', 'desc')
    );
    
    // ... rest of snapshot logic ...
  }, [user, currentJourneyId]); // ← Add dependency
  
  // ...
}
```

#### 6.2: Update BadgesPage to pass currentJourneyId
```typescript
// In BadgesPage.tsx or wherever useBadges is called
const { currentJourneyId } = useStreaksContext();
const { badges, celebrationBadge, dismissCelebration } = useBadges(currentJourneyId);
```

**Dependencies:**
- Step 5 (useStreaks updated)

**Testing:**
- Test badges only load for current journey
- Test celebrations only trigger for current journey badges
- Test no celebration after relapse

---

### Step 7: Update Dashboard UI (2-3 hours)

**File:** `src/features/kamehameha/pages/KamehamehaPage.tsx`

**Changes:**

#### 7.1: Add journey data hooks
```typescript
import { useJourneyInfo } from '../hooks/useJourneyInfo'; // New hook

export function KamehamehaPage() {
  const { currentJourneyId, disciplineDisplay } = useStreaksContext();
  const { journeyNumber, violationsCount, loading: journeyLoading } = useJourneyInfo(currentJourneyId);
  
  // ...
}
```

#### 7.2: Add Journey Info component
Create `src/features/kamehameha/components/JourneyInfo.tsx`:
```tsx
interface JourneyInfoProps {
  journeyNumber: number;
  mainDisplay: string;
  disciplineDisplay: string;
  violationsCount: number;
}

export function JourneyInfo({ journeyNumber, mainDisplay, disciplineDisplay, violationsCount }: JourneyInfoProps) {
  return (
    <div className="glass-morphism p-4 rounded-xl mb-4">
      <h2 className="text-xl font-bold text-white mb-2">
        Journey #{journeyNumber}: {mainDisplay}
      </h2>
      <div className="text-white/70 text-sm space-y-1">
        <div>├─ {disciplineDisplay} since last violation</div>
        <div>└─ {violationsCount} violations total</div>
      </div>
    </div>
  );
}
```

#### 7.3: Add to Dashboard
```tsx
{!loading && !journeyLoading && currentJourneyId && (
  <JourneyInfo
    journeyNumber={journeyNumber}
    mainDisplay={mainDisplay}
    disciplineDisplay={disciplineDisplay}
    violationsCount={violationsCount}
  />
)}
```

**Dependencies:**
- Step 5 (useStreaks)
- Step 2 (journey service for data)

**Testing:**
- Visual: Journey info displays correctly
- Data: Journey number, duration, violations accurate
- Responsive: Works on mobile

---

### Step 8: Create useJourneyInfo Hook (30 min)

**File:** `src/features/kamehameha/hooks/useJourneyInfo.ts` (NEW)

```typescript
import { useState, useEffect } from 'react';
import { getJourneyNumber, getJourneyViolations } from '../services/journeyService';
import { useAuth } from '../../auth/context/AuthContext';

interface UseJourneyInfoReturn {
  journeyNumber: number;
  violationsCount: number;
  loading: boolean;
  error: string | null;
}

export function useJourneyInfo(journeyId: string | null): UseJourneyInfoReturn {
  const { user } = useAuth();
  const [journeyNumber, setJourneyNumber] = useState(0);
  const [violationsCount, setViolationsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !journeyId) {
      setLoading(false);
      return;
    }

    async function loadJourneyInfo() {
      try {
        setLoading(true);
        
        const [number, violations] = await Promise.all([
          getJourneyNumber(user!.uid, journeyId!),
          getJourneyViolations(user!.uid, journeyId!)
        ]);
        
        setJourneyNumber(number);
        setViolationsCount(violations.length);
        setError(null);
      } catch (err) {
        console.error('Failed to load journey info:', err);
        setError('Failed to load journey info');
      } finally {
        setLoading(false);
      }
    }

    loadJourneyInfo();
  }, [user, journeyId]);

  return { journeyNumber, violationsCount, loading, error };
}
```

**Dependencies:**
- Step 2 (journey service)

**Testing:**
- Test journey number calculation
- Test violations count
- Test loading states
- Test error handling

---

### Step 9: Create Journey History Page (2-3 hours)

**File:** `src/features/kamehameha/pages/JourneyHistoryPage.tsx` (NEW)

```tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { getJourneyHistory, getJourneyViolations, getJourneyNumber } from '../services/journeyService';
import { Journey, Relapse } from '../types/kamehameha.types';
import { formatDuration } from '../../../utils/formatDuration';

export function JourneyHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [expandedJourneyId, setExpandedJourneyId] = useState<string | null>(null);
  const [journeyViolations, setJourneyViolations] = useState<Record<string, Relapse[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function loadJourneys() {
      try {
        const history = await getJourneyHistory(user!.uid);
        setJourneys(history);
      } catch (error) {
        console.error('Failed to load journey history:', error);
      } finally {
        setLoading(false);
      }
    }

    loadJourneys();
  }, [user]);

  const toggleJourneyExpansion = async (journeyId: string) => {
    if (expandedJourneyId === journeyId) {
      setExpandedJourneyId(null);
    } else {
      setExpandedJourneyId(journeyId);
      
      // Load violations if not already loaded
      if (!journeyViolations[journeyId] && user) {
        const violations = await getJourneyViolations(user.uid, journeyId);
        setJourneyViolations(prev => ({ ...prev, [journeyId]: violations }));
      }
    }
  };

  if (loading) {
    return <div className="text-white">Loading journey history...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/kamehameha')}
            className="text-white/70 hover:text-white mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">Journey History</h1>
          <p className="text-white/70 mt-2">
            Your complete recovery journey, one step at a time
          </p>
        </div>

        {/* Journey List */}
        <div className="space-y-4">
          {journeys.map((journey, index) => {
            const isActive = journey.endReason === 'active';
            const isExpanded = expandedJourneyId === journey.id;
            const violations = journeyViolations[journey.id] || [];

            return (
              <div
                key={journey.id}
                className="glass-morphism p-6 rounded-xl"
              >
                {/* Journey Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      {isActive ? '►' : '○'} Journey #{journeys.length - index}
                      {isActive && (
                        <span className="text-sm font-normal text-green-400">(Current)</span>
                      )}
                    </h2>
                    <p className="text-white/70 text-sm mt-1">
                      {new Date(journey.startDate).toLocaleDateString()} - 
                      {isActive ? ' Present' : ` ${new Date(journey.endDate!).toLocaleDateString()}`}
                      {' | '}
                      {formatDuration(journey.finalSeconds)}
                    </p>
                  </div>
                </div>

                {/* Journey Stats */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-white">{journey.achievementsCount}</div>
                    <div className="text-white/70 text-sm">Achievements</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-white">{journey.violationsCount}</div>
                    <div className="text-white/70 text-sm">Violations</div>
                  </div>
                </div>

                {/* Expand Violations Button */}
                {journey.violationsCount > 0 && (
                  <button
                    onClick={() => toggleJourneyExpansion(journey.id)}
                    className="mt-4 w-full py-2 text-white/70 hover:text-white text-sm"
                  >
                    {isExpanded ? '▼ Hide Violations' : '▶ View Violations'}
                  </button>
                )}

                {/* Violations List (Expanded) */}
                {isExpanded && violations.length > 0 && (
                  <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                    {violations.map((violation, vIndex) => {
                      const dayNumber = Math.floor((violation.timestamp - journey.startDate) / (1000 * 60 * 60 * 24)) + 1;
                      
                      return (
                        <div key={violation.id} className="bg-white/5 p-4 rounded-lg">
                          <div className="text-white font-medium mb-2">
                            • {new Date(violation.timestamp).toLocaleDateString()} (Day {dayNumber})
                          </div>
                          <div className="text-white/70 text-sm space-y-1">
                            <div><strong>Triggers:</strong> {violation.reasons.join(', ')}</div>
                            {violation.reflection.whatLed && (
                              <div><strong>What led to this:</strong> {violation.reflection.whatLed}</div>
                            )}
                            {violation.reflection.willDoDifferently && (
                              <div><strong>Next time:</strong> {violation.reflection.willDoDifferently}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {journeys.length === 0 && (
          <div className="glass-morphism p-8 rounded-xl text-center">
            <p className="text-white/70">No journey history yet. Start your first journey!</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Dependencies:**
- Step 2 (journey service)
- Step 1 (types)

**Testing:**
- Test journey list displays
- Test expansion/collapse
- Test violation details
- Test current journey indicator
- Test empty state

---

### Step 10: Add Routing (15 min)

**File:** `src/main.tsx`

```tsx
<Route
  path="/kamehameha/history"
  element={
    <ProtectedRoute>
      <StreaksProvider>
        <JourneyHistoryPage />
      </StreaksProvider>
    </ProtectedRoute>
  }
/>
```

**File:** `src/features/kamehameha/pages/KamehamehaPage.tsx`

Add button:
```tsx
<button
  onClick={() => navigate('/kamehameha/history')}
  className="btn-secondary"
>
  📖 Journey History
</button>
```

**Dependencies:**
- Step 9 (Journey History page)

**Testing:**
- Test navigation works
- Test back button
- Test route protection

---

## Code Examples

### Journey Interface
```typescript
export interface Journey {
  id: string;
  startDate: number;
  endDate: number | null;
  endReason: 'active' | 'relapse';
  finalSeconds: number;
  achievementsCount: number;
  violationsCount: number;
  createdAt: number;
  updatedAt: number;
}
```

### Creating a Journey
```typescript
export async function createJourney(userId: string): Promise<Journey> {
  const db = getFirestore();
  const journeysRef = collection(db, `users/${userId}/kamehameha_journeys`);
  const now = Date.now();

  const journey: Omit<Journey, 'id'> = {
    startDate: now,
    endDate: null,
    endReason: 'active',
    finalSeconds: 0,
    achievementsCount: 0,
    violationsCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(journeysRef, journey);

  return {
    id: docRef.id,
    ...journey,
  };
}
```

### Ending a Journey
```typescript
export async function endJourney(
  userId: string,
  journeyId: string,
  finalSeconds: number
): Promise<void> {
  const db = getFirestore();
  const journeyRef = doc(db, `users/${userId}/kamehameha_journeys/${journeyId}`);

  await updateDoc(journeyRef, {
    endDate: Date.now(),
    endReason: 'relapse',
    finalSeconds,
    updatedAt: Date.now(),
  });
}
```

### Querying Current Journey
```typescript
export async function getCurrentJourney(userId: string): Promise<Journey | null> {
  const db = getFirestore();
  const journeysRef = collection(db, `users/${userId}/kamehameha_journeys`);

  const q = query(
    journeysRef,
    where('endReason', '==', 'active'),
    limit(1)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as Journey;
}
```

---

## Testing Strategy

### Unit Tests
- [ ] `journeyService.createJourney()` creates valid journey
- [ ] `journeyService.endJourney()` updates journey correctly
- [ ] `journeyService.getCurrentJourney()` returns active journey
- [ ] `journeyService.getJourneyHistory()` returns sorted journeys
- [ ] `journeyService.incrementJourneyViolations()` increments count

### Integration Tests
- [ ] Initialize streaks creates journey
- [ ] PMO relapse ends journey and creates new one
- [ ] Discipline relapse increments journey violations
- [ ] Badge creation links to current journey
- [ ] Journey achievements count updates

### E2E Tests (Manual in Emulator)
1. **Fresh Start:**
   - Sign in → Journey #1 created
   - Check Firestore: `currentJourneyId` set

2. **Reach Milestone:**
   - Wait 1 minute → Badge earned
   - Check Firestore: Badge has `journeyId` matching current journey
   - Verify celebration modal appears

3. **Discipline Violation:**
   - Report discipline relapse
   - Check Firestore: Journey `violationsCount` incremented
   - Check Dashboard: Shows "X violations total"
   - Verify journey continues (not ended)

4. **PMO Relapse:**
   - Report PMO relapse
   - Check Firestore: Journey #1 has `endDate`, `endReason: 'relapse'`
   - Check Firestore: Journey #2 created with `endReason: 'active'`
   - Check Firestore: `currentJourneyId` updated to Journey #2
   - Verify no celebration modal

5. **Reach Milestone Again:**
   - Wait 1 minute → Badge earned
   - Verify NEW badge created (not old one)
   - Verify celebration modal appears
   - Check Firestore: New badge has Journey #2 `journeyId`

6. **Journey History:**
   - Navigate to Journey History page
   - Verify Journey #2 (current) shown first
   - Verify Journey #1 shown second
   - Expand Journey #1 → See violations

---

## Migration Plan

### Option A: Dev/Testing (Recommended)
**Reset all data and start fresh**

1. Clear Firestore collections:
   - `kamehameha_badges`
   - `kamehameha_relapses`
   - `kamehameha_journeys`
   - `kamehameha/streaks`

2. Sign out and sign back in
3. New initialization creates journey

### Option B: Production (Future)
**Migrate existing users**

1. Create migration script: `scripts/migrateToJourneySystem.ts`
2. For each user:
   - Create "legacy" journey with current streak data
   - Update existing badges with legacy journey ID
   - Update existing relapses with legacy journey ID
   - Create new "current" journey
   - Update streaks with current journey ID

3. Run migration as background job
4. Monitor for errors
5. Verify data integrity

---

## Rollback Plan

### If Critical Bug Found:

1. **Immediate:** Revert Cloud Functions deployment
   ```bash
   firebase deploy --only functions --force
   ```

2. **Code:** Git revert to previous commit
   ```bash
   git revert HEAD
   git push
   ```

3. **Frontend:** Redeploy previous version
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

4. **Data:** Restore Firestore from backup (if available)

### Partial Rollback:
- Can disable journey features via feature flag
- Keep data structure, show old UI
- Gives time to fix bugs without losing data

---

## Success Criteria

### Must Have (P0):
- [x] Documentation complete
- [ ] Journey created on initialization
- [ ] Journey ended on PMO relapse
- [ ] Badges linked to journey
- [ ] No celebration bug after relapse
- [ ] Dashboard shows journey info
- [ ] Journey history page works

### Should Have (P1):
- [ ] Journey number displayed
- [ ] Violations expandable in history
- [ ] Loading states smooth
- [ ] Error handling robust

### Nice to Have (P2):
- [ ] Journey comparison/analytics
- [ ] Export journey data
- [ ] Journey milestones visualization
- [ ] Journey stats (avg duration, success rate)

---

## Estimated Timeline

| Step | Task | Time | Cumulative |
|------|------|------|------------|
| 1 | Update types | 30 min | 0.5 hr |
| 2 | Create journey service | 1.5 hr | 2 hr |
| 3 | Update Firestore service | 2 hr | 4 hr |
| 4 | Update Cloud Functions | 1.5 hr | 5.5 hr |
| 5 | Update useStreaks hook | 1 hr | 6.5 hr |
| 6 | Update useBadges hook | 1 hr | 7.5 hr |
| 7 | Update Dashboard UI | 2.5 hr | 10 hr |
| 8 | Create useJourneyInfo hook | 30 min | 10.5 hr |
| 9 | Create Journey History page | 2.5 hr | 13 hr |
| 10 | Add routing | 15 min | 13.25 hr |
| Testing & Polish | E2E, bug fixes, docs | 2-3 hr | **15-16 hr** |

**Total: 15-16 hours** (realistic estimate with testing)

---

## Checkpoint Questions

Before starting each phase, ask:
1. Are all dependencies complete?
2. Do I understand the requirements?
3. Do I have test data ready?
4. Do I know the rollback plan?

After each step:
1. Does TypeScript compile?
2. Are there any console errors?
3. Does it work in the emulator?
4. Should I commit this checkpoint?

---

## Notes

- **Keep commits small:** Commit after each major step
- **Test in emulator:** Don't deploy to production until fully tested
- **Monitor Firestore writes:** Watch for accidental write loops
- **Document surprises:** Update DEVELOPER_NOTES.md if you find gotchas

---

**Ready to implement? Let's go! 🚀**

