# Changelog

All notable changes to the Pomodoro Timer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.3.0] - 2025-10-16

### Added - Feature 2.6: Dark/Light Mode

**Theme System**
- Implemented complete dark mode/light mode theme system
- Created `useTheme` hook for theme management
  - Supports 'light', 'dark', and 'system' modes
  - Detects system preference using `window.matchMedia`
  - Listens to real-time system theme changes
  - Persists theme to localStorage ('pomodoro-theme')
- Theme toggle button with sun/moon icons in header
- Smooth color transitions (200ms) for all theme changes

**Dark Mode Styling**
- Comprehensive dark mode support for all components:
  - App: Elegant gradient backgrounds (gray-900 to session color with 30% opacity)
  - Timer: Adjusted colors for better visibility (red-400, green-400, blue-400)
  - SessionInfo: Dark text colors
  - Settings Modal: Dark backdrop and modal container
  - Settings Form: Dark inputs, labels, error messages, info box, toggle switch
  - Resume Prompt: Complete dark mode support
- Color scheme optimized for readability and eye comfort
- All buttons and controls work well in both modes

**Technical Details**
- Uses dynamic className selection based on `isDark` state
- Replaced all `dark:` prefix usage with conditional ternary operators
- Ensures proper theme switching across all components
- Bundle impact: +7.7 kB (CSS: +2.7 kB, JS: +5 kB)
- Maintains smooth performance with transitions

### Fixed - Dark Mode Implementation Issues

**Critical Bug: Theme Toggle Not Working**
- **Issue**: Dark mode toggle changed state but UI didn't visually update
- **Root Cause**: Tailwind `dark:` prefix requires `.dark` class on HTML element, but our state-based approach didn't consistently apply it
- **Solution**: Replaced ALL `dark:` prefixes with dynamic className selection using `isDark` state
- **Components Fixed**:
  - `App.tsx`: Background gradients, title, buttons, card, footer
  - `SettingsModal.tsx`: Modal backdrop and container  
  - `Settings.tsx`: All form elements, inputs, labels, buttons, dialogs
  - `ResumePrompt.tsx`: Modal, text, buttons, timer display
  - `Timer.tsx`: Timer display colors
  - `SessionInfo.tsx`: Session labels and counter text
- **Commits**: 10 commits over 2 hours debugging and fixing all components
- **Verification**: Used `findstr` to confirm zero remaining `dark:` prefixes

**Testing & Documentation**
- Verified theme toggle works perfectly across all components
- All modals and forms render correctly in both modes
- Tested persistence and system preference detection
- Created `FEATURE_2.6_SUMMARY.md` with comprehensive documentation including bug fixes
- Updated `ROADMAP.md` with completion status

## [2.2.0] - 2025-10-16

### Fixed
- **[P0 CRITICAL] Session switch regression**
  - Issue: Timer would not automatically switch to next session after countdown completed
  - Root cause: Incorrect conditional check `time === 0 && !isActive` prevented session switch
  - Solution: Removed `!isActive` check to allow switch when timer naturally reaches 0
  - Result: Timer now correctly transitions between work/break sessions ✅

## [2.1.2] - 2025-10-16

### Fixed
- **[P1] Fixed timer running slower when Chrome is minimized**
  - Issue: Browser timer throttling caused countdown to appear frozen or very slow when minimized
  - Root cause: `setInterval` gets throttled from 1s to up to 60s when browser is inactive
  - Solution: Changed to timestamp-based calculation instead of counting intervals
  - Result: Perfect timer accuracy regardless of browser state (active/background/minimized)
  - Technical: Timer now calculates elapsed time from real timestamps, not interval fire counts
  - Impact: Timer now works reliably when browser is minimized or in background ✅

## [2.1.1] - 2025-10-16

### Fixed
- **[P0 CRITICAL] Fixed backward compatibility issue preventing data loss**
  - Issue: New `notificationsEnabled` field caused existing user settings to be wiped
  - Impact: Users upgrading from v2.0.0 would lose all custom timer durations
  - Solution: Implemented graceful migration that merges old settings with new defaults
  - Result: All existing user settings are preserved, new field defaults to enabled
  - Added comprehensive test suite (12 new tests) for settings validation
  - Zero data loss guarantee for upgrading users ✅

