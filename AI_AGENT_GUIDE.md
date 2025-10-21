# AI Agent Guide - ZenFocus Development

**Last Updated:** October 21, 2025  
**For:** AI assistants, coding agents, and automated development tools

---

## Quick Start

You're working on **ZenFocus**, a dual-purpose productivity app:
1. **Timer** - Pomodoro timer with ambient sounds (existing)
2. **Kamehameha** - PMO recovery tool with AI therapist (in development)

**First Steps:**
1. Read this guide completely
2. Review [`docs/INDEX.md`](docs/INDEX.md)
3. Read [`docs/core/ARCHITECTURE.md`](docs/core/ARCHITECTURE.md)
4. Read feature-specific docs based on your task

---

## Documentation Structure

### Entry Points

```
AI_AGENT_GUIDE.md       ← You are here
docs/INDEX.md           ← Navigation hub
docs/core/ARCHITECTURE.md ← System overview
```

### Feature Documentation

**Kamehameha (Primary Focus):**
- [`docs/kamehameha/OVERVIEW.md`](docs/kamehameha/OVERVIEW.md) - Feature introduction
- [`docs/kamehameha/SPEC.md`](docs/kamehameha/SPEC.md) - Complete requirements (MUST READ before implementing)
- [`docs/kamehameha/DATA_SCHEMA.md`](docs/kamehameha/DATA_SCHEMA.md) - Firestore structure, TypeScript types
- [`docs/kamehameha/AI_INTEGRATION.md`](docs/kamehameha/AI_INTEGRATION.md) - OpenAI setup, Cloud Functions
- [`docs/kamehameha/SECURITY.md`](docs/kamehameha/SECURITY.md) - Security rules, privacy, data protection

**Timer (Existing):**
- Root directory docs: `README.md`, `CHANGELOG.md`, `FEATURE_*.md`

### Implementation Resources

- [`docs/kamehameha/IMPLEMENTATION_GUIDE.md`](docs/kamehameha/IMPLEMENTATION_GUIDE.md) - High-level roadmap and phases
- [`docs/kamehameha/QUICKSTART.md`](docs/kamehameha/QUICKSTART.md) - Fast-track guide for each phase
- [`docs/kamehameha/PROGRESS.md`](docs/kamehameha/PROGRESS.md) - Task tracker (update as you work)
- [`docs/kamehameha/FILE_STRUCTURE.md`](docs/kamehameha/FILE_STRUCTURE.md) - Complete file organization reference
- [`docs/kamehameha/DEVELOPER_NOTES.md`](docs/kamehameha/DEVELOPER_NOTES.md) - Project-specific tips and context
- [`docs/kamehameha/DOCUMENTATION_MAINTENANCE.md`](docs/kamehameha/DOCUMENTATION_MAINTENANCE.md) - How to keep docs updated
- [`docs/kamehameha/phases/`](docs/kamehameha/phases/) - Detailed phase-by-phase guides (optional)

---

## Reading Order for Tasks

### Task: Implement New Kamehameha Feature

**Order:**
1. `docs/kamehameha/QUICKSTART.md` - Find your current phase
2. `docs/kamehameha/SPEC.md` - Find your feature's requirements
3. `docs/kamehameha/DATA_SCHEMA.md` - Understand data structures
4. `docs/kamehameha/FILE_STRUCTURE.md` - Know where files go
5. `docs/kamehameha/DEVELOPER_NOTES.md` - Check for relevant tips
6. `docs/core/ARCHITECTURE.md` - See how it fits in the app
7. Existing code examples in `src/features/timer/`

### Task: Modify Existing Timer Feature

**Order:**
1. `README.md` - Project overview
2. Relevant `FEATURE_*.md` doc in root
3. `docs/core/ARCHITECTURE.md` - Shared components
4. Existing code in `src/components/` or `src/features/timer/`

### Task: Work on Firebase/Authentication

**Order:**
1. `docs/kamehameha/QUICKSTART.md` - Phase 1 quick steps
2. `docs/kamehameha/SECURITY.md` - Auth flow, security rules
3. `docs/kamehameha/DATA_SCHEMA.md` - Firestore structure
4. `docs/kamehameha/DEVELOPER_NOTES.md` - Firebase beginner tips
5. `docs/core/ARCHITECTURE.md` - How auth integrates
6. `docs/kamehameha/IMPLEMENTATION_GUIDE.md` - Phase 1 overview

### Task: Integrate OpenAI/AI Chat

