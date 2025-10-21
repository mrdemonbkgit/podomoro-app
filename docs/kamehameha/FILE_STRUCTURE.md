# Kamehameha - File Structure Reference

**Last Updated:** October 21, 2025

This document provides a complete reference for where files go in the Kamehameha feature.

---

## 📁 Complete Directory Tree

```
src/
├── features/
│   ├── auth/                          ← Phase 1: Authentication
│   │   ├── LoginPage.tsx              User-facing login UI
│   │   ├── AuthProvider.tsx           Context provider for auth state
│   │   ├── ProtectedRoute.tsx         Route guard component
│   │   └── UserProfile.tsx            Display user info
│   │
│   ├── timer/                         ← Existing: Pomodoro timer
│   │   └── (existing components)
│   │
│   └── kamehameha/                    ← NEW: PMO recovery tool
│       │
│       ├── pages/                     Main application pages
│       │   ├── KamehamehaPage.tsx     Dashboard/home page
│       │   └── ChatPage.tsx           AI therapist chat interface
│       │
│       ├── components/                UI components
│       │   ├── StreakTimer.tsx        Live countdown timer (updates every second)
│       │   ├── StreakCard.tsx         Display card for main/discipline streak
│       │   ├── QuickActions.tsx       Action buttons (Check In, Chat, etc.)
│       │   ├── ActivityFeed.tsx       Recent activity display
│       │   ├── CheckInModal.tsx       Check-in form modal
│       │   ├── RelapseFlow.tsx        Multi-step relapse tracking
│       │   ├── RelapseTypeSelect.tsx  Step 1: Choose type
│       │   ├── RelapseReasons.tsx     Step 2: Select reasons
│       │   ├── RelapseReflection.tsx  Step 3: Reflection prompts
│       │   ├── RelapseConfirmation.tsx Step 4: Confirm and submit
│       │   ├── ChatMessages.tsx       Message list container
│       │   ├── ChatMessage.tsx        Single message bubble
│       │   ├── ChatInput.tsx          Input box + send button
│       │   ├── EmergencyButton.tsx    🚨 Panic/emergency button
│       │   ├── JournalList.tsx        List of journal entries
│       │   ├── JournalEntry.tsx       Single journal entry display
│       │   ├── JournalViewer.tsx      Modal to view full entry
│       │   ├── MilestoneCard.tsx      Milestone display
│       │   ├── BadgeDisplay.tsx       Single badge component
│       │   ├── CelebrationModal.tsx   Celebration animation + message
│       │   ├── ProgressBar.tsx        Progress to next milestone
│       │   ├── BadgeGallery.tsx       All earned badges display
│       │   ├── StreakChart.tsx        Visual streak history
│       │   ├── KamehamehaSettings.tsx Settings panel
│       │   ├── AIConfig.tsx           System prompt editor
│       │   ├── RulesConfig.tsx        Customizable rules list
│       │   └── DataManagement.tsx     Export/import/delete data
│       │
│       ├── hooks/                     Custom React hooks
│       │   ├── useKamehameha.ts       Main data hook (combines all data)
│       │   ├── useStreaks.ts          Streak calculations and updates
│       │   ├── useCheckIns.ts         Check-in CRUD operations
│       │   ├── useRelapses.ts         Relapse CRUD operations
│       │   ├── useChat.ts             Chat message management
│       │   ├── useBadges.ts           Badge and milestone logic
│       │   └── useFirestore.ts        Generic Firestore operations
│       │
│       ├── services/                  Business logic and external APIs
│       │   ├── firestoreService.ts    Firestore database operations
│       │   ├── streakCalculations.ts  Timer and calculation logic
│       │   ├── realtimeSync.ts        Real-time listeners
│       │   ├── aiChatService.ts       OpenAI Cloud Function calls
│       │   └── dataExport.ts          Export/import functionality
│       │
│       └── types/                     TypeScript interfaces
│           ├── kamehameha.types.ts    All main interfaces
│           └── firestore.types.ts     Firestore-specific types
│
├── shared/                            Components used by both features
│   ├── components/
│   │   ├── FloatingNav.tsx            Bottom navigation (updated for routing)
│   │   └── StreakBadge.tsx            Always-visible streak timer badge
│   └── hooks/
│       └── useTheme.ts                Dark/light mode (existing)
│
├── services/
│   └── firebase/                      Firebase configuration
│       ├── config.ts                  Firebase initialization
│       ├── auth.ts                    Auth helper methods
│       └── firestore.ts               Firestore utilities
│
└── routes/
    └── AppRouter.tsx                  React Router configuration

functions/                             Firebase Cloud Functions (serverless)
├── src/
│   ├── index.ts                       Main chat function export
│   ├── chatWithTherapist.ts           OpenAI chat implementation
│   ├── contextBuilder.ts              Build AI context from user data
│   └── rateLimit.ts                   Rate limiting logic
├── package.json                       Function dependencies
└── tsconfig.json                      TypeScript config for functions

docs/                                  All documentation
├── INDEX.md                           Main navigation hub
├── core/
│   └── ARCHITECTURE.md                Overall app architecture
└── kamehameha/
    ├── OVERVIEW.md                    Feature introduction
    ├── SPEC.md                        Complete requirements
    ├── DATA_SCHEMA.md                 Database structure
    ├── AI_INTEGRATION.md              OpenAI setup guide
    ├── SECURITY.md                    Security and privacy
    ├── IMPLEMENTATION_GUIDE.md        High-level roadmap
    ├── QUICKSTART.md                  Get started fast
    ├── PROGRESS.md                    Track progress
    ├── FILE_STRUCTURE.md              This file
    ├── DEVELOPER_NOTES.md             Project-specific tips
    └── phases/
        ├── PHASE_1_FIREBASE_SETUP.md
        ├── PHASE_2_FOUNDATION.md
        ├── PHASE_3_CORE_FEATURES.md
        ├── PHASE_4_AI_CHAT.md
        ├── PHASE_5_GAMIFICATION.md
        └── PHASE_6_POLISH.md
```

