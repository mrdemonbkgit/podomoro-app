# ZenFocus - Application Architecture

**Last Updated:** October 21, 2025

## Overview

ZenFocus is a dual-purpose productivity application containing two major features:

1. **Timer Feature** - Pomodoro timer with task management, ambient sounds, and settings
2. **Kamehameha Feature** - PMO recovery companion with AI therapist, streak tracking, and check-ins

## Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript 5.6** - Type safety
- **Vite 6** - Build tool and dev server
- **React Router** - Page routing (/timer, /kamehameha)
- **Tailwind CSS 3.4** - Styling
- **Framer Motion 12** - Animations

### Backend & Services
- **Firebase Authentication** - Google login
- **Firestore** - Real-time NoSQL database
- **Firebase Cloud Functions** - Serverless backend for AI
- **OpenAI API** - GPT-5 for AI therapist

### State Management
- **React Hooks** - useState, useEffect, useContext
- **Custom Hooks** - Feature-specific data management
- **LocalStorage** - Timer feature persistence
- **Firestore** - Kamehameha feature persistence with real-time sync

### Testing
- **Vitest** - Unit and integration tests
- **React Testing Library** - Component tests
- **Firebase Emulator** - Local testing (future)

---

## Application Structure

### High-Level Architecture

```
┌─────────────────────────────────────────┐
│          ZenFocus App                   │
│  (React 19 + TypeScript + Vite)         │
└─────────────────────────────────────────┘
           │
           ├─── React Router
           │
    ┌──────┴──────┐
    │             │
┌───▼───┐    ┌───▼──────┐
│ Timer │    │Kamehameha│
│ Page  │    │   Page   │
│  /    │    │/kamehameha│
└───┬───┘    └───┬──────┘
    │             │
    │        ┌────▼──────────┐
    │        │   Firebase    │
    │        │  - Auth       │
    │        │  - Firestore  │
    │        │  - Functions  │
    │        └────┬──────────┘
    │             │
    │        ┌────▼──────┐
    │        │  OpenAI   │
    │        │   API     │
    └────────┴───────────┘
      Shared Components
      (FloatingNav, Theme)
```

### Directory Structure

```
podomoro-app/
├── src/
│   ├── features/              # Feature-based organization
│   │   ├── auth/             # Authentication (Google login)
│   │   │   ├── LoginPage.tsx
│   │   │   ├── AuthProvider.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   │
│   │   ├── timer/            # Pomodoro timer feature
│   │   │   ├── components/   # Timer-specific components
│   │   │   ├── hooks/        # Timer-specific hooks
│   │   │   └── types/        # Timer-specific types
│   │   │
│   │   └── kamehameha/       # PMO recovery feature
│   │       ├── pages/        # Full page components
│   │       ├── components/   # Feature components
│   │       ├── hooks/        # Data management hooks
│   │       ├── services/     # Business logic
│   │       └── types/        # TypeScript interfaces
│   │
│   ├── shared/               # Shared across features
│   │   ├── components/       # FloatingNav, StreakBadge
│   │   ├── hooks/            # useTheme, usePersistedState
│   │   └── utils/            # Common utilities
│   │
│   ├── services/             # External service integrations
│   │   └── firebase/         # Firebase configuration
│   │       ├── config.ts     # Firebase initialization
│   │       ├── auth.ts       # Auth methods
│   │       └── firestore.ts  # Firestore helpers
│   │
│   ├── routes/               # Routing configuration
│   │   └── AppRouter.tsx     # Route definitions
│   │
│   ├── App.tsx               # Root component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
│
├── functions/                # Firebase Cloud Functions
│   ├── src/
│   │   ├── openai.ts        # OpenAI API integration
│   │   └── contextBuilder.ts # Build AI context
│   └── package.json
│
├── docs/                     # Documentation
│   ├── INDEX.md
│   ├── core/
│   │   └── ARCHITECTURE.md  # This file
│   └── kamehameha/
│       └── ...
│
└── [config files]
```

---

## Routing Structure

### React Router Configuration

```typescript
<BrowserRouter>
  <Routes>
    {/* Timer Page - Public */}
    <Route path="/" element={<Navigate to="/timer" />} />
    <Route path="/timer" element={<TimerPage />} />
    
    {/* Kamehameha Page - Protected */}
    <Route 
      path="/kamehameha" 
      element={
        <ProtectedRoute>
          <KamehamehaPage />
        </ProtectedRoute>
      } 
    />
    
    {/* Login Page */}
    <Route path="/login" element={<LoginPage />} />
  </Routes>
</BrowserRouter>
```

### Navigation Flow

```
User on /timer
    │
    ├─ Clicks 🛡️ Kamehameha button in FloatingNav
    │
    ├─ Authenticated? ──Yes─→ Navigate to /kamehameha
    │                 │
    │                 └No──→ Redirect to /login
    │                         │
    │                         └─ After login → /kamehameha
    │
User on /kamehameha
    │
    └─ Clicks 🍅 Timer button → Navigate to /timer
```

