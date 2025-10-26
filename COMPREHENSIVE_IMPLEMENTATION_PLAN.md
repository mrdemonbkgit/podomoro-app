# Comprehensive Implementation Plan - All 21 Technical Debt Issues

**Project:** ZenFocus - Kamehameha Recovery Tool  
**Date:** October 26, 2025  
**Version:** 2.1 (Second Review Corrected)  
**Status:** Ready for Execution  
**Scope:** All 21 identified technical debt issues  
**Target:** Production-ready codebase

> **✅ This plan has been peer-reviewed TWICE and corrected.**  
> - **First Review:** Fixed testing libraries, indexes, Windows compatibility
> - **Second Review:** Fixed chat paths, document/collection confusion, console stripping, Node.js API issues
> 
> **Review Documents:**
> - First Review: `docs/COMPREHENSIVE_PLAN_REVIEW.md` → `docs/PLAN_REVIEW_RESPONSE.md`
> - Second Review: `docs/COMPREHENSIVE_PLAN_SECOND_REVIEW.md` → `docs/SECOND_REVIEW_RESPONSE.md`

---

## 📋 Executive Summary

This plan provides a **complete roadmap** to address all 21 technical debt issues identified in the audit (v2.0).

**Total Issues:** 21
- 🔴 **8 HIGH PRIORITY** (Must fix before production)
- 🟡 **10 MEDIUM PRIORITY** (Should fix soon)
- 🟢 **3 LOW PRIORITY** (Nice to have)

**Timeline:** 6-7 weeks total
- **Phase 0 (Quick Wins):** 2.5 hours
- **Phase 1 (Critical Fixes):** 1.5 weeks
- **Phase 2 (Testing & Stability):** 2 weeks
- **Phase 2.5 (CI/CD Pipeline):** 1 day
- **Phase 3 (Quality & Performance):** 1.5 weeks
- **Phase 4 (Polish):** 1 week

---

## 🎯 Strategic Approach

### **Guiding Principles**

1. **Safety First** - Fix infrastructure issues before code changes
2. **Quick Wins Early** - Build momentum with easy wins
3. **Tests Before Features** - Add tests before refactoring
4. **Atomic Commits** - Small, reversible changes
5. **Continuous Validation** - Test after each major change

### **Execution Philosophy**

```
Infrastructure → Code Quality → Testing → Performance → Polish
     ↓              ↓             ↓            ↓           ↓
   2 hours      1.5 weeks     2 weeks     1.5 weeks    1 week
```

### **Risk Management**

- **High Risk Changes:** Create backup branches first
- **Medium Risk Changes:** Small commits with validation
- **Low Risk Changes:** Can batch together

---

## 🗺️ Full Issue Map

### **🔴 HIGH PRIORITY (8 issues)**

| # | Issue | Risk | Effort | Phase |
|---|-------|------|--------|-------|
| 1 | Missing .env templates | Low | 20 min | Quick Wins |
| 2 | Compiled JS in Git | Low | 15 min | Quick Wins |
| 3 | Deprecated function compiled | Low | 5 min | Quick Wins |
| 4 | Zero test coverage | High | 3 days | Phase 3 |
| 5 | Excessive console logging | Medium | 2 days | Phase 2 |
| 6 | Build artifacts in Git | Low | 15 min | Quick Wins |
| 7 | Nested functions folder | Medium | 20 min | Quick Wins |
| 8 | No runtime validation (Zod) | Medium | 1 day | Phase 2 |

### **🟡 MEDIUM PRIORITY (10 issues)**

| # | Issue | Risk | Effort | Phase |
|---|-------|------|--------|-------|
| 9 | Type safety issues (as any) | Low | 2 hours | Phase 4 |
| 10 | Delete operation bugs | Medium | 1 hour | Phase 2 |
| 11 | TODO polling instead of real-time | Medium | 3 hours | Phase 4 |
| 12 | Deprecated type interfaces | Low | 1 hour | Phase 4 |
| 13 | Missing Firestore indexes | Low | 30 min | Phase 4 |
| 14 | Unused function declarations | Low | 30 min | Phase 4 |
| 15 | Firebase types mismatch | Low | 2 hours | Phase 4 |
| 16 | No error boundaries | Medium | 3 hours | Phase 3 |
| 17 | No ESLint/Prettier | Low | 2 hours | Phase 5 |
| 18 | No Firestore rules tests | Medium | 4 hours | Phase 3 |

### **🟢 LOW PRIORITY (3 issues)**

| # | Issue | Risk | Effort | Phase |
|---|-------|------|--------|-------|
| 19 | Duplicate milestone constants | Low | 1 hour | Phase 5 |
| 20 | Magic numbers | Low | 2 hours | Phase 5 |
| 21 | Missing API docs | Low | 4 hours | Phase 5 |

---

## ⚡ Phase 0: Quick Wins (2 hours) - DO FIRST!

**Goal:** Fix 5 HIGH PRIORITY infrastructure issues in 2 hours

**Why First:** 
- Zero risk
- Immediate impact
- Clears path for real work
- Builds momentum

### **Quick Win #1: Environment Templates (20 minutes)**

**Issue:** #1 - Missing .env.example

**Steps:**
1. Create `.env.example` in root:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_USE_FIREBASE_EMULATOR=true
```

2. Create `functions/.env.example`:
```env
OPENAI_API_KEY=sk-...your_key_here
```

3. Update `README.md` with setup instructions

4. Commit:
```bash
git add .env.example functions/.env.example README.md
git commit -m "feat: Add environment variable templates"
```

**Validation:**
- [ ] .env.example files exist
- [ ] README references them
- [ ] Can set up project from scratch using templates

---

### **Quick Win #2: Remove Build Artifacts (15 minutes)**

**Issues:** #2 (compiled JS) + #6 (build artifacts) - COMBINED

**Steps:**
1. Update `.gitignore`:
```gitignore
# Build output
dist/
functions/lib/

# TypeScript build cache
*.tsbuildinfo

# Firebase logs
firebase-debug.log
firestore-debug.log
ui-debug.log
```

2. Remove from Git:
```bash
git rm -r --cached dist/
git rm -r --cached functions/lib/
git rm --cached tsconfig.tsbuildinfo
git rm --cached firebase-debug.log firestore-debug.log
```

3. Rebuild to verify:
```bash
npm run build
cd functions && npm run build
```

4. Commit:
```bash
git add .gitignore
git commit -m "chore: Remove build artifacts from Git tracking"
```

**Validation:**
- [ ] No build artifacts in `git status`
- [ ] Project still builds successfully
- [ ] .gitignore covers all patterns

---

### **Quick Win #3: Delete Nested Functions Folder (20 minutes)**

**Issue:** #7 - Nested functions/functions/ folder

**Steps:**
1. Verify which is correct:
```bash
# Check firebase.json
cat firebase.json | grep "functions"

# Should show: "source": "functions"

