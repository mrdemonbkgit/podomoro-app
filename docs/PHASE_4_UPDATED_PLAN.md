# 🎨 Phase 4: Polish & Documentation - UPDATED PLAN

**Date:** October 26, 2025  
**Status:** READY TO BEGIN  
**Timeline:** 3-4 days (reduced from 1 week due to Phase 2.5 completion)

---

## 📋 **PHASE 2.5 COMPLETION IMPACT**

**✅ Already Completed in Phase 2.5:**
- ✅ **Issue #17: ESLint & Prettier Setup** (Days 1-2) - **DONE**
  - ESLint 9 flat config
  - Prettier 3.6.2
  - Pre-commit hooks
  - CI integration
  - All scripts working

**Remaining for Phase 4:**
- Issue #19: Consolidate Constants (Day 1)
- Issue #20: Extract Magic Numbers (Day 2)
- Issue #21: API Documentation (Day 3)
- Final validation & polish (Day 4)

**Time Saved:** 2 days (~16 hours)  
**New Timeline:** 3-4 days instead of 7 days

---

## 🎯 **PHASE 4 OBJECTIVES**

### **Primary Goals:**
1. ✅ Consolidate milestone constants (eliminate duplication)
2. ✅ Extract magic numbers to constants (improve maintainability)
3. ✅ Document Cloud Functions API (developer experience)
4. ✅ Final code quality pass
5. ✅ Prepare for production

### **Success Criteria:**
- ✅ No duplicate constants across codebase
- ✅ All magic numbers extracted to named constants
- ✅ All Cloud Functions fully documented
- ✅ API reference document created
- ✅ README updated
- ✅ All tests passing
- ✅ Production-ready

---

## 📅 **DAY 1: Consolidate Constants (Issue #19)**

**Problem:** Milestone constants defined in 3 places:
1. `functions/src/milestoneConstants.ts` (Cloud Functions)
2. `src/features/kamehameha/constants/milestones.ts` (Frontend)
3. Potentially in test files

**Goal:** Single source of truth for milestone definitions

### **Strategy: Keep Intentional Duplication with Validation**

**Why NOT share code between frontend and backend:**
- Different deployment targets (Cloud Functions vs. Vite build)
- Different module systems
- Increased complexity for shared code
- Not worth the effort for small config

**Solution: Duplicate with validation test**

#### **Step 1: Verify Constants Match**

**Check both files:**
- `functions/src/milestoneConstants.ts`
- `src/features/kamehameha/constants/milestones.ts`

**Ensure they define identical:**
- `MILESTONE_SECONDS` array
- `getBadgeConfig()` function behavior

#### **Step 2: Add Validation Test**

**Create:** `src/features/kamehameha/__tests__/milestoneConstants.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { MILESTONE_SECONDS as FRONTEND_MILESTONES } from '../constants/milestones';

// Import from functions (if possible in test environment)
// Or manually define expected values
const EXPECTED_MILESTONES = [
  60,      // 1 minute
  300,     // 5 minutes
  86400,   // 1 day
  259200,  // 3 days
  604800,  // 1 week
  1209600, // 2 weeks
  2592000, // 1 month
  5184000, // 2 months
  7776000, // 3 months
  15552000, // 6 months
  31536000, // 1 year
];

describe('Milestone Constants Sync', () => {
  it('should match backend milestone definitions', () => {
    expect(FRONTEND_MILESTONES).toEqual(EXPECTED_MILESTONES);
  });

  it('should have all milestones in ascending order', () => {
    const sorted = [...FRONTEND_MILESTONES].sort((a, b) => a - b);
    expect(FRONTEND_MILESTONES).toEqual(sorted);
  });

  it('should have no duplicate milestones', () => {
    const unique = [...new Set(FRONTEND_MILESTONES)];
    expect(FRONTEND_MILESTONES).toHaveLength(unique.length);
  });
});
```

#### **Step 3: Add Documentation Comments**

**In both files, add header comment:**

