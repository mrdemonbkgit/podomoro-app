# Kamehameha - Developer Notes

**Project Context:** ZenFocus Pomodoro Timer + Kamehameha Recovery Tool  
**Developer:** Tony (New to Firebase)  
**Last Updated:** October 21, 2025

---

## 👤 About This Project

### User (Tony) Context

**Experience Level:**
- ✅ Comfortable with React, TypeScript, Vite
- ✅ Experienced with Tailwind CSS, Framer Motion
- ✅ Familiar with custom hooks and state management
- ⚠️ **New to Firebase** - Needs clear explanations
- ⚠️ **First time with Cloud Functions** - Step-by-step guidance helpful

**Preferences & Priorities:**
- **Budget-conscious** - Monitor Firebase and OpenAI costs
- **Privacy-focused** - User data security is critical
- **Quality over speed** - Willing to take time to do it right
- **Clean code** - TypeScript strict mode, well-documented

**Tools Ready:**
- Google account for Firebase
- OpenAI API key ready for Phase 4
- Development environment set up

---

## 🔥 Firebase Tips for Beginners

### Understanding Firebase Structure

**Firebase is NOT a traditional backend:**
- No SQL queries, no JOIN statements
- Think **collections of documents**, not tables
- Real-time subscriptions instead of polling
- Security rules ARE your API layer

**Mental Model:**
```
Firebase Console
  ├── Authentication (users managed by Google)
  ├── Firestore Database (NoSQL documents)
  ├── Cloud Functions (serverless backend code)
  └── Hosting (deploy your React app)
```

### Common Firebase Gotchas

**1. Security Rules Are Critical**
```javascript
// ❌ BAD: Allow all (never do this in production)
allow read, write: if true;

// ✅ GOOD: User-specific access
allow read, write: if request.auth != null 
  && request.auth.uid == userId;
```

**2. Real-time Listeners Can Be Expensive**
```typescript
// ❌ BAD: Listener without cleanup
useEffect(() => {
  onSnapshot(docRef, (snap) => { /* ... */ });
}, []);

// ✅ GOOD: Always unsubscribe
useEffect(() => {
  const unsubscribe = onSnapshot(docRef, (snap) => { /* ... */ });
  return () => unsubscribe();
}, []);
```

**3. Reads Cost Money (Free Tier: 50K/day)**
```typescript
// ❌ BAD: Fetching full collection every time
const snapshot = await getDocs(collection(db, 'items'));

// ✅ GOOD: Use pagination
const q = query(collection(db, 'items'), limit(10));
const snapshot = await getDocs(q);
```

**4. Offline Persistence Can Cause Confusion**
```typescript
// Firebase caches data offline by default
// Sometimes you see old data before new data loads
// This is NORMAL and expected behavior
```

### Firebase Local Development

**Always use emulators during development:**
```bash
# Start Firebase emulators
firebase emulators:start

# Your app connects to:
# - Firestore: localhost:8080
# - Functions: localhost:5001
# - Auth: localhost:9099
```

**Benefits:**
- No cost during development
- Fast iteration
- Reset data anytime
- Test security rules safely

---

## 💰 Cost Management

### Firebase Costs (Free Tier Limits)

**Firestore:**
- 50K document reads/day ✅
- 20K document writes/day ✅
- 20K deletes/day ✅
- 1 GB storage ✅

**For Kamehameha with 10 active users:**
- ~500 reads/day (check-ins, streaks, chat history)
- ~100 writes/day (check-ins, chat messages)
- **Well within free tier** ✅

**Cloud Functions:**
- 2M invocations/month ✅
- 400K GB-seconds compute ✅

**For Chat with 10 users:**
- ~300 invocations/month (30 chats/user)
- **Well within free tier** ✅

### OpenAI Costs

**GPT-4 Pricing:**
- Input: $0.03/1K tokens
- Output: $0.06/1K tokens

**Average chat message:**
- System prompt + context: 500 tokens
- User message: 50 tokens
- AI response: 200 tokens
- **Total: ~750 tokens = $0.035/message**

**Monthly estimate (10 users, 30 msgs each):**
- 300 messages × $0.035 = **$10.50/month**

**Budget tip:** Set up billing alerts in OpenAI dashboard

### Cost Optimization Strategies

1. **Cache Frequently Accessed Data**
   ```typescript
   // Cache user config in memory for 5 minutes
   let configCache: { data: Config; timestamp: number } | null = null;
   ```