# Verify source exists
ls functions/src/
```

2. Backup (just in case):
```bash
# If nervous, create temporary backup
cp -r functions/functions /tmp/functions-backup-$(date +%s)
```

3. Delete nested folder:
```bash
rm -rf functions/functions/
```

4. Verify functions still work:
```bash
cd functions
npm run build
firebase emulators:start --only functions
# Test a function call
```

5. Commit:
```bash
git add functions/
git commit -m "chore: Remove duplicate nested functions folder"
```

**Validation:**
- [ ] Only one functions directory exists
- [ ] Functions compile successfully
- [ ] Emulator starts without errors
- [ ] No duplicate package.json files

---

### **Quick Win #4: Clean Deprecated Compiled Code (5 minutes)**

**Issue:** #3 - Old milestones.js still compiled

**Steps:**
1. Clean and rebuild:
```bash
cd functions
rm -rf lib/
npm run build
```

2. Verify old file gone:
```bash
# Should NOT exist
ls lib/milestones.js 2>/dev/null || echo "✓ Correctly deleted"
```

3. Check what IS compiled:
```bash
ls lib/
# Should see: contextBuilder, index, milestoneConstants, 
#             rateLimit, scheduledMilestones, types
```

**Validation:**
- [ ] milestones.js does NOT exist in lib/
- [ ] All current source files ARE compiled
- [ ] No compilation errors

---

### **Quick Win #5: Centralize Paths & Fix Deletes (1.5 hours)**

**Issue:** #10 - Delete operations use wrong paths  
**Improvement:** Create shared `paths.ts` for all services to use

**Steps:**

1. **Create shared paths file** `src/features/kamehameha/services/paths.ts`:
```typescript
/**
 * Centralized Firestore paths
 * Single source of truth for all path construction
 * 
 * IMPORTANT: Distinguishes between COLLECTIONS and DOCUMENTS
 * - COLLECTION_PATHS: Contains multiple documents (use with collection())
 * - DOCUMENT_PATHS: Single documents (use with doc())
 * 
 * All services and hooks MUST import from this file.
 * Do NOT use hardcoded path strings elsewhere.
 */

// Collections (contain multiple documents)
export const COLLECTION_PATHS = {
  checkIns: (userId: string) => `users/${userId}/kamehameha_checkIns`,
  relapses: (userId: string) => `users/${userId}/kamehameha_relapses`,
  journeys: (userId: string) => `users/${userId}/kamehameha_journeys`,
  badges: (userId: string) => `users/${userId}/kamehameha_badges`,
  chatMessages: (userId: string) => `users/${userId}/kamehameha_chatHistory`, // NOTE: Production uses 'chatHistory' not 'chat_messages'
} as const;

// Documents (single documents, NOT collections)
export const DOCUMENT_PATHS = {
  streak: (userId: string) => `users/${userId}/kamehameha/streaks`, // This is a DOCUMENT, not a collection!
} as const;

// Helper to get document references within collections
export const getDocPath = {
  checkIn: (userId: string, id: string) => `${COLLECTION_PATHS.checkIns(userId)}/${id}`,
  relapse: (userId: string, id: string) => `${COLLECTION_PATHS.relapses(userId)}/${id}`,
  journey: (userId: string, id: string) => `${COLLECTION_PATHS.journeys(userId)}/${id}`,
  badge: (userId: string, id: string) => `${COLLECTION_PATHS.badges(userId)}/${id}`,
  chatMessage: (userId: string, id: string) => `${COLLECTION_PATHS.chatMessages(userId)}/${id}`,
} as const;
```

2. **Update firestoreService.ts** - Add import and update all paths:
```typescript
import { COLLECTION_PATHS, DOCUMENT_PATHS, getDocPath } from './paths';

// Update streak document references
// BEFORE
const streaksRef = doc(db, 'users', userId, 'kamehameha', 'streaks');
// AFTER
const streaksRef = doc(db, DOCUMENT_PATHS.streak(userId));

// Update deleteCheckIn (line ~355)
// BEFORE
const checkInRef = doc(db, 'users', userId, 'kamehameha', CHECKINS_COLLECTION, checkInId);
// AFTER
const checkInRef = doc(db, getDocPath.checkIn(userId, checkInId));

// Update deleteRelapse (line ~467)
// BEFORE
const relapseRef = doc(db, 'users', userId, 'kamehameha', RELAPSES_COLLECTION, relapseId);
// AFTER
const relapseRef = doc(db, getDocPath.relapse(userId, relapseId));
```

3. **Update journeyService.ts** - Import and use paths:
```typescript
import { COLLECTION_PATHS } from '../services/paths';

// Update all collection() calls
const journeysRef = collection(db, COLLECTION_PATHS.journeys(userId));
```

4. **Update hooks** (useBadges, useCheckIns, useRelapses, etc.):
```typescript
import { COLLECTION_PATHS } from '../services/paths';

// Update snapshot queries
const badgesRef = collection(db, COLLECTION_PATHS.badges(user.uid));
```

5. **Scan for hardcoded paths** (find any we missed):
```bash
# Add to package.json
"scripts": {
  "scan:paths": "node scripts/scan-hardcoded-paths.js"
}
```

Create `scripts/scan-hardcoded-paths.js`:
```javascript
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const pathPatterns = [
  /users\/\${.*?}\/kamehameha/,
  /'users\/.*?\/kamehameha/,
  /"users\/.*?\/kamehameha/,
];

// Manual recursive directory walker (Node.js doesn't support recursive option)
function walkDirectory(dir, fileList = []) {
  const entries = readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Recurse into subdirectory
      walkDirectory(fullPath, fileList);
    } else if (entry.name.match(/\.(ts|tsx)$/)) {
      fileList.push(fullPath);
    }
  }
  
  return fileList;
}

let found = false;
const files = walkDirectory('src/features/kamehameha');

for (const filePath of files) {
  // Skip the source file itself
  if (filePath.includes('services/paths.ts') || filePath.includes('services\\paths.ts')) continue;
  
  const content = readFileSync(filePath, 'utf-8');
  for (const pattern of pathPatterns) {
    if (content.match(pattern)) {
      console.error(`⚠️  Hardcoded path in: ${filePath}`);
      found = true;
    }
  }
}

if (found) {
  console.error('\n❌ Found hardcoded paths. Use COLLECTION_PATHS from services/paths.ts instead.');
  process.exit(1);
} else {
  console.log('✅ No hardcoded paths found. All using centralized paths!');
}
```

6. **Test manually**:
```bash
# Start emulator
firebase emulators:start

# In app:
# - Create check-in → Delete it → Verify gone
# - Create relapse → Delete it → Verify gone
# - Journey history loads correctly
# - Badges load correctly
```

7. **Verify no hardcoded paths**:
```bash
npm run scan:paths
```

8. Commit:
```bash
git add src/features/kamehameha/services/paths.ts
git add src/features/kamehameha/services/firestoreService.ts
git add src/features/kamehameha/services/journeyService.ts
git add src/features/kamehameha/hooks/
git add scripts/scan-hardcoded-paths.js
git add package.json
git commit -m "feat: Centralize Firestore paths and fix delete operations

