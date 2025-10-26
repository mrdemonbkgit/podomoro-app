# Phase 3: Performance & Quality - Execution Plan

**Date:** October 26, 2025 (2:50 AM)  
**Status:** 🚀 READY TO EXECUTE  
**Estimated Time:** 1.5 weeks → Let's aim for 1 day! 💪

---

## 📊 **STARTING STATUS**

**Previous Phases:**
- ✅ Phase -1: Prerequisites (DONE)
- ✅ Phase 0: Quick Wins (DONE)
- ✅ Phase 1: Critical Fixes (DONE)
- ✅ Phase 2: Testing & Stability (DONE & **OFFICIALLY ACCEPTED!**)

**Current Phase:**
- 🚀 **Phase 3: Performance & Quality** ⬅️ **WE ARE HERE**

---

## 🎯 **PHASE 3 OBJECTIVES**

Fix 6 MEDIUM priority issues:
1. **Issue #9:** Type safety issues (`as any`)
2. **Issue #11:** Replace polling with real-time
3. **Issue #12:** Remove deprecated types
4. **Issue #13:** Create Firestore indexes
5. **Issue #14:** Remove dead code
6. **Issue #15:** Update Cloud Function types

---

## 📋 **DAY 1: Quick Type & Code Fixes** (4 hours)

### **Task 1: Fix Type Safety (Issue #9)** - 30 min
**File:** `src/features/kamehameha/services/firestoreService.ts`

**Problem:** Using `as any` bypasses TypeScript safety
**Fix:** Use proper `UpdateData<T>` type

**Changes:**
```typescript
// Line 157 (approximate)
// BEFORE:
await updateDoc(streaksRef, updatedStreaks as any);

// AFTER:
import { UpdateData } from 'firebase/firestore';
await updateDoc(streaksRef, updatedStreaks as UpdateData<Streaks>);
```

**Validation:**
- ✅ TypeScript compiles
- ✅ No new errors
- ✅ Commit: "fix(types): Replace 'as any' with proper UpdateData type"

---

### **Task 2: Remove Dead Code (Issue #14)** - 1 hour

**Scan for unused:**
1. JSDoc for removed functions
2. Commented-out code blocks
3. Deprecated function declarations

**Files to check:**
- `firestoreService.ts`
- `streakCalculations.ts`
- `kamehameha.types.ts`

**Actions:**
- Remove JSDoc for non-existent functions
- Remove commented code
- Remove deprecated exports

**Validation:**
- ✅ `npx ts-prune` shows only expected unused exports
- ✅ Grep for deprecated tags
- ✅ Commit: "chore: Remove dead code and outdated JSDoc"

---

### **Task 3: Remove Deprecated Types (Issue #12)** - 1.5 hours

**File:** `src/features/kamehameha/types/kamehameha.types.ts`

**Scan for:**
```bash
grep -r "@deprecated" src/features/kamehameha/
grep -r "StreakType" src/  # Check if still used
```

**Actions:**
1. Identify truly unused types
2. Check for any remaining usages
3. Remove if safe
4. Update JSDoc to remove @deprecated tags

**Validation:**
- ✅ TypeScript compiles
- ✅ No broken imports
- ✅ Tests pass
- ✅ Commit: "refactor(types): Remove deprecated type interfaces"

---

### **Day 1 Summary:**
- ⏱️ Time: 4 hours
- ✅ Issues fixed: #9, #14, #12
- 📝 Commits: 3
- 🎯 Progress: 50% of Phase 3 complete!

---

## 📋 **DAY 2: Replace Polling with Real-Time** (Issue #11)

### **Task: JourneyHistoryPage Real-Time Listener** - 3 hours

**File:** `src/features/kamehameha/pages/JourneyHistoryPage.tsx`

**Current Issue:**
```typescript
// Polls every 5 seconds - wasteful!
useEffect(() => {
  const interval = setInterval(async () => {
    await loadJourneys();
  }, 5000);
  return () => clearInterval(interval);
}, []);
```