## [2.1.0] - 2025-10-16

### Added
- **Feature 2.3: Desktop Notifications** 🔔
  - Desktop notifications when timer completes
  - Works even when tab is in background
  - iOS-style toggle switch in settings
  - Auto-request notification permission
  - Session-specific notification messages:
    - Work Complete: "Work Session Complete! 🎉"
    - Short Break Complete: "Break Over! 💪"
    - Long Break Complete: "Long Break Complete! 🌟"
  - Graceful fallback if notifications not supported
  - Auto-close notifications after 5 seconds
  - Click notification to focus window
  - User preference saved to localStorage
  
### Added (Feature 2.1)
- **Feature 2.1: Customizable Timer Durations** - Users can now customize timer durations
  - **Enhancement:** Settings now apply instantly if timer hasn't been started
  - **Enhancement:** Smart session count handling when changing sessions until long break
  - Created `Settings` component with form inputs for work, short break, long break durations
  - Created `SettingsModal` component with backdrop and modal wrapper
  - Created `useSettings` hook for settings state management and localStorage persistence
  - Added settings gear icon button to app header
  - Input validation (1-60 minutes for durations, 2-8 for sessions until long break)
  - Real-time validation feedback with error messages
  - Save and reset to defaults functionality
  - Settings persist across sessions using localStorage
  - Settings apply to next session (current session not interrupted)
  - **Smart application:** Settings apply instantly if timer is in initial state (not started)
  - Dynamic footer displays current settings
  - Added `sessionsUntilLongBreak` customization (2-8 sessions)
  - Updated info box to explain instant vs. next-session application

### Fixed
- **Fixed inconsistent button sizes for Start/Pause buttons**
  - Start and Pause buttons had slightly different widths due to text content
  - Added `min-w-[140px]` to all control buttons (Start, Pause, Reset)
  - All buttons now have consistent width for better visual alignment

- **CRITICAL: Fixed pause button resetting timer instead of pausing**
  - Issue: Clicking pause mid-session (e.g., at 04:16) would reset timer to full duration (05:00)
  - Root cause: Settings `useEffect` had `isActive` in dependencies, triggering on pause
  - Solution: Only run settings update effect when `workDuration` changes
  - Added check for "round minute" (time % 60 === 0) to detect initial vs. paused state
  - Now pause correctly maintains time: 04:16 stays at 04:16 ✅

- **Replaced Chrome native confirm dialog with custom React confirmation modal**
  - Removed `confirm()` call from Settings component
  - Created custom confirmation dialog with backdrop
  - Better UX with styled Cancel/Reset buttons
  - Consistent design with rest of the app
  - No more jarring browser dialogs

- **Fixed Sessions Until Long Break setting not updating the session counter display**
  - Session counter now properly displays "Session X of Y" based on current settings
  - Smart handling: Resets session count if it exceeds new limit (prevents "Session 3 of 2")
  - SessionInfo component now receives `sessionsUntilLongBreak` as a prop
  - Immediate visual feedback when changing this setting
  
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

**Feature 2.1 Files:**
- New file: `src/types/settings.ts` - Settings interface, defaults, and validation constants
- New file: `src/hooks/useSettings.ts` - Settings state management with validation
- New file: `src/components/Settings.tsx` - Settings form component
- New file: `src/components/SettingsModal.tsx` - Modal wrapper component
- Updated: `src/types/timer.ts` - Added `minutesToSeconds` helper
- Updated: `src/hooks/useTimer.ts` - Now accepts settings prop and uses custom durations
- Updated: `src/App.tsx` - Integrated settings button, modal, and dynamic display

**Testing & Documentation:**
- New file: `MCP_TESTING_WORKFLOW.md` - Automated browser testing workflow
- New file: `TEST_REPORT_FEATURE_2.1.md` - Comprehensive test report with screenshots
- New file: `FEATURE_2.1_SUMMARY.md` - Detailed implementation summary
- Updated: `ROADMAP.md` - Marked Feature 2.1 complete, added MCP testing workflow
- Updated: `README.md` - Added test reports section
- **Test Status:** ✅ 7/7 tests passed using Chrome DevTools MCP

**Feature 2.2 Files:**
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

