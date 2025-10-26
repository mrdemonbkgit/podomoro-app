# Kamehameha API Reference

**Complete API documentation for the Kamehameha Recovery Tool**

---

## Table of Contents

1. [React Hooks](#react-hooks)
2. [Service Functions](#service-functions)
3. [Type Definitions](#type-definitions)
4. [Constants](#constants)
5. [Examples](#examples)

---

## React Hooks

### `useStreaks()`

Primary hook for managing streak state and display.

**Returns:** `UseStreaksReturn`

```typescript
interface UseStreaksReturn {
  streaks: Streaks | null;
  mainDisplay: StreakDisplay | null;
  currentJourneyId: string | null;
  loading: boolean;
  error: Error | null;
  resetMainStreak: () => Promise<void>;
  refreshStreaks: () => Promise<void>;
}
```

**Example:**

```typescript
function StreakDashboard() {
  const {
    mainDisplay,      // Current streak with formatted time
    streaks,          // Raw streak data
    loading,          // Loading state
    error,            // Error state
    resetMainStreak,  // Reset on relapse
    refreshStreaks,   // Force reload
  } = useStreaks();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Current Streak</h2>
      <p>{mainDisplay?.formatted}</p>
      <p>Record: {streaks?.main.longestSeconds} seconds</p>
      <button onClick={resetMainStreak}>Log Relapse</button>
    </div>
  );
}
```

---

### `useMilestones(currentJourneyId, journeyStartDate)`

Client-side milestone detection for automatic badge creation.

**Parameters:**
- `currentJourneyId: string | null` - Active journey ID
- `journeyStartDate: number | null` - Journey start timestamp

**How it works:**
1. Monitors elapsed time every second
2. Checks against milestone thresholds
3. Creates badge documents automatically
4. Uses deterministic IDs to prevent duplicates

**Example:**

```typescript
function MilestoneTracker() {
  const { currentJourneyId, journeyStartDate } = useStreaks();
  
  // Automatically detects milestones - no manual calls needed
  useMilestones(currentJourneyId, journeyStartDate);
  
  return <div>Milestones are being tracked...</div>;
}
```

---

### `useBadges(currentJourneyId)`

Manages badge display and celebration logic.

**Parameters:**
- `currentJourneyId: string | null` - Active journey ID

**Returns:** `UseBadgesReturn`

```typescript
interface UseBadgesReturn {
  badges: Badge[];
  loading: boolean;
  error: string | null;
  celebrationBadge: Badge | null;
  dismissCelebration: () => void;
}
```

**Example:**

```typescript
function BadgeDisplay() {
  const { currentJourneyId } = useStreaks();
  const {
    badges,
    celebrationBadge,
    dismissCelebration,
  } = useBadges(currentJourneyId);

  return (
    <div>
      <h2>Your Badges ({badges.length})</h2>
      {badges.map(badge => (
        <div key={badge.id}>
          {badge.emoji} {badge.name}
        </div>
      ))}
      
      {celebrationBadge && (
        <CelebrationModal
          badge={celebrationBadge}
          onClose={dismissCelebration}
        />
      )}
    </div>
  );
}
```

---

### `useJourneyInfo(currentJourneyId)`

Loads journey metadata (number, violations count).

**Parameters:**
- `currentJourneyId: string | null` - Active journey ID

**Returns:** `UseJourneyInfoReturn`

```typescript
interface UseJourneyInfoReturn {
  journeyNumber: number | null;
  violationsCount: number;
  loading: boolean;
}
```

**Example:**

```typescript
function JourneyInfo() {
  const { currentJourneyId } = useStreaks();
  const { journeyNumber, violationsCount, loading } = useJourneyInfo(currentJourneyId);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <p>Journey #{journeyNumber}</p>
      <p>Violations: {violationsCount}</p>
    </div>
  );
}
```

---

## Service Functions

### Firestore Service

**`getStreaks(userId: string): Promise<Streaks>`**

Load user's streak data from Firestore. Automatically initializes streaks for new users.

```typescript
const streaks = await getStreaks(user.uid);
console.log('Current journey:', streaks.currentJourneyId);
console.log('Record:', streaks.main.longestSeconds, 'seconds');
```

---

**`initializeUserStreaks(userId: string): Promise<Streaks>`**

Create initial journey and streak document for new users. Called automatically by `getStreaks()`.

```typescript
// Usually called automatically, but can be called manually:
const streaks = await initializeUserStreaks(user.uid);
```

---

**`resetMainStreak(userId: string, previousSeconds: number): Promise<Streaks>`**

⚠️ **CRITICAL FUNCTION** - Atomic transaction to end journey and start new one.

**What it does:**
1. End current journey (set endDate, finalSeconds)
2. Create new journey
3. Update longest streak if record broken
4. Update streaks document

**Transaction guarantees:**
- All operations succeed or fail together
- No duplicate journeys
- Consistent longest streak

```typescript
// User logs relapse after 7 days
const updatedStreaks = await resetMainStreak(user.uid, 604800);
console.log('New journey:', updatedStreaks.currentJourneyId);
```

---

**`createCheckIn(checkInData: Omit<CheckIn, 'id'>): Promise<void>`**

Save a daily check-in with mood and notes.

```typescript
await createCheckIn({
  userId: user.uid,
  journeyId: currentJourneyId,
  timestamp: Date.now(),
  mood: 'good',
  notes: 'Feeling strong today!',
  streakType: 'main',
});
```

---

**`createRelapse(relapseData: Omit<Relapse, 'id'>): Promise<void>`**

Log a relapse (PMO or rule violation).

```typescript
// Log PMO relapse (resets streak)
await createRelapse({
  userId: user.uid,
  journeyId: currentJourneyId,
  timestamp: Date.now(),
  trigger: 'stress',
  location: 'home',
  notes: 'Had a difficult day',
  isPMO: true,
  streakType: 'main',
});

// Log rule violation (doesn't reset streak)
await createRelapse({
  userId: user.uid,
  journeyId: currentJourneyId,
  timestamp: Date.now(),
  trigger: 'edging',
  isPMO: false,
  streakType: 'main',
});
```

---

### Journey Service

**`createJourney(userId: string): Promise<Journey>`**

Create a new journey. Called automatically by `initializeUserStreaks()` and `resetMainStreak()`.

```typescript
const journey = await createJourney(user.uid);
console.log('New journey ID:', journey.id);
```

---

**`endJourney(userId: string, journeyId: string, finalSeconds: number): Promise<void>`**

End a journey. Called by `resetMainStreak()`.

```typescript
await endJourney(user.uid, 'journey-123', 604800);
```

---

**`getCurrentJourney(userId: string): Promise<Journey | null>`**

Get the currently active journey.

```typescript
const journey = await getCurrentJourney(user.uid);
if (journey) {
  console.log('Started:', new Date(journey.startDate));
}
```

---

**`getJourneyHistory(userId: string, limitCount?: number): Promise<Journey[]>`**

Get all journeys, ordered by start date (most recent first).

```typescript
// Get all journeys
const allJourneys = await getJourneyHistory(user.uid);

// Get last 10 journeys
const recentJourneys = await getJourneyHistory(user.uid, 10);
```

---

**`incrementJourneyAchievements(userId: string, journeyId: string): Promise<void>`**

Atomically increment journey's achievement count. Called automatically when badges are created.

```typescript
await incrementJourneyAchievements(user.uid, journeyId);
```

---

**`incrementJourneyViolations(userId: string, journeyId: string): Promise<void>`**

Atomically increment journey's violation count.

```typescript
await incrementJourneyViolations(user.uid, journeyId);
```

---

## Type Definitions

### `Streaks`

Main streak data structure.

```typescript
interface Streaks {
  currentJourneyId: string | null;  // Reference to active journey
  main: {
    longestSeconds: number;          // All-time record
  };
  lastUpdated: number;               // Timestamp of last update
}
```

---

### `StreakDisplay`

Formatted display data for UI.

```typescript
interface StreakDisplay {
  seconds: number;        // Total elapsed seconds
  formatted: string;      // Human-readable: "7d 3h 15m"
  days: number;           // Days component
  hours: number;          // Hours component
  minutes: number;        // Minutes component
  secs: number;           // Seconds component
}
```

---

### `Journey`

Journey lifecycle document.

```typescript
interface Journey {
  id: string;
  startDate: number;              // Journey start timestamp
  endDate: number | null;         // null if active
  endReason: 'active' | 'relapse'; // Why journey ended
  finalSeconds: number;           // Duration when ended
  achievementsCount: number;      // Number of badges earned
  violationsCount: number;        // Rule violations (not PMO)
  createdAt: number;
  updatedAt: number;
}
```

---

### `Badge`

Achievement/milestone badge.

```typescript
interface Badge {
  id: string;                // Format: "{journeyId}-{milestoneSeconds}"
  userId: string;
  journeyId: string;
  milestoneSeconds: number;  // Threshold crossed (e.g., 86400 for 1 day)
  earnedAt: number;          // Timestamp when earned
  emoji: string;             // Display emoji (e.g., "🌱")
  name: string;              // Badge name (e.g., "First Step")
  message: string;           // Celebration message
  streakType: 'main';        // Always 'main' in current system
}
```

---

### `CheckIn`

Daily check-in record.

```typescript
interface CheckIn {
  id: string;
  userId: string;
  journeyId: string;
  timestamp: number;
  mood: 'great' | 'good' | 'okay' | 'struggling';
  notes?: string;
  streakType: 'main';
}
```

---

### `Relapse`

Relapse/violation record.

```typescript
interface Relapse {
  id: string;
  userId: string;
  journeyId: string;
  timestamp: number;
  trigger?: string;           // What caused it
  location?: string;          // Where it happened
  notes?: string;
  isPMO: boolean;            // true = full relapse, false = rule violation
  streakType: 'main';
}
```

---

## Constants

### `INTERVALS`

Timing intervals (milliseconds).

```typescript
export const INTERVALS = {
  UPDATE_DISPLAY_MS: 1000,      // Display update interval
  MILESTONE_CHECK_MS: 1000,     // Milestone check interval
} as const;
```

---

### `TIMEOUTS`

UI feedback timeouts (milliseconds).

```typescript
export const TIMEOUTS = {
  SUCCESS_MESSAGE_MS: 3000,     // Success toast duration
  ERROR_MESSAGE_MS: 5000,       // Error toast duration
  TOAST_DURATION_MS: 3000,      // Generic toast duration
} as const;
```

---

### `MILESTONE_SECONDS`

Milestone thresholds (seconds).

**Development:**
- 60 (1 minute)
- 300 (5 minutes)

**Production:**
- 86400 (1 day)
- 259200 (3 days)
- 604800 (7 days)
- 1209600 (14 days)
- 2592000 (30 days)
- 5184000 (60 days)
- 7776000 (90 days)
- 15552000 (180 days)
- 31536000 (365 days)

---

## Examples

### Complete Dashboard Component

```typescript
function KamehamehaDashboard() {
  const {
    mainDisplay,
    streaks,
    loading,
    error,
    resetMainStreak,
    currentJourneyId,
    journeyStartDate,
  } = useStreaks();

  const { badges, celebrationBadge, dismissCelebration } = useBadges(currentJourneyId);
  const { journeyNumber, violationsCount } = useJourneyInfo(currentJourneyId);
  
  useMilestones(currentJourneyId, journeyStartDate);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div>
      {/* Current Streak */}
      <section>
        <h1>{mainDisplay?.formatted}</h1>
        <p>Journey #{journeyNumber}</p>
        <p>Record: {streaks?.main.longestSeconds} seconds</p>
      </section>

      {/* Badges */}
      <section>
        <h2>Achievements ({badges.length})</h2>
        {badges.map(badge => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </section>

      {/* Actions */}
      <section>
        <button onClick={resetMainStreak}>
          Log Relapse
        </button>
      </section>

      {/* Celebration */}
      {celebrationBadge && (
        <CelebrationModal
          badge={celebrationBadge}
          onClose={dismissCelebration}
        />
      )}
    </div>
  );
}
```

---

### Logging a Check-In

```typescript
async function handleCheckIn(mood: CheckIn['mood'], notes: string) {
  const { user } = useAuth();
  const { currentJourneyId } = useStreaks();

  try {
    await createCheckIn({
      userId: user.uid,
      journeyId: currentJourneyId!,
      timestamp: Date.now(),
      mood,
      notes,
      streakType: 'main',
    });
    
    toast.success('Check-in saved!');
  } catch (error) {
    toast.error('Failed to save check-in');
  }
}
```

---

### Logging a Relapse

```typescript
async function handleRelapse(data: RelapseFormData) {
  const { user } = useAuth();
  const { currentJourneyId, mainDisplay, resetMainStreak } = useStreaks();

  try {
    // Save relapse record
    await createRelapse({
      userId: user.uid,
      journeyId: currentJourneyId!,
      timestamp: Date.now(),
      trigger: data.trigger,
      location: data.location,
      notes: data.notes,
      isPMO: data.isPMO,
      streakType: 'main',
    });

    // Reset streak if PMO (not just violation)
    if (data.isPMO) {
      await resetMainStreak();
      toast.success('Journey reset. Fresh start!');
    } else {
      // Just log violation, don't reset
      toast.info('Violation logged');
    }
  } catch (error) {
    toast.error('Failed to log relapse');
  }
}
```

---

## Architecture Notes

### Journey-Based System (Phase 5.1)

The Kamehameha system uses a **journey-based architecture**:

1. **One journey = one streak period** (from start to relapse)
2. **Badges belong to journeys** (permanent historical records)
3. **No auto-save** - display calculated from immutable `journey.startDate`
4. **Atomic transactions** - all critical operations use Firestore transactions

### Data Flow

```
User Action (UI)
    ↓
Hook (useStreaks, useMilestones)
    ↓
Service Function (firestoreService, journeyService)
    ↓
Firestore (Database)
    ↓
Real-time Listener (onSnapshot)
    ↓
Hook State Update
    ↓
UI Re-render
```

### Security

All Firestore operations are protected by security rules:
- Users can only access their own data
- `uid` must match authenticated user
- Server-side validation in Cloud Functions

---

## Migration from Old System

If you're updating from the old discipline streak system:

**Old:**
```typescript
// Two separate timers
streaks: {
  main: { seconds, longestSeconds },
  discipline: { seconds, longestSeconds }
}
```

**New (Phase 5.1):**
```typescript
// One journey, badges for milestones
streaks: {
  currentJourneyId: "journey-123",
  main: { longestSeconds }
}
// Display calculated from journey.startDate
```

**Key Changes:**
- No more `seconds` field in Streaks
- All timing from `journey.startDate`
- Badges replace discipline tracking
- Rule violations logged but don't reset streak

---

## Need Help?

- **Issues:** See `docs/kamehameha/DEVELOPER_NOTES.md`
- **Progress:** See `docs/kamehameha/PROGRESS.md`
- **Spec:** See `docs/kamehameha/SPEC.md`
- **Schema:** See `docs/kamehameha/DATA_SCHEMA.md`

---

**Last Updated:** Phase 4 Day 3 (API Documentation)

