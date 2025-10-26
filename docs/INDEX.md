# ZenFocus Documentation Index

**Last Updated:** Phase 5 Planning - October 26, 2025

## 📚 API Reference

**[→ Complete API Documentation](API_REFERENCE.md)** - Hooks, services, types, and examples

## Quick Start

### For New Developers
Start with `core/ARCHITECTURE.md` to understand the overall application structure.

### For Feature Development
- **Working on Pomodoro Timer?** Go to `zenfocus/OVERVIEW.md`
- **Working on Kamehameha?** Go to `kamehameha/OVERVIEW.md`

### For AI Agents
1. Read [`.cursorrules`](../.cursorrules) (auto-loads, quick start)
2. Read [`AI_AGENT_GUIDE.md`](../AI_AGENT_GUIDE.md) (comprehensive guide)
3. Read this index for navigation
4. See [`AI_DOCUMENTATION_SYSTEM.md`](AI_DOCUMENTATION_SYSTEM.md) to understand the tiered system

---

## Documentation Structure

### `core/` - Shared Architecture
- `ARCHITECTURE.md` - Overall app architecture, routing, shared components, Firebase integration

### `zenfocus/` - Pomodoro Timer Feature (Original)
- `OVERVIEW.md` - Timer feature overview and quick links
- `features/` - Feature documentation (Task Management, Audio System, Settings)
- `releases/` - Version release notes (V2.0, V3.0)
- `development/` - Development guides (Build System, Testing, UI/UX)

### `kamehameha/` - PMO Recovery Tool (New Feature)

**Requirements & Specifications:**
- `OVERVIEW.md` - Entry point for Kamehameha feature
- `SPEC.md` - Complete requirements specification (all features, user flows)
- `DATA_SCHEMA.md` - Firestore schema and TypeScript types
- `AI_INTEGRATION.md` - OpenAI integration details
- `SECURITY.md` - Privacy and security considerations

**Implementation Resources:**
- `IMPLEMENTATION_GUIDE.md` - High-level roadmap and phase overview
- `QUICKSTART.md` - Fast-track guide for each phase
- `PROGRESS.md` - Task tracker (update as you work)
- `FILE_STRUCTURE.md` - Complete file organization reference
- `DEVELOPER_NOTES.md` - Project-specific tips and Firebase guidance
- `DOCUMENTATION_MAINTENANCE.md` - How to keep docs updated during development
- `phases/` - Detailed phase-by-phase guides (optional)

**Setup & Testing:**
- [`FIREBASE_SETUP.md`](../FIREBASE_SETUP.md) - Complete Firebase setup instructions
- [`DEV_LOGIN_GUIDE.md`](../DEV_LOGIN_GUIDE.md) - Dev Login feature for automated testing (bypasses Google OAuth)

**Phase Summaries:**
- `phase-summaries/` - Implementation plans and completion reports for each phase
  - Phase 1: Firebase Auth setup ✅
  - Phase 2: Streak tracking foundation ✅
  - Phase 3: Check-ins and relapse tracking ✅
  - Phase 4: AI therapist chat ✅
  - Phase 5: Security & production hardening (see `PHASE_5_IMPLEMENTATION_PLAN.md`)

### `tools/` - Development Tools
- MCP setup and testing workflows
- Cursor IDE configuration
- Development tool integrations

### `archive/` - Historical Documentation
- Completed bug fixes
- Old test reports
- Superseded documentation

---

## Application Overview

**ZenFocus** is a dual-purpose productivity application:

1. **Timer Feature** - Pomodoro timer with task management and ambient sounds
2. **Kamehameha Feature** - PMO recovery companion with AI therapist

Both features share:
- Navigation system (FloatingNav)
- Theme system (dark/light mode)
- React Router for page switching
- Firebase authentication

---

## Common Tasks

### Adding New Features

**To Timer:**
- Check `zenfocus/OVERVIEW.md` for current features
- Modify components in `src/components/` or `src/features/timer/`
- Document in `zenfocus/features/` directory
- Update `CHANGELOG.md`
- Test with existing features

**To Kamehameha:**
- Check current phase in `kamehameha/PROGRESS.md`
- Consult `kamehameha/QUICKSTART.md` for phase-specific steps
- Reference `kamehameha/FILE_STRUCTURE.md` for where files go
- Follow patterns in `kamehameha/SPEC.md` for requirements
- Update `kamehameha/PROGRESS.md` as you complete tasks

### Modifying Shared Components

**FloatingNav, Theme System, etc:**
- See `core/ARCHITECTURE.md` → Shared Infrastructure
- Test impact on both Timer and Kamehameha
- Update both feature docs if behavior changes

### Working with Firebase

**Authentication:**
- See `kamehameha/SECURITY.md` for auth flow
- Code in `src/services/firebase/auth.ts`

