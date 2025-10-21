# Kamehameha - Quick Start Guide

**Goal:** Get started implementing Kamehameha in 10 minutes or less.

---

## 🚦 Where Are You?

### Just Starting? (Phase 1)
→ **Go to:** [Phase 1: Firebase Setup](#phase-1-firebase-setup)

### Firebase Done? (Phase 2)
→ **Go to:** [Phase 2: Foundation](#phase-2-foundation)

### Foundation Done? (Phase 3)
→ **Go to:** [Phase 3: Core Features](#phase-3-core-features)

### Core Features Done? (Phase 4)
→ **Go to:** [Phase 4: AI Chat](#phase-4-ai-chat)

### AI Chat Done? (Phase 5)
→ **Go to:** [Phase 5: Gamification](#phase-5-gamification)

### Almost Done? (Phase 6)
→ **Go to:** [Phase 6: Polish](#phase-6-polish)

---

## Phase 1: Firebase Setup

**Goal:** Get Firebase authentication working

### Prerequisites
- [ ] Firebase account created
- [ ] Node.js 18+ installed

### Read These (15 minutes)
1. [DATA_SCHEMA.md](DATA_SCHEMA.md) - Understand data structure
2. [SECURITY.md](SECURITY.md) - Security rules overview
3. [phases/PHASE_1_FIREBASE_SETUP.md](phases/PHASE_1_FIREBASE_SETUP.md) - Detailed instructions

### Do This (30-60 minutes)
```bash
# Install Firebase
npm install firebase

# Install React Router
npm install react-router-dom
```

**Then:**
1. Create Firebase project in console
2. Enable Google Auth
3. Create Firestore database
4. Copy config to `.env.local`
5. Create auth components
6. Test sign in/out

### Success Check
- [ ] Can sign in with Google
- [ ] User profile displays
- [ ] Can sign out
- [ ] Routes protect Kamehameha page

**Next:** [Phase 2](#phase-2-foundation)

---

## Phase 2: Foundation

**Goal:** Build Kamehameha page with streak timers

### Read These (10 minutes)
1. [DATA_SCHEMA.md](DATA_SCHEMA.md) - Streak data structure
2. [phases/PHASE_2_FOUNDATION.md](phases/PHASE_2_FOUNDATION.md) - Detailed instructions

### Do This (4-6 hours)
1. Create data layer hooks
2. Build Kamehameha page
3. Add streak timer components
4. Implement top badge
5. Connect to Firestore

### Success Check
- [ ] Kamehameha page loads
- [ ] Timers count up every second
- [ ] Data persists after refresh
- [ ] Badge visible on all pages

**Next:** [Phase 3](#phase-3-core-features)

---

## Phase 3: Core Features

**Goal:** Implement check-ins and relapse tracking

### Read These (15 minutes)
1. [SPEC.md](SPEC.md) - Features 2 & 3
2. [phases/PHASE_3_CORE_FEATURES.md](phases/PHASE_3_CORE_FEATURES.md) - Detailed instructions

### Do This (8-10 hours)
1. Build check-in modal
2. Create relapse tracking flow
3. Implement journal system
4. Connect to Firestore

### Success Check
- [ ] Can submit check-ins
- [ ] Check-ins save to database
- [ ] Relapse flow resets streaks
- [ ] Journal entries viewable

**Next:** [Phase 4](#phase-4-ai-chat)

---

## Phase 4: AI Chat

**Goal:** Get AI therapist chat working

### Prerequisites
- [ ] OpenAI API key ready

### Read These (20 minutes)
1. [AI_INTEGRATION.md](AI_INTEGRATION.md) - Complete guide
2. [phases/PHASE_4_AI_CHAT.md](phases/PHASE_4_AI_CHAT.md) - Detailed instructions

### Do This (8-10 hours)
```bash
# Initialize Cloud Functions
firebase init functions

# Install OpenAI
cd functions
npm install openai
```

**Then:**
1. Create Cloud Function for chat
2. Build context builder
3. Create chat UI
4. Implement emergency mode
5. Deploy function

### Success Check
- [ ] Chat interface works
- [ ] AI responds within 3 seconds
- [ ] Context includes user data
- [ ] Emergency mode triggers

**Next:** [Phase 5](#phase-5-gamification)

---

## Phase 5: Gamification

**Goal:** Add milestones and celebrations

### Read These (10 minutes)
1. [SPEC.md](SPEC.md) - Feature 5
2. [phases/PHASE_5_GAMIFICATION.md](phases/PHASE_5_GAMIFICATION.md) - Detailed instructions

### Do This (4-6 hours)
1. Define milestone tiers
2. Build detection logic
3. Create celebration modal
4. Add badge gallery

### Success Check
- [ ] Milestones detected automatically
- [ ] Celebration plays at milestone
- [ ] Badges saved and displayed
- [ ] Progress bars show advancement

**Next:** [Phase 6](#phase-6-polish)

---

## Phase 6: Polish

**Goal:** Settings, testing, and launch prep

### Read These (10 minutes)
1. [phases/PHASE_6_POLISH.md](phases/PHASE_6_POLISH.md) - Detailed instructions
2. [SECURITY.md](SECURITY.md) - Security checklist

### Do This (6-8 hours)
1. Build settings panel
2. Implement data export
3. Run security audit
4. Write tests
5. Final QA

### Success Check
- [ ] All settings work
- [ ] Data export downloads
- [ ] Security rules tested
- [ ] No console errors
- [ ] Mobile responsive

**Next:** Deploy to production! 🚀

---

## 🛠️ Common Commands

### Development
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm test                 # Run tests
```

### Firebase
```bash
firebase login                    # Log in to Firebase
firebase init                     # Initialize Firebase
firebase emulators:start          # Start local emulators
firebase deploy                   # Deploy all
firebase deploy --only functions  # Deploy functions only
firebase deploy --only firestore  # Deploy security rules
```

### Debugging
```bash
# Check Firebase config
firebase projects:list

# View function logs
firebase functions:log

# View function logs in real-time
firebase functions:log --follow
```

---

## 🆘 Troubleshooting Quick Fixes

### "Firebase not initialized"
```typescript
// Check src/services/firebase/config.ts exists
// Verify .env.local has all variables
// Restart dev server
```

### "Permission denied" in Firestore
```bash
# Check firestore.rules
# Verify user is authenticated
# Check userId matches in security rules
firebase emulators:start  # Test locally
```

### "Cannot find module 'firebase'"
```bash
npm install firebase
npm install firebase-admin  # For Cloud Functions
```

### "OpenAI API error"
```bash
# Check API key in Cloud Functions config
firebase functions:config:set openai.key="sk-..."

# Verify key is valid
# Check OpenAI usage limits
```

### "Streak timer not updating"
```typescript
// Check useEffect dependencies
// Verify setInterval cleanup
// Check if timer is paused
```

---

## 📋 Pre-Start Checklist

Before beginning Phase 1:

- [ ] Read [OVERVIEW.md](OVERVIEW.md) - Understand the feature
- [ ] Read [SPEC.md](SPEC.md) - Know what you're building
- [ ] Read [DATA_SCHEMA.md](DATA_SCHEMA.md) - Understand data structure
- [ ] Have Firebase account ready
- [ ] Have OpenAI API key (for Phase 4)
- [ ] Development environment set up
- [ ] Git repo ready for commits

---

## 🎯 Daily Workflow

### Start of Day
1. Check [PROGRESS.md](PROGRESS.md) - Where did I leave off?
2. Read today's phase guide
3. Review relevant specs
4. Start coding

### During Work
1. Follow phase guide step-by-step
2. Test after each major step
3. Commit frequently
4. Update progress tracker

### End of Day
1. Update [PROGRESS.md](PROGRESS.md)
2. Note any blockers
3. Commit work
4. Plan next session

---

## 💡 Pro Tips

### Efficiency
- **Work in small increments** - Don't try to do a whole phase at once
- **Test continuously** - Catch bugs early
- **Use Firebase emulator** - Test locally before deploying
- **Copy existing patterns** - Look at Timer feature for examples

### Quality
- **TypeScript strict mode** - Catch errors early
- **Security rules first** - Don't skip security
- **Mobile test often** - Most users will be on mobile
- **Dark mode always** - Test both themes

### Learning
- **Read Firebase docs** - You're new to Firebase, take time to understand
- **Experiment in emulator** - Safe place to learn
- **Ask questions** - Document answers in DEVELOPER_NOTES.md

---

## ✅ Ready to Start?

Pick your phase above and dive in!

**Remember:**
- Take breaks
- Commit often
- Update progress tracker
- Ask for help when stuck

**You've got this! 🚀**