- Created shared services/paths.ts for all path construction
- Updated all services and hooks to use centralized paths
- Fixed delete operation paths (checkIns, relapses)
- Added scan script to prevent future hardcoded paths
- Single source of truth for all collection paths"
```

**Validation:**
- [ ] paths.ts file created with all collection paths
- [ ] firestoreService.ts imports and uses paths
- [ ] journeyService.ts imports and uses paths
- [ ] All hooks import and use paths
- [ ] Delete operations actually delete data
- [ ] No Firestore errors in console
- [ ] `npm run scan:paths` passes (no hardcoded paths)
- [ ] All features still work correctly

---

### **Quick Wins Summary**

**Time:** 2.5 hours total  
**Issues Fixed:** 5 HIGH PRIORITY (#1, #2, #3, #6, #7) + 1 MEDIUM (#10)  
**Risk:** Minimal (all reversible)  
**Impact:** HUGE (clean foundation for real work)

**Checklist:**
- [ ] Environment templates created
- [ ] Build artifacts removed from Git
- [ ] Nested functions folder deleted
- [ ] Deprecated compiled code cleaned
- [ ] Centralized paths created (paths.ts)
- [ ] Delete operations fixed
- [ ] Path scan script added
- [ ] All changes committed
- [ ] Project still builds and runs

---

## 🏗️ Phase 1: Critical Code Quality (1.5 weeks)

**Goal:** Fix remaining 2 HIGH PRIORITY code issues

**Timeline:** 7-10 business days  
**Focus:** Logging and validation

### **Day 1-2: Logging Infrastructure (Issue #5)**

#### **Part A: Create Logger Utility (2 hours)**

**Steps:**

1. **Create `src/utils/logger.ts`**:
```typescript
/**
 * Production-safe logging utility
 * - Development: All logs visible
 * - Production: Only errors visible + build-time stripping
 */

const isDevelopment = import.meta.env.DEV;

// Sanitize sensitive data before logging
function sanitize(data: unknown): unknown {
  if (typeof data === 'string') {
    // Partially hide user IDs: "dEsc...kzVX"
    return data.replace(/^([a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/, '$1...$2');
  }
  if (Array.isArray(data)) {
    return data.length > 5 ? `[${data.length} items]` : data;
  }
  return data;
}

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args.map(sanitize));
    }
  },
  
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info(...args.map(sanitize));
    }
  },
  
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  error: (...args: unknown[]) => {
    // Always log errors
    console.error(...args);
  },
  
  group: (label: string) => {
    if (isDevelopment) {
      console.group(label);
    }
  },
  
  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },
};
```

2. **Configure build optimization in `vite.config.ts`**:
```typescript
export default defineConfig({
  // ... existing config
  esbuild: {
    drop: ['debugger'], // Only drop debugger statements, NOT console!
    // NOTE: We DON'T drop 'console' because:
    // - logger.error() relies on console.error for production logging
    // - Dropping 'console' would remove ALL console methods including .error
    // - logger.debug/info already check isDevelopment at runtime
  },
});
```

> **CRITICAL:** Do NOT add `'console'` to the drop array! This would strip `console.error`, 
> breaking `logger.error()` which is the only production logging mechanism.

3. **Test logger**:
- Run in dev mode - all logs should appear (logger checks `isDevelopment`)
- Build for production - only errors appear (logger.error bypasses check)
- Errors should ALWAYS appear in production (critical!)

4. Commit:
```bash
git add src/utils/logger.ts vite.config.ts
git commit -m "feat: Add production-safe logger with build-time stripping"
```

---

#### **Part B: Replace Console Statements (1-2 days)**

**Strategy:** File-by-file replacement, test after each file

**Replacement Map:**
```
console.log(...)      → logger.debug(...)
console.info(...)     → logger.info(...)
console.warn(...)     → logger.warn(...)
console.error(...)    → logger.error(...)  (keep!)
console.group(...)    → logger.group(...)
console.groupEnd(...) → logger.groupEnd()
```

**Order of Attack (by file, most to least):**

**Day 1 Morning:**
1. `firestoreService.ts` (21 logs)
   - Import logger
   - Replace all console.log with logger.debug
   - Keep console.error as logger.error
   - Test: Create/read/update/delete operations

2. `journeyService.ts` (18 logs)
   - Same process
   - Test: Journey lifecycle operations

**Day 1 Afternoon:**
3. `useStreaks.ts` (5 logs)
4. `useBadges.ts` (5 logs)
5. `useMilestones.ts` (3 logs)
   - Test: App runs, badges work, milestones detected

**Day 2 Morning:**
6. Remaining 22 logs across other files:
   - AI chat service
   - Check-in hooks
   - Relapse hooks
   - Components

**Day 2 Afternoon:**
7. **Verification (Cross-Platform)**:

**Option A: Use ESLint (Recommended)**
```bash
# ESLint will catch console statements automatically
npm run lint

# Should see NO errors for console.log/warn in kamehameha files
```

**Option B: Use NPM Script**
```bash
# Add to package.json scripts
"scan:console": "node scripts/scan-console.js"

# Then run
npm run scan:console
```

Create `scripts/scan-console.js`:
```javascript
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const consolePatterns = [
  { regex: /console\.log\(/, type: 'console.log' },
  { regex: /console\.warn\(/, type: 'console.warn' },
];

// Manual recursive directory walker (Node.js doesn't support recursive option)
function walkDirectory(dir, fileList = []) {
  const entries = readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Recurse into subdirectory
      walkDirectory(fullPath, fileList);
    } else if (entry.name.match(/\.(ts|tsx)$/)) {
      fileList.push(fullPath);
    }
  }
  
  return fileList;
}

let found = false;
const files = walkDirectory('src/features/kamehameha');

for (const filePath of files) {
  // Skip logger.ts itself
  if (filePath.includes('utils/logger.ts') || filePath.includes('utils\\logger.ts')) continue;
  
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach((line, idx) => {
    for (const pattern of consolePatterns) {
      if (line.match(pattern.regex)) {
        console.error(`⚠️  ${pattern.type} found in: ${filePath}:${idx + 1}`);
        console.error(`   ${line.trim()}`);
        found = true;
      }
    }
  });
}

if (found) {
  console.error('\n❌ Found console.log/warn statements. Use logger instead!');
  process.exit(1);
} else {
  console.log('✅ No console.log/warn statements found!');
}
```

8. **Production build test**:
```bash
npm run build

# Verify build size is reasonable (console stripping works)
# Check that build succeeds without errors
```

**Commit Strategy:**
- Commit after each file or logical group
- Example: `refactor(kamehameha): Replace console logs with logger in firestoreService`

**Validation:**
- [ ] Logger utility created
- [ ] Build-time stripping configured (`esbuild.drop`)
- [ ] All 74 console.log replaced
- [ ] All console.warn replaced
- [ ] console.error changed to logger.error
- [ ] `npm run lint` passes (or `npm run scan:console`)
- [ ] Dev mode shows logs
- [ ] Production build succeeds
- [ ] App functions normally

---

### **Day 3: Runtime Validation with Zod (Issue #8)**

**Goal:** Add Zod validation to **ALL** callable Cloud Functions

**Steps:**

1. **Install Zod** (in Cloud Functions):
```bash
cd functions
npm install zod
```

2. **Create validation schemas** (`functions/src/validation.ts`):
```typescript
import { z } from 'zod';