**Database:**
- See `kamehameha/DATA_SCHEMA.md` for Firestore structure
- Service layer in `src/features/kamehameha/services/`

### AI Integration

**OpenAI Chat:**
- See `kamehameha/AI_INTEGRATION.md` for details
- Cloud Functions in `functions/src/`
- Chat UI in `src/features/kamehameha/pages/ChatPage.tsx`

---

## Document Categories

### Timer Feature (ZenFocus)
- `zenfocus/OVERVIEW.md` - Timer feature overview
- `zenfocus/features/` - Task Management, Audio System, Settings
- `zenfocus/releases/` - Version release notes
- `zenfocus/development/` - Build System, Testing, UI/UX

### Kamehameha Feature (Recovery Tool)
- `kamehameha/SPEC.md` - What to build (complete requirements)
- `kamehameha/DATA_SCHEMA.md` - How to structure data
- `kamehameha/IMPLEMENTATION_GUIDE.md` - Phase-by-phase roadmap
- `kamehameha/QUICKSTART.md` - Fast-track guide for each phase
- `kamehameha/PROGRESS.md` - Task tracking (living document)

### Architecture & Design
- `core/ARCHITECTURE.md` - System design
- `kamehameha/OVERVIEW.md` - Kamehameha architecture
- `zenfocus/OVERVIEW.md` - Timer architecture
- `kamehameha/FILE_STRUCTURE.md` - File organization

### Integration Guides
- `kamehameha/AI_INTEGRATION.md` - OpenAI setup
- `kamehameha/SECURITY.md` - Firebase security
- `tools/` - MCP and development tool setup

### Implementation Resources
- `kamehameha/DEVELOPER_NOTES.md` - Tips, patterns, Firebase guidance
- `kamehameha/DOCUMENTATION_MAINTENANCE.md` - Keep docs updated during development
- `zenfocus/development/` - Build and testing guides

### Project-Wide
- `README.md` - Project overview and setup
- `CHANGELOG.md` - Version history
- `AI_AGENT_GUIDE.md` - For AI assistants
- `.cursorrules` - AI auto-load configuration

### Documentation Meta
- `AI_DOCUMENTATION_SYSTEM.md` - Explains the tiered AI documentation architecture
- `REORGANIZATION_SUMMARY.md` - Quick overview of recent reorganization
- `REORGANIZATION_COMPLETE.md` - Detailed reorganization breakdown
- `REORGANIZATION_PLAN.md` - Original reorganization plan

### Historical
- `archive/` - Completed bug fixes, old test reports

---

## Key Directories

```
src/
├── features/
│   ├── auth/          - Authentication (Google login)
│   ├── timer/         - Pomodoro timer feature (existing)
│   └── kamehameha/    - PMO recovery feature (new)
├── shared/            - Components used by both features
├── services/          - Firebase and external services
└── routes/            - React Router configuration

docs/
├── INDEX.md           - This file (documentation hub)
├── core/              - Shared architecture docs
├── zenfocus/          - Timer feature documentation
│   ├── features/      - Task Management, Audio System, Settings
│   ├── releases/      - Version release notes
│   └── development/   - Build System, Testing, UI/UX
├── kamehameha/        - PMO recovery feature docs
│   ├── phases/        - Phase-by-phase guides
│   └── [specs, guides, schemas]
├── tools/             - Development tool setup
└── archive/           - Historical documentation

functions/             - Firebase Cloud Functions (AI chat)
```

---

## Naming Conventions

### Files
- **Components:** PascalCase (e.g., `CheckInModal.tsx`)
- **Hooks:** camelCase with 'use' prefix (e.g., `useStreaks.ts`)
- **Services:** camelCase (e.g., `firestoreService.ts`)
- **Types:** PascalCase or camelCase (e.g., `kamehameha.types.ts`)

### Documentation
- **Overview/Index:** `INDEX.md`, `OVERVIEW.md`
- **Specifications:** `SPEC.md`
- **Data/Schema:** `DATA_SCHEMA.md`
- **Integration guides:** `[SERVICE]_INTEGRATION.md`

---

## Development Workflow

### 1. Planning Phase
- Check `kamehameha/PROGRESS.md` for current status
- Read `kamehameha/QUICKSTART.md` for your phase
- Check `SPEC.md` for requirements
- Review `DATA_SCHEMA.md` for data structures
- Consult `DEVELOPER_NOTES.md` for tips

### 2. Implementation Phase
- Reference `FILE_STRUCTURE.md` for where files go
- Create components in `src/features/kamehameha/`
- Follow existing patterns from Timer feature
- Use TypeScript types from `types/` folders
- Write tests alongside code
- **Update `PROGRESS.md` as you complete tasks**

