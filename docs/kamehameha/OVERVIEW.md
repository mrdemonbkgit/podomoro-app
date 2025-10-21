# Kamehameha - PMO Recovery Tool Overview

**Last Updated:** October 21, 2025  
**Feature Status:** Planning Phase  
**Target Release:** V4.0 (5-6 weeks)

## Quick Links

- **[Complete Specification](SPEC.md)** - Detailed requirements and user flows
- **[Data Schema](DATA_SCHEMA.md)** - Firestore structure and TypeScript types
- **[AI Integration](AI_INTEGRATION.md)** - OpenAI setup and context building
- **[Security Guide](SECURITY.md)** - Privacy, security, and data protection
- **[Implementation Guide](IMPLEMENTATION_GUIDE.md)** - Phase-by-phase development roadmap
- **[Quick Start Guide](QUICKSTART.md)** - Fast-track guide for each phase
- **[Progress Tracker](PROGRESS.md)** - Current implementation status

---

## What is Kamehameha?

Kamehameha is a comprehensive PMO (Pornography-Masturbation-Orgasm) recovery companion tool built into ZenFocus. It provides users with:

- **Dual Streak Tracking** - Main streak (full PMO) and Discipline streak (rule violations)
- **AI Therapist Chat** - Contextual support powered by OpenAI GPT-5
- **Check-In System** - Daily mood, urges, triggers, and journal entries
- **Relapse Tracking** - Structured reflection and streak reset
- **Milestones & Badges** - Gamification for motivation
- **Real-time Sync** - Data synchronized across all devices via Firebase

**Philosophy:** Kamehameha means "turtle devastation wave" - symbolizing building inner strength to overcome challenges.

---

## How It Fits Into ZenFocus

### Integration Points

**Shared with Timer Feature:**
- FloatingNav (bottom-right navigation)
- Theme system (dark/light mode)
- React Router (page switching)
- Firebase Authentication (Google login)

**Independent:**
- Data storage (Firestore vs localStorage)
- UI components and styling
- Feature-specific hooks and services
- Cloud Functions for AI

### Navigation

Users can switch between features:
- `/timer` - Pomodoro timer page
- `/kamehameha` - Recovery tool page (requires authentication)

**Streak Badge:** Always visible on both pages when authenticated: `🛡️ 15d 4h 23m 15s`

---

## Core Features

### 1. Streak Tracking

**Two Types of Streaks:**

**Main Streak:**
- Tracks days clean from full PMO (orgasm included)
- Resets when user marks a full relapse
- Primary focus of recovery

**Discipline Streak:**
- Tracks days without rule violations
- Rules: viewing porn, AI sex chatbots, generated content, erotica, social media triggers
- Resets when user marks any rule violation
- Encourages stricter boundaries

**Display:**
- Live timer updating every second
- Format: `15d 4h 23m 15s`
- Shows current and longest streak
- Progress to next milestone

### 2. AI Therapist Chat

**Purpose:** Provide contextual, compassionate support