**Order:**
1. `docs/kamehameha/QUICKSTART.md` - Phase 4 quick steps
2. `docs/kamehameha/AI_INTEGRATION.md` - Complete setup guide
3. `docs/kamehameha/SPEC.md` - Feature 4: AI Therapist Chat
4. `docs/kamehameha/DATA_SCHEMA.md` - Chat message schema
5. `docs/kamehameha/SECURITY.md` - API key security
6. `docs/kamehameha/DEVELOPER_NOTES.md` - Cost management tips

---

## Key Principles

### 1. Read Before You Code

**Always** read the relevant specification documents before implementing:
- Prevents misunderstandings
- Ensures consistency
- Reduces refactoring

**Example:**
```
❌ BAD: "Let me implement check-ins" → starts coding immediately
✅ GOOD: Read SPEC.md → Find Feature 2: Check-In System → Read requirements → Implement
```

### 2. Follow Existing Patterns

This codebase has established patterns:
- Custom hooks (e.g., `useTimer`, `useSettings`)
- Component structure (functional components with TypeScript)
- State management (React hooks + localStorage/Firestore)
- Styling (Tailwind CSS + custom classes)

**Example:**
```typescript
// Existing pattern: custom hooks
export const useStreaks = () => {
  const [streaks, setStreaks] = useState<Streaks>(/* ... */);
  // ... logic
  return { streaks, /* ... */ };
};

// Follow this pattern for new hooks
export const useCheckIns = () => {
  const [checkIns, setCheckIns] = useState<CheckIn[]>(/* ... */);
  // ... logic
  return { checkIns, /* ... */ };
};
```

### 3. TypeScript First

- All new code must be TypeScript
- Define interfaces in `types/` folders
- Export shared types
- Use strict type checking

### 4. Test Security Rules

When working with Firestore:
- Test security rules after any change
- Use Firebase emulator
- Verify user isolation
- Check for unauthorized access

### 5. Update Documentation

After implementing features:
- Update `CHANGELOG.md`
- Update relevant `FEATURE_*.md` docs
- Add JSDoc comments to public APIs
- Update specs if behavior changed

---

## Project Structure

### Directory Layout

```
src/
├── features/
│   ├── auth/             - Google authentication (Phase 1)
│   │   ├── LoginPage.tsx
│   │   ├── AuthProvider.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── timer/            - Existing Pomodoro timer
│   │   └── (existing components)
│   │
│   └── kamehameha/       - NEW: PMO recovery tool
│       ├── pages/
│       │   ├── KamehamehaPage.tsx    - Main dashboard
│       │   └── ChatPage.tsx          - AI chat interface
│       ├── components/
│       │   ├── StreakTimer.tsx       - Live countdown
│       │   ├── CheckInModal.tsx      - Check-in form
│       │   ├── RelapseFlow.tsx       - Multi-step relapse tracking
│       │   ├── ChatMessages.tsx      - Chat UI
│       │   └── [20+ more components]
│       ├── hooks/
│       │   ├── useKamehameha.ts      - Main data hook
│       │   ├── useStreaks.ts         - Streak calculations
│       │   ├── useCheckIns.ts        - Check-in CRUD
│       │   └── useFirestore.ts       - Firestore operations
│       ├── services/
│       │   ├── firestoreService.ts   - Database operations
│       │   ├── streakCalculations.ts - Timer logic
│       │   └── aiChatService.ts      - OpenAI Cloud Function calls
│       └── types/
│           └── kamehameha.types.ts   - All TypeScript interfaces
│
├── shared/               - Components used by both features
│   ├── FloatingNav.tsx   - Bottom navigation
│   ├── StreakBadge.tsx   - Always-visible streak timer
│   └── hooks/
│       └── useTheme.ts   - Dark/light mode
│
├── services/
│   └── firebase/
│       ├── config.ts     - Firebase initialization
│       ├── auth.ts       - Auth helper methods
│       └── firestore.ts  - Firestore utilities
│
└── routes/
    └── AppRouter.tsx     - React Router configuration

functions/                - Firebase Cloud Functions
├── src/
│   ├── index.ts          - Main chat function
│   ├── contextBuilder.ts - Build AI context from user data
│   └── rateLimit.ts      - Rate limiting logic
└── package.json

docs/                     - All documentation
├── INDEX.md              - Navigation hub
├── core/                 - Shared architecture
│   └── ARCHITECTURE.md
└── kamehameha/           - Feature-specific docs
    ├── OVERVIEW.md
    ├── SPEC.md
    ├── DATA_SCHEMA.md
    ├── AI_INTEGRATION.md
    └── SECURITY.md
```

