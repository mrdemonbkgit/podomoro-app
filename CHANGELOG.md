# Changelog

All notable changes to the Pomodoro Timer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 🎯 **Task Management (Focus Priorities)** - Simple task management inspired by Flocus:
  - Set up to 3 daily focus priorities
  - Current task displays on main screen
  - Click edit icon to open Focus Priorities modal
  - Check off tasks as you complete them
  - Auto-progression to next unfinished task
  - Smooth modal animations with Framer Motion
  - Keyboard shortcuts: Enter to move between tasks, Escape to close
  - Tasks persist in localStorage across sessions
  - Staggered entrance animations for task items
- 🎨 **Phase 3 & 4: UI/UX Upgrade Complete** - Major visual and interaction enhancements:
  - **Circular Progress Ring** - Beautiful animated ring around timer showing session progress
  - **Session Completion Dots** - Visual progress indicators with checkmarks and pulsing current session
  - **Confetti Celebrations** 🎉 - Animated celebrations on session completion (work/break/long break)
  - **Personalized Greeting** - Time-based greeting (Good morning/afternoon/evening) with custom name option
  - **Settings Slide-out Panel** - Converted modal to slide-out panel for consistency with sounds mixer
  - **Framer Motion Integration** - Smooth spring animations throughout the app
  - **Auto Dark Mode** - Already supported via system preferences (light/dark/system modes)
- 🎵 **Phase 2: Real Audio Files Integration - Batch 2** - Integrated 9 additional real audio files:
  - Nature: Ocean Waves, Forest, River Stream, Birds Chirping, Crickets, Wind
  - Weather: Thunderstorm, Heavy Rain, Snowfall
  - Urban: City Ambience
- **17 total real audio files** now integrated (63% of all sounds)
- **100% complete** for Nature, Weather, and Workspace categories
- Hybrid audio system: Real files with automatic fallback to synthesis
- Audio preloading and caching for better performance
- Safety validation script (`validate-sounds.ps1`) to prevent accidental file placement
- Enhanced warnings in download scripts
- Git protection rules to prevent committing non-audio files

### Changed
- Updated ambient sound system to use real MP3 files when available
- Enhanced audio quality for all nature and weather sounds
- All quick presets now use primarily real audio files
- Updated documentation with comprehensive sound inventory
- **UI Cleanup** - Streamlined top navigation:
  - Removed redundant settings button from top-right corner
  - Moved dark mode toggle to floating navigation menu (bottom-right)
  - Cleaner header with only ZenFocus logo
  - All controls now consolidated in bottom-right floating menu
- **Motivational Quotes** - Refined display for cleaner UI:
  - Single-line display with ellipsis overflow
  - More subtle styling (smaller text, lighter weight, italic)
  - Better positioned alignment at top-right
- **Session Info Component** - Updated to display current active task:
  - Shows first unfinished task as main heading
  - Falls back to default question when no tasks set
  - Automatically updates as tasks are completed

### Fixed
- **[P0] Ambient sounds stop button** - Complete redesign of audio engine to fix critical bug where sounds wouldn't stop
- **Race conditions** in audio loading preventing duplicate sound instances
- **Audio element lifecycle** - Proper pause() before disconnect() to prevent independent playback
- Git ignore rules to protect `public/sounds/` from accidental commits
- Added README.md in `public/sounds/` with safety guidelines

## [2.0.0] - 2025-10-16 🎉 **V2.0 RELEASE**

### 🌟 V2.0: Enhanced Experience - Complete!

This is a **major milestone release** that transforms the Pomodoro Timer from a basic fixed-duration timer into a fully customizable, feature-rich productivity tool. All 6 planned V2.0 features have been successfully implemented, tested, and polished.

### Major Features
- ✅ **Feature 2.1: Customizable Timer Durations** - Personalize work/break durations (1-60 min)
- ✅ **Feature 2.2: Smart Resume/Restart Prompt** - Never lose progress on page reload
- ✅ **Feature 2.3: Desktop Notifications** - Stay informed even when tab is hidden
- ✅ **Feature 2.4: Skip Session Button** - Take control of your breaks
- ✅ **Feature 2.5: Sound Options** - 5 unique notification sounds with volume control
- ✅ **Feature 2.6: Dark/Light Mode** - Elegant themes with system preference detection

### Quality & Polish
- ✅ **86 Unit Tests** - Comprehensive coverage of hooks and utilities
- ✅ **CI/CD Pipeline** - Automated testing and build verification
- ✅ **Accessibility** - Keyboard shortcuts, ARIA labels, screen reader support
- ✅ **15+ Bug Fixes** - Including critical timer accuracy and UI compatibility issues

