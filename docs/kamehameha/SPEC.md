# Kamehameha - Complete Specification

**Last Updated:** October 22, 2025  
**Version:** 1.2  
**Status:** Phases 1-4 Complete

## Document Purpose

This document provides complete requirements for the Kamehameha PMO recovery tool. It includes:
- Feature specifications
- User flows
- UI descriptions
- Acceptance criteria
- Success metrics

## Implementation Status

**✅ Completed (Phases 1-4):**
- Feature 1: Dual Streak Tracking (Phase 2)
- Feature 2: Check-In System (Phase 3)
- Feature 3: Relapse Tracking (Phase 3)
- Feature 4: AI Therapist Chat (Phase 4)
- Firebase Authentication with Dev Login
- Firebase Cloud Functions
- OpenAI GPT-4 integration
- Real-time Firestore integration
- Glass morphism UI with dark mode

**🔜 Next (Phase 5):**
- Feature 5: Milestones & Gamification
- Badge system
- Progress visualization

**⏳ Future Phases:**
- Feature 6: Configuration & Settings (Phase 6)
- Additional: History view UI (not assigned to specific phase yet)
- Additional: AI config UI (deferred to Phase 6)
- Additional: Performance & Polish (Phase 6)

## Notable Implementation Deviations

**Feature 1 UI Change (Phase 3):**
- **Spec:** Dual streak cards side-by-side
- **Actual:** Single timer with tab switching
- **Reason:** User feedback - dual cards were "overwhelming". Single focused display is cleaner and matches Pomodoro timer aesthetic.
- **Impact:** None - all functionality preserved, improved UX

**Feature 2 & 3 History Views (Phase 3):**
- **Spec:** View check-in and relapse history
- **Actual:** History CRUD in backend, UI deferred to future phase
- **Reason:** Focus on core functionality first. History view UI not critical for MVP.
- **Impact:** Data is saved and accessible via Firestore, just no UI yet. Could be added in Phase 5 or 6.