### File Naming Conventions

- **Components:** `PascalCase.tsx` (e.g., `CheckInModal.tsx`)
- **Hooks:** `useCamelCase.ts` (e.g., `useStreaks.ts`)
- **Services:** `camelCase.ts` (e.g., `firestoreService.ts`)
- **Types:** `camelCase.types.ts` (e.g., `kamehameha.types.ts`)
- **Pages:** `PascalCasePage.tsx` (e.g., `KamehamehaPage.tsx`)

---

## Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Navigation (`/timer`, `/kamehameha`)
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

### Backend
- **Firebase Authentication** - Google OAuth 2.0
- **Firestore** - Real-time database
- **Firebase Cloud Functions** - Serverless backend (AI chat)
- **OpenAI GPT-5** - AI therapist

### Development
- **Vitest** - Unit testing
- **Firebase Emulator** - Local testing
- **ESLint** - Code quality
- **Git** - Version control

---

## Common Tasks

### 1. Create a New Component

**Template:**
```typescript
// src/features/kamehameha/components/MyComponent.tsx
import { FC } from 'react';

interface MyComponentProps {
  isDark: boolean;
  onAction: () => void;
}

export const MyComponent: FC<MyComponentProps> = ({ isDark, onAction }) => {
  return (
    <div className={`component ${isDark ? 'dark-mode' : ''}`}>
      {/* Component content */}
    </div>
  );
};
```

### 2. Create a Custom Hook

**Template:**
```typescript
// src/features/kamehameha/hooks/useMyHook.ts
import { useState, useEffect } from 'react';
import { MyData } from '../types/kamehameha.types';

export const useMyHook = (userId: string) => {
  const [data, setData] = useState<MyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch data logic
  }, [userId]);

  const updateData = async (newData: Partial<MyData>) => {
    // Update logic
  };

  return { data, loading, error, updateData };
};
```

### 3. Add Firestore Collection

**Steps:**
1. Define TypeScript interface in `DATA_SCHEMA.md`
2. Add to `src/features/kamehameha/types/kamehameha.types.ts`
3. Create security rules in `firestore.rules`
4. Create service methods in `firestoreService.ts`
5. Create custom hook for CRUD operations
6. Test with Firebase emulator

### 4. Add Route

**Steps:**
1. Create page component in `src/features/kamehameha/pages/`
2. Update `src/routes/AppRouter.tsx`:
   ```typescript
   <Route path="/new-route" element={<ProtectedRoute><NewPage /></ProtectedRoute>} />
   ```
3. Update `FloatingNav.tsx` if needed
4. Test navigation

### 5. Call Cloud Function from Frontend

**Template:**
```typescript
// src/features/kamehameha/services/myService.ts
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const myFunction = httpsCallable(functions, 'myFunctionName');

export async function callMyFunction(data: any): Promise<any> {
  try {
    const result = await myFunction(data);
    return result.data;
  } catch (error: any) {
    console.error('Error calling function:', error);
    throw new Error(error.message);
  }
}
```

---

## Implementation Phases

### Current Status: Documentation Complete ✅

**For detailed task tracking, see:** [`docs/kamehameha/PROGRESS.md`](docs/kamehameha/PROGRESS.md)

**For phase overview, see:** [`docs/kamehameha/IMPLEMENTATION_GUIDE.md`](docs/kamehameha/IMPLEMENTATION_GUIDE.md)

### Phase 1: Firebase Setup (Next)
- [ ] Create Firebase project
- [ ] Enable Google Authentication
- [ ] Set up Firestore database
- [ ] Configure security rules
- [ ] Add Firebase SDK to project
- [ ] Implement Google sign-in
- [ ] Set up React Router

**Estimated:** 2-3 days

**Read:** 
- `docs/kamehameha/QUICKSTART.md` → Phase 1
- `docs/kamehameha/IMPLEMENTATION_GUIDE.md` → Phase 1
- `docs/kamehameha/phases/PHASE_1_FIREBASE_SETUP.md` (if created)

### Phase 2: Kamehameha Foundation
- [ ] Create data layer (hooks, services)
- [ ] Build Kamehameha page layout
- [ ] Implement streak timers
- [ ] Create top streak badge

**Estimated:** 3-4 days

**Read:** `docs/kamehameha/QUICKSTART.md` → Phase 2