2. **Batch Firestore Operations**
   ```typescript
   // Use batch writes to save on operations
   const batch = writeBatch(db);
   batch.set(doc1, data1);
   batch.set(doc2, data2);
   await batch.commit(); // Counts as 1 write operation cost
   ```

3. **Limit Chat Context Size**
   ```typescript
   // Only send last 10 messages to AI
   const recentMessages = chatHistory.slice(-10);
   ```

4. **Use Pagination**
   ```typescript
   // Load 20 check-ins at a time, not all
   const q = query(checkInsRef, limit(20));
   ```

---

## 🎨 Design Patterns Used in ZenFocus

### Custom Hooks Pattern

**Existing examples:** `useTimer`, `useSettings`, `useTasks`

**Pattern to follow:**
```typescript
export const useMyFeature = () => {
  const [state, setState] = useState(/* ... */);
  
  useEffect(() => {
    // Load from storage
  }, []);
  
  const action1 = () => { /* ... */ };
  const action2 = () => { /* ... */ };
  
  return { state, action1, action2 };
};
```

### Glass Morphism Style

**Existing pattern in ZenFocus:**
```css
/* glass.css */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

**Use for Kamehameha cards and modals** - keeps visual consistency

### Framer Motion Animations

**Existing examples:** `TasksModal`, `SessionInfo`

**Standard pattern:**
```typescript
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      {/* Content */}
    </motion.div>
  )}
</AnimatePresence>
```

### Dark Mode Support

**Always use the theme hook:**
```typescript
const { isDark } = useTheme();

// Apply classes conditionally
<div className={isDark ? 'bg-gray-800' : 'bg-white'}>
```

---

## 🔒 Security Reminders

### API Keys

**❌ NEVER do this:**
```typescript
// NEVER EVER put API keys in frontend code
const OPENAI_API_KEY = 'sk-...'; // ❌ NO!
```

**✅ Always do this:**
```typescript
// In Cloud Functions only
const openai = new OpenAI({
  apiKey: functions.config().openai.key
});
```

### User Data Access

**Always verify ownership:**
```typescript
// ❌ BAD: Trust client
await setDoc(doc(db, `users/${userId}/...`), data);

// ✅ GOOD: Verify in security rules
// rules:
allow write: if request.auth.uid == userId;
```

### Sensitive Data Logging

**❌ Don't log:**
```typescript
console.log('Journal entry:', journalText); // Contains sensitive info
console.log('User data:', userData); // May contain private info
```

**✅ Do log:**
```typescript
console.log('Journal entry saved, length:', journalText.length);
console.log('User data updated for userId:', userId);
```

---

## 🐛 Common Issues & Solutions

### Issue: "Firebase not initialized"

**Symptom:** Errors about Firebase not being configured

**Solution:**
```bash
# Check .env.local exists with all variables
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
# etc.

# Restart dev server
npm run dev
```

### Issue: Timer not updating

**Symptom:** Streak timer shows but doesn't count up

**Solution:**
```typescript
// Check useEffect has proper cleanup
useEffect(() => {
  const interval = setInterval(() => {
    setSeconds(prev => prev + 1);
  }, 1000);
  
  return () => clearInterval(interval); // ← Don't forget this!
}, []);
```

### Issue: Firestore "Permission Denied"

**Symptom:** Can't read/write to Firestore

**Solutions:**
1. Check user is authenticated: `console.log(auth.currentUser)`
2. Check security rules match your user ID
3. Test with emulator: `firebase emulators:start`
4. Check Firestore rules in Firebase Console

### Issue: Cloud Function not working

**Symptom:** Function returns errors or doesn't respond

**Solutions:**
```bash
# Check function logs
firebase functions:log

# Deploy again
firebase deploy --only functions

# Test locally first
firebase emulators:start --only functions
```

---

## 📱 Mobile Considerations

### Touch Targets

**Minimum size: 44x44px** (iOS guideline, also good for Android)

```typescript
// ✅ Good
<button className="p-3"> {/* 48px min */}