/**
 * Chat request validation schema
 * @example Valid: { message: "Hello", isEmergency: false }
 * @example Invalid: { message: "", isEmergency: "yes" }
 */
export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  isEmergency: z.boolean().optional().default(false),
});

/**
 * Get chat history request validation schema
 * @example Valid: { limitCount: 20 }
 * @example Invalid: { limitCount: -5 }
 */
export const GetChatHistorySchema = z.object({
  limitCount: z.number().int().min(1).max(100).optional().default(20),
});

/**
 * Clear chat history request validation schema
 * @example Valid: { confirm: true }
 * @example Invalid: { confirm: false }
 */
export const ClearChatHistorySchema = z.object({
  confirm: z.boolean().refine(val => val === true, {
    message: 'Must confirm deletion by setting confirm: true'
  }),
});

// Export types
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type GetChatHistoryRequest = z.infer<typeof GetChatHistorySchema>;
export type ClearChatHistoryRequest = z.infer<typeof ClearChatHistorySchema>;

// Export validation helper
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
```

3. **Update Cloud Functions** (`functions/src/index.ts`):

**chatWithAI:**
```typescript
import { ChatRequestSchema, validateRequest } from './validation';

export const chatWithAI = onCall(async (request) => {
  // Validate request
  const validation = validateRequest(ChatRequestSchema, request.data);
  
  if (!validation.success) {
    throw new HttpsError(
      'invalid-argument',
      'Invalid request format',
      validation.errors.errors
    );
  }
  
  const data = validation.data; // Type-safe!
  // ... rest of function
});
```

**getChatHistory:**
```typescript
import { GetChatHistorySchema, validateRequest } from './validation';

export const getChatHistory = onCall(async (request) => {
  const validation = validateRequest(GetChatHistorySchema, request.data || {});
  
  if (!validation.success) {
    throw new HttpsError(
      'invalid-argument',
      'Invalid request format',
      validation.errors.errors
    );
  }
  
  const { limitCount } = validation.data;
  // ... rest of function
});
```

**clearChatHistory:**
```typescript
import { ClearChatHistorySchema, validateRequest } from './validation';

export const clearChatHistory = onCall(async (request) => {
  const validation = validateRequest(ClearChatHistorySchema, request.data);
  
  if (!validation.success) {
    throw new HttpsError(
      'invalid-argument',
      'Must confirm deletion',
      validation.errors.errors
    );
  }
  
  // Type-safe and validated!
  // ... rest of function
});
```

4. **Test validation for ALL functions**:
```bash
# Start emulator
firebase emulators:start

# Test chatWithAI
# - Valid: { message: "Help me" } → Should work
# - Invalid: { message: "" } → Should error
# - Invalid: { message: 123 } → Should error

# Test getChatHistory  
# - Valid: { limitCount: 20 } → Should work
# - Valid: {} → Should use default (20)
# - Invalid: { limitCount: -5 } → Should error

# Test clearChatHistory
# - Valid: { confirm: true } → Should work
# - Invalid: { confirm: false } → Should error
# - Invalid: {} → Should error
```

5. Commit:
```bash
git add functions/src/validation.ts
git add functions/src/index.ts
git commit -m "feat(functions): Add Zod runtime validation for ALL Cloud Functions

- Added validation schemas for all callable functions
- chatWithAI: message length and type validation
- getChatHistory: limitCount validation with defaults
- clearChatHistory: confirmation requirement
- Type-safe with inferred types from schemas
- Clear error messages for invalid requests"
```

**Validation:**
- [ ] Zod installed in functions
- [ ] Validation schemas created for ALL functions
- [ ] chatWithAI validates message
- [ ] getChatHistory validates limitCount
- [ ] clearChatHistory validates confirm
- [ ] Invalid requests return clear errors
- [ ] Type safety maintained (inferred types)
- [ ] All tests pass

---

### **Phase 1 Summary**

**Completed:**
- Issue #5: Console logging fixed (74 → 0 statements)
- Issue #8: Runtime validation added (Zod)

**Time:** 1.5 weeks  
**Remaining HIGH PRIORITY:** Issue #4 (testing) - addressed in Phase 3

---

## 🧪 Phase 2: Testing & Stability (2 weeks)

**Goal:** Add comprehensive test coverage + error handling

**Issues Addressed:** #4 (HIGH), #16, #18 (MEDIUM)

### **Week 1: Infrastructure & Service Tests**

#### **Day 1: Test Infrastructure Setup**

**Steps:**

1. **Install additional testing dependencies**:
```bash
npm install --save-dev \
  @firebase/rules-unit-testing \
  @testing-library/react \
  @testing-library/user-event \
  @testing-library/jest-dom \
  msw
```

> **Note:** `@testing-library/react` already includes `renderHook` (no need for deprecated `@testing-library/react-hooks`).
> Vitest environment is already configured (jsdom) in `vitest.config.ts`.

2. **Create Firebase mocks** (`src/test/mocks/firebase.ts`):
```typescript
// Mock Firestore
export const mockFirestore = {
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  // ... etc
};

// Mock Auth
export const mockAuth = {
  currentUser: { uid: 'test-user-123' },
  signInAnonymously: vi.fn(),
  // ... etc
};
```

3. **Create test fixtures** (`src/test/fixtures/kamehameha.ts`):
```typescript
// Standard test data
export const testUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
};

export const testJourney = {
  id: 'journey-123',
  startDate: Date.now() - 86400000, // 1 day ago
  endDate: null,
  achievementsCount: 2,
  violationsCount: 0,
  // ...
};

export const testBadge = {
  id: 'badge-123',
  journeyId: 'journey-123',
  milestoneSeconds: 60,
  // ...
};
```

4. **Add jest-dom to test setup** (`src/test/setup.ts`):
```typescript
// Add to existing setup file
import '@testing-library/jest-dom';
```

5. **Configure test utilities** (`src/test/utils.tsx`):
```typescript
import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react'; // Built-in since React 18

// Wrapper with providers
export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <AuthProvider>
      <StreaksProvider>
        {ui}
      </StreaksProvider>
    </AuthProvider>
  );
}

// Hook wrapper
export function renderHookWithProviders<T>(hook: () => T) {
  return renderHook(hook, {
    wrapper: ({ children }) => (
      <AuthProvider>
        <StreaksProvider>
          {children}
        </StreaksProvider>
      </AuthProvider>
    ),
  });
}
```

---

#### **Day 2-3: Service Layer Tests**

**Create:** `src/features/kamehameha/services/__tests__/`

**1. streakCalculations.test.ts** (2 hours)
```typescript
describe('calculateStreakFromStart', () => {
  test('calculates correct duration', () => {
    const startDate = Date.now() - 60000; // 1 minute ago
    const result = calculateStreakFromStart(startDate);
    expect(result.totalSeconds).toBe(60);
  });
  
  test('handles negative durations', () => {
    const startDate = Date.now() + 60000; // future
    const result = calculateStreakFromStart(startDate);
    expect(result.totalSeconds).toBe(0); // Should clamp to 0
  });
  
  // ... 10 more tests
});