---

## 🎯 Where Does This File Go?

### Creating a New Component?

**UI Component:**
- **Path:** `src/features/kamehameha/components/`
- **Naming:** `PascalCase.tsx` (e.g., `CheckInModal.tsx`)
- **Pattern:** Functional component with TypeScript props

**Shared Component:**
- **Path:** `src/shared/components/`
- **When:** Used by both Timer and Kamehameha features

### Creating a New Hook?

**Kamehameha Hook:**
- **Path:** `src/features/kamehameha/hooks/`
- **Naming:** `useCamelCase.ts` (e.g., `useStreaks.ts`)
- **Pattern:** Returns object with data and methods

**Shared Hook:**
- **Path:** `src/shared/hooks/`
- **When:** Generic functionality used across features

### Creating a New Service?

**Business Logic:**
- **Path:** `src/features/kamehameha/services/`
- **Naming:** `camelCase.ts` (e.g., `streakCalculations.ts`)
- **Pattern:** Exported functions, no default export

**Firebase Service:**
- **Path:** `src/services/firebase/`
- **When:** Core Firebase configuration or utilities

### Creating a New Type/Interface?

**Kamehameha Types:**
- **Path:** `src/features/kamehameha/types/kamehameha.types.ts`
- **Pattern:** Export all interfaces, group related types

**Example:**
```typescript
// src/features/kamehameha/types/kamehameha.types.ts
export interface Streak {
  // ...
}

export interface CheckIn {
  // ...
}
```

### Creating a Cloud Function?

**Function Implementation:**
- **Path:** `functions/src/`
- **Naming:** `camelCase.ts`
- **Export:** From `functions/src/index.ts`

**Example:**
```typescript
// functions/src/index.ts
export { chatWithTherapist } from './chatWithTherapist';
```

### Creating a Page?

**New Route:**
- **Path:** `src/features/kamehameha/pages/`
- **Naming:** `PascalCasePage.tsx` (e.g., `ChatPage.tsx`)
- **Register:** In `src/routes/AppRouter.tsx`

---

## 📦 Import Patterns

### Within Kamehameha Feature

```typescript
// Import from hooks
import { useStreaks } from '../hooks/useStreaks';

// Import from services
import { calculateStreak } from '../services/streakCalculations';

// Import from types
import { Streak, CheckIn } from '../types/kamehameha.types';

// Import from components
import { StreakTimer } from '../components/StreakTimer';
```

### From Shared Resources

```typescript
// Import shared components
import { FloatingNav } from '../../../shared/components/FloatingNav';

// Import shared hooks
import { useTheme } from '../../../shared/hooks/useTheme';
```

### From Services

```typescript
// Import Firebase
import { db, auth } from '../../../services/firebase/config';
import { signInWithGoogle } from '../../../services/firebase/auth';
```

### From External Libraries

```typescript
// React
import { useState, useEffect, FC } from 'react';

// Firebase
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Framer Motion
import { motion, AnimatePresence } from 'framer-motion';

// React Router
import { useNavigate, Link } from 'react-router-dom';
```

---

## 🔧 Component Creation Templates

### Basic Component