### Phase 3: Core Features
- [ ] Check-in system
- [ ] Relapse tracking
- [ ] Journal system

**Estimated:** 4-5 days

**Read:** `docs/kamehameha/QUICKSTART.md` → Phase 3

### Phase 4: AI Chat
- [ ] Set up Cloud Functions
- [ ] Implement context builder
- [ ] Build chat interface
- [ ] Integrate OpenAI API

**Estimated:** 4-5 days

**Read:** `docs/kamehameha/QUICKSTART.md` → Phase 4

### Phase 5: Milestones & Gamification
- [ ] Milestone detection
- [ ] Celebration animations
- [ ] Badge gallery

**Estimated:** 2-3 days

**Read:** `docs/kamehameha/QUICKSTART.md` → Phase 5

### Phase 6: Polish & Testing
- [ ] Settings panel
- [ ] Data export/import
- [ ] Security audit
- [ ] Testing

**Estimated:** 3-4 days

**Read:** `docs/kamehameha/QUICKSTART.md` → Phase 6

---

## Critical Guidelines

### Security

1. **API Keys:**
   - NEVER expose OpenAI API key in frontend
   - Store in Cloud Functions config only
   - Use environment variables for local dev

2. **Firestore Rules:**
   - Test every rule change
   - Ensure user isolation
   - Validate data types
   - See `docs/kamehameha/SECURITY.md`

3. **Authentication:**
   - Always check `isAuthenticated()` in rules
   - Protect all Kamehameha routes
   - Verify user ownership

### Data Privacy

1. **Sensitive Data:**
   - Journal entries are highly sensitive
   - Chat messages contain personal information
   - Never log sensitive data
   - See `docs/kamehameha/SECURITY.md` → Privacy Compliance

2. **User Data Rights:**
   - Implement data export
   - Implement account deletion
   - Store only necessary data
   - See `docs/kamehameha/SECURITY.md` → User Data Rights

### Performance

1. **Firestore:**
   - Use pagination (`.limit()`)
   - Create necessary indexes
   - Cache frequently accessed data
   - See `docs/kamehameha/DATA_SCHEMA.md` → Performance

2. **Real-time Updates:**
   - Use Firestore listeners sparingly
   - Unsubscribe on component unmount
   - Throttle expensive calculations

---

## Testing Strategy

### Unit Tests
- All custom hooks
- All utility functions
- Calculation logic (streak timers)

### Integration Tests
- Data flow (UI → service → Firestore)
- Authentication flow
- Cloud Functions

### Manual Testing
- User flows (check-ins, relapses, chat)
- Mobile responsiveness
- Dark mode
- Error states

### Security Testing
- Firestore rules
- Unauthorized access attempts
- Rate limiting
- API key security

---

## Error Handling

### Pattern

```typescript
try {
  // Operation
  await firestoreService.saveCheckIn(data);
} catch (error: any) {
  console.error('Error saving check-in:', error);
  
  // User-friendly message
  if (error.code === 'permission-denied') {
    throw new Error('You do not have permission to perform this action');
  }
  
  if (error.code === 'unauthenticated') {
    throw new Error('Please sign in to continue');
  }
  
  // Generic fallback
  throw new Error('Failed to save check-in. Please try again.');
}
```

### Logging

- **Development:** `console.log()` is fine
- **Production:** Use Firebase Analytics or logging service
- **Never log:** Sensitive user data, API keys, passwords

---

## Git Workflow

### Commit Messages

Format: `<type>: <description>`

Types:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Add/update tests
- `chore:` Maintenance tasks

**Examples:**
```
feat: implement check-in modal with mood and urge tracking
fix: streak timer not updating every second
docs: update SPEC.md with relapse flow details
refactor: extract streak calculations to separate service
```

### Branches

- `main` - Production code
- `develop` - Integration branch
- `feature/kamehameha-setup` - Feature branches
- `fix/streak-timer-bug` - Bug fix branches

---

## Troubleshooting

### Firebase Emulator Not Starting

```bash
# Clear cache
firebase emulators:clear

# Restart with fresh data
firebase emulators:start --import=./emulator-data --export-on-exit
```

### Firestore Permission Denied

1. Check security rules in `firestore.rules`
2. Verify user is authenticated
3. Check user ID matches document owner
4. Test with Firebase emulator

### Cloud Function Not Deploying

```bash
# Check function logs
firebase functions:log

# Deploy with verbose logging
firebase deploy --only functions --debug
```

### TypeScript Errors