**New Implementation:**
```typescript
import { onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';

useEffect(() => {
  if (!user?.uid) return;
  
  const journeysRef = collection(db, COLLECTION_PATHS.journeys(user.uid));
  const q = query(journeysRef, orderBy('startDate', 'desc'), limit(20));
  
  const unsubscribe = onSnapshot(q, 
    (snapshot) => {
      const journeysList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Journey[];
      setJourneys(journeysList);
      setLoading(false);
    }, 
    (error) => {
      logger.error('Journey history listener error:', error);
      setError('Failed to load journey history');
      setLoading(false);
    }
  );
  
  return () => unsubscribe();
}, [user?.uid]);
```

**Benefits:**
- ✅ Instant updates (no 5-second delay)
- ✅ Fewer Firestore reads (only on changes)
- ✅ Better UX
- ✅ Lower cost

**Validation:**
- ✅ Manually test: Create relapse → History updates instantly
- ✅ Test offline: Listener reconnects
- ✅ No console errors
- ✅ Commit: "feat: Replace polling with real-time listener in JourneyHistoryPage"

---

### **Day 2 Summary:**
- ⏱️ Time: 3 hours
- ✅ Issues fixed: #11
- 📝 Commits: 1
- 🎯 Progress: 67% of Phase 3 complete!

---

## 📋 **DAY 3: Firebase Infrastructure** (3 hours)

### **Task 1: Create Firestore Indexes (Issue #13)** - 1.5 hours

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

**Deploy:**
```bash
firebase deploy --only firestore:indexes
```

**Document in README:**
Add Firestore Indexes section with deployment instructions.

**Validation:**
- ✅ Index file created
- ✅ Deployed successfully
- ✅ README updated
- ✅ Commit: "feat: Add Firestore indexes for scheduled queries"

---

### **Task 2: Update Cloud Function Types (Issue #15)** - 1.5 hours

**File:** `functions/src/types.ts`

**Update to match Phase 5.1 schema:**
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

**Check all usages:**
```bash
grep -r "FirestoreStreaks" functions/src/
```

**Update any Cloud Functions using this type.**

**Validation:**
- ✅ Types match current schema
- ✅ Functions compile: `cd functions && npm run build`
- ✅ No TypeScript errors
- ✅ Commit: "fix(functions): Update FirestoreStreaks type to match Phase 5.1 schema"

---

### **Day 3 Summary:**
- ⏱️ Time: 3 hours
- ✅ Issues fixed: #13, #15
- 📝 Commits: 2
- 🎯 Progress: 100% of Phase 3 complete!

---

## ✅ **PHASE 3 COMPLETION CHECKLIST**

**Issues Fixed:**
- [ ] Issue #9: Type safety (`as any` → `UpdateData<T>`)
- [ ] Issue #11: Real-time listener (no more polling)
- [ ] Issue #12: Deprecated types removed
- [ ] Issue #13: Firestore indexes created
- [ ] Issue #14: Dead code removed
- [ ] Issue #15: Cloud Function types updated

**Validation:**
- [ ] All TypeScript compiles
- [ ] Functions build successfully
- [ ] Tests pass: `npm test`
- [ ] Manual testing: App works
- [ ] Firestore indexes deployed
- [ ] Documentation updated

**Documentation:**
- [ ] Update `PROGRESS.md`
- [ ] Create `PHASE_3_COMPLETE.md` summary
- [ ] Tag: `phase-3-complete`

**Final Commit:**
```bash
git tag -a phase-3-complete -m "Phase 3 COMPLETE - 6 MEDIUM issues fixed. Type safety improved, real-time listeners, Firestore indexes deployed, dead code removed, Cloud Function types updated. Production-ready!"
```

---

## 🎯 **SUCCESS METRICS**

**Before Phase 3:**
- ❌ Type safety bypassed with `as any`
- ❌ Polling wastes Firestore reads
- ❌ Dead code clutters codebase
- ❌ Deprecated types confuse developers
- ❌ Missing Firestore indexes
- ❌ Outdated Cloud Function types

**After Phase 3:**
- ✅ Type-safe Firestore updates
- ✅ Real-time listeners (instant updates)
- ✅ Clean, maintainable code
- ✅ No deprecated types
- ✅ Firestore indexes deployed
- ✅ Cloud Functions match current schema

---

## 🚀 **LET'S GO!**

**Estimated Total Time:** 10 hours (over 1.5 weeks)  
**Aggressive Goal:** Complete in 1 day! 💪  
**Priority:** Quality > Speed

**Ready to execute Phase 3!** 🎯


