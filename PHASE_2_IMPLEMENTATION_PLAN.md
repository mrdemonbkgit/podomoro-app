# Phase 2: Kamehameha Foundation - Implementation Plan

**Status:** Ready to implement  
**Estimated Duration:** 3-4 hours  
**Date:** October 21, 2025

---

## 📋 Overview

Phase 2 builds the core foundation of the Kamehameha recovery tool:
- **Dual streak tracking** (Main streak + Discipline streak)
- **Real-time countdown timers** (update every second)
- **Firestore data persistence**
- **Top streak badge** (visible on all pages)
- **Beautiful dashboard UI**

---

## 🏗️ Architecture

### Data Flow
```
User Action (e.g., page load)
    ↓
useStreaks hook
    ↓
Firestore Service (read/write)
    ↓
Firestore Database
    ↓
Real-time updates (every second)
    ↓
UI Components (StreakTimer, StreakCard, Badge)
```

### File Structure
```
src/
├── features/
│   └── kamehameha/
│       ├── types/
│       │   └── kamehameha.types.ts       # TypeScript interfaces
│       ├── services/
│       │   ├── firestoreService.ts       # Firestore CRUD operations
│       │   └── streakCalculations.ts     # Time calculations & formatting
│       ├── hooks/
│       │   └── useStreaks.ts             # Main state management hook
│       ├── components/
│       │   ├── StreakTimer.tsx           # Real-time countdown display
│       │   ├── StreakCard.tsx            # Dashboard streak card
│       │   └── QuickActions.tsx          # Check-in/Relapse buttons
│       └── pages/
│           └── KamehamehaPage.tsx        # Main dashboard (update)
└── shared/
    └── components/
        └── StreakBadge.tsx               # Top bar badge
```

---

## 📝 Implementation Steps

### Step 1: TypeScript Types (5 min)

**File:** `src/features/kamehameha/types/kamehameha.types.ts`

```typescript
export interface StreakData {
  startDate: number;              // Unix timestamp
  currentSeconds: number;         // Current streak in seconds
  longestSeconds: number;         // Best streak ever
  lastUpdated: number;            // Last calculation time
}

export interface Streaks {
  main: StreakData;               // PMO streak
  discipline: StreakData;         // Rule violations streak
  lastUpdated: number;
}

export interface StreakDisplay {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  formatted: string;              // "15d 4h 23m 15s"
}
```

**Why:** Type-safe data structures prevent bugs and improve DX.

---

### Step 2: Streak Calculations (15 min)

**File:** `src/features/kamehameha/services/streakCalculations.ts`

**Functions to implement:**
- `calculateStreakFromStart(startDate: number): StreakDisplay`
- `formatStreakTime(seconds: number): string`
- `getTimeSince(startDate: number): number`
- `parseStreakDisplay(seconds: number): StreakDisplay`

**Example:**
```typescript
// Input: startDate = 1697932800000 (15 days ago)
// Output: { days: 15, hours: 4, minutes: 23, seconds: 15, formatted: "15d 4h 23m 15s" }
```

**Why:** Centralized time logic ensures consistency.

---

### Step 3: Firestore Service (20 min)

**File:** `src/features/kamehameha/services/firestoreService.ts`

**Functions to implement:**
- `initializeUserStreaks(userId: string): Promise<void>`
- `getStreaks(userId: string): Promise<Streaks>`
- `updateStreaks(userId: string, streaks: Streaks): Promise<void>`
- `resetMainStreak(userId: string): Promise<void>`
- `resetDisciplineStreak(userId: string): Promise<void>`

**Firestore structure:**
```
users/{userId}/kamehameha/streaks
{
  main: { startDate, currentSeconds, longestSeconds, lastUpdated },
  discipline: { startDate, currentSeconds, longestSeconds, lastUpdated },
  lastUpdated
}
```

**Why:** Separates database logic from UI components.

---

### Step 4: useStreaks Hook (25 min)

**File:** `src/features/kamehameha/hooks/useStreaks.ts`

**State:**
```typescript
const [streaks, setStreaks] = useState<Streaks | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<Error | null>(null);
const [mainDisplay, setMainDisplay] = useState<StreakDisplay | null>(null);
const [disciplineDisplay, setDisciplineDisplay] = useState<StreakDisplay | null>(null);
```

**Functions:**
```typescript
- loadStreaks(): Promise<void>
- resetMain(): Promise<void>
- resetDiscipline(): Promise<void>
```

**Effects:**
```typescript
// 1. Load streaks on mount
// 2. Update display every second
// 3. Save to Firestore periodically (every minute)
```

**Why:** Single source of truth for streak state.

---

### Step 5: StreakTimer Component (15 min)

**File:** `src/features/kamehameha/components/StreakTimer.tsx`

**Props:**
```typescript
interface StreakTimerProps {
  display: StreakDisplay;
  label: string;              // "MAIN STREAK" or "DISCIPLINE STREAK"
  icon: string;               // "🏆" or "⚡"
  variant: 'main' | 'discipline';
}
```

**UI:**
```
┌─────────────────────────┐
│    🏆 MAIN STREAK       │
│   15d 4h 23m 15s       │
└─────────────────────────┘
```

**Why:** Reusable display component for both streaks.

---

### Step 6: StreakCard Component (20 min)

**File:** `src/features/kamehameha/components/StreakCard.tsx`

**Props:**
```typescript
interface StreakCardProps {
  display: StreakDisplay;
  longestSeconds: number;
  label: string;
  icon: string;
  variant: 'main' | 'discipline';
  onReset: () => void;
}
```