describe('parseStreakDisplay', () => {
  test('parses seconds to D:H:M:S', () => {
    const result = parseStreakDisplay(90061); // 1d 1h 1m 1s
    expect(result.days).toBe(1);
    expect(result.hours).toBe(1);
    expect(result.minutes).toBe(1);
    expect(result.seconds).toBe(1);
  });
  
  // ... 8 more tests
});
```

**2. journeyService.test.ts** (4 hours)
```typescript
describe('createJourney', () => {
  test('creates journey with correct initial values', async () => {
    const journey = await createJourney('user-123');
    expect(journey.achievementsCount).toBe(0);
    expect(journey.violationsCount).toBe(0);
    expect(journey.endDate).toBeNull();
  });
});

describe('resetMainStreak (CRITICAL)', () => {
  test('transaction ends old journey', async () => {
    // ... atomic transaction test
  });
  
  test('transaction creates new journey', async () => {
    // ...
  });
  
  test('rolls back on failure', async () => {
    // Test atomic behavior
  });
});

// ... 15 more tests
```

**3. firestoreService.test.ts** (6 hours)
```typescript
describe('initializeUserStreaks', () => {
  test('creates streaks document', async () => {
    // ...
  });
  
  test('creates initial journey', async () => {
    // ...
  });
  
  test('links journey to streaks', async () => {
    // ...
  });
});

describe('deleteCheckIn', () => {
  test('deletes from correct path', async () => {
    // VERIFY FIX FROM QUICK WINS
  });
});

// ... 20 more tests
```

---

#### **Day 4-5: Hook Tests**

**Create:** `src/features/kamehameha/hooks/__tests__/`

**1. useStreaks.test.ts** (4 hours)
```typescript
describe('useStreaks', () => {
  test('loads streaks on mount', async () => {
    // ...
  });
  
  test('calculates display from journey', async () => {
    // ...
  });
  
  test('updates display every second', async () => {
    // ...
  });
  
  test('resetMainStreak calls service correctly', async () => {
    // ...
  });
  
  // ... 12 more tests
});
```

**2. useMilestones.test.ts** (4 hours)
```typescript
describe('useMilestones', () => {
  test('detects milestone at exact second', async () => {
    // ...
  });
  
  test('creates badge with deterministic ID', async () => {
    // ...
  });
  
  test('does not duplicate if exists', async () => {
    // ...
  });
  
  // ... 10 more tests
});
```

**3. useBadges.test.ts** (3 hours)
```typescript
describe('useBadges', () => {
  test('celebrates badge from current journey', async () => {
    // ...
  });
  
  test('does not celebrate old journey badge', async () => {
    // ...
  });
  
  test('celebrates only highest milestone', async () => {
    // CRITICAL TEST
  });
  
  // ... 8 more tests
});
```

---

### **Week 2: Integration Tests & Error Handling**

#### **Day 6-7: Integration Tests**

**Create:** `src/features/kamehameha/__tests__/integration/`

**1. journey-lifecycle.test.ts** (6 hours)
```typescript
describe('Complete Journey Lifecycle', () => {
  test('initialize → milestone → relapse → new journey', async () => {
    // Test complete flow end-to-end
    // 1. Initialize user
    // 2. Wait for 1 minute milestone
    // 3. Verify badge created
    // 4. Report PMO
    // 5. Verify journey ended
    // 6. Verify new journey created
    // 7. Verify badges preserved
  });
  
  test('rule violation flow', async () => {
    // Test violation WITHOUT reset
  });
  
  // ... 5 more integration tests
});
```

**2. offline-scenario.test.ts** (4 hours)
```typescript
describe('Offline Scenarios', () => {
  test('multiple milestones earned offline', async () => {
    // Simulate user offline for 7 days
    // Multiple badges should be created
    // Only highest should celebrate
  });
});
```

---

#### **Day 8: Error Boundaries (Issue #16)**

**Steps:**

1. **Create error boundary** (`src/components/ErrorBoundary.tsx`):
```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    logger.error('React Error Boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

2. **Wrap routes in `src/main.tsx`**:
```typescript
<ErrorBoundary>
  <KamehamehaPage />
</ErrorBoundary>
```

3. **Test error boundary**:
- Throw error in component
- Verify fallback UI appears
- Verify error logged

---

#### **Day 9: Firestore Rules Tests (Issue #18)**

**Steps:**

1. **Create test file** (`firestore.rules.test.ts`):
```typescript
import { 
  assertFails, 
  assertSucceeds,
  initializeTestEnvironment 
} from '@firebase/rules-unit-testing';

describe('Firestore Security Rules', () => {
  // Use deterministic fixtures (not Date.now()) for consistency
  const FIXED_TIMESTAMP = 1700000000000;
  
  beforeEach(async () => {
    // Isolate test environment - clear data between tests
    await testEnv.clearFirestore();
  });
  
  test('users can read own data', async () => {
    const db = testEnv.authenticatedContext('user123');
    await assertSucceeds(
      getDoc(doc(db, 'users/user123/kamehameha/streaks'))
    );
  });
  
  test('users cannot read other users data', async () => {
    const db = testEnv.authenticatedContext('user123');
    await assertFails(
      getDoc(doc(db, 'users/user456/kamehameha/streaks'))
    );
  });
  
  test('unauthenticated access denied', async () => {
    const db = testEnv.unauthenticatedContext();
    await assertFails(
      getDoc(doc(db, 'users/user123/kamehameha/streaks'))
    );
  });
  
  // Test write rules
  // Test subcollections
  // Test dev test user (should be removed for production)
  
  // ... 15 more tests
});
```

> **Best Practices:**
> - Use `testEnv.clearFirestore()` between tests for isolation
> - Use deterministic timestamps (not `Date.now()`)
> - Proper async/await handling
> - Separate test environment from dev emulator

2. **Add test script to package.json**:
```json
{
  "scripts": {
    "test:rules": "vitest run firestore.rules.test.ts"
  }
}
```

---

### **Phase 2 Summary**

**Completed:**
- Issue #4: Test coverage >70% (100+ tests)
- Issue #16: Error boundaries added
- Issue #18: Firestore rules tested

**Test Count:** 100+ tests
**Coverage:** >70% overall, 100% for critical paths

---

## 🛡️ Phase 2.5: CI/CD Pipeline Guardrails (1 day)

**Goal:** Add continuous integration checks to catch issues early

**Why:** Prevents broken code from reaching production, catches errors at commit time

### **Setup GitHub Actions CI Pipeline**

**Create:** `.github/workflows/ci.yml`
```yaml
name: Continuous Integration

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  frontend-quality:
    name: Frontend Quality Checks
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: TypeScript type check
        run: npm run typecheck
      
      - name: Lint
        run: npm run lint
      
      - name: Unit tests
        run: npm test -- --run
      
      - name: Build
        run: npm run build
      
      - name: Check build size
        run: |
          SIZE=$(du -sh dist | cut -f1)
          echo "Build size: $SIZE"
  
  functions-quality:
    name: Cloud Functions Quality Checks
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'npm'
          cache-dependency-path: functions/package-lock.json
      
      - name: Install functions dependencies
        working-directory: ./functions
        run: npm ci
      
      - name: TypeScript type check (functions)
        working-directory: ./functions
        run: npx tsc --noEmit
      
      - name: Build functions
        working-directory: ./functions
        run: npm run build
      
      - name: Verify no deprecated code compiled
        working-directory: ./functions
        run: |
          if [ -f "lib/milestones.js" ]; then
            echo "❌ Deprecated milestones.js found in build!"
            exit 1
          fi
          echo "✅ No deprecated files in build"
  
  firestore-rules:
    name: Firestore Security Rules Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Test Firestore rules
        run: npm run test:rules
  
  code-quality:
    name: Code Quality Checks
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Check for console.log statements
        run: npm run scan:console
      
      - name: Check for hardcoded paths
        run: npm run scan:paths
      
      - name: Format check
        run: npm run format:check
```

### **Update package.json Scripts**

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "test": "vitest",
    "test:rules": "vitest run firestore.rules.test.ts",
    "scan:console": "node scripts/scan-console.js",
    "scan:paths": "node scripts/scan-hardcoded-paths.js",
    "format:check": "prettier --check \"src/**/*.{ts,tsx}\"",
    "ci": "npm run typecheck && npm run lint && npm run test -- --run && npm run build"
  }
}
```

### **Benefits of CI Pipeline**

1. **Early Error Detection**
   - Catches TypeScript errors before merge
   - Catches linting issues before merge
   - Catches test failures before merge

2. **Prevents Technical Debt**
   - Enforces console.log removal
   - Enforces centralized paths
   - Enforces code formatting

3. **Security Validation**
   - Tests Firestore rules on every change
   - Prevents security regressions

4. **Build Verification**
   - Ensures project builds successfully
   - Verifies no deprecated code in output
   - Checks build size

### **Local Pre-Commit Hook**

**Create:** `.husky/pre-commit` (if using Husky)
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run typecheck
npm run lint
npm run test -- --run
```