```typescript
// src/features/kamehameha/components/MyComponent.tsx
import { FC } from 'react';

interface MyComponentProps {
  isDark: boolean;
  onAction: () => void;
}

export const MyComponent: FC<MyComponentProps> = ({ isDark, onAction }) => {
  return (
    <div className={`component ${isDark ? 'dark' : 'light'}`}>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

### Custom Hook

```typescript
// src/features/kamehameha/hooks/useMyHook.ts
import { useState, useEffect } from 'react';
import { MyData } from '../types/kamehameha.types';

export const useMyHook = (userId: string) => {
  const [data, setData] = useState<MyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch or subscribe to data
  }, [userId]);

  const updateData = async (newData: Partial<MyData>) => {
    // Update logic
  };

  return { data, loading, error, updateData };
};
```

### Service Function

```typescript
// src/features/kamehameha/services/myService.ts
import { db } from '../../../services/firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { MyData } from '../types/kamehameha.types';

export async function saveMyData(
  userId: string,
  data: MyData
): Promise<string> {
  const docRef = await addDoc(
    collection(db, `users/${userId}/kamehameha/myCollection`),
    data
  );
  return docRef.id;
}
```

### Cloud Function

```typescript
// functions/src/myFunction.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const myFunction = functions.https.onCall(async (data, context) => {
  // Verify auth
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
  }

  // Function logic
  return { result: 'success' };
});
```

---

## 🎨 Naming Conventions

### Files
- **Components:** `PascalCase.tsx`
- **Hooks:** `useCamelCase.ts`
- **Services:** `camelCase.ts`
- **Types:** `camelCase.types.ts`
- **Pages:** `PascalCasePage.tsx`

### Variables
- **Components:** `PascalCase`
- **Functions:** `camelCase`
- **Constants:** `UPPER_SNAKE_CASE`
- **Types:** `PascalCase`

### Firestore Collections
- **Pattern:** `users/{userId}/kamehameha/{collection}`
- **Examples:**
  - `users/abc123/kamehameha/checkIns`
  - `users/abc123/kamehameha/relapses`
  - `users/abc123/kamehameha/chatHistory`

---

## 📊 Component Hierarchy

### Kamehameha Page

```
KamehamehaPage
├── StreakCard (Main)
│   └── StreakTimer
├── StreakCard (Discipline)
│   └── StreakTimer
├── QuickActions
│   ├── Button (Check In)
│   ├── Button (Mark Relapse)
│   └── Button (AI Therapist)
└── ActivityFeed
    ├── CheckInEntry
    ├── RelapseEntry
    └── MilestoneEntry
```

### Chat Page

```
ChatPage
├── Header
│   └── EmergencyButton
├── ChatMessages
│   ├── ChatMessage (user)
│   ├── ChatMessage (AI)
│   └── ChatMessage (user)
└── ChatInput
    ├── TextArea
    └── SendButton
```

---

## 🔍 Finding Existing Code

### Looking for a Pattern?

**Check Timer feature:**
- `src/features/timer/` - Existing components
- `src/components/` - Shared timer components
- `src/hooks/` - Existing hooks like `useTimer`, `useSettings`

**Example patterns to follow:**
- Modal components: `SettingsPanel.tsx`, `SoundsPanel.tsx`
- Custom hooks: `useTimer.ts`, `useSettings.ts`
- Data persistence: See how `useSettings` uses localStorage

### Need Firebase Examples?

**Once Phase 1 is complete:**
- Auth: `src/services/firebase/auth.ts`
- Firestore: `src/features/kamehameha/services/firestoreService.ts`

---

## 📝 Adding New Features

### To Kamehameha:

1. **Component:** `src/features/kamehameha/components/MyFeature.tsx`
2. **Hook (if needed):** `src/features/kamehameha/hooks/useMyFeature.ts`
3. **Service (if needed):** `src/features/kamehameha/services/myFeatureService.ts`
4. **Types:** Add to `src/features/kamehameha/types/kamehameha.types.ts`
5. **Test:** Follow existing test patterns

### To Timer:

1. **Component:** `src/features/timer/components/` or `src/components/`
2. Follow existing timer patterns

### Shared Across Both:

1. **Component:** `src/shared/components/`
2. **Hook:** `src/shared/hooks/`
3. **Ensure no feature-specific logic**

---

## ✅ Checklist Before Creating Files

- [ ] Checked if similar component exists
- [ ] Verified correct directory
- [ ] Using correct naming convention
- [ ] TypeScript interfaces defined
- [ ] Import paths planned
- [ ] Component will be properly exported

---

**Quick Reference:**  
New component? → `src/features/kamehameha/components/`  
New hook? → `src/features/kamehameha/hooks/`  
New service? → `src/features/kamehameha/services/`  
New type? → `src/features/kamehameha/types/kamehameha.types.ts`  
Cloud function? → `functions/src/`

**When in doubt, follow existing patterns from the Timer feature!**