**UI:**
```
┌───────────────────────────────────┐
│    🏆 MAIN STREAK                 │
│  15 days 4 hours 23 min 15 sec    │
│     Longest: 45 days              │
│  Next milestone: 30 days (15d)    │
│  ▓▓▓▓▓░░░░░░░░░░░░░░░ 50%        │
│  [ Reset ] (disabled until Phase 3)│
└───────────────────────────────────┘
```

**Why:** Rich dashboard card with progress visualization.

---

### Step 7: QuickActions Component (10 min)

**File:** `src/features/kamehameha/components/QuickActions.tsx`

**UI:**
```
┌─────────────────────────────────┐
│      Quick Actions              │
│  [ 📝 Check In ]  (Phase 3)    │
│  [ ⚠️ Report Relapse ] (Phase 3)│
│  [ 💬 AI Support ] (Phase 4)   │
└─────────────────────────────────┘
```

**Why:** Placeholder for Phase 3 features.

---

### Step 8: Update KamehamehaPage (30 min)

**File:** `src/features/kamehameha/pages/KamehamehaPage.tsx`

**Layout:**
```
┌─────────────────────────────────────────┐
│  [Nav] Kamehameha         [Profile] ▼  │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────┐  ┌─────────────┐     │
│  │ Main Streak │  │ Discipline  │     │
│  │   Card      │  │   Card      │     │
│  └─────────────┘  └─────────────┘     │
│                                         │
│  ┌─────────────────────────────┐      │
│  │   Quick Actions             │      │
│  └─────────────────────────────┘      │
│                                         │
└─────────────────────────────────────────┘
```

**Why:** Beautiful, functional dashboard.

---

### Step 9: StreakBadge Component (15 min)

**File:** `src/shared/components/StreakBadge.tsx`

**Props:**
```typescript
interface StreakBadgeProps {
  display: StreakDisplay | null;
  isVisible: boolean;
}
```

**UI:**
```
Top-right corner of screen:
┌─────────────────────┐
│ 🛡️ 15d 4h 23m 15s  │
└─────────────────────┘
```

**Features:**
- Fixed position (top-right)
- Glass morphism style
- Updates every second
- Only visible when authenticated
- Shows main streak only

**Why:** Constant visual reminder of progress.

---

### Step 10: Add Badge to App (10 min)

**File:** `src/App.tsx`

**Changes:**
```typescript
import { StreakBadge } from './shared/components/StreakBadge';
import { useAuth } from './features/auth/context/AuthContext';
import { useStreaks } from './features/kamehameha/hooks/useStreaks';

// In App component:
const { user } = useAuth();
const { mainDisplay } = useStreaks();

// In JSX (after existing elements):
{user && <StreakBadge display={mainDisplay} isVisible={true} />}
```

**Why:** Badge visible on Timer page too.

---

## 🎨 Design System

### Colors
- **Main Streak:** Purple gradient (`from-purple-500 to-purple-700`)
- **Discipline Streak:** Blue gradient (`from-blue-500 to-blue-700`)
- **Background:** Dark mode (`from-slate-900 via-purple-900 to-slate-900`)
- **Cards:** Glass morphism (`bg-white/10 backdrop-blur-lg`)

### Typography
- **Timer:** `text-4xl md:text-6xl font-bold`
- **Label:** `text-sm md:text-base font-semibold uppercase`
- **Stats:** `text-xs md:text-sm text-white/70`

### Spacing
- **Card padding:** `p-6 md:p-8`
- **Grid gap:** `gap-6 md:gap-8`
- **Responsive:** Mobile-first, then tablet, then desktop

---

## ✅ Acceptance Criteria

### Must Have
- [x] Dual streak timers created
- [x] Real-time updates (every second)
- [x] Firestore persistence
- [x] Top badge shows main streak
- [x] Beautiful glass morphism UI
- [x] Mobile responsive
- [x] Dark mode compatible
- [x] TypeScript strict mode
- [x] Zero linting errors

### Nice to Have (Phase 3)
- [ ] Reset streak functionality
- [ ] Streak history chart
- [ ] Milestone detection
- [ ] Notifications

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Load page - streaks initialize correctly
- [ ] Wait 10 seconds - timer counts up
- [ ] Refresh page - streaks persist
- [ ] Sign out/in - data loads correctly
- [ ] Check both Timer and Kamehameha pages - badge visible
- [ ] Mobile view - responsive layout
- [ ] Browser console - no errors

### Edge Cases
- [ ] First-time user (no existing data)
- [ ] User with existing streaks
- [ ] Network offline (cached data)
- [ ] Very long streaks (100+ days)

---

## 📊 Success Metrics

**Code Quality:**
- TypeScript compilation: ✅ Zero errors
- Linting: ✅ Zero errors
- Test coverage: N/A (manual testing for Phase 2)

**Performance:**
- Page load: < 1 second
- Timer updates: Smooth, no flicker
- Firestore reads: Minimal (cache first)

**UX:**
- Beautiful, motivating UI
- Clear, readable timers
- Responsive on all devices

---

## 🚀 Let's Build!

**Estimated time:** 2-3 hours of focused work

**Order of implementation:**
1. Types (5 min)
2. Calculations (15 min)
3. Firestore service (20 min)
4. useStreaks hook (25 min)
5. StreakTimer component (15 min)
6. StreakCard component (20 min)
7. QuickActions component (10 min)
8. Update KamehamehaPage (30 min)
9. StreakBadge component (15 min)
10. Add badge to App (10 min)

**Total:** ~2.5 hours

**Ready? Let's start with Step 1: TypeScript Types!** 🎯