---

## Shared Infrastructure

### 1. FloatingNav Component

**Location:** `src/shared/components/FloatingNav.tsx`

**Purpose:** Bottom-right navigation menu visible on all pages

**Buttons:**
- 🍅 Timer (Link to /timer)
- ⚙️ Settings (Opens settings panel)
- 🎵 Sounds (Opens sounds panel)
- ☀️/🌙 Theme Toggle
- 🛡️ Kamehameha (Link to /kamehameha)

**Implementation:**
```typescript
// Uses React Router Link components
<Link to="/timer">
  <button>🍅 Timer</button>
</Link>
<Link to="/kamehameha">
  <button>🛡️ Kamehameha</button>
</Link>
```

### 2. Theme System

**Location:** `src/shared/hooks/useTheme.ts`

**Purpose:** Dark/light mode management across entire app

**Storage:** localStorage (key: 'pomodoro-theme')

**Usage:**
```typescript
const { isDark, toggleTheme } = useTheme();
```

**Applied to:**
- Timer page
- Kamehameha page
- All modals and panels
- FloatingNav

### 3. Streak Badge

**Location:** `src/shared/components/StreakBadge.tsx`

**Purpose:** Always-visible streak timer for Kamehameha

**Display:** `🛡️ 15d 4h 23m 15s`

**Visibility:**
- Shown when user is authenticated
- Visible on both /timer and /kamehameha
- Updates every second
- Non-interactive (display only)

**Position:** Fixed top-left or top-right

---

## Feature Architecture

### Timer Feature (Existing)

**State Management:**
- LocalStorage for persistence
- Custom hooks: `useTimer`, `useSettings`, `useTasks`
- No backend required

**Key Components:**
- Timer display with circular progress
- Task management (Focus Priorities)
- Ambient sounds mixer
- Settings panel

**Data Flow:**
```
User interaction
    ↓
Component calls hook
    ↓
Hook updates state
    ↓
State saved to localStorage
    ↓
UI re-renders
```

### Kamehameha Feature (New)

**State Management:**
- Firebase Firestore for persistence
- Real-time sync across devices
- Custom hooks: `useKamehameha`, `useStreaks`, `useCheckIns`
- Cloud Functions for AI chat

**Key Components:**
- Streak timers (Main & Discipline)
- Check-in system with journal
- Relapse tracking
- AI therapist chat
- Milestones and badges

**Data Flow:**
```
User interaction
    ↓
Component calls hook
    ↓
Hook calls Firestore service
    ↓
Firestore updates data
    ↓
Real-time listener triggers
    ↓
Hook updates state
    ↓
UI re-renders
```

---

## Authentication Architecture

### Google OAuth Flow

```
User clicks "Sign in with Google"
    ↓
Firebase Auth handles OAuth
    ↓
Google sign-in popup
    ↓
User authorizes
    ↓
Firebase returns user token
    ↓
AuthProvider updates context
    ↓
User redirected to /kamehameha
```

### Protected Routes

```typescript
<ProtectedRoute>
  {/* Only accessible if authenticated */}
  <KamehamehaPage />
</ProtectedRoute>
```

**Logic:**
1. Check if user is authenticated
2. If yes: Render children
3. If no: Redirect to /login with returnUrl

### Auth State Persistence

- Firebase handles token refresh
- Auth state persists across sessions
- User stays logged in until explicit logout

---

## Database Architecture

### Timer Feature Data

**Storage:** LocalStorage

**Keys:**
- `pomodoro-settings` - Timer durations, sessions
- `pomodoro-theme` - Dark/light preference
- `pomodoro-timer-state` - Persisted timer state
- `zenfocus-tasks` - Task priorities
- `pomodoro-ambientVolumes` - Sound volumes

### Kamehameha Feature Data

**Storage:** Firestore

**Structure:**
```
users/
  {userId}/
    profile/
      - email, displayName, photoURL
    kamehameha/
      streaks/
        - main, discipline
      checkIns/
        {checkInId}/
      relapses/
        {relapseId}/
      chatHistory/
        {messageId}/
      config/
        - systemPrompt, rulesList
```

**See:** `docs/kamehameha/DATA_SCHEMA.md` for complete schema

---

## API Integration

### OpenAI API

**Access:** Via Firebase Cloud Functions (secure)

**Flow:**
```
User sends message
    ↓
Frontend calls Cloud Function
    ↓
Function authenticates user
    ↓
Function gathers user context from Firestore
    ↓
Function calls OpenAI API
    ↓
Response streamed back to client
    ↓
Message saved to Firestore
```

**Why Cloud Functions:**
- API key security (not exposed to client)
- Rate limiting enforcement
- Context building server-side
- Cost control

---

## State Management Patterns

### Timer Feature Pattern