```bash
# Rebuild TypeScript
npm run build

# Check for type errors
npx tsc --noEmit
```

---

## Resources

### Firebase
- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Cloud Functions Guide](https://firebase.google.com/docs/functions)

### OpenAI
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [GPT-4 Guide](https://platform.openai.com/docs/guides/gpt)

### React
- [React 19 Documentation](https://react.dev/)
- [React Router Documentation](https://reactrouter.com/)

### Internal Docs
- [docs/INDEX.md](docs/INDEX.md) - Documentation hub
- [docs/core/ARCHITECTURE.md](docs/core/ARCHITECTURE.md) - System architecture
- [docs/kamehameha/IMPLEMENTATION_GUIDE.md](docs/kamehameha/IMPLEMENTATION_GUIDE.md) - Phases roadmap
- [docs/kamehameha/QUICKSTART.md](docs/kamehameha/QUICKSTART.md) - Fast-track guide
- [docs/kamehameha/PROGRESS.md](docs/kamehameha/PROGRESS.md) - Task tracker
- [docs/kamehameha/FILE_STRUCTURE.md](docs/kamehameha/FILE_STRUCTURE.md) - File organization
- [docs/kamehameha/DEVELOPER_NOTES.md](docs/kamehameha/DEVELOPER_NOTES.md) - Project tips
- [docs/kamehameha/](docs/kamehameha/) - All Kamehameha feature docs

---

## Developer Notes

**From User (Tony):**
- New to Firebase - provide clear explanations
- Using Google login for authentication
- OpenAI API key ready
- Budget-conscious - optimize costs
- Privacy is important - user data rights and controls

**Technical Preferences:**
- TypeScript strict mode
- Functional components with hooks
- Tailwind CSS for styling
- Framer Motion for animations
- Clean, documented code

---

## Quick Reference Card

### Essential Files
- `docs/kamehameha/SPEC.md` - Feature requirements
- `docs/kamehameha/DATA_SCHEMA.md` - Database structure
- `docs/kamehameha/IMPLEMENTATION_GUIDE.md` - Phases overview
- `docs/kamehameha/QUICKSTART.md` - Fast-track guide
- `docs/kamehameha/PROGRESS.md` - Task tracker

### Key Commands
```bash
npm run dev                    # Start dev server
firebase emulators:start       # Start Firebase emulator
firebase deploy --only functions # Deploy Cloud Functions
npm run build                  # Build for production
npm test                       # Run tests
```

### File Locations
- Components: `src/features/kamehameha/components/`
- Hooks: `src/features/kamehameha/hooks/`
- Services: `src/features/kamehameha/services/`
- Types: `src/features/kamehameha/types/`
- Cloud Functions: `functions/src/`

### Documentation Flow
```
START: AI_AGENT_GUIDE.md (this file)
  ↓
docs/INDEX.md (navigation hub)
  ↓
docs/core/ARCHITECTURE.md (system overview)
  ↓
docs/kamehameha/QUICKSTART.md (find your phase)
  ↓
docs/kamehameha/OVERVIEW.md (feature intro)
  ↓
docs/kamehameha/SPEC.md (detailed requirements)
  ↓
docs/kamehameha/DATA_SCHEMA.md (database structure)
  ↓
docs/kamehameha/FILE_STRUCTURE.md (where files go)
  ↓
docs/kamehameha/DEVELOPER_NOTES.md (project tips)
  ↓
[Other specialized docs as needed: AI_INTEGRATION.md, SECURITY.md]
  ↓
docs/kamehameha/PROGRESS.md (track your work)
```

---

## Final Checklist Before Starting

- [ ] Read this guide completely
- [ ] Read `docs/INDEX.md`
- [ ] Read `docs/core/ARCHITECTURE.md`
- [ ] Read relevant `docs/kamehameha/*.md` for your task
- [ ] Review `docs/kamehameha/IMPLEMENTATION_GUIDE.md`
- [ ] Check `docs/kamehameha/PROGRESS.md` for current status
- [ ] Consult `docs/kamehameha/QUICKSTART.md` for your phase
- [ ] Understand the current phase
- [ ] Know which files to create/modify (see FILE_STRUCTURE.md)
- [ ] Have Firebase credentials ready (if Phase 1)
- [ ] Have OpenAI API key ready (if Phase 4)

---

**You're ready to start building! 🚀**

When in doubt:
1. Read the documentation
2. Follow existing patterns
3. Test thoroughly
4. Ask clarifying questions

Good luck!

