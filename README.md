# 🍅 Pomodoro Timer App

A simple and elegant Pomodoro Timer application built with React 19, TypeScript, and Tailwind CSS.

## Features

### V2.0 Features (In Progress)

- **Customizable Timer Durations** ✅ (Feature 2.1)
  - Customize work, short break, and long break durations
  - Set sessions until long break (2-8 sessions)
  - Settings persist across sessions
  - Input validation (1-60 minutes)
  - Easy reset to defaults (25/5/15 minutes)
  
- **Persistent State** ✅ (Feature 2.2)
  - Timer state survives page refreshes
  - Resume prompt when returning to the app
  - Background timer continuation with elapsed time tracking
  - Shows time elapsed while away

### V1.0 Core Features

- **Timer Durations** (Customizable!)
  - Work session: 25 minutes (default, customizable 1-60 min)
  - Short break: 5 minutes (default, customizable 1-60 min)
  - Long break: 15 minutes (default, customizable 1-60 min)
  - Sessions until long break: 4 (default, customizable 2-8)

- **Basic Controls**
  - Start/Pause button
  - Reset button
  - Session counter

- **Visual Feedback**
  - Color-coded sessions (red for work, green for short break, blue for long break)
  - Large, clear countdown display
  - Browser tab shows countdown
  - Smooth background transitions
  - Settings gear icon for easy access

- **Audio Notification**
  - Two-tone chime sound when timer completes
  - Generated using Web Audio API

## Tech Stack

- **React 19** - Latest version of React
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd podomoro-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example files
cp .env.example .env
cp functions/.env.example functions/.env

# Edit .env with your Firebase config (get from Firebase Console)
# Edit functions/.env with your OpenAI API key (for AI chat feature)
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

6. Deploy Firestore indexes (required for production):
```bash
firebase deploy --only firestore:indexes
```

### Firestore Indexes

Required indexes are defined in `firestore.indexes.json` at the repo root.

**Deploy indexes:**
```bash
firebase deploy --only firestore:indexes
```

**View index status:**
```bash
firebase firestore:indexes
```

**Check index build progress:**
Visit Firebase Console → Firestore → Indexes

⏱️ **Note:** Index building can take several minutes to hours depending on data size.

**Milestone Detection:** Uses a hybrid approach for reliability:
- ✅ **Client-side detection** (`useMilestones` hook) - Primary, instant feedback when app is open
- ✅ **Scheduled Cloud Function** (`checkMilestonesScheduled`) - Backup, runs every minute for offline detection
- 🔍 **Technical:** Scheduled function uses `collectionGroup('kamehameha')` with `FieldPath.documentId() == 'streaks'` filter
- 📊 **Index Required:** See index configuration above for `kamehameha` collection group

### Firebase Security Rules

ZenFocus uses separate security rules for production and development:

**📄 Production Rules:** `firestore.rules`
- ✅ Strict authentication required for all operations
- ❌ No test user exceptions
- 🚀 Safe to deploy to production

**📄 Development Rules:** `firestore.rules.dev`
- ✅ Includes test user exception for automated tests
- ⚠️ **NEVER deploy to production!**
- 🧪 Used by Firebase emulator only

**Deploy Production Rules:**
```bash
# Deploy secure production rules
firebase deploy --only firestore:rules
```

**Run Emulator with Dev Rules:**
```bash
# Automatically swaps to dev rules and starts emulator
npm run emulator

# When done, restore production rules
npm run emulator:restore
```

**Test Security Rules:**
```bash
# Start emulator first
firebase emulators:start

# In another terminal, run rules tests
npm run test:rules
```

**⚠️ IMPORTANT:** 
- `firestore.rules` = Production (no backdoors, strict auth)
- `firestore.rules.dev` = Development (test user exception for CI)
- Always use `npm run emulator` which handles rules switching automatically
- Never manually deploy `firestore.rules.dev` to production

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## How to Use

1. **Customize your settings** (optional): Click the ⚙️ settings icon to customize timer durations
2. Click **Start** to begin a work session (25 minutes by default)
3. When the timer completes, you'll hear a notification sound
4. The timer automatically switches to a break (5 minutes by default)
5. After completing the configured number of work sessions (4 by default), you'll get a long break (15 minutes by default)
6. Use **Pause** to temporarily stop the timer
7. Use **Reset** to return to the initial work session
8. Your settings and timer state persist across page refreshes