Or use lint-staged:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### **Validation**

- [ ] CI workflow file created
- [ ] All jobs run successfully on push
- [ ] TypeScript errors caught by CI
- [ ] Lint errors caught by CI
- [ ] Test failures caught by CI
- [ ] Build failures caught by CI
- [ ] Rules tests run in CI
- [ ] Code quality checks pass

---

## ⚡ Phase 3: Performance & Quality (1.5 weeks)

**Goal:** Fix remaining MEDIUM priority performance and quality issues

**Issues:** #9, #11, #12, #13, #14, #15 (6 MEDIUM issues)

### **Day 1: Quick Type & Code Fixes (4 hours)**

#### **Fix #1: Type Safety Issues (Issue #9)**

**File:** `firestoreService.ts:157`

**Change:**
```typescript
// BEFORE
await updateDoc(streaksRef, updatedStreaks as any);

// AFTER
import { UpdateData } from 'firebase/firestore';
await updateDoc(streaksRef, updatedStreaks as UpdateData<Streaks>);
```

---

#### **Fix #2: Remove Dead Code (Issue #14)**

**File:** `firestoreService.ts:165-172`

**Remove:**
```typescript
/**
 * Save current streak state (called periodically)
 * Phase 5.1: Only saves main streak now
 * ...
 */
// Function doesn't exist, remove JSDoc
```

---

#### **Fix #3: Remove Deprecated Types (Issue #12)**

**File:** `kamehameha.types.ts`

**Steps:**
1. Search for all usages of deprecated types:
```bash
npx ts-prune  # Find unused exports
grep -r "streakType" src/  # Check if still used
```

2. Remove deprecated type definitions
3. Update JSDoc to remove @deprecated notices

---

### **Day 2: Replace Polling with Real-Time (Issue #11)**

**File:** `JourneyHistoryPage.tsx`

**Change:**
```typescript
// BEFORE (polling every 5 seconds)
useEffect(() => {
  const interval = setInterval(async () => {
    await loadJourneys();
  }, 5000);
  return () => clearInterval(interval);
}, []);

// AFTER (real-time listener)
useEffect(() => {
  if (!user?.uid) return;
  
  const journeysRef = collection(db, `users/${user.uid}/kamehameha_journeys`);
  const q = query(journeysRef, orderBy('startDate', 'desc'), limit(20));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const journeysList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Journey[];
    setJourneys(journeysList);
    setLoading(false);
  }, (error) => {
    logger.error('Journey history listener error:', error);
    setError(error);
  });
  
  return () => unsubscribe();
}, [user?.uid]);
```

**Benefits:**
- Instant updates (no 5-second delay)
- Fewer Firestore reads (only on changes)
- Better UX

---

### **Day 3: Firebase Infrastructure (3 hours)**

#### **Fix #1: Create Firestore Indexes (Issue #13)**

**Create:** `firestore.indexes.json` (at repo root)
```json
{
  "indexes": [
    {
      "collectionGroup": "streaks",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "currentJourneyId", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "kamehameha_relapses",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "journeyId", "order": "ASCENDING" },
        { "fieldPath": "streakType", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ]
}
```

> **IMPORTANT NOTES:**
> 1. `streakType` field is used in the current schema for categorization. If this field is being removed/renamed in Phase 5.1, update the index accordingly.
> 
> 2. **Scheduled Function & Collection Group Query:** The `collectionGroup('streaks')` index is for **future use**. Current schema stores streaks as individual DOCUMENTS (`users/{uid}/kamehameha/streaks`), NOT as a collection. The scheduled milestone function (`checkMilestonesScheduled`) uses collection group queries, but won't find existing streak documents in the current schema. This is OK because:
>    - **Primary detection:** Client-side `useMilestones` hook (works now, covers 99% of cases)
>    - **Scheduled function:** Backup for offline scenarios (future enhancement after schema change)
>    - **No immediate action needed:** Deploy the index for future use
> 
> 3. If you want scheduled function to work NOW: Consider migrating to `users/{uid}/streaks/{streakId}` collection structure (major change, requires data migration).

**Deploy:**
```bash
firebase deploy --only firestore:indexes
```

**Document in README:**

Add to README.md:
```markdown
### Firestore Indexes

Required indexes are defined in `firestore.indexes.json` at the repo root.

**Deploy indexes:**
```bash
firebase deploy --only firestore:indexes
```

**View index status:**
```bash
firebase firestore:indexes
```

**Check index build progress:**
Visit Firebase Console → Firestore → Indexes

⏱️ **Note:** Index building can take several minutes to hours depending on data size.
```

