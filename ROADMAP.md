# 🍅 Pomodoro Timer - Product Roadmap

This document outlines the product roadmap for the Pomodoro Timer application. It's designed to be AI-agent friendly with detailed technical implementation notes.

---

## 📦 Current Version: V1.0 ✅
**Release Date:** October 16, 2025  
**Status:** Production Ready  
**Git Tag:** `v1.0.0`

### Completed Features
- [x] Fixed timer durations (25/5/15 min)
- [x] Start/Pause/Reset controls
- [x] Session counter (1-4) with auto-reset after long break
- [x] Color-coded sessions (red/green/blue)
- [x] Audio notifications using Web Audio API
- [x] Browser tab countdown display
- [x] Responsive, modern UI design
- [x] React 19 + TypeScript + Vite + Tailwind CSS
- [x] Chrome DevTools MCP integration for testing

### Current File Structure
```
src/
├── components/
│   ├── Timer.tsx          # Timer display with countdown
│   ├── Controls.tsx       # Start/Pause/Reset buttons
│   └── SessionInfo.tsx    # Session type and counter
├── hooks/
│   └── useTimer.ts        # Core timer logic
├── types/
│   └── timer.ts           # TypeScript types and constants
├── utils/
│   └── audio.ts           # Audio notification utility
└── App.tsx                # Main app component
```

---

## 🚀 V2.0 - Enhanced Experience
**Planned Release:** Q1 2026  
**Status:** Not Started  
**Priority:** High  
**Estimated Effort:** 2-3 weeks

### Features Overview
Focus: Enhance user experience with customization and persistence.

---

### Feature 2.1: Customizable Timer Durations ✅ **COMPLETED**
**Priority:** High  
**Effort:** Medium (2-3 days)  
**Dependencies:** None  
**Status:** ✅ Implemented (October 2025)

#### Description
Allow users to customize work, short break, and long break durations instead of fixed 25/5/15 minutes.

#### User Story
As a user, I want to set custom timer durations so that I can adapt the Pomodoro technique to my personal workflow preferences.