## Project Structure

```
podomoro-app/
├── public/
│   └── vite.svg              # Favicon
├── src/
│   ├── components/
│   │   ├── Timer.tsx         # Timer display component
│   │   ├── Controls.tsx      # Control buttons
│   │   ├── SessionInfo.tsx   # Session type and counter
│   │   ├── ResumePrompt.tsx  # Resume modal for persisted state
│   │   ├── Settings.tsx      # Settings form component
│   │   └── SettingsModal.tsx # Settings modal wrapper
│   ├── hooks/
│   │   ├── useTimer.ts       # Custom timer hook with settings support
│   │   ├── useSettings.ts    # Settings state management
│   │   └── usePersistedState.ts # Generic localStorage persistence
│   ├── types/
│   │   ├── timer.ts          # Timer TypeScript types and constants
│   │   └── settings.ts       # Settings TypeScript types
│   ├── utils/
│   │   └── audio.ts          # Audio notification utility
│   ├── App.tsx               # Main app component
│   ├── App.css               # App styles
│   ├── index.css             # Global styles with Tailwind
│   ├── main.tsx              # Entry point
│   └── vite-env.d.ts         # Vite type declarations
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Documentation & Changelog

### Project Documentation
All documentation is organized in the **[`docs/`](docs/)** directory:
- **[docs/INDEX.md](docs/INDEX.md)** - Documentation hub and navigation
- **[docs/API_REFERENCE.md](docs/API_REFERENCE.md)** - 📚 **Complete API Reference** (hooks, services, types)
- **[docs/zenfocus/](docs/zenfocus/)** - Timer feature documentation
- **[docs/kamehameha/](docs/kamehameha/)** - PMO Recovery Tool (V4.0 - in development)

### Version History
See **[CHANGELOG.md](CHANGELOG.md)** for detailed version history and changes.

### Current Status
- ✅ **V3.0** - Live (ZenFocus rebrand, task management, ambient sounds)
- 🔄 **V4.0** - In Development (Kamehameha PMO Recovery Tool)
  - See [docs/kamehameha/OVERVIEW.md](docs/kamehameha/OVERVIEW.md) for details
  - Track progress at [docs/kamehameha/PROGRESS.md](docs/kamehameha/PROGRESS.md)

## Testing

### Unit Tests

Run unit tests with Vitest:
```bash
npm run test           # Run once
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage
```

### E2E Tests (Playwright)

The project includes 70 comprehensive E2E tests covering Timer, Auth, and Kamehameha features.

```bash
# Run E2E tests (headless)
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

#### Running with Firebase Emulator

For authenticated tests (Kamehameha features), you need the Firebase emulator:

**Native/Linux:**
```bash
npm run test:e2e:full
```

**WSL with Windows Emulator:**
1. Start emulator on Windows: `firebase emulators:start --only firestore,auth`
2. Set up firewall (PowerShell Admin, one-time):
   ```powershell
   New-NetFirewallRule -DisplayName "Firebase Auth" -Direction Inbound -LocalPort 9099 -Protocol TCP -Action Allow
   New-NetFirewallRule -DisplayName "Firebase Firestore" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
   ```
3. Start dev server with Windows host:
   ```bash
   VITE_USE_FIREBASE_EMULATOR=true VITE_EMULATOR_HOST=<windows-ip> npm run dev
   ```
4. Run tests: `FIREBASE_EMULATOR=true npx playwright test`

### Testing with AI Assistant (MCP Integration)

This project includes Chrome DevTools MCP setup for AI-assisted testing and debugging.

1. **Launch Chrome with debugging:**
   ```bash
   # Windows PowerShell
   .\launch-chrome-debug.ps1

   # Or double-click
   launch-chrome-debug.bat
   ```

2. **Configure MCP in Cursor** (one-time setup)
   - See `MCP_SETUP_GUIDE.md` for detailed instructions
   - Restart Cursor after configuration

3. **Run automated tests with AI!**
   - "Test the new feature using MCP"
   - "Take screenshots of the app"
   - "Check for console errors"
   - See `MCP_TESTING_WORKFLOW.md` for complete workflow

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