### Technical Improvements
- Automatic build versioning with git integration
- Timestamp-based timer for accuracy in background
- Web Audio API for synthesized sounds
- Backward-compatible settings migration
- Legacy browser support (Safari ≤13)

**See `RELEASE_NOTES_V2.0.md` for complete details.**

---

## [2.5.0] - 2025-10-16

### Added - Feature 2.5: Sound Options

**5 Notification Sounds**
- Implemented 5 distinct notification sounds using Web Audio API:
  - 🔔 **Chime** (default): Two-tone pleasant chime (ding-dong sound)
  - 🛎️ **Bell**: Classic bell ring with harmonics for a richer sound
  - 📟 **Beep**: Simple digital beep (square wave at A5)
  - 🎹 **Piano**: Soft piano notes playing a C major chord
  - 🌊 **Gentle**: Calm ambient tone with slight detuning for depth
- Each sound has unique characteristics and duration
- All sounds are synthesized in real-time (no audio files required)

**Interactive Sound Picker**
- Card-based UI with icon, name, and description for each sound
- Click any sound card to select and instantly preview it
- Selected sound highlighted with blue border and checkmark
- Hover effects for better interactivity
- Fully responsive design

**Volume Control**
- Slider with range 0-100% for precise volume adjustment
- Real-time volume percentage display
- Visual feedback with gradient slider (blue fill shows current level)
- "Test" button to preview current sound at current volume
- Volume at 0% mutes sound and disables Test button
- Shows mute indicator (🔇) when volume is 0%

**Settings Integration**
- Added `soundType` field to settings (default: 'chime')
- Added `volume` field to settings (default: 100)
- Settings persist to localStorage
- Backward compatible with existing user settings
- Timer uses selected sound and volume for session complete notifications

**Dark Mode Support**
- Sound picker cards adapt to light/dark themes
- Volume slider styled for both modes
- All text and borders properly themed

**Files Modified**
- `src/utils/sounds.ts` (new): Sound library with 5 generators
- `src/utils/audio.ts`: Refactored to accept sound type and volume
- `src/types/settings.ts`: Added soundType and volume fields
- `src/components/Settings.tsx`: Added sound picker UI and volume slider
- `src/hooks/useTimer.ts`: Pass sound settings to playNotification

**Technical Details**
- Used Web Audio API for all sound generation
- Oscillators with ADSR envelopes for smooth sound
- Multiple oscillators for harmonics (Bell, Piano)
- Volume normalized from 0-100 to 0-1 for audio context
- Type-safe with TypeScript interfaces

**Testing**
- Verified all 5 sounds play with distinct characteristics
- Confirmed volume control affects sound level
- Tested mute functionality (volume = 0)
- Verified settings persistence across page refreshes
- Confirmed dark mode styling
- Tested in Chrome DevTools MCP

## [2.4.0] - 2025-10-16

### Added - Feature 2.4: Skip Session Button

**Skip Break Functionality**
- Added "Skip Break" button that appears only during break sessions (short break and long break)
- Button allows users to immediately end their break and start the next work session
- Positioned horizontally between Start/Pause and Reset buttons for easy access
- No confirmation dialog required - immediate action for faster workflow

**Button Design**
- Orange color (`bg-orange-500`/`bg-orange-600` in dark mode) to distinguish from other actions
- Suggests "skip ahead" with distinctive color
- Matches existing button styling with consistent sizing (`min-w-[140px]`)
- Fully supports dark mode with proper color variants

**Behavior**
- Only visible during break sessions (not during work time)
- Immediately transitions to next work session on click
- Maintains session counter correctly:
  - After short break: Increments session count
  - After long break: Resets session count to 0
- Does NOT play notification sound (manual user action)
- Timer pauses after skip (user can start when ready)

**Technical Details**
- Added `skipBreak()` function to `useTimer` hook
- Updated `Controls` component to accept new props (`onSkip`, `sessionType`, `isDark`)
- Modified `UseTimerReturn` interface to include `skipBreak`
- Conditional rendering based on `sessionType !== 'work'`

**Files Modified**
- `src/hooks/useTimer.ts`: Added skipBreak function
- `src/components/Controls.tsx`: Added Skip Break button with conditional visibility
- `src/App.tsx`: Wired up skipBreak and passed required props

**Testing**
- Verified button appears during short break
- Verified button disappears during work time
- Confirmed session counter increments correctly after skipping short break
- Tested in both light and dark modes
- Confirmed button styling matches other controls

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

See [docs/kamehameha/OVERVIEW.md](docs/kamehameha/OVERVIEW.md) for V4.0 Kamehameha feature in development.

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

V2.0 and V3.0 features have been completed. See [docs/zenfocus/OVERVIEW.md](docs/zenfocus/OVERVIEW.md) for current Timer features.

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

