# Changelog

All notable changes to the Pomodoro Timer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Feature 2.2: Persistent State** - Timer state now persists across page refreshes
  - Created `usePersistedState` generic hook for localStorage persistence with validation
  - Added `PersistedTimerState` interface with timestamp tracking
  - Created `ResumePrompt` component showing saved session details
  - Automatic stale state detection (2-hour maximum age)
  - "Resume" button to continue from saved state
  - "Start Fresh" button to clear saved state and start over
  - State validation to prevent corruption
  - Cleared state on timer completion and reset
  - **Background timer continuation** - Calculates elapsed time when tab is closed
    - Shows "While you were away, Xs elapsed" message
    - Updates timer to reflect where it would be
    - Handles timer completion while away
    - Transparent time calculation displayed to user

### Fixed
- Fixed bug where resume prompt appeared when pausing a timer that was already running after page refresh
- Added logic to dismiss resume prompt if timer was active on page load

### Technical Details
- New hook: `src/hooks/usePersistedState.ts` - Generic localStorage persistence
- New component: `src/components/ResumePrompt.tsx` - Resume modal UI with elapsed time display
- Updated: `src/hooks/useTimer.ts` - Integrated persistence with timer logic and elapsed time calculation
- Updated: `src/types/timer.ts` - Added `PersistedTimerState` interface
- State includes: time, isActive, sessionType, completedSessions, timestamp
- Elapsed time calculation: `elapsed = now - savedTimestamp`, `newTime = savedTime - elapsed`

See [ROADMAP.md](ROADMAP.md) for planned features.

## [1.0.0] - 2025-10-16

### Added
- Initial release of Pomodoro Timer V1.0
- Fixed timer durations (25 minutes work, 5 minutes short break, 15 minutes long break)
- Start/Pause/Reset controls
- Session counter (1-4) with automatic reset after long break
- Color-coded sessions:
  - Red/pink for work sessions
  - Green for short breaks
  - Blue for long breaks
- Audio notification using Web Audio API (two-tone chime)
- Browser tab title updates with countdown
- Responsive, modern UI with Tailwind CSS
- React 19 + TypeScript + Vite stack
- Chrome DevTools MCP integration for automated testing
- Helper scripts for launching Chrome with debugging (`launch-chrome-debug.ps1`, `launch-chrome-debug.bat`)
- Comprehensive documentation:
  - README.md with usage instructions
  - ROADMAP.md with future features
  - IMPLEMENTATION_SUMMARY.md with technical details
  - MCP_SETUP_GUIDE.md for AI testing setup

### Technical Details
- **Frontend Framework:** React 19
- **Language:** TypeScript (strict mode)
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 3
- **State Management:** React hooks (useState, useEffect, useCallback)
- **Audio:** Web Audio API (no external files)
- **Testing:** Chrome DevTools MCP integration

### Components
- `Timer.tsx` - Main timer display component
- `Controls.tsx` - Start/Pause/Reset buttons
- `SessionInfo.tsx` - Session type and counter display
- `App.tsx` - Main application component

### Custom Hooks
- `useTimer.ts` - Core timer logic with countdown, session management, and auto-transitions

### File Structure
```
src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── App.tsx         # Main app
```

### Known Limitations
- Timer durations are fixed (not customizable in V1.0)
- No persistent state (refreshing resets timer)
- No task management
- No statistics/history tracking
- No dark mode

See [ROADMAP.md](ROADMAP.md) for planned enhancements in V2.0 and V3.0.

## Git History

### [c8d8b42] - 2025-10-16
**fix: Correct MCP package name to chrome-devtools-mcp**
- Fixed MCP integration to use correct package name
- Changed from `@modelcontextprotocol/server-chrome-devtools` to `chrome-devtools-mcp@latest`

### [0b85dc8] - 2025-10-16
**feat: Add Chrome DevTools MCP integration setup**
- Added MCP setup guide and helper scripts
- Created PowerShell and batch launcher scripts
- Updated documentation

### [dc7d7df] - 2025-10-16
**feat: Initial release - Pomodoro Timer V1.0**
- Complete implementation of core Pomodoro timer
- All V1.0 features implemented and tested

---

[Unreleased]: https://github.com/yourusername/pomodoro-timer/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/pomodoro-timer/releases/tag/v1.0.0