---

#### **Fix #2: Update Cloud Function Types (Issue #15)**

**File:** `functions/src/types.ts`

**Update FirestoreStreaks interface:**
```typescript
// BEFORE (outdated)
export interface FirestoreStreaks {
  main: {
    currentSeconds: number;
    longestSeconds: number;
    startTime: number;
    lastUpdated: number;
  };
  discipline: { ... };
  lastUpdated: number;
}

// AFTER (Phase 5.1 schema)
export interface FirestoreStreaks {
  currentJourneyId: string;
  main: {
    longestSeconds: number;
  };
  lastUpdated: number;
}
```

---

### **Phase 3 Summary**

**Completed:**
- Issue #9: Type safety fixed
- Issue #11: Polling replaced with real-time
- Issue #12: Deprecated types removed
- Issue #13: Firestore indexes deployed
- Issue #14: Dead code removed
- Issue #15: Cloud Function types updated

**Time:** 1.5 weeks (including testing of each fix)

---

## 🎨 Phase 4: Polish & Documentation (1 week)

**Goal:** Address LOW PRIORITY code quality items

**Issues:** #17, #19, #20, #21 (1 MEDIUM + 3 LOW)

### **Day 1-2: ESLint & Prettier Setup (Issue #17)**

**Steps:**

1. **Install dependencies**:
```bash
npm install --save-dev \
  eslint \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-config-prettier \
  prettier
```

2. **Create `.eslintrc.json`**:
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "rules": {
    "no-console": ["warn", { "allow": ["error"] }],
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/exhaustive-deps": "error",
    "@typescript-eslint/no-unused-vars": ["error", { 
      "argsIgnorePattern": "^_" 
    }]
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

3. **Create `.prettierrc`**:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100,
  "trailingComma": "es5"
}
```

4. **Add scripts to `package.json`**:
```json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx}\""
  }
}
```

5. **Update lint-staged** (pre-commit):
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "tsc --noEmit"
    ]
  }
}
```

6. **Run initial fix**:
```bash
npm run lint:fix
npm run format
```

7. **Fix any remaining issues manually**

8. **Add to CI**:
```yaml
- name: Lint
  run: npm run lint

- name: Check formatting
  run: npm run format:check
```

---

### **Day 3: Consolidate Constants (Issue #19)**

**Problem:** Milestone constants defined in 3 places

**Solution:**

1. **Keep as source of truth:** `functions/src/milestoneConstants.ts`

2. **Update frontend to import from shared location** or duplicate intentionally:
```typescript
// Option A: Shared config file
// Create shared/milestones.config.ts

// Option B: Keep duplicates but document
// Add comment: "SYNC: This must match functions/src/milestoneConstants.ts"
```

3. **Add validation test**:
```typescript
// Ensure frontend and backend constants match
test('milestone constants match backend', () => {
  expect(FRONTEND_MILESTONES).toEqual(BACKEND_MILESTONES);
});
```

---

### **Day 4: Extract Magic Numbers (Issue #20)**

**Strategy:** Create constants file

**Create:** `src/features/kamehameha/constants/app.constants.ts`
```typescript
export const INTERVALS = {
  UPDATE_DISPLAY_MS: 1000,
  POLLING_MS: 5000,  // Legacy, being removed
  MILESTONE_CHECK_MS: 1000,
} as const;

export const LIMITS = {
  MAX_MESSAGE_LENGTH: 2000,
  RATE_LIMIT_MESSAGES_PER_MIN: 10,
  MAX_CHECKINS_DISPLAY: 10,
  MAX_RELAPSES_DISPLAY: 10,
} as const;

export const TIMEOUTS = {
  SUCCESS_MESSAGE_MS: 3000,
  ERROR_MESSAGE_MS: 5000,
} as const;
```

**Replace magic numbers:**
```typescript
// BEFORE
setInterval(updateDisplay, 1000);

// AFTER
import { INTERVALS } from '../constants/app.constants';
setInterval(updateDisplay, INTERVALS.UPDATE_DISPLAY_MS);
```

---

### **Day 5: API Documentation (Issue #21)**

**Goal:** Document all Cloud Functions

**File:** `functions/src/index.ts`

**Add comprehensive JSDoc:**
```typescript
/**
 * Chat with AI Therapist Cloud Function
 * 
 * Provides compassionate AI-powered support for recovery journey.
 * Includes context about user's streaks, check-ins, and relapses.
 * 
 * @function chatWithAI
 * @callable
 * 
 * @param {ChatRequest} request - User message and flags
 * @param {string} request.message - Message content (1-2000 chars)
 * @param {boolean} [request.isEmergency=false] - Emergency mode flag
 * 
 * @returns {ChatResponse} AI response or error
 * @returns {boolean} response.success - Whether request succeeded
 * @returns {ChatMessage} [response.message] - AI message if successful
 * @returns {string} [response.error] - Error message if failed
 * @returns {boolean} [response.rateLimitExceeded] - Rate limit flag
 * 
 * @throws {HttpsError} 'unauthenticated' - User not logged in
 * @throws {HttpsError} 'invalid-argument' - Invalid message format
 * 
 * @rateLimit 10 messages per minute per user
 * @cost ~$0.004 per message (GPT-4)
 * 
 * @example
 * ```typescript
 * const result = await chatWithAI({
 *   message: "I'm struggling with urges today",
 *   isEmergency: false
 * });
 * if (result.success) {
 *   console.log(result.message.content);
 * }
 * ```
 * 
 * @example Emergency Mode
 * ```typescript
 * const result = await chatWithAI({
 *   message: "I need help right now",
 *   isEmergency: true  // Activates crisis-specific prompts
 * });
 * ```
 * 
 * @see {@link https://platform.openai.com/docs/api-reference OpenAI API Docs}
 */
export const chatWithAI = onCall(
  // ... implementation
);
```

**Create API Reference Doc:** `functions/API_REFERENCE.md`
- List all functions
- Parameters and return types
- Rate limits
- Cost estimates
- Example usage
- Error codes

---

### **Phase 4 Summary**

**Completed:**
- Issue #17: ESLint + Prettier configured
- Issue #19: Constants consolidated
- Issue #20: Magic numbers extracted
- Issue #21: API fully documented

**Time:** 1 week

---

## 📊 Final Validation & Deployment

### **Pre-Production Checklist**

**Infrastructure:**
- [ ] No build artifacts in Git
- [ ] No nested functions folder
- [ ] Environment templates exist
- [ ] .gitignore comprehensive

**Code Quality:**
- [ ] Zero console.log statements in production
- [ ] All types properly defined (no `as any`)
- [ ] ESLint passes with no errors
- [ ] Prettier formatting consistent
- [ ] No dead code remaining

**Testing:**
- [ ] Test coverage >70%
- [ ] All critical paths 100% covered
- [ ] Integration tests pass
- [ ] Firestore rules tested
- [ ] Error boundaries working

**Performance:**
- [ ] Real-time listeners instead of polling
- [ ] Firestore indexes deployed
- [ ] Build size optimized
- [ ] No memory leaks