**Features:**
- Real-time chat with OpenAI GPT-5
- Emergency mode for high-urge situations
- Context-aware (knows user's streaks, recent check-ins, relapse patterns)
- Chat history saved for continuity
- Customizable system prompt

**Access:** Via Cloud Functions (secure, no API key exposed)

**Context Sent to AI:**
- Custom system prompt
- Current streaks (main & discipline)
- Recent check-ins (last 7 days)
- Recent relapses and patterns
- Previous chat messages (last 10)
- Emergency flag if panic button pressed

### 3. Check-In System

**Daily Accountability:**

Users can check in anytime with:
- **Mood:** 5-point emoji scale (😢 😕 😐 🙂 😊)
- **Urge Intensity:** Slider 0-10
- **Triggers:** Multi-select (stress, boredom, loneliness, anger, tired, other)
- **Journal Entry:** Free-form text (optional)

**Purpose:**
- Track patterns over time
- Provide AI context
- Encourage self-awareness
- Build daily habits

### 4. Relapse Tracking

**Structured Recovery:**

Multi-step process:
1. **Select Type:** Main PMO or Rule Violation
2. **Choose Reasons:** From customizable list
3. **Reflection:** Two prompts:
   - "What led to this moment?"
   - "What will you do differently next time?"
4. **Confirmation:** Shows previous streak, confirms reset

**Benefits:**
- Reduces shame through structure
- Encourages learning from setbacks
- Tracks patterns for AI insights
- Resets appropriate streak only

### 5. Milestones & Badges

**Gamification for Motivation:**

**Milestone Tiers:**
- 1 day: "First Step" 🌱
- 3 days: "Building Momentum" 💪
- 7 days: "One Week Warrior" ⚔️
- 14 days: "Two Week Champion" 🏆
- 30 days: "Monthly Master" 👑
- 60 days: "Two Month Legend" 🌟
- 90 days: "Quarter Year Hero" 🎖️
- 180 days: "Half Year Titan" 🔥
- 365 days: "One Year Phoenix" 🦅

**Celebrations:**
- Confetti animation
- Badge display
- Congratulatory message
- Progress visualization

---

## User Journey

### First Time User

1. **Access Kamehameha** - Click 🛡️ in FloatingNav
2. **Sign in with Google** - Required for Kamehameha
3. **See Dashboard** - Empty state, prompts for first check-in
4. **Set Streaks** - Automatically start counting from signup
5. **First Check-In** - Guided through mood, urges, journal
6. **Explore AI Chat** - Optional conversation with therapist
7. **Customize Rules** - Edit list of what counts as violations

### Daily Use

1. **Check Badge** - See streak timer on any page
2. **Check In** - When ready, log mood/urges/journal
3. **Talk to AI** - When struggling or celebrating
4. **Track Progress** - View activity feed, milestones

### Difficult Moments

1. **Strong Urges** - Click AI Therapist, use emergency button
2. **Relapse** - Structured tracking with reflection
3. **Streak Reset** - Appropriate streak resets, longest preserved
4. **Recovery** - Continue journey with insights

---

## Technical Architecture

### Frontend

**Location:** `src/features/kamehameha/`

**Key Folders:**
- `pages/` - KamehamehaPage, ChatPage
- `components/` - 20+ feature components
- `hooks/` - useStreaks, useCheckIns, useRelapses, useKamehameha
- `services/` - firestoreService, streakCalculations, realtimeSync
- `types/` - TypeScript interfaces

**Styling:** Tailwind CSS + Framer Motion (consistent with Timer)

### Backend

**Firebase Services:**
- **Authentication:** Google OAuth via Firebase Auth
- **Database:** Firestore (real-time NoSQL)
- **Functions:** Cloud Functions for AI chat
- **Hosting:** Vercel (frontend), Firebase (functions)

**OpenAI Integration:**
- GPT-5 API (or GPT-4 fallback)
- Accessed via Cloud Functions
- Context built server-side
- Rate limiting enforced

### Data Flow

```
User Action
    ↓
React Component
    ↓
Custom Hook (e.g., useCheckIns)
    ↓
Firestore Service Layer
    ↓
Firebase Firestore
    ↓
Real-time Listener
    ↓
Hook Updates State
    ↓
Component Re-renders
```

---

## Development Status

### Current Phase: Planning & Documentation

**Completed:**
- ✅ Requirements gathering
- ✅ Feature specification
- ✅ Architecture design
- ✅ Documentation structure

**Next Steps:**
1. Firebase project setup
2. Google Authentication implementation
3. React Router configuration
4. Data layer and hooks
5. UI components
6. AI integration
7. Testing and deployment

**Timeline:** 5-6 weeks (see implementation plan)

---

## Key Design Principles

### 1. Privacy First
- User data encrypted and secure
- Firestore security rules prevent unauthorized access
- No data sharing without consent
- User data rights and controls
- Optional account deletion with full data removal

### 2. Compassionate Support
- Non-judgmental language throughout
- Structured relapse tracking reduces shame
- AI therapist trained in compassionate response
- Celebration of progress, not perfection

### 3. Evidence-Based
- Streak tracking proven motivational tool
- Daily check-ins for self-awareness
- Pattern recognition for prevention
- Gamification backed by behavioral science

### 4. User Control
- Customizable rules list
- Editable AI system prompt
- Manual relapse marking only
- Optional features (notifications, sharing)

### 5. Seamless Integration
- Consistent design with Timer feature
- Shared navigation
- Same theme system
- No disruption to existing workflow

---

## Security & Privacy

### Data Protection
- All data stored in user's private Firestore collection
- Security rules: users can only access own data
- API keys never exposed to client
- HTTPS for all communications

### Authentication
- Google OAuth only (trusted provider)
- Firebase handles all auth
- Session persistence
- Secure logout

### AI Chat Privacy
- Chat history stored securely
- Context built server-side only
- No training on user data (OpenAI policy)
- User can delete chat history anytime

**See:** [SECURITY.md](SECURITY.md) for complete details

---

## Configuration

### User-Configurable Settings

1. **AI System Prompt** - Customize therapist personality/approach
2. **Rules List** - Add/remove/edit what counts as violations
3. **Notifications** - Enable/disable (future)
4. **Data Management** - Export, import, delete all data
5. **Privacy** - Visibility options

### Default Configuration

**Rules List:**
- Viewed pornography
- AI sex chatbot usage
- Generated AI softcore porn
- Text/audio erotica
- TikTok/social media sexy content triggers

**System Prompt:**
```
You are a compassionate PMO recovery therapist with expertise in 
addiction recovery, cognitive behavioral therapy, and mindfulness. 
Your role is to provide non-judgmental support, practical strategies,
and encouragement...
```

---

## File Structure

```
src/features/kamehameha/
├── pages/
│   ├── KamehamehaPage.tsx       # Main dashboard
│   └── ChatPage.tsx              # AI therapist chat
├── components/
│   ├── StreakTimer.tsx           # Live countdown display
│   ├── StreakCard.tsx            # Streak info card
│   ├── CheckInModal.tsx          # Check-in form
│   ├── RelapseFlow.tsx           # Multi-step relapse tracking
│   ├── ChatMessages.tsx          # Chat UI
│   ├── MilestoneCard.tsx         # Milestone display
│   ├── BadgeDisplay.tsx          # Earned badges
│   └── [15+ more components]
├── hooks/
│   ├── useKamehameha.ts          # Main data hook
│   ├── useStreaks.ts             # Streak calculations
│   ├── useCheckIns.ts            # Check-in CRUD
│   ├── useRelapses.ts            # Relapse tracking
│   └── useFirestore.ts           # Firestore operations
├── services/
│   ├── firestoreService.ts       # Database layer
│   ├── streakCalculations.ts    # Business logic
│   └── realtimeSync.ts           # Real-time listeners
└── types/
    └── kamehameha.types.ts       # TypeScript interfaces
```

---

## Related Documentation

### Essential Reading
1. **[SPEC.md](SPEC.md)** - Complete feature specification
2. **[DATA_SCHEMA.md](DATA_SCHEMA.md)** - Firestore structure
3. **[AI_INTEGRATION.md](AI_INTEGRATION.md)** - OpenAI setup

### Implementation
4. **[Implementation Plan](../../kamehameha-pmo-recovery-tool.plan.md)** - Step-by-step guide
5. **[SECURITY.md](SECURITY.md)** - Security considerations
6. **[Architecture](../core/ARCHITECTURE.md)** - Overall app structure

### Project Docs
7. **[README.md](../../README.md)** - Project setup
8. **[CHANGELOG.md](../../CHANGELOG.md)** - Version history

---

## FAQ

**Q: Why requires authentication?**  
A: PMO recovery data is highly personal and sensitive. Cloud storage with authentication ensures data is secure, private, and synced across devices.

**Q: Can I use without creating an account?**  
A: Kamehameha requires Google login. The Timer feature works without authentication.

**Q: Is my data private?**  
A: Yes. Data is stored in your private Firestore collection with strict security rules. Only you can access it.

**Q: Will AI chat be used to train models?**  
A: No. OpenAI's policy doesn't use API data for training unless explicitly opted in (we don't opt in).

**Q: What if I delete my account?**  
A: All your data is permanently deleted from Firestore. This cannot be undone.

**Q: Can I export my data?**  
A: Yes. Export to JSON anytime from settings.

**Q: How much does it cost?**  
A: ZenFocus is free. Firebase has generous free tier. OpenAI API costs paid by you via your API key.

---

## Roadmap

### Phase 1-3: Core Features (Weeks 1-3)
- Firebase setup
- Authentication
- Streak tracking
- Check-ins
- Relapse tracking

### Phase 4: AI Integration (Week 3-4)
- Cloud Functions
- Chat interface
- Context building
- Emergency mode

### Phase 5-6: Polish (Weeks 4-6)
- Milestones & badges
- Settings panel
- Testing
- Documentation
- Deployment

### Future Enhancements (Post-V4.0)
- Accountability partners
- Group support
- Advanced analytics
- Mobile app
- Offline support

---

**Ready to build?** Start with [SPEC.md](SPEC.md) for complete requirements, then follow the [Implementation Plan](../../kamehameha-pmo-recovery-tool.plan.md).