// ❌ Too small
<button className="p-1"> {/* 32px, hard to tap */}
```

### Responsive Breakpoints

**ZenFocus uses Tailwind defaults:**
- `sm:` - 640px and up
- `md:` - 768px and up
- `lg:` - 1024px and up

**Always test:** Mobile first, then desktop

### Mobile Safari Quirks

```css
/* Fix for Safari's 100vh issue */
.full-height {
  min-height: 100vh;
  min-height: -webkit-fill-available;
}
```

---

## 🧪 Testing Strategy

### What to Test

**Unit Tests:**
- Hook return values
- Calculation functions (streak calculations)
- Data transformation utilities

**Integration Tests:**
- Firestore security rules
- Cloud Function responses
- Auth flow

**Manual Testing:**
- User flows (check-ins, relapses, chat)
- Mobile responsiveness
- Dark mode

### Testing Checklist Before Each Phase

- [ ] Test on Chrome and Safari
- [ ] Test on mobile (responsive design)
- [ ] Test in dark and light mode
- [ ] Test with Firebase emulator
- [ ] No console errors
- [ ] TypeScript compiles without errors

---

## 📝 Documentation Habits

### When to Update Docs

**Update PROGRESS.md:**
- After completing each task
- When hitting blockers
- At end of each day

**Update CHANGELOG.md:**
- After completing each phase
- When adding new features
- Before deployment

**Update Phase Guides:**
- If you discover better approaches
- When encountering issues not documented
- After solving difficult problems

---

## 💡 Pro Tips from Existing Codebase

### 1. Use Existing Patterns

**Instead of creating from scratch:**
```typescript
// Look at how SettingsPanel.tsx implements modals
// Look at how useTimer.ts manages state
// Look at how TasksModal.tsx handles keyboard events
```

### 2. Consistent Styling

**ZenFocus gradient pattern:**
```typescript
<div className="bg-gradient-to-br from-purple-500 to-indigo-600">
```

**Use in Kamehameha for visual consistency**

### 3. Keyboard Accessibility

**Follow TasksModal pattern:**
- `Escape` to close
- `Enter` to confirm
- Tab navigation

### 4. Loading States

**Always show loading states:**
```typescript
{loading && <div>Loading...</div>}
{error && <div>Error: {error}</div>}
{data && <div>{/* Render data */}</div>}
```

---

## 🎯 Phase-Specific Notes

### Phase 1: Firebase Setup

**Take your time here** - This is the foundation. Better to spend extra time understanding Firebase now than debugging auth issues later.

**Resources:**
- Firebase Console will be your friend
- Firebase emulator is your safety net
- Test thoroughly before moving to Phase 2

### Phase 4: AI Chat

**This is the most complex phase:**
- Cloud Functions are new territory
- Rate limiting is critical
- Cost monitoring is important
- Test with emulator extensively

**Budget reminder:** Set up billing alerts before deploying

---

## 🧪 Dev Login Feature (Testing Breakthrough!)

### The Problem
Google blocks sign-in attempts from automated browsers (Playwright, Puppeteer, Chrome DevTools) for security reasons. This made testing authenticated features extremely difficult, requiring manual screenshots and error copying.

### The Solution: Dev Login
We implemented a development-only mock authentication system that bypasses Google OAuth entirely:

**How it works:**
1. A yellow "Dev Login (Testing Only)" button appears on the login page (dev mode only)
2. Clicking it stores a mock user in `localStorage`
3. `AuthContext` checks for this mock user before Firebase auth
4. Firestore rules allow read/write for the specific dev test user UID

**Files Modified:**
- `src/features/auth/context/AuthContext.tsx` - Added `devSignIn()` function
- `src/features/auth/types/auth.types.ts` - Added `devSignIn?` to interface
- `src/features/auth/components/LoginPage.tsx` - Added Dev Login button
- `firestore.rules` - Added permissions for `dev-test-user-12345`

**Benefits:**
- ✅ Complete Playwright automation now possible
- ✅ Instant authentication (no OAuth popup)
- ✅ Test Firestore operations without restrictions
- ✅ Massive productivity boost for development

**Security:**
- Only available when `import.meta.env.DEV === true`
- Button doesn't appear in production builds
- Mock user has limited test data scope
- **DO NOT** deploy Firestore rules with dev user to production!

**See:** [`DEV_LOGIN_GUIDE.md`](../../DEV_LOGIN_GUIDE.md) for complete documentation

---

## 🐛 Bug Fixes (Phase 2)

### Bug #1: Infinite Recursion in Streak Calculations
**Problem:** `formatStreakTime()` was calling `parseStreakDisplay()`, which called `formatStreakTime()` again, causing "Maximum call stack size exceeded" errors.

**Solution:** Calculate time components directly in `formatStreakTime()` without calling `parseStreakDisplay()`.

**File:** `src/features/kamehameha/services/streakCalculations.ts:85-111`

### Bug #2: useStreaks Hook Called Without Auth Check
**Problem:** The `useStreaks` hook was being called unconditionally in `App.tsx`, causing errors when the user wasn't authenticated.

**Solution:** Created a `StreakBadgeWrapper` component that only calls `useStreaks` when a user is authenticated. The wrapper is only rendered when `user` exists.

**File:** `src/App.tsx`

### Bug #3: Redirect Authentication vs Popup
**Problem:** Firebase `signInWithPopup` fails in some contexts (automated browsers, certain security policies) with COOP errors.

**Solution:** Switched to `signInWithRedirect`, which is more reliable and works in all contexts. Added `getRedirectResult()` handling on auth state changes.

**File:** `src/features/auth/context/AuthContext.tsx`

**Lesson Learned:** For production apps, redirect-based auth is generally more reliable than popups, especially for mobile users and automated testing scenarios.

### Bug #4: Firestore Collection Path Segments
**Problem:** `FirebaseError: Invalid collection reference. Collection references must have an odd number of segments.`

**Root Cause:** Collections require ODD path segments, documents require EVEN segments.
- ❌ `users/{userId}/kamehameha/checkIns` = 4 segments (INVALID for collection)
- ✅ `users/{userId}/kamehameha_checkIns` = 3 segments (VALID)

**Solution:** Renamed collections to be at user level with `kamehameha_` prefix:
- `checkIns` → `kamehameha_checkIns`
- `relapses` → `kamehameha_relapses`

**Files:** `src/features/kamehameha/services/firestoreService.ts`, `docs/kamehameha/DATA_SCHEMA.md`

**Lesson Learned:** Always count path segments when designing Firestore schemas. Collections = odd, documents = even.

---

## 🎨 UI/UX Design Lessons

### Phase 3 Timer Display Evolution

**Initial Design:**
- Two separate streak cards side-by-side
- Each showing: Days, Hours, Minutes, Seconds as separate components
- Labels above each number
- Welcome message at top
- "Updates every second" footer text
- Reset buttons on each card

**User Feedback:** "The UI is so bad with 2 card running 4 numbers at the same time"

**Solution - Single Timer with Tabs:**
- Tab buttons to switch between Main and Discipline streaks
- Single timer display showing `D:HH:MM:SS` format
- Matches Pomodoro timer aesthetic (consistency across app)
- Removed welcome message (reduced noise)
- Removed redundant labels and footer text
- Action buttons below timer (Check-In, Report Relapse)

**Result:** "much better" - User feedback after redesign

**Design Principles:**
1. **Less is more** - Remove unnecessary text and labels
2. **Consistency** - Match existing patterns in the app
3. **Focus** - One thing at a time (single timer, not dual)
4. **Simplicity** - Clean, large numbers with clear hierarchy
5. **User feedback** - Listen and iterate quickly

**Implementation Tips:**
- Used `tabular-nums` for consistent digit spacing
- Responsive text sizing: `6xl → 7xl → 8xl → 9xl`
- Simple format: just numbers and colons, no labels needed
- Tab switching with active state styling

---

## 🚀 Motivation & Philosophy

### Why This Project Matters

Kamehameha is deeply personal recovery software. Users will trust us with sensitive information. Every decision should prioritize:

1. **User Privacy** - Their data, their control
2. **Compassion** - Non-judgmental, supportive experience
3. **Reliability** - Streaks and data must be accurate
4. **Accessibility** - Available when users need it most

### Development Philosophy

- **Progress over perfection** - MVP first, iterate later
- **Test thoroughly** - User data is sacred
- **Document learnings** - Help future you (and others)
- **Ask questions** - Firebase is new, it's okay to learn

---

## 📞 When You're Stuck

1. **Check documentation** - Phase guides have troubleshooting
2. **Check Firebase Console** - Often has helpful error messages
3. **Check existing code** - Timer feature has similar patterns
4. **Test in emulator** - Isolate the problem
5. **Update PROGRESS.md** - Note the blocker
6. **Take a break** - Fresh eyes help

---

**Remember:** You're building something meaningful. Take time to do it right. 💪

**Good luck!** 🚀

