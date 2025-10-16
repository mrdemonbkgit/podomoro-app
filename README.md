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

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

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

## Roadmap & Changelog

### Future Features
See **[ROADMAP.md](ROADMAP.md)** for detailed feature planning:
- **V2.0** - Enhanced Experience (customization, persistence, themes)
- **V3.0** - Productivity Suite (tasks, analytics, advanced features)
- **Backlog** - Long-term ideas (mobile app, integrations, gamification)

### Version History
See **[CHANGELOG.md](CHANGELOG.md)** for detailed version history and changes.

## Testing with AI Assistant (MCP Integration)

This project includes Chrome DevTools MCP setup for AI-assisted testing and debugging.

### Quick Start

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

### Test Reports

Automated test reports with screenshots:
- `TEST_REPORT_FEATURE_2.1.md` - Customizable Timer Durations
- More reports added as features are tested

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