**Documentation:**
- [ ] README up to date
- [ ] API reference complete
- [ ] .env.example files documented
- [ ] Code comments clear

**Security:**
- [ ] Runtime validation in place
- [ ] Firestore rules tested
- [ ] No API keys in frontend
- [ ] Error messages don't leak data

---

## 📅 Complete Timeline

### **Overview**

| Phase | Duration | Issues Fixed | Risk Level |
|-------|----------|--------------|------------|
| **Phase 0: Quick Wins** | 2.5 hours | 6 issues (5 HIGH, 1 MED) | Low |
| **Phase 1: Critical Fixes** | 1.5 weeks | 2 HIGH issues | Medium |
| **Phase 2: Testing** | 2 weeks | 1 HIGH, 2 MED issues | Medium |
| **Phase 2.5: CI/CD** | 1 day | Infrastructure | Low |
| **Phase 3: Performance** | 1.5 weeks | 6 MED issues | Low |
| **Phase 4: Polish** | 1 week | 1 MED, 3 LOW issues | Low |
| **Final Validation** | 2 days | - | - |
| **TOTAL** | **6-7 weeks** | **21 issues** | - |

### **Detailed Schedule**

**Week 1:**
- Day 1 Morning: Quick Wins (2 hours)
- Day 1 Afternoon: Logger utility
- Day 2-3: Console log replacement
- Day 4: Zod validation
- Day 5: Start test infrastructure

**Week 2-3: Testing**
- Days 6-8: Service layer tests
- Days 9-10: Hook tests
- Days 11-12: Integration tests
- Day 13: Error boundaries
- Day 14: Firestore rules tests
- Day 15: CI/CD pipeline setup

**Week 4-5: Performance**
- Day 15: Type fixes
- Day 16: Real-time listeners
- Day 17: Firestore indexes
- Day 18-19: Cloud Function types
- Day 20-21: Testing all fixes

**Week 6-7: Polish**
- Days 22-23: ESLint/Prettier
- Day 24: Constants consolidation
- Day 25: Magic numbers
- Day 26: API documentation
- Days 27-28: Final validation

---

## 🎯 Success Metrics

### **Quantitative Goals**

- [ ] **0** console.log statements in production
- [ ] **>70%** test coverage overall
- [ ] **100%** coverage for critical paths (reset, milestones)
- [ ] **0** TypeScript errors
- [ ] **0** ESLint errors
- [ ] **21/21** issues resolved
- [ ] **<5s** production build time increase
- [ ] **<10%** bundle size increase

### **Qualitative Goals**

- [ ] Code is maintainable and well-documented
- [ ] New developers can onboard easily
- [ ] Production monitoring in place
- [ ] Error handling is graceful
- [ ] User experience is smooth
- [ ] Security is validated
- [ ] Performance is optimized

---

## 🔄 Rollback Strategy

### **Per-Phase Rollback**

**If Phase Fails:**
1. Identify failing commit
2. Create rollback branch
3. Test rollback thoroughly
4. Communicate to team
5. Investigate root cause

**Rollback Commands:**
```bash
# Rollback to before phase
git checkout -b rollback-phase-N
git reset --hard <commit-before-phase>

# Test rollback
npm install
npm run build
npm test

# If working, force push (with caution)
git push origin rollback-phase-N --force
```

### **Critical Checkpoints**

**After Quick Wins:**
- Verify project builds
- Verify emulator starts
- Tag: `pre-phase-1`

**After Phase 1:**
- Verify all tests pass
- Verify production build
- Tag: `pre-phase-2`

**After Phase 2:**
- Verify coverage >70%
- Verify all features work
- Tag: `pre-phase-3`

**After Phase 3:**
- Verify performance
- Verify no regressions
- Tag: `pre-phase-4`

---

## 📝 Documentation Updates

### **During Implementation**

**Update After Each Phase:**
- `docs/kamehameha/PROGRESS.md` - Mark issues complete
- `CHANGELOG.md` - Document changes
- `docs/kamehameha/DEVELOPER_NOTES.md` - Add learnings

**Final Documentation:**
- Update README with new setup steps
- Document all new testing procedures
- Create deployment guide
- Update architecture docs

---

## 💡 Tips for Success

### **General Principles**

1. **Start with Quick Wins** - Builds momentum and confidence
2. **Test After Every Change** - Catch issues early
3. **Commit Frequently** - Small, reversible changes
4. **Document As You Go** - Don't leave for end
5. **Ask for Help** - When stuck, reach out

### **Common Pitfalls to Avoid**

- ❌ Trying to fix everything at once
- ❌ Skipping tests to save time
- ❌ Not committing frequently
- ❌ Leaving documentation for the end
- ❌ Not validating after each change

### **When Things Go Wrong**

1. **Don't Panic** - Most issues are fixable
2. **Check Git History** - What changed?
3. **Review Test Output** - What's failing?
4. **Consult Documentation** - Is there a known solution?
5. **Rollback if Needed** - It's okay to start over

---

## 🎉 Completion Criteria

### **Definition of Done**

The implementation is complete when:

- [ ] All 21 issues are resolved
- [ ] All tests pass (100+ tests)
- [ ] Coverage >70%
- [ ] Production build succeeds
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Manual testing passed
- [ ] Stakeholder approval received

### **Ready for Production**

The project is ready for production when:

- [ ] All HIGH PRIORITY issues fixed (8/8)
- [ ] All MEDIUM PRIORITY issues fixed (10/10)
- [ ] Security validated (rules tested)
- [ ] Performance validated (no regressions)
- [ ] Monitoring in place (error logging)
- [ ] Deployment guide complete
- [ ] Team trained on new features

---

## 📞 Support & Resources

### **Documentation References**

- `TECHNICAL_DEBT_AUDIT.md` - Full issue list
- `docs/kamehameha/SPEC.md` - Feature requirements
- `docs/kamehameha/DATA_SCHEMA.md` - Database schema
- `docs/kamehameha/DEVELOPER_NOTES.md` - Implementation tips
- `docs/kamehameha/PROGRESS.md` - Current status

### **External Resources**

- [Vitest Documentation](https://vitest.dev/)
- [Firebase Testing Guide](https://firebase.google.com/docs/rules/unit-tests)
- [Zod Documentation](https://zod.dev/)
- [ESLint Rules](https://eslint.org/docs/rules/)

---

**Plan Created:** October 26, 2025  
**Estimated Completion:** December 7, 2025 (6-7 weeks)  
**Confidence Level:** High (85%)

**Ready to Execute!** 🚀

---

## 📌 Quick Reference

**Start Here:** Phase 0 (Quick Wins) - 2 hours  
**Most Critical:** Issue #4 (Tests) and #5 (Logging)  
**Biggest Impact:** Quick Wins - 6 issues in 2 hours  
**Hardest Part:** Test coverage (2 weeks)  
**Final Stretch:** Polish & Documentation (1 week)

**Remember:** Progress > Perfection. Fix issues incrementally and validate frequently! 💪