```typescript
// Custom hook with localStorage
const useTimer = ({ settings }) => {
  const [time, setTime] = useState(() => {
    // Load from localStorage
  });
  
  useEffect(() => {
    // Save to localStorage
  }, [time]);
  
  return { time, start, pause, reset };
};
```

### Kamehameha Feature Pattern

```typescript
// Custom hook with Firestore
const useStreaks = (userId) => {
  const [streaks, setStreaks] = useState(null);
  
  useEffect(() => {
    // Set up real-time listener
    const unsubscribe = onSnapshot(
      doc(db, `users/${userId}/kamehameha/streaks`),
      (snapshot) => setStreaks(snapshot.data())
    );
    
    return unsubscribe;
  }, [userId]);
  
  return { streaks, resetStreak };
};
```

---

## Security Architecture

### Authentication
- Firebase Auth handles all auth
- JWT tokens for API calls
- Automatic token refresh
- Secure session management

### Authorization
- Firestore security rules
- Users can only access their own data
- Cloud Functions verify user auth
- API key never exposed to client

### Data Encryption
- Firestore encrypts data at rest
- HTTPS for all communications
- Sensitive fields encrypted client-side (future)

**See:** `docs/kamehameha/SECURITY.md` for details

---

## Build & Deployment

### Development
```bash
npm run dev              # Start dev server
npm run typecheck        # TypeScript check
npm run test             # Run tests
```

### Production Build
```bash
npm run build            # Build for production
npm run preview          # Preview production build
```

### Deployment
- **Frontend:** Vercel (auto-deploy from GitHub)
- **Functions:** Firebase Cloud Functions
- **Database:** Firestore

### Environment Variables
```
# Frontend (.env.local)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Functions (firebase functions:config)
openai.api_key=...
```

---

## Performance Considerations

### Code Splitting
- Route-based code splitting
- Lazy load Kamehameha page
- Lazy load AI chat components

### Caching
- Firebase caches auth state
- Firestore caches data locally
- Service worker for offline (future)

### Optimization
- Minimize re-renders with useMemo/useCallback
- Debounce Firestore writes
- Lazy load sounds and images
- Tree-shaking with Vite

---

## Testing Strategy

### Unit Tests
- Hooks and utilities
- Business logic
- Data transformations

### Integration Tests
- Component + Hook integration
- Firestore service layer
- Auth flow

### End-to-End Tests
- Full user journeys (future)
- Playwright or Cypress (future)

### Manual Testing
- Cross-browser testing
- Mobile responsiveness
- Firebase emulator

---

## Migration Strategy

### From V3.0 to V4.0 (with Kamehameha)

**Phase 1:** Add Firebase (no breaking changes)
- Firebase SDK added
- Auth system built
- Existing features unchanged

**Phase 2:** Add Kamehameha
- New /kamehameha route
- Timer feature unaffected
- Optional authentication

**Phase 3:** Future enhancements
- Sync Timer data to cloud (optional)
- Cross-device sync
- Backup and restore

---

## Adding New Features

### To Timer Feature
1. Create components in `src/components/` or `src/features/timer/`
2. Add hooks if needed
3. Update localStorage schema if needed
4. Test with existing features
5. Update CHANGELOG.md

### To Kamehameha Feature
1. Read `docs/kamehameha/SPEC.md`
2. Create components in `src/features/kamehameha/`
3. Update Firestore schema if needed
4. Add to `DATA_SCHEMA.md`
5. Test with Firebase emulator
6. Update CHANGELOG.md

### Shared Components
1. Create in `src/shared/components/`
2. Test with both Timer and Kamehameha
3. Document in this file
4. Update both feature docs if behavior changes

---

## Troubleshooting

### Firebase Issues
- Check environment variables
- Verify Firebase project configuration
- Check Firestore security rules
- Use Firebase console to debug

### Routing Issues
- Check React Router configuration
- Verify route paths match
- Check ProtectedRoute logic
- Test with browser navigation

### State Issues
- Check localStorage for Timer
- Check Firestore for Kamehameha
- Verify real-time listeners
- Check console for errors

---

## Resources

### Documentation
- [React Router](https://reactrouter.com/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore](https://firebase.google.com/docs/firestore)
- [OpenAI API](https://platform.openai.com/docs)

### Internal Docs
- [Kamehameha Overview](../kamehameha/OVERVIEW.md)
- [Data Schema](../kamehameha/DATA_SCHEMA.md)
- [AI Integration](../kamehameha/AI_INTEGRATION.md)
- [Security Guide](../kamehameha/SECURITY.md)

---

**Next Steps:**
1. Read [Kamehameha Overview](../kamehameha/OVERVIEW.md) to understand the recovery feature
2. Review [Data Schema](../kamehameha/DATA_SCHEMA.md) before implementing data layer
3. Check [Security Guide](../kamehameha/SECURITY.md) before deploying