```typescript
/**
 * Milestone Constants
 * 
 * ⚠️ SYNC WARNING: This file must be kept in sync with:
 * - Frontend: src/features/kamehameha/constants/milestones.ts
 * - Backend: functions/src/milestoneConstants.ts
 * 
 * When updating milestones:
 * 1. Update BOTH files
 * 2. Run tests to verify sync: npm run test:milestones
 * 
 * DO NOT modify one without the other!
 */
```

#### **Step 4: Update package.json**

```json
{
  "scripts": {
    "test:milestones": "vitest run milestoneConstants.test.ts"
  }
}
```

#### **Deliverables:**
- ✅ Validation test created
- ✅ Sync warnings added to both files
- ✅ Test script added
- ✅ Test passes

**Time:** 2 hours

---

## 📅 **DAY 2: Extract Magic Numbers (Issue #20)**

**Problem:** Magic numbers scattered throughout codebase:
- Intervals (1000ms, 5000ms)
- Limits (2000 chars, 10 messages/min)
- Timeouts (3000ms, 5000ms)

**Goal:** Named constants for all magic numbers

### **Step 1: Create Constants File**

**Create:** `src/features/kamehameha/constants/app.constants.ts`

```typescript
/**
 * Application Constants
 * 
 * Named constants for all magic numbers in the Kamehameha feature.
 */

/**
 * Time intervals for various operations (in milliseconds)
 */
export const INTERVALS = {
  /** Display update interval (1 second) */
  UPDATE_DISPLAY_MS: 1000,
  
  /** Milestone check interval (1 second) */
  MILESTONE_CHECK_MS: 1000,
  
  /** @deprecated Legacy polling interval, being phased out */
  POLLING_MS: 5000,
} as const;

/**
 * Limits for various features
 */
export const LIMITS = {
  /** Maximum AI chat message length */
  MAX_MESSAGE_LENGTH: 2000,
  
  /** Rate limit: messages per minute */
  RATE_LIMIT_MESSAGES_PER_MIN: 10,
  
  /** Maximum check-ins to display in UI */
  MAX_CHECKINS_DISPLAY: 10,
  
  /** Maximum relapses to display in UI */
  MAX_RELAPSES_DISPLAY: 10,
  
  /** Maximum journey history to display */
  MAX_JOURNEY_HISTORY_DISPLAY: 20,
} as const;

/**
 * Timeouts for UI feedback (in milliseconds)
 */
export const TIMEOUTS = {
  /** Success message display duration */
  SUCCESS_MESSAGE_MS: 3000,
  
  /** Error message display duration */
  ERROR_MESSAGE_MS: 5000,
  
  /** Toast notification duration */
  TOAST_DURATION_MS: 3000,
} as const;

/**
 * Time conversions
 */
export const TIME = {
  /** Milliseconds in one second */
  MS_PER_SECOND: 1000,
  
  /** Seconds in one minute */
  SECONDS_PER_MINUTE: 60,
  
  /** Minutes in one hour */
  MINUTES_PER_HOUR: 60,
  
  /** Hours in one day */
  HOURS_PER_DAY: 24,
  
  /** Days in one week */
  DAYS_PER_WEEK: 7,
} as const;
```

### **Step 2: Find and Replace Magic Numbers**

**Search for common patterns:**
```bash
# Find setInterval calls
grep -r "setInterval" src/features/kamehameha/

# Find setTimeout calls
grep -r "setTimeout" src/features/kamehameha/

# Find numeric literals in code
grep -rE '\b[0-9]{3,}\b' src/features/kamehameha/ --include="*.ts" --include="*.tsx"
```

**Replace in files:**

**Example 1: `useStreaks.ts`**
```typescript
// BEFORE
setInterval(() => {
  updateDisplay();
}, 1000);

// AFTER
import { INTERVALS } from '../constants/app.constants';

setInterval(() => {
  updateDisplay();
}, INTERVALS.UPDATE_DISPLAY_MS);
```

