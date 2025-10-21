# ZenFocus Timer - Documentation

**The Original Pomodoro Timer Feature**

---

## What is ZenFocus?

ZenFocus is a modern Pomodoro timer with ambient sounds, task management, and motivational features. It helps you stay focused and productive using the Pomodoro Technique.

---

## Quick Links

### Features
- [Task Management](features/TASK_MANAGEMENT.md) - Focus priorities system
- [Audio System](features/AUDIO_SYSTEM.md) - 15 ambient sounds
- [Settings](features/ENHANCEMENT_INSTANT_SETTINGS.md) - User preferences

### Development
- [Build System](development/BUILD_SYSTEM.md) - How assets are bundled
- [Testing](development/TESTING.md) - Test strategies and reports
- [UI/UX Improvements](development/UI_UX_IMPROVEMENTS.md) - Design evolution

### Releases
- [Version 3.0](releases/V3.0.md) - Latest release (ZenFocus rebrand)
- [Version 2.0](releases/V2.0.md) - Major feature additions

---

## Core Features

### ⏱️ Pomodoro Timer
- 25-minute focus sessions
- 5-minute short breaks
- 15-minute long breaks
- Customizable durations
- Auto-start options
- Pause/resume functionality

### 🎯 Task Management
- 3 focus priorities
- Check off completed tasks
- Reset tasks for new day
- Persistent across sessions
- Edit anytime

### 🎵 Ambient Sounds
- 15 high-quality tracks
- Nature, urban, tech categories
- Volume control
- Smooth fade transitions
- Auto-resume after break

### 💬 Motivational Quotes
- Rotating inspirational quotes
- Subtle, non-distracting
- Encourages persistence
- Changes each session

### 🎨 Beautiful UI
- Glass morphism design
- Smooth animations
- Dark/light mode
- Mobile responsive
- Keyboard accessible

---

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **localStorage** - State persistence

---

## Architecture

### Component Structure

```
src/
├── components/
│   ├── Timer.tsx - Main timer display
│   ├── Controls.tsx - Start/pause/reset buttons
│   ├── SessionInfo.tsx - Current session details
│   ├── TasksModal.tsx - Priority management
│   ├── SoundsPanel.tsx - Audio selection
│   ├── SettingsPanel.tsx - User preferences
│   └── FloatingNav.tsx - Bottom navigation
├── hooks/
│   ├── useTimer.ts - Timer logic
│   ├── useSettings.ts - Settings management
│   ├── useTasks.ts - Task management
│   ├── useAudio.ts - Audio control
│   └── useTheme.ts - Theme switching
└── utils/
    └── AudioEngine.ts - Centralized audio
```

### State Management

- **React Hooks** - Local component state
- **Context** - Theme state
- **localStorage** - Persistent data
- **Custom Hooks** - Business logic

---

## Getting Started

### For Users

1. Open ZenFocus
2. Set your priorities (click edit icon)
3. Choose an ambient sound (optional)
4. Click Start to begin first Pomodoro
5. Focus for 25 minutes
6. Take a break when timer ends
7. Repeat!

### For Developers

1. Clone repository
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Build for production: `npm run build`

**See:** [Build System](development/BUILD_SYSTEM.md) for details

---

## Documentation Index

### Features (User-Facing)
- [Task Management](features/TASK_MANAGEMENT.md)
- [Audio System](features/AUDIO_SYSTEM.md)
- [Instant Settings](features/ENHANCEMENT_INSTANT_SETTINGS.md)
- [Safety Improvements](features/SAFETY_IMPROVEMENTS.md)

### Development (Technical)
- [Build System](development/BUILD_SYSTEM.md)
- [Testing Strategies](development/TESTING.md)
- [UI/UX Evolution](development/UI_UX_IMPROVEMENTS.md)

### Releases (Changelog)
- [V3.0 - ZenFocus Rebrand](releases/V3.0.md)
- [V2.0 - Enhanced Features](releases/V2.0.md)

---

## Related Documentation

**Project-Wide:**
- [Main Documentation Hub](../INDEX.md)
- [Architecture Overview](../core/ARCHITECTURE.md)
- [AI Agent Guide](../../AI_AGENT_GUIDE.md)

**Kamehameha Feature:**
- [Kamehameha Overview](../kamehameha/OVERVIEW.md)

---

## Version History

- **V3.0 (Oct 2025):** ZenFocus rebrand, UI overhaul, task management
- **V2.0 (Oct 2025):** Audio system, enhanced features
- **V1.0 (Initial):** Basic Pomodoro timer

---

## Contributing

This is part of a larger dual-feature app (ZenFocus Timer + Kamehameha Recovery Tool).

**See main project documentation for:**
- Development guidelines
- Code style
- Testing requirements
- Contribution process

---

**ZenFocus: Focus Better, Work Smarter** ⚡