#### Acceptance Criteria
- [x] Settings panel/modal with three number inputs
- [x] Input validation (min: 1 min, max: 60 min)
- [x] Real-time preview of changes
- [x] Save button to apply settings
- [x] Reset to defaults button (25/5/15)
- [x] Settings persist across sessions (localStorage)
- [x] Settings apply to next session (don't interrupt current)

#### Technical Implementation

**New Files:**
- `src/components/Settings.tsx` - Settings panel component with form inputs
- `src/components/SettingsModal.tsx` - Modal wrapper with backdrop
- `src/hooks/useSettings.ts` - Settings state management with localStorage
- `src/types/settings.ts` - Settings type definitions and constants

**Modified Files:**
- `src/types/timer.ts` - Added minutesToSeconds helper function
- `src/hooks/useTimer.ts` - Updated to accept settings and use custom durations
- `src/App.tsx` - Added settings button, modal, and dynamic footer

**Implementation Steps:**
1. ✅ Created settings type interface with validation constants
2. ✅ Created `useSettings` hook with localStorage persistence
3. ✅ Updated `useTimer` to accept settings prop
4. ✅ Added settings gear icon button to App header
5. ✅ Created modal with form inputs and validation
6. ✅ Added save and reset functionality
7. ✅ Settings apply to next session (current session not interrupted)
8. ✅ Dynamic footer shows current settings

**Testing Requirements:**
- [x] TypeScript compilation successful
- [x] Production build successful
- [x] Settings validation working
- [x] localStorage persistence working
- [x] Automated MCP testing completed
- [x] Test timer with custom durations
- [x] Test persistence across page refreshes
- [x] Test reset to defaults functionality

**Test Report:** See `TEST_REPORT_FEATURE_2.1.md`  
**Testing Method:** Chrome DevTools MCP (see `MCP_TESTING_WORKFLOW.md`)

---

### Feature 2.2: Persistent State ✅ **COMPLETED**
**Priority:** High  
**Effort:** Small (1 day)  
**Dependencies:** None  
**Status:** ✅ Implemented (October 2025)  
**Enhancements:** Background timer continuation with elapsed time tracking

#### Description
Save timer state to survive page refreshes, so users don't lose progress. Timer now continues counting in the background when tab is closed, calculating elapsed time and updating the timer position when user returns.

#### User Stories
1. As a user, I want my timer progress to be saved if I accidentally refresh the page or close the browser.
2. As a user, I want the timer to continue counting while the tab is closed, so I can see where the timer would be when I return.

#### Acceptance Criteria
**Core Persistence:**
- [x] Save current timer state to localStorage
- [x] Restore state on page load
- [x] Handle edge cases (stale data, invalid state)
- [x] Show "Resume?" prompt if state is restored
- [x] Clear state when timer completes or is reset

**Background Continuation (Enhancement):**
- [x] Calculate elapsed time when tab was closed: `elapsed = now - savedTimestamp`
- [x] Update timer to reflect background continuation: `newTime = savedTime - elapsed`
- [x] Show "While you were away, Xs elapsed" message in resume prompt
- [x] Handle timer completion while tab was closed
- [x] Only calculate elapsed time if significant time passed (>2 seconds)
- [x] Display updated timer value with "(Updated from pause time)" indicator

**Bug Fixes:**
- [x] Fix resume prompt appearing when pausing already-running timer after refresh
- [x] Dismiss resume prompt if timer was active on page load

#### Technical Implementation

**New Files:**
- `src/hooks/usePersistedState.ts` - Generic persisted state hook with validation
- `src/components/ResumePrompt.tsx` - Resume modal UI with elapsed time display

**Modified Files:**
- `src/hooks/useTimer.ts` - Integrated persistence with elapsed time calculation
- `src/types/timer.ts` - Added `PersistedTimerState` interface
- `src/App.tsx` - Added ResumePrompt modal with elapsed time prop

**Implementation Steps:**
1. Create `usePersistedState` hook wrapper around `useState`
2. Serialize/deserialize timer state to localStorage
3. Add timestamp to detect stale state (older than 2 hours)
4. On load, check for saved state and prompt user to resume
5. **Calculate elapsed time if timer was active**: `elapsed = now - savedTimestamp`
6. **Update timer position**: `newTime = savedTime - elapsed`
7. **Handle timer completion while away** - switch to next session
8. Clear state on timer completion or reset
9. **Dismiss resume prompt if timer was active on page load** (bug fix)

**State to Persist:**
```typescript
{
  time: number;
  isActive: boolean;
  sessionType: SessionType;
  completedSessions: number;
  timestamp: number; // Used for elapsed time calculation
}
```

**Elapsed Time Calculation Logic:**
```typescript
// On mount, if timer was active:
const elapsed = Math.floor((Date.now() - state.timestamp) / 1000);

if (elapsed > 2) {  // Only if significant time passed
  const newTime = state.time - elapsed;
  
  if (newTime <= 0) {
    // Timer completed while away - switch to next session
    switchToNextSession();
  } else {
    // Update time and show resume prompt with elapsed info
    setElapsedWhileAway(elapsed);
    setState({ ...prev, time: newTime, isActive: false });
  }
}
```

**Testing Requirements:**
- [x] Test state save/restore
- [x] Test stale state handling
- [x] Test invalid data handling
- [x] Test elapsed time calculation (verified: 25s elapsed, timer updated correctly)
- [x] Test timer completion while away
- [x] Test resume prompt not appearing when pausing running timer after refresh
- [x] Test resume prompt appearance with elapsed time message
- [x] No console errors

**Commits:**
- `4f6f17b` - Initial persistent state implementation
- `2cfe2db` - Bug fix: Prevent resume prompt on pause after refresh
- `ed98d1e` - Background timer continuation with elapsed time tracking
- `b70ec73` - Updated CHANGELOG with enhancements

---

### Feature 2.3: Desktop Notifications
**Status:** ✅ COMPLETED  
**Priority:** Medium  
**Effort:** Small (1 day)  
**Dependencies:** None  
**Completed:** October 16, 2025

#### Description
Request browser notification permission and show desktop notifications when timer completes.

#### User Story
As a user, I want desktop notifications when my timer ends so I'm alerted even if the tab is in the background.

#### Acceptance Criteria
- [x] Request notification permission on first use
- [x] Show desktop notification when timer completes
- [x] Notification shows session type (work/break completed)
- [x] Fallback to in-app notification if permission denied
- [x] Settings to enable/disable notifications
- [x] Works in background tabs

#### Technical Implementation

**New Files:**
- ✅ `src/utils/notifications.ts` - Notification utility (161 lines)
- ✅ `FEATURE_2.3_SUMMARY.md` - Implementation documentation

**Modified Files:**
- ✅ `src/hooks/useTimer.ts` - Call notification on completion
- ✅ `src/components/Settings.tsx` - Add notification toggle
- ✅ `src/types/settings.ts` - Add notificationsEnabled field
- ✅ `src/hooks/useSettings.ts` - Update validation for boolean

**Implementation Steps:**
1. ✅ Check browser notification support
2. ✅ Request permission on app load or first timer start
3. ✅ Create notification utility:
   ```typescript
   showNotification(title: string, body: string, icon?: string)
   notifySessionComplete(sessionType: 'work' | 'shortBreak' | 'longBreak')
   ```
4. ✅ Call notification in `switchToNextSession` function
5. ✅ Add setting to enable/disable (default: enabled)
6. ✅ Create iOS-style toggle switch in settings
7. ✅ Update settings validation for boolean fields

**Notification Messages:**
- Work complete: "Time for a break! 🎉"
- Short break complete: "Break's over - back to work! 💪"
- Long break complete: "Long break done - ready for the next round?"

**Testing Requirements:**
- [x] Test with permission granted/denied
- [x] Test notification content
- [x] Test in background tab
- [x] Test toggle switch functionality
- [x] Test settings persistence
- [x] TypeScript compilation
- [x] Production build

**Test Report:** See FEATURE_2.3_SUMMARY.md

---

### Feature 2.4: Skip Break
**Priority:** Low  
**Effort:** Small (0.5 day)  
**Dependencies:** None

#### Description
Add button to skip current break and start next work session immediately.

#### User Story
As a user, I want to skip my break if I'm in a flow state and want to continue working.

#### Acceptance Criteria
- [ ] Skip button only visible during break sessions
- [ ] Clicking skip immediately starts next work session
- [ ] Maintains session counter
- [ ] Confirmation prompt (optional)

#### Technical Implementation

**Modified Files:**
- `src/hooks/useTimer.ts` - Add `skipBreak()` function
- `src/components/Controls.tsx` - Add skip button

**Implementation Steps:**
1. Add `skipBreak` function to useTimer hook
2. Function switches to work session immediately
3. Add conditional skip button in Controls
4. Only show when `sessionType !== 'work'`

**Testing Requirements:**
- Test skip during short break
- Test skip during long break
- Verify session counter is maintained

---

### Feature 2.5: Sound Options
**Priority:** Medium  
**Effort:** Medium (2 days)  
**Dependencies:** None

#### Description
Provide multiple notification sounds and volume control.

#### Acceptance Criteria
- [ ] 3-5 different notification sounds
- [ ] Sound preview in settings
- [ ] Volume slider (0-100%)
- [ ] Mute option
- [ ] Preferences persist

#### Technical Implementation

**New Files:**
- `src/utils/sounds.ts` - Sound library with Web Audio API

**Modified Files:**
- `src/utils/audio.ts` - Refactor to support multiple sounds
- `src/components/Settings.tsx` - Add sound settings
- `src/hooks/useSettings.ts` - Add sound preferences

**Implementation Steps:**
1. Create multiple sound generators with Web Audio API:
   - Chime (current)
   - Bell
   - Beep
   - Piano
   - Gentle tone
2. Add volume control to playNotification
3. Add settings UI with sound preview buttons
4. Save preferences to localStorage

**Testing Requirements:**
- Test all sound variations
- Test volume control
- Test mute functionality

---

### Feature 2.6: Dark/Light Mode
**Priority:** Medium  
**Effort:** Medium (1-2 days)  
**Dependencies:** None

#### Description
Theme toggle for dark and light modes.

#### User Story
As a user, I want a dark mode option to reduce eye strain in low-light environments.

#### Acceptance Criteria
- [ ] Toggle button in header
- [ ] Dark theme with appropriate colors
- [ ] Respects system preference on first load
- [ ] Preference persists
- [ ] Smooth transition between themes
- [ ] All components styled for both themes

#### Technical Implementation

**Modified Files:**
- `tailwind.config.js` - Enable dark mode
- `src/App.tsx` - Add theme toggle
- All component files - Add dark mode classes

**Implementation Steps:**
1. Enable Tailwind dark mode: `darkMode: 'class'`
2. Create `useTheme` hook:
   ```typescript
   const { theme, toggleTheme } = useTheme();
   // theme: 'light' | 'dark' | 'system'
   ```
3. Add `dark:` classes to all components
4. Add toggle button with sun/moon icon
5. Save preference to localStorage

**Color Scheme (Dark Mode):**
- Background: `bg-gray-900`
- Card: `bg-gray-800`
- Text: `text-gray-100`
- Work: `text-red-400`
- Short break: `text-green-400`
- Long break: `text-blue-400`

**Testing Requirements:**
- Test theme toggle
- Test system preference detection
- Test all components in dark mode
- Test persistence

---

### V2.0 Technical Debt
- [ ] Add unit tests (React Testing Library)
  - Test components in isolation
  - Test custom hooks
  - Target: 80% coverage
  
- [ ] Add E2E tests (Playwright)
  - Full timer flow test
  - Settings flow test
  - Notification test
  
- [ ] Improve accessibility
  - Add ARIA labels
  - Keyboard navigation
  - Screen reader support
  - Focus management
  
- [ ] Performance optimization
  - Lazy load settings modal
  - Memoize expensive calculations
  - Reduce re-renders

---

## 📊 V3.0 - Productivity Suite
**Planned Release:** Q2 2026  
**Status:** Planning  
**Priority:** Medium  
**Estimated Effort:** 4-6 weeks

### Features Overview
Focus: Transform from timer to full productivity tool with analytics and task management.

---

### Feature 3.1: Task Management
**Priority:** High  
**Effort:** Large (1-2 weeks)  
**Dependencies:** None

#### Description
Add task list functionality to associate Pomodoros with specific tasks.

#### User Story
As a user, I want to create tasks and track which Pomodoros are spent on each task to measure my productivity.

#### Acceptance Criteria
- [ ] Add, edit, delete tasks
- [ ] Associate current Pomodoro with a task
- [ ] Mark tasks as complete
- [ ] Show task list with Pomodoro count
- [ ] Task persistence (localStorage initially)
- [ ] Drag to reorder tasks
- [ ] Task categories/tags (optional)

#### Technical Implementation

**New Files:**
- `src/components/TaskList.tsx` - Task list component
- `src/components/TaskItem.tsx` - Individual task
- `src/components/AddTaskForm.tsx` - Add task form
- `src/hooks/useTasks.ts` - Task state management
- `src/types/task.ts` - Task type definitions

**Modified Files:**
- `src/App.tsx` - Add task panel
- `src/hooks/useTimer.ts` - Link to active task

**Data Structure:**
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  pomodorosCompleted: number;
  pomodorosEstimated: number;
  createdAt: number;
  completedAt?: number;
  tags?: string[];
}
```

**Implementation Steps:**
1. Create task CRUD operations
2. Add task list UI (sidebar or bottom panel)
3. Add "active task" selector during timer
4. Increment task pomodoro count on work completion
5. Add task completion checkbox
6. Persist tasks to localStorage
7. Add drag-and-drop reordering (react-dnd or dnd-kit)

**Testing Requirements:**
- Test CRUD operations
- Test Pomodoro counting
- Test persistence
- E2E test for full task workflow

---

### Feature 3.2: Statistics Dashboard
**Priority:** High  
**Effort:** Large (1 week)  
**Dependencies:** Task Management (optional)

#### Description
Visual dashboard showing productivity statistics and trends.

#### User Story
As a user, I want to see my productivity statistics to understand my work patterns and stay motivated.

#### Acceptance Criteria
- [ ] Today's completed Pomodoros
- [ ] This week's completed Pomodoros
- [ ] Monthly view with calendar heatmap
- [ ] Current streak counter
- [ ] Longest streak
- [ ] Total productive time
- [ ] Average Pomodoros per day
- [ ] Charts/graphs
- [ ] Task breakdown (if tasks enabled)

#### Technical Implementation

**New Files:**
- `src/components/Stats.tsx` - Stats dashboard
- `src/components/StatsCard.tsx` - Individual stat card
- `src/components/StreakCalendar.tsx` - Calendar heatmap
- `src/components/Charts.tsx` - Charts component
- `src/hooks/useStats.ts` - Stats calculation
- `src/types/stats.ts` - Stats type definitions

**Dependencies:**
- Chart library: `recharts` or `chart.js`
- Calendar: `react-calendar` or custom

**Data Structure:**
```typescript
interface DailyStats {
  date: string; // YYYY-MM-DD
  workSessionsCompleted: number;
  shortBreaksCompleted: number;
  longBreaksCompleted: number;
  totalMinutes: number;
  taskBreakdown?: { taskId: string; count: number }[];
}
```

**Implementation Steps:**
1. Track completed sessions in localStorage
2. Create stats calculation hook
3. Build dashboard UI with cards
4. Implement streak calculation
5. Add calendar heatmap
6. Add charts (bar, line, pie)
7. Export stats functionality

**Testing Requirements:**
- Test stats calculations
- Test with various date ranges
- Test streak logic

---

### Feature 3.3: Advanced Settings
**Priority:** Medium  
**Effort:** Medium (3-4 days)  
**Dependencies:** V2.0 Settings

#### Description
Additional configuration options for power users.

#### Acceptance Criteria
- [ ] Auto-start next session toggle
- [ ] Auto-start breaks toggle
- [ ] Configurable long break interval (4-8 sessions)
- [ ] Notification settings (sound, desktop, timing)
- [ ] Data management (export, import, clear)
- [ ] Keyboard shortcuts configuration

#### Technical Implementation

**Modified Files:**
- `src/components/Settings.tsx` - Expand settings
- `src/hooks/useSettings.ts` - Add new settings
- `src/hooks/useTimer.ts` - Implement auto-start

**New Settings:**
```typescript
interface AdvancedSettings {
  autoStartNextSession: boolean;
  autoStartBreaks: boolean;
  longBreakInterval: number; // 4-8
  notifyBeforeEnd: number; // seconds (0 = disabled)
  keyboardShortcuts: {
    startPause: string;
    reset: string;
    skip: string;
  };
}
```

**Implementation Steps:**
1. Add settings UI with toggles
2. Implement auto-start logic
3. Add keyboard shortcut listener
4. Add customizable long break interval
5. Add pre-notification (X seconds before end)

---

### Feature 3.4: Data Export/Import
**Priority:** Low  
**Effort:** Medium (2-3 days)  
**Dependencies:** Task Management, Statistics

#### Description
Export and import data for backup and portability.

#### Acceptance Criteria
- [ ] Export all data to JSON
- [ ] Export stats to CSV
- [ ] Import data from JSON
- [ ] Merge or replace on import
- [ ] Clear all data option with confirmation
- [ ] Automatic backup option

#### Technical Implementation

**New Files:**
- `src/utils/export.ts` - Export utilities
- `src/utils/import.ts` - Import utilities

**Modified Files:**
- `src/components/Settings.tsx` - Add export/import UI

**Implementation Steps:**
1. Create export functions (JSON, CSV)
2. Create import with validation
3. Add download/upload buttons
4. Add data merge logic
5. Add clear data with confirmation

**Data Format:**
```json
{
  "version": "3.0",
  "exportDate": "2026-01-15",
  "settings": { ... },
  "tasks": [ ... ],
  "stats": { ... }
}
```

---

## 💡 Future Ideas (Backlog)
**No timeline assigned - Ideas for V4.0+**

### High-Level Concepts
- [ ] **Mobile App** (React Native)
  - Native iOS/Android apps
  - Sync with web version
  - Background timers
  - Native notifications

- [ ] **Browser Extension**
  - Chrome/Firefox/Edge extension
  - Quick timer in toolbar
  - Website blocking during work sessions
  - Integration with task management

- [ ] **Team/Collaborative Features**
  - Share timer with team
  - Group Pomodoro sessions
  - Team statistics
  - Accountability features

- [ ] **Integration with Other Tools**
  - Google Calendar integration
  - Todoist/Trello sync
  - Slack notifications
  - API for third-party integrations

- [ ] **Gamification**
  - Achievement badges
  - Level system
  - Challenges
  - Leaderboards (optional)

- [ ] **Advanced Analytics**
  - Productivity insights (AI-powered)
  - Best productivity time detection
  - Focus score
  - Recommendations

- [ ] **Content During Sessions**
  - Background music/sounds
  - Focus music integration (Spotify, etc.)
  - White noise generator
  - Ambient sounds

- [ ] **Customization**
  - Custom color themes
  - Custom timer faces
  - Custom notification sounds (upload)
  - Font size adjustments

- [ ] **Educational Features**
  - Pomodoro technique tutorials
  - Productivity tips
  - Focus techniques guide
  - Onboarding flow for new users

- [ ] **Offline Support**
  - Progressive Web App (PWA)
  - Service Worker for offline functionality
  - Offline data sync

---

## 🔄 Version History

### V1.0 - October 2025
**Focus:** MVP with core Pomodoro functionality

**Major Features:**
- Basic timer (25/5/15 fixed durations)
- Start/Pause/Reset controls
- Session tracking
- Audio notifications
- Responsive UI

**Tech Stack:**
- React 19 + TypeScript
- Vite
- Tailwind CSS
- Web Audio API

**Lines of Code:** ~500
**Components:** 3
**Hooks:** 1

---

## 📖 Implementation Guidelines

### For AI Agents

When implementing features from this roadmap:

1. **Read the full feature specification** including acceptance criteria
2. **Check dependencies** - ensure prerequisite features are complete
3. **Follow the technical implementation** section
4. **Update existing files** as specified in "Modified Files"
5. **Create new files** as specified in "New Files"
6. **Build and verify** - run `npm run build` to check for errors
7. **Test with Chrome DevTools MCP** - use automated browser testing (see `MCP_TESTING_WORKFLOW.md`)
8. **Create test report** - document test results with screenshots
9. **Update this roadmap** - mark features complete with checkmarks
10. **Update CHANGELOG.md** with changes
11. **Consider backwards compatibility** with existing data

### Testing Checklist
- [x] TypeScript compilation passes
- [x] Production build successful
- [x] **MCP automated testing** (Chrome DevTools MCP)
- [x] Visual verification with screenshots
- [x] Console error checking
- [x] Functional testing (all interactions)
- [x] Persistence testing (localStorage)
- [ ] Accessibility testing (keyboard nav, screen readers)
- [ ] Mobile responsive testing
- [ ] Cross-browser testing (Firefox, Safari, Edge)

**New:** See `MCP_TESTING_WORKFLOW.md` for automated browser testing workflow

### Documentation Updates
After implementing a feature, update:
- [ ] README.md (if public API changes)
- [ ] CHANGELOG.md (version entry)
- [ ] This ROADMAP.md (mark complete)
- [ ] Code comments (JSDoc for public functions)

---

## 🤝 Contributing

This roadmap is a living document. If you have ideas for features or improvements:

1. Check if the idea exists in the backlog
2. Consider creating a detailed feature spec
3. Discuss feasibility and priority
4. Add to appropriate section with status "Proposed"

---

**Last Updated:** October 16, 2025  
**Next Review:** January 2026