**Example 2: `useMilestones.ts`**
```typescript
// BEFORE
if (secondsElapsed % 1000 === 0) {
  checkMilestones();
}

// AFTER
import { INTERVALS } from '../constants/app.constants';

if (secondsElapsed % INTERVALS.MILESTONE_CHECK_MS === 0) {
  checkMilestones();
}
```

**Example 3: `aiChatService.ts`**
```typescript
// BEFORE
if (message.length > 2000) {
  throw new Error('Message too long');
}

// AFTER
import { LIMITS } from '../constants/app.constants';

if (message.length > LIMITS.MAX_MESSAGE_LENGTH) {
  throw new Error('Message too long');
}
```

### **Step 3: Verify No Breaking Changes**

```bash
# Run all tests
npm test

# Type check
npm run typecheck

# Build
npm run build
```

#### **Deliverables:**
- ✅ `app.constants.ts` created
- ✅ All magic numbers replaced with named constants
- ✅ All tests passing
- ✅ No type errors

**Time:** 3 hours

---

## 📅 **DAY 3: API Documentation (Issue #21)**

**Problem:** Cloud Functions lack comprehensive documentation

**Goal:** Fully documented API with examples

### **Step 1: Add JSDoc to All Cloud Functions**

**Files to document:**
- `functions/src/index.ts`
- `functions/src/scheduledMilestones.ts`

#### **Example: `chatWithAI` Function**