**All other requirements implemented as specified.**

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [User Personas](#user-personas)
3. [Core Features](#core-features)
4. [User Interface Specifications](#user-interface-specifications)
5. [User Flows](#user-flows)
6. [Acceptance Criteria](#acceptance-criteria)
7. [Success Metrics](#success-metrics)

---

## Feature Overview

### Vision

Kamehameha provides a comprehensive, compassionate recovery companion for individuals overcoming PMO addiction. It combines streak tracking, AI-powered support, structured reflection, and gamification to support long-term recovery.

### Goals

1. **Support Recovery** - Provide tools and encouragement for staying clean
2. **Prevent Relapse** - Identify patterns and early warning signs
3. **Reduce Shame** - Structured, non-judgmental approach to setbacks
4. **Build Habits** - Daily check-ins and consistent engagement
5. **Provide Support** - AI therapist available 24/7

### Non-Goals

- Not a replacement for professional therapy
- Not a medical diagnosis tool
- Not a social network or community platform (initially)
- Not for tracking other addictions (focused on PMO)

---

## User Personas

### Primary: Recovery Seeker

**Profile:**
- Age: 18-35 (primary), all ages welcome
- Gender: All genders
- Stage: Early to mid recovery (0-90 days typical)
- Tech: Comfortable with web apps, uses Google account

**Needs:**
- Daily accountability and tracking
- Support during difficult moments
- Non-judgmental space for reflection
- Motivation through progress visualization
- Privacy and confidentiality

**Pain Points:**
- Shame and guilt about relapses
- Lack of support system
- Difficulty identifying triggers
- Losing track of progress
- Expensive or inaccessible therapy

### Secondary: Long-term Maintainer

**Profile:**
- Age: 25-45
- Gender: All genders
- Stage: 90+ days clean
- Tech: Regular app users

**Needs:**
- Continued motivation
- Tools to prevent complacency
- Long-term progress tracking
- Occasional support during stress

**Pain Points:**
- Boredom with simple streak tracking
- Need for deeper insights
- Risk of relapse during stress
- Lack of long-term milestones

---

## Core Features

### Feature 1: Dual Streak Tracking

#### Requirements

**FR-1.1: Main Streak Timer**
<!-- IMPLEMENTED: Phase 2, October 21, 2025 -->
- Display live countdown: `15d 4h 23m 15s` ✅
- Update every second ✅
- Show current streak and longest streak ✅
- Reset only when user marks full PMO relapse (Phase 3)
- Persist across sessions and devices ✅
- Visible on badge and dashboard ✅

**FR-1.2: Discipline Streak Timer**
<!-- IMPLEMENTED: Phase 2, October 21, 2025 -->
- Separate timer for rule violations ✅
- Same format as main streak ✅
- Reset when user marks any rule violation (Phase 3)
- Track longest discipline streak ✅
- Display prominently on dashboard ✅

**FR-1.3: Streak Badge (Always Visible)**
<!-- IMPLEMENTED: Phase 2, October 21, 2025 -->
<!-- CHANGED: Icon from 🛡️ to 🔥 for better thematic fit with "Kamehameha" -->
- Format: `🔥 15d 4h 23m 15s` (shows main streak)
- Fixed position: top-left (chosen from spec options)
- Visible on both /timer and /kamehameha pages ✅
- Only shown when user is authenticated ✅
- Non-interactive (display only) ✅
- Updates every second ✅

**FR-1.4: Streak History**
<!-- PARTIALLY IMPLEMENTED: Backend complete, UI future -->
- Store all past streaks ✅ (via relapse history in Firestore)
- Track reset events ✅ (relapse documents record resets)
- Calculate statistics (average streak, total days clean) - Future
- Display streak chart/graph - Phase 5: Gamification (StreakChart component)

#### UI Specification

<!-- ACTUAL IMPLEMENTATION (Phase 3): Single timer with tabs -->
**Dashboard Timer Display (As Implemented):**

```
┌───────────────────────────────────┐
│  [🏆 Main Streak]  [⚡ Discipline] │ ← Tabs
│                                   │
│     0 : 00 : 32 : 17             │ ← D:HH:MM:SS
│    (Large, centered display)      │
│                                   │
│  Current: 0 days  Longest: 0 days │
│                                   │
│  [📝 Daily Check-In]              │
│  [⚠️ Report Relapse]              │
└───────────────────────────────────┘
```

**Original Spec (For Reference):**
```
┌───────────────────────────────────┐
│    🏆 MAIN STREAK                 │
│  15 days 4 hours 23 min 42 sec    │
│     Longest: 45 days              │
│  Next milestone: 30 days (15d)    │
│  ▓▓▓▓▓░░░░░░░░░░░░░░░ 50%        │
└───────────────────────────────────┘
```

**Implementation Notes:**
- Changed from dual-card to single timer with tab switching
- User feedback: dual cards were "overwhelming"
- Cleaner, more focused UI matching Pomodoro timer style
- Large `D:HH:MM:SS` format for easy reading
- Tabs allow switching between Main/Discipline streaks
- Progress bars deferred to Phase 5 (Milestones)

**Styling:**
- Purple gradient background
- Large, prominent numbers (6xl → 9xl responsive)
- Tab-based switching with active state
- Smooth animations on updates
- Mobile responsive

#### Acceptance Criteria

<!-- PHASES 2-3 COMPLETE: October 21, 2025 -->
- [x] Main streak timer displays accurately ✅
- [x] Discipline streak timer displays independently ✅
- [x] Badge visible on both pages when authenticated ✅
- [x] Timers update every second ✅
- [x] Longest streaks preserved after reset ✅
- [ ] Progress bars show correct percentage to next milestone (Phase 5: Gamification - ProgressBar component)
- [x] Data persists across sessions ✅
- [x] Data syncs across devices in real-time ✅

---

### Feature 2: Check-In System

#### Requirements

**FR-2.1: Check-In Modal**
<!-- IMPLEMENTED: Phase 3, October 21, 2025 -->
- User-initiated (not scheduled reminders) ✅
- Accessible from dashboard "Check In" button ✅
- Modal or full-screen form ✅
- All fields optional except timestamp ✅

**FR-2.2: Check-In Fields**
<!-- IMPLEMENTED: Phase 3, October 21, 2025 -->
- **Timestamp:** Auto-filled (read-only) ✅
- **Mood:** 5 emoji buttons (😢 😕 😐 🙂 😊) ✅
- **Urge Intensity:** Slider 0-10 with labels ✅
- **Triggers:** Multi-select checkboxes ✅
- **Journal Entry:** Textarea, unlimited length ✅

**FR-2.3: Trigger Options**
<!-- IMPLEMENTED: Phase 3, October 21, 2025 -->
- Stress ✅
- Boredom ✅
- Loneliness ✅
- Anger ✅
- Tired/Fatigue ✅
- Other (with text input) ✅

**FR-2.4: Journal Entry**
- Rich text optional (future)
- Character count display
- Auto-save draft (future)
- Optional tags (future)

**FR-2.5: Check-In History**
<!-- NOT IMPLEMENTED: Future feature - not assigned to specific phase yet -->
<!-- Data is saved to Firestore, just need to build the UI -->
- View all past check-ins
- Filter by date range
- Search journal entries
- See mood/urge trends over time

#### UI Specification

**Check-In Modal:**

```
┌────────────────────────────────────┐
│  Check In                    [×]   │
├────────────────────────────────────┤
│  October 21, 2025 - 2:30 PM       │
│                                    │
│  How are you feeling?              │
│  😢  😕  😐  🙂  😊               │
│  [Select mood]                     │
│                                    │
│  Urge intensity                    │
│  0 ════●═════════ 10              │
│  None           Extreme            │
│                                    │
│  Triggers experienced?             │
│  ☐ Stress   ☐ Boredom             │
│  ☐ Loneliness ☐ Anger             │
│  ☐ Tired    ☐ Other: _____        │
│                                    │
│  Journal (optional)                │
│  ┌────────────────────────────┐   │
│  │                            │   │
│  │                            │   │
│  │                            │   │
│  └────────────────────────────┘   │
│  0 characters                      │
│                                    │
│     [Cancel]  [Submit Check-In]    │
└────────────────────────────────────┘
```

**Styling:**
- Clean, uncluttered layout
- Large touch targets (mobile-friendly)
- Smooth animations
- Dark mode support

#### Acceptance Criteria

<!-- PHASE 3 COMPLETE: October 21, 2025 -->
- [x] Check-in modal opens from dashboard button ✅
- [x] All fields work correctly (mood, slider, checkboxes, textarea) ✅
- [x] Timestamp auto-fills with current date/time ✅
- [x] Submitting saves to Firestore ✅
- [ ] Can view check-in history (Future: History view UI - not assigned to specific phase yet)
- [ ] Trends visible over time (Phase 5: Gamification - StreakChart component)
- [x] Works on mobile and desktop ✅

---

### Feature 3: Relapse Tracking

#### Requirements

**FR-3.1: Relapse Flow - Multi-Step Modal**
<!-- IMPLEMENTED: Phase 3, October 21, 2025 -->
- Accessible from "Report Relapse" button (warning styling) ✅
- 4-step wizard interface ✅
- Can go back to previous steps ✅
- Can cancel at any time ✅

**FR-3.2: Step 1 - Type Selection**
<!-- IMPLEMENTED: Phase 3, October 21, 2025 -->
- Two options:
  - **Full PMO** (Main Streak Reset) ✅
  - **Rule Violation** (Discipline Streak Reset) ✅
- Clear explanation of consequences ✅
- Radio button selection ✅

**FR-3.3: Step 2 - Reason Selection** (if Rule Violation)
<!-- IMPLEMENTED: Phase 3, October 21, 2025 -->
- Checklist of customizable rules (defaults used) ✅
- Default rules:
  - Viewed pornography ✅
  - Used AI sex chatbot ✅
  - Generated AI softcore porn ✅
  - Consumed text/audio erotica ✅
  - TikTok/social media triggers ✅
- Multiple reasons can be selected ✅
- "Other" with text input ✅

**FR-3.4: Step 3 - Reflection**
<!-- IMPLEMENTED: Phase 3, October 21, 2025 -->
- Two prompts with textareas:
  - "What led to this moment?" ✅
  - "What will you do differently next time?" ✅
- Encourages learning, not shame ✅
- Optional but strongly encouraged ✅

**FR-3.5: Step 4 - Confirmation**
<!-- IMPLEMENTED: Phase 3, October 21, 2025 -->
- Shows:
  - Type of relapse ✅
  - Previous streak length ✅
  - Which streak will reset ✅
  - Motivational message ✅
- Final confirmation required ✅
- "Cancel" and "Confirm Reset" buttons ✅

**FR-3.6: Post-Relapse**
<!-- IMPLEMENTED: Phase 3, October 21, 2025 -->
- Appropriate streak resets to 0 ✅
- Longest streak preserved ✅
- Relapse saved to history ✅
- AI therapist notified (context updated) - Phase 4
- Optional: Celebratory message for honesty ✅

#### UI Specification

**Step 1 - Type Selection:**

```
┌────────────────────────────────────┐
│  Mark Relapse                 [×]  │
├────────────────────────────────────┤
│  What happened?                    │
│                                    │
│  ○ Full PMO                        │
│    (Main Streak will reset)        │
│                                    │
│  ○ Rule Violation                  │
│    (Discipline Streak will reset)  │
│                                    │
│         [Cancel]  [Next →]         │
└────────────────────────────────────┘
```

**Step 2 - Reasons:**

```
┌────────────────────────────────────┐
│  Mark Relapse            Step 2/4  │
├────────────────────────────────────┤
│  What rules did you violate?       │
│  (Select all that apply)           │
│                                    │
│  ☐ Viewed pornography              │
│  ☐ Used AI sex chatbot             │
│  ☐ Generated AI softcore porn      │
│  ☐ Consumed text/audio erotica     │
│  ☐ TikTok/social media triggers    │
│  ☐ Other: ___________________      │
│                                    │
│       [← Back]  [Cancel]  [Next →] │
└────────────────────────────────────┘
```

**Step 3 - Reflection:**

```
┌────────────────────────────────────┐
│  Mark Relapse            Step 3/4  │
├────────────────────────────────────┤
│  What led to this moment?          │
│  ┌────────────────────────────┐   │
│  │                            │   │
│  │                            │   │
│  └────────────────────────────┘   │
│                                    │
│  What will you do differently?     │
│  ┌────────────────────────────┐   │
│  │                            │   │
│  │                            │   │
│  └────────────────────────────┘   │
│                                    │
│       [← Back]  [Cancel]  [Next →] │
└────────────────────────────────────┘
```

**Step 4 - Confirmation:**

```
┌────────────────────────────────────┐
│  Mark Relapse            Step 4/4  │
├────────────────────────────────────┤
│  Resetting Discipline Streak       │
│                                    │
│  Your previous streak: 12 days     │
│  Longest streak: 30 days (saved)   │
│                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                    │
│  This is okay. Recovery is a       │
│  journey, not a destination.       │
│  You're being honest with yourself │
│  and that takes courage.           │
│                                    │
│     [← Back]  [Cancel]             │
│           [Confirm Reset]          │
└────────────────────────────────────┘
```

#### Acceptance Criteria

<!-- PHASE 3 COMPLETE: October 21, 2025 -->
- [x] Multi-step wizard navigable with back/next ✅
- [x] Type selection determines which streak resets ✅
- [ ] Reasons customizable from settings (Phase 6: Polish - using defaults)
- [x] Reflection prompts save to database ✅
- [x] Confirmation shows correct information ✅
- [x] Appropriate streak resets on confirmation ✅
- [x] Longest streak preserved ✅
- [x] Relapse saved to history with all details ✅
- [x] Can cancel at any step without saving ✅

---

### Feature 4: AI Therapist Chat

#### Requirements

**FR-4.1: Chat Interface**
- Full-page or slide-out chat UI
- WhatsApp/iMessage style bubbles
- User messages on right, AI on left
- Real-time message streaming
- Loading indicator while AI responds
- Auto-scroll to latest message

**FR-4.2: Message Sending**
- Text input with send button
- Enter key sends message
- Shift+Enter for new line
- Character limit: 2000 per message
- Cannot send empty messages

**FR-4.3: Emergency Mode**
- Prominent 🚨 button in header
- When clicked:
  - Adds emergency flag to context
  - AI responds with immediate support
  - Prioritizes grounding techniques
  - Suggests breathing exercises

**FR-4.4: Context Building**
- Server-side only (Cloud Functions)
- Includes:
  - Custom system prompt
  - Current streaks (main & discipline)
  - Recent check-ins (last 7 days)
  - Recent relapses (if any)
  - Last 10 chat messages
  - Emergency flag (if active)

**FR-4.5: Chat History**
- All messages saved to Firestore
- Infinite scroll to load older messages
- Can delete individual messages
- Can clear entire history
- Export chat history (future)

**FR-4.6: System Prompt Management**
- Editable in settings
- Default template provided
- Preview mode to test prompts
- Validation (max length, content)
- Reset to default option

#### UI Specification

**Chat Page:**

```
┌────────────────────────────────────┐
│  [← Back]  AI Therapist      [🚨]  │
├────────────────────────────────────┤
│                                    │
│  ┌──────────────────────┐         │
│  │ Hello! How can I     │ AI      │
│  │ support you today?   │         │
│  └──────────────────────┘         │
│                                    │
│         ┌────────────────────┐    │
│    User │ Feeling urges...   │    │
│         └────────────────────┘    │
│                                    │
│  ┌──────────────────────────┐     │
│  │ I understand. Let's      │ AI  │
│  │ talk through this...     │     │
│  └──────────────────────────┘     │
│                                    │
├────────────────────────────────────┤
│  [Type your message...]     [Send] │
└────────────────────────────────────┘
```

**Emergency Mode Active:**

```
┌────────────────────────────────────┐
│  [← Back]  AI Therapist  [🚨 ON]   │
│  ⚠️ Emergency Support Active       │
├────────────────────────────────────┤
│  ┌──────────────────────────┐     │
│  │ I'm here for you. Let's  │ AI  │
│  │ focus on breathing...    │     │
│  └──────────────────────────┘     │
│                                    │
│  Breathing Exercise:               │
│  ┌────────────────────────┐       │
│  │  In... Hold... Out...  │       │
│  │  [Visual guide here]   │       │
│  └────────────────────────┘       │
└────────────────────────────────────┘
```

#### Acceptance Criteria

- [ ] Chat interface displays correctly
- [ ] Messages send and receive in real-time
- [ ] User and AI messages visually distinct
- [ ] Emergency button activates special mode
- [ ] Context includes relevant user data
- [ ] Chat history persists and scrolls
- [ ] Can delete messages and clear history
- [ ] System prompt editable in settings
- [ ] Works on mobile and desktop
- [ ] Loading states during API calls

---

### Feature 5: Milestones & Gamification

#### Requirements

**FR-5.1: Milestone Tiers**
- Predefined milestone levels:
  - 1, 3, 7, 14, 30, 60, 90, 180, 365 days
- Each tier has:
  - Name (e.g., "One Week Warrior")
  - Badge emoji (e.g., ⚔️)
  - Congratulatory message
- Milestones for both streaks

**FR-5.2: Milestone Detection**
- Automatic detection when streak reaches milestone
- Firestore Cloud Function trigger (optional)
- Client-side detection backup
- Award badge immediately

**FR-5.3: Celebration Animation**
- Confetti animation (canvas-confetti)
- Modal with badge display
- Congratulatory message
- Option to share (future)
- Sound effect (optional)

**FR-5.4: Badge Gallery**
- Display all earned badges
- Show locked future badges
- Badge details on hover/click
- Sort by date earned
- Filter by streak type

**FR-5.5: Progress Visualization**
- Progress bar to next milestone
- Percentage complete
- Days remaining
- Streak chart/graph over time

#### UI Specification

**Milestone Celebration Modal:**

```
┌────────────────────────────────────┐
│                                    │
│          🎉 CONGRATS! 🎉           │
│                                    │
│              ⚔️                    │
│       One Week Warrior!            │
│                                    │
│   You've reached 7 days clean!    │
│   Your dedication is inspiring.    │
│                                    │
│       [Share]     [Close]          │
│                                    │
└────────────────────────────────────┘
```

**Badge Gallery:**

```
┌────────────────────────────────────┐
│  Earned Badges                     │
├────────────────────────────────────┤
│  🌱 First Step       ✓ Day 1      │
│  💪 Building Momentum ✓ Day 3     │
│  ⚔️ One Week Warrior  ✓ Day 7     │
│  🏆 Two Week Champion ✓ Day 14    │
│  👑 Monthly Master    ⏳ 15 days  │
│  🌟 Two Month Legend  🔒 Locked   │
│  ...                               │
└────────────────────────────────────┘
```

#### Acceptance Criteria

- [ ] Milestones automatically detected
- [ ] Celebration modal appears at milestone
- [ ] Confetti animation plays
- [ ] Badge saved to user profile
- [ ] Badge gallery displays correctly
- [ ] Progress bars show accurate percentage
- [ ] Works for both main and discipline streaks
- [ ] Locked badges shown but disabled

---

### Feature 6: Configuration & Settings

#### Requirements

**FR-6.1: Settings Panel**
- Accessible from FloatingNav or page header
- Slide-out panel or modal
- Organized sections

**FR-6.2: AI Configuration**
- Edit system prompt (large textarea)
- Model selection (GPT-4, GPT-5)
- Temperature slider (future)
- Reset to default prompt

**FR-6.3: Rules Management**
- View current rules list
- Add new rules
- Edit existing rules
- Delete rules
- Reorder rules (drag-and-drop, future)
- Reset to default rules

**FR-6.4: Data Management**
- Export all data (JSON download)
- Import data from backup (future)
- Clear all data (with confirmation)
- Delete account (with confirmation)

**FR-6.5: Privacy Settings**
- Badge visibility toggle (future)
- Notification preferences (future)
- Data sharing preferences (future)

#### UI Specification

**Settings Panel:**

```
┌────────────────────────────────────┐
│  [← Back]  Kamehameha Settings     │
├────────────────────────────────────┤
│                                    │
│  ▼ AI Therapist                    │
│    System Prompt                   │
│    ┌────────────────────────┐     │
│    │ You are a compassionate│     │
│    │ recovery therapist...  │     │
│    └────────────────────────┘     │
│    [Reset to Default]              │
│                                    │
│  ▼ Rules & Violations              │
│    1. Viewed pornography  [Edit]   │
│    2. AI sex chatbot      [Edit]   │
│    3. Generated content   [Edit]   │
│    [+ Add Rule]                    │
│    [Reset to Default Rules]        │
│                                    │
│  ▼ Data & Privacy                  │
│    [Export All Data]               │
│    [Clear All Data]                │
│    [Delete Account]                │
│                                    │
└────────────────────────────────────┘
```

#### Acceptance Criteria

- [ ] Settings panel accessible and organized
- [ ] System prompt editable and saveable
- [ ] Rules can be added, edited, deleted
- [ ] Data export downloads JSON file
- [ ] Clear data requires confirmation
- [ ] Delete account removes all data
- [ ] Reset options restore defaults

---

## User Flows

### Flow 1: First Time User Setup

1. User clicks 🛡️ Kamehameha in FloatingNav
2. Redirected to /login (not authenticated)
3. Sees "Sign in with Google to access Kamehameha"
4. Clicks "Sign in with Google"
5. Google OAuth popup
6. User authorizes
7. Redirected to /kamehameha
8. Sees empty dashboard with onboarding prompts:
   - "Welcome! Your streaks start now."
   - "Start with your first check-in"
9. Streaks automatically start counting
10. Optional onboarding tour (future)

### Flow 2: Daily Check-In

1. User navigates to /kamehameha
2. Sees current streaks on dashboard
3. Clicks "Check In" button
4. Modal opens with check-in form
5. Selects mood: 🙂
6. Adjusts urge slider: 3/10
7. Checks triggers: "Stress"
8. Writes optional journal entry
9. Clicks "Submit Check-In"
10. Modal closes
11. Check-in saved to Firestore
12. Activity feed updates
13. Success message briefly appears

### Flow 3: Using AI Therapist During Urges

1. User feeling strong urges
2. Navigates to /kamehameha
3. Clicks "AI Therapist" button
4. Chat page opens
5. Clicks 🚨 emergency button
6. Types: "Having really strong urges"
7. Presses Enter to send
8. AI responds within 2-3 seconds:
   - Acknowledges struggle
   - Provides grounding technique
   - Asks about triggers
   - Offers breathing exercise
9. User engages in conversation
10. Urges subside
11. User closes chat
12. Chat history saved

### Flow 4: Marking a Relapse

1. User experienced a relapse
2. Navigates to /kamehameha
3. Clicks "Mark Relapse" button (warning color)
4. Step 1: Selects "Rule Violation"
5. Clicks "Next"
6. Step 2: Checks "Viewed pornography"
7. Clicks "Next"
8. Step 3: Writes reflection:
   - "What led to this: Stayed up too late, bored"
   - "Do differently: Set bedtime alarm, use filter"
9. Clicks "Next"
10. Step 4: Reviews:
    - "Resetting Discipline Streak"
    - "Previous: 12 days"
    - "Longest: 30 days (saved)"
    - Motivational message
11. Clicks "Confirm Reset"
12. Discipline streak resets to 0
13. Main streak unaffected
14. Relapse saved to history
15. User sees dashboard with reset streak
16. Optional: Encouraged to check in or chat with AI

### Flow 5: Reaching a Milestone

1. User's main streak reaches 7 days
2. Automatic detection triggers
3. Confetti animation plays
4. Celebration modal appears:
   - "🎉 CONGRATS! 🎉"
   - "⚔️ One Week Warrior!"
   - "You've reached 7 days clean!"
   - Motivational message
5. User clicks "Close"
6. Badge saved to profile
7. Badge appears in gallery
8. Dashboard shows progress to next milestone (14 days)

---

## Acceptance Criteria

### Minimum Viable Product (MVP)

**Must Have:**
- [ ] Google Authentication working
- [ ] Dual streak timers (main & discipline) accurate
- [ ] Streak badge visible on all pages
- [ ] Check-in system functional
- [ ] Relapse tracking with 4-step flow
- [ ] AI chat with basic context
- [ ] Milestones detection and celebration
- [ ] Settings panel for AI prompt and rules
- [ ] Data export functionality
- [ ] Firestore security rules configured
- [ ] Mobile responsive
- [ ] Dark mode support

**Should Have:**
- [ ] Check-in history view
- [ ] Badge gallery
- [ ] Progress visualizations
- [ ] Emergency mode in chat
- [ ] Streak chart/graph
- [ ] Clear data functionality
- [ ] Delete account functionality

**Nice to Have:**
- [ ] Notification system
- [ ] Sharing achievements
- [ ] Accountability partners
- [ ] Advanced analytics
- [ ] Offline support

---

## Success Metrics

### User Engagement
- Daily active users (DAU)
- Check-ins per user per week
- Average session duration
- Return rate (users coming back after 7, 30, 90 days)

### Feature Usage
- Percentage using AI chat
- Average messages per chat session
- Percentage reaching milestones (7, 30, 90 days)
- Relapse tracking usage rate

### Recovery Outcomes
- Average streak length
- Percentage improving streaks over time
- Relapse frequency trends
- User-reported satisfaction (future surveys)

### Technical Metrics
- Page load time < 2 seconds
- Chat response time < 3 seconds
- Real-time sync latency < 500ms
- 99.9% uptime

---

## Technical Considerations

### Performance
- Lazy load AI chat components
- Optimize Firestore queries (pagination, indexes)
- Cache streak calculations
- Debounce real-time updates

### Security
- Firestore security rules prevent unauthorized access
- API keys never exposed to client
- Encrypt sensitive data (future)
- User data rights and controls

### Scalability
- Firebase scales automatically
- Monitor Firestore usage and costs
- Optimize Cloud Functions for cold starts
- Consider caching for read-heavy operations

### Accessibility
- Keyboard navigation
- Screen reader support
- ARIA labels
- Color contrast compliance (WCAG AA)

---

**Next Steps:**
1. Review and approve this specification
2. Read [DATA_SCHEMA.md](DATA_SCHEMA.md) for database structure
3. Read [AI_INTEGRATION.md](AI_INTEGRATION.md) for OpenAI setup
4. Begin implementation following [Implementation Plan](../../kamehameha-pmo-recovery-tool.plan.md)