### 3. Testing Phase
- Unit tests for hooks and utilities
- Integration tests for data flow
- Manual testing with Firebase emulator
- Security rules testing

### 4. Documentation Phase
- Update `PROGRESS.md` with completion status
- Update `SPEC.md` if behavior changed
- Update `CHANGELOG.md`
- Add JSDoc comments to public APIs
- Document learnings in `DEVELOPER_NOTES.md`

---

## Getting Help

### For Developers
- **Start here:** `kamehameha/QUICKSTART.md` - Find your phase
- **Track progress:** `kamehameha/PROGRESS.md` - See what's done
- **Need tips?** `kamehameha/DEVELOPER_NOTES.md` - Firebase guidance, patterns
- **Where does file go?** `kamehameha/FILE_STRUCTURE.md` - Complete reference
- Check existing code examples in `src/features/timer/`

### For AI Agents
- **Auto-loaded instructions:** `.cursorrules` in project root (automatically read by Cursor, Copilot, etc.)
- Start with `AI_AGENT_GUIDE.md` in root directory
- Read this INDEX.md for navigation
- Read `core/ARCHITECTURE.md` for overall context
- Check `kamehameha/PROGRESS.md` for current status
- Read specific feature docs before implementing
- Reference existing implementations
- **Always update `PROGRESS.md` as you work**
- **Setup guide:** See `AI_SETUP_GUIDE.md` for configuring AI tools

---

## Version History

- **2025-10-21:**
  - **Documentation Reorganization:** Complete restructure of 30+ files
    - Created `zenfocus/` directory for Timer feature docs
    - Created `tools/` directory for development tool setup
    - Created `archive/` directory for historical docs
    - Consolidated 5 audio files → 1 comprehensive AUDIO_SYSTEM.md
    - Consolidated 3 UI/UX files → 1 UI_UX_IMPROVEMENTS.md
    - Root directory cleaned: 30+ docs → 6 essential files
  - Created comprehensive documentation structure for Kamehameha feature
  - Added implementation resources: QUICKSTART, PROGRESS, FILE_STRUCTURE, DEVELOPER_NOTES
  - Organized into phases with detailed guides
  - Added AI auto-load configuration (.cursorrules)
- **2025-10-19:** Added task management feature documentation
- **2025-10-18:** V3.0 release - ZenFocus rebrand
- **2025-10-16:** V2.0 release - Enhanced features

---

## Quick Links

### Start Here
1. [AI Agent Guide](../AI_AGENT_GUIDE.md) - For AI assistants
2. [AI Setup Guide](AI_SETUP_GUIDE.md) - Configure AI tools to auto-read instructions
3. [Application Architecture](core/ARCHITECTURE.md) - System overview

### Timer Feature (ZenFocus)
4. [ZenFocus Overview](zenfocus/OVERVIEW.md) - Timer feature guide
5. [Task Management](zenfocus/features/TASK_MANAGEMENT.md) - Focus priorities
6. [Audio System](zenfocus/features/AUDIO_SYSTEM.md) - Ambient sounds
7. [UI/UX Evolution](zenfocus/development/UI_UX_IMPROVEMENTS.md) - Design history

### Kamehameha Feature (Recovery Tool)
8. [Kamehameha Overview](kamehameha/OVERVIEW.md) - Feature introduction
9. [Complete Specification](kamehameha/SPEC.md) - All requirements
10. [Quick Start Guide](kamehameha/QUICKSTART.md) - Fast-track for each phase
11. [Progress Tracker](kamehameha/PROGRESS.md) - Track your tasks
12. [Data Schema](kamehameha/DATA_SCHEMA.md) - Database structure
13. [AI Integration](kamehameha/AI_INTEGRATION.md) - OpenAI setup
14. [Security Guide](kamehameha/SECURITY.md) - Security and privacy

### Development Resources
15. [File Structure](kamehameha/FILE_STRUCTURE.md) - Where files go
16. [Developer Notes](kamehameha/DEVELOPER_NOTES.md) - Tips and patterns
17. [Documentation Maintenance](kamehameha/DOCUMENTATION_MAINTENANCE.md) - Keep docs updated
18. [Build System](zenfocus/development/BUILD_SYSTEM.md) - Asset bundling
19. [Testing Guide](zenfocus/development/TESTING.md) - Test strategies

### Project Documentation
20. [README.md](../README.md) - Project overview
21. [CHANGELOG.md](../CHANGELOG.md) - Version history

### Documentation Meta
23. [AI Documentation System](AI_DOCUMENTATION_SYSTEM.md) - Tiered AI documentation architecture
24. [Reorganization Summary](REORGANIZATION_SUMMARY.md) - Quick overview of recent docs reorganization
25. [Archive Index](archive/README.md) - Index of historical documentation
26. [Tools Index](tools/README.md) - Development tools setup