```typescript
/**
 * Chat with AI Therapist Cloud Function
 * 
 * Provides compassionate AI-powered support for recovery journey.
 * Includes context about user's streaks, check-ins, and relapses.
 * 
 * @function chatWithAI
 * @category Cloud Functions
 * @access authenticated users only
 * 
 * @param {Object} request - The chat request
 * @param {string} request.message - User's message (1-2000 characters)
 * @param {boolean} [request.isEmergency=false] - Emergency mode flag
 * 
 * @returns {Promise<ChatResponse>} The AI response
 * @returns {boolean} response.success - Whether request succeeded
 * @returns {ChatMessage} [response.message] - AI message if successful
 * @returns {string} [response.error] - Error message if failed
 * @returns {boolean} [response.rateLimitExceeded] - Rate limit exceeded flag
 * 
 * @throws {HttpsError} code='unauthenticated' - User not logged in
 * @throws {HttpsError} code='invalid-argument' - Invalid message format
 * @throws {HttpsError} code='resource-exhausted' - Rate limit exceeded
 * 
 * @rateLimit 10 messages per minute per user
 * @cost Approximately $0.004 per message (GPT-4 pricing)
 * 
 * @example Basic usage
 * ```typescript
 * const result = await chatWithAI({
 *   message: "I'm struggling with urges today",
 *   isEmergency: false
 * });
 * 
 * if (result.success) {
 *   console.log(result.message.content);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 * 
 * @example Emergency mode
 * ```typescript
 * const result = await chatWithAI({
 *   message: "I need help right now",
 *   isEmergency: true  // Activates crisis-specific prompts
 * });
 * ```
 * 
 * @see {@link https://platform.openai.com/docs/api-reference OpenAI API Documentation}
 * @since 1.0.0
 */
export const chatWithAI = onCall<ChatRequest, Promise<ChatResponse>>(
  { cors: true },
  async (request) => {
    // ... implementation
  }
);
```

#### **Example: `checkMilestonesScheduled` Function**

```typescript
/**
 * Scheduled Milestone Check Cloud Function
 * 
 * Runs every minute to detect milestones for users who are offline.
 * This is a backup to the client-side milestone detection in `useMilestones` hook.
 * 
 * @function checkMilestonesScheduled
 * @category Cloud Functions - Scheduled
 * @access system (runs automatically)
 * 
 * @schedule Every 1 minute (cron: "* * * * *")
 * @timeZone UTC
 * @memory 256MiB
 * @maxInstances 1 (prevents concurrent executions)
 * 
 * @description
 * For each user with an active journey:
 * 1. Calculates elapsed seconds since journey start
 * 2. Checks for uncelebrated milestones
 * 3. Creates badge documents for new milestones
 * 4. Uses deterministic badge IDs for idempotency
 * 
 * @algorithm
 * Uses collectionGroup('kamehameha') query with filters:
 * - FieldPath.documentId() == 'streaks'
 * - currentJourneyId != null
 * 
 * This finds all active streak documents across all users.
 * Requires composite index on (kamehameha.__name__, currentJourneyId).
 * 
 * @cost
 * - Firestore reads: ~1 per user per minute (only active users)
 * - Firestore writes: Only when new milestones reached
 * - Estimated: $0.01-0.05 per day for 100 active users
 * 
 * @example Firestore Index Required
 * ```json
 * {
 *   "collectionGroup": "kamehameha",
 *   "queryScope": "COLLECTION_GROUP",
 *   "fields": [
 *     { "fieldPath": "__name__", "order": "ASCENDING" },
 *     { "fieldPath": "currentJourneyId", "order": "ASCENDING" }
 *   ]
 * }
 * ```
 * 
 * @see {@link useMilestones} for client-side detection
 * @see {@link firestore.indexes.json} for index configuration
 * @since 1.0.0
 */
export const checkMilestonesScheduled = onSchedule(
  {
    schedule: 'every 1 minutes',
    timeZone: 'UTC',
    maxInstances: 1,
    memory: '256MiB',
  },
  async (event) => {
    // ... implementation
  }
);
```

### **Step 2: Create API Reference Document**

**Create:** `functions/API_REFERENCE.md`

```markdown
# Cloud Functions API Reference

**Version:** 1.0.0  
**Last Updated:** October 26, 2025

---

## 📋 **Table of Contents**

1. [Authentication](#authentication)
2. [Callable Functions](#callable-functions)
   - [chatWithAI](#chatwithAI)
3. [Scheduled Functions](#scheduled-functions)
   - [checkMilestonesScheduled](#checkmilestonesscheduled)
4. [Rate Limits](#rate-limits)
5. [Cost Estimates](#cost-estimates)
6. [Error Codes](#error-codes)

---

## 🔐 **Authentication**

All callable functions require Firebase Authentication.

**Setup:**
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';

const functions = getFunctions();
const auth = getAuth();

// User must be logged in
await auth.signInWithPopup(googleProvider);
```

---

## 📞 **Callable Functions**

### `chatWithAI`

Send a message to the AI therapist and receive a compassionate response.

**Type Signature:**
```typescript
function chatWithAI(request: ChatRequest): Promise<ChatResponse>
```

**Request:**
```typescript
interface ChatRequest {
  message: string;        // 1-2000 characters
  isEmergency?: boolean;  // default: false
}
```

**Response:**
```typescript
interface ChatResponse {
  success: boolean;
  message?: ChatMessage;
  error?: string;
  rateLimitExceeded?: boolean;
}

interface ChatMessage {
  role: 'assistant';
  content: string;
  timestamp: number;
}
```

**Usage Example:**
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const chatWithAI = httpsCallable(functions, 'chatWithAI');

try {
  const result = await chatWithAI({
    message: "I'm struggling with urges today",
    isEmergency: false
  });

  if (result.data.success) {
    console.log('AI Response:', result.data.message.content);
  } else {
    console.error('Error:', result.data.error);
  }
} catch (error) {
  if (error.code === 'functions/unauthenticated') {
    console.error('User must be logged in');
  } else if (error.code === 'functions/resource-exhausted') {
    console.error('Rate limit exceeded');
  }
}
```

**Rate Limit:** 10 messages per minute per user

**Cost:** ~$0.004 per message (GPT-4 pricing)

**Error Codes:**
- `unauthenticated` - User not logged in
- `invalid-argument` - Invalid message format
- `resource-exhausted` - Rate limit exceeded

---

## ⏰ **Scheduled Functions**

### `checkMilestonesScheduled`

Automatically runs every minute to detect milestones for offline users.

**Schedule:** Every 1 minute (cron: `* * * * *`)

**Description:**
- Queries all users with active journeys
- Calculates elapsed seconds
- Creates badge documents for new milestones
- Idempotent (safe to run multiple times)

**Required Index:**
```json
{
  "collectionGroup": "kamehameha",
  "fields": [
    { "fieldPath": "__name__", "order": "ASCENDING" },
    { "fieldPath": "currentJourneyId", "order": "ASCENDING" }
  ]
}
```

**Cost:** $0.01-0.05 per day for 100 active users

---

## ⏱️ **Rate Limits**

| Function | Limit | Period |
|----------|-------|--------|
| `chatWithAI` | 10 messages | per minute per user |

**Rate Limit Response:**
```json
{
  "success": false,
  "error": "Rate limit exceeded. Please wait before sending another message.",
  "rateLimitExceeded": true
}
```

---

## 💰 **Cost Estimates**

### Per-Function Costs

| Function | Trigger | Cost per Invocation | Monthly (100 users) |
|----------|---------|---------------------|---------------------|
| `chatWithAI` | On-demand | $0.004 (GPT-4) | $12-40 |
| `checkMilestonesScheduled` | Every minute | $0.0001 (Firestore) | $4-5 |

**Total Estimated Cost:** $16-45/month for 100 active users

**Cost Breakdown:**
- GPT-4 API: $10-35/month (3-10 messages/user/day)
- Firestore reads: $4-5/month (scheduled checks)
- Cloud Functions compute: $1-5/month

---

## ⚠️ **Error Codes**

### Common Errors

| Code | Description | How to Handle |
|------|-------------|---------------|
| `unauthenticated` | User not logged in | Redirect to login |
| `invalid-argument` | Invalid request data | Show validation error |
| `resource-exhausted` | Rate limit exceeded | Show "Please wait" message |
| `internal` | Server error | Show generic error, retry later |
| `unavailable` | Service temporarily down | Show maintenance message |

### Example Error Handling

```typescript
try {
  const result = await chatWithAI({ message: userInput });
} catch (error) {
  switch (error.code) {
    case 'functions/unauthenticated':
      alert('Please log in to chat');
      navigateToLogin();
      break;
    case 'functions/resource-exhausted':
      alert('Too many messages. Please wait a moment.');
      break;
    default:
      alert('An error occurred. Please try again.');
  }
}
```

---

## 🔧 **Development**

### Local Testing

```bash
# Start emulators
firebase emulators:start

# Functions run at:
# http://localhost:5001/[project-id]/us-central1/[function-name]
```

### Deployment

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:chatWithAI
```

---

## 📚 **Additional Resources**

- [Firebase Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [OpenAI API Pricing](https://openai.com/pricing)
- [Firestore Pricing](https://firebase.google.com/pricing)

---

**Last Updated:** October 26, 2025  
**Version:** 1.0.0
```

#### **Deliverables:**
- ✅ All Cloud Functions have comprehensive JSDoc
- ✅ `API_REFERENCE.md` created
- ✅ Examples for all functions
- ✅ Error codes documented
- ✅ Cost estimates provided

**Time:** 4 hours

---

## 📅 **DAY 4: Final Polish & Validation**

### **Step 1: Code Quality Pass**

**Run all quality checks:**
```bash
# TypeScript
npm run typecheck

# ESLint
npm run lint

# Prettier
npm run format:check

# Tests
npm test

# Build
npm run build

# Full CI
npm run ci
```

### **Step 2: Update README**

**Add sections:**

1. **Development Scripts**
```markdown
### Development Scripts

```bash
# Quality checks
npm run typecheck      # TypeScript type checking
npm run lint           # ESLint code quality
npm run format         # Prettier formatting
npm run test           # Run all tests
npm run build          # Production build
npm run ci             # Full CI pipeline

# Constants validation
npm run test:milestones  # Verify milestone constants sync
```
```

2. **Constants Management**
```markdown
### Constants Management

Milestone constants are intentionally duplicated between frontend and backend:
- Frontend: `src/features/kamehameha/constants/milestones.ts`
- Backend: `functions/src/milestoneConstants.ts`

**When updating milestones:**
1. Update both files
2. Run: `npm run test:milestones`
3. Ensure test passes before committing
```

3. **API Reference**
```markdown
### Cloud Functions API

See [functions/API_REFERENCE.md](functions/API_REFERENCE.md) for complete documentation.

**Available Functions:**
- `chatWithAI` - AI therapist chat
- `checkMilestonesScheduled` - Offline milestone detection
```

### **Step 3: Create Phase 4 Summary**

**Document:** `docs/PHASE_4_COMPLETE.md`

#### **Deliverables:**
- ✅ All quality checks passing
- ✅ README updated
- ✅ Phase 4 summary document
- ✅ Ready for final review

**Time:** 2 hours

---

## ✅ **PHASE 4 SUCCESS CRITERIA**

### **Code Quality:**
- ✅ No duplicate constants (or validated if intentional)
- ✅ All magic numbers extracted to named constants
- ✅ Zero TypeScript errors
- ✅ Zero ESLint errors
- ✅ Code formatted with Prettier

### **Documentation:**
- ✅ All Cloud Functions have comprehensive JSDoc
- ✅ API Reference document created
- ✅ README updated with new sections
- ✅ Constants management documented

### **Testing:**
- ✅ Milestone constants sync test added
- ✅ All existing tests passing
- ✅ New tests for Phase 4 changes passing

### **Production Readiness:**
- ✅ Build succeeds
- ✅ No console errors in dev
- ✅ All scripts in package.json work
- ✅ CI pipeline passes

---

## 📊 **PHASE 4 TIMELINE**

| Day | Task | Hours | Status |
|-----|------|-------|--------|
| **Day 1** | Consolidate Constants | 2 | Pending |
| **Day 2** | Extract Magic Numbers | 3 | Pending |
| **Day 3** | API Documentation | 4 | Pending |
| **Day 4** | Final Polish & Validation | 2 | Pending |
| **TOTAL** | | **11 hours** | **3-4 days** |

**Original Estimate:** 7 days (1 week)  
**Phase 2.5 Savings:** 2 days (ESLint & Prettier already done)  
**New Estimate:** 3-4 days

---

## 🎯 **DELIVERABLES**

### **New Files:**
1. ✅ `src/features/kamehameha/__tests__/milestoneConstants.test.ts`
2. ✅ `src/features/kamehameha/constants/app.constants.ts`
3. ✅ `functions/API_REFERENCE.md`
4. ✅ `docs/PHASE_4_COMPLETE.md`

### **Modified Files:**
1. ✅ `src/features/kamehameha/constants/milestones.ts` (add sync warning)
2. ✅ `functions/src/milestoneConstants.ts` (add sync warning)
3. ✅ `functions/src/index.ts` (add JSDoc)
4. ✅ `functions/src/scheduledMilestones.ts` (add JSDoc)
5. ✅ Multiple files with magic numbers → constants
6. ✅ `package.json` (add test:milestones script)
7. ✅ `README.md` (add new sections)

---

## 💬 **NOTES**

### **Why NOT Sharing Code Between Frontend & Backend:**
- Different build systems (Vite vs. Functions)
- Different module resolution
- Increases complexity
- Risk of breaking deployments
- Small config file (~20 lines)
- Validation test provides safety net

### **Magic Numbers to Prioritize:**
1. Timeouts (setInterval, setTimeout)
2. Limits (message length, rate limits)
3. Display limits (max items to show)
4. Time conversions

### **Documentation Standards:**
- Use JSDoc for all public functions
- Include examples
- Document parameters and returns
- List error codes
- Provide cost estimates
- Link to external resources

---

**Phase 4 Status:** READY TO BEGIN  
**Estimated Completion:** 3-4 days  
**Next Phase:** Production deployment preparation

---

**Let's start with Day 1!** 🚀

