# Documentation Maintenance Guide

**For:** AI Agents and Developers  
**Purpose:** Keep documentation accurate during active development

---

## 📋 Document Types & Update Frequency

### 1. Living Documents (Update Frequently)

**`PROGRESS.md` ⚡ Update CONSTANTLY**
- **When:** After completing ANY task
- **How:** Check off completed items `[x]`, add notes to blockers
- **Rule:** Update this EVERY time you finish a task or hit a blocker

**Example:**
```markdown
- [x] Create Firebase project in console ✅
- [x] Enable Google Authentication ✅
- [ ] Set up Firestore database ← Working on this
  - Blocker: Need to understand collection structure
```

**`DEVELOPER_NOTES.md` 💡 Update As You Learn**
- **When:** You discover a solution, pattern, or gotcha
- **How:** Add to relevant section or create new "Lessons Learned"
- **Rule:** If you spent >30 minutes debugging, document the solution

**Example:**
```markdown
### Phase 1 Learnings

**Issue: Firebase emulator not starting**
- Problem: Port 8080 already in use
- Solution: `firebase emulators:start --only firestore`
- Added: 2025-10-22
```

---

### 2. Semi-Stable Documents (Update When Behavior Changes)

**`SPEC.md` 📝 Update If Requirements Change**
- **When:** Feature behavior differs from spec
- **How:** Update specific feature section, note change in comments
- **Rule:** Only update if ACTUAL behavior differs from documented behavior

**Example:**
```markdown
<!-- CHANGED 2025-10-22: Moved dark mode toggle per user request -->
**FR-1.3: Streak Badge**
- Position: top-right (was: top-left)
```

**`DATA_SCHEMA.md` 🗄️ Update If Schema Changes**
- **When:** You add/remove/modify Firestore fields
- **How:** Update TypeScript interface AND example JSON
- **Rule:** Keep interfaces in sync with actual database structure

---

### 3. Stable Documents (Rarely Update)

**`OVERVIEW.md`, `ARCHITECTURE.md`, `AI_INTEGRATION.md`, `SECURITY.md`**
- **When:** Major architectural changes only
- **How:** Update specific sections, not entire document
- **Rule:** These are reference docs - only update for fundamental changes

---

## 🔄 Update Workflow During Development

### When Starting Work

```
1. Check PROGRESS.md → See current status
2. Read relevant SPEC.md section → Know requirements
3. Check DEVELOPER_NOTES.md → Any known issues?
```

### While Working

```
Every hour or when switching tasks:
1. Update PROGRESS.md → Mark completed items
2. Note any blockers → Document in PROGRESS.md
3. If you found a solution → Add to DEVELOPER_NOTES.md
```

### When Changing Behavior

```
If implementation differs from spec:
1. Ask: Is this a bug or intentional change?
2. If bug → Fix code, don't update docs
3. If intentional → Update SPEC.md, note reason
4. Update PROGRESS.md with completion
```

### At End of Phase

```
Before moving to next phase:
1. Mark all Phase tasks complete in PROGRESS.md
2. Update CHANGELOG.md with phase completion
3. Document major learnings in DEVELOPER_NOTES.md
4. Review SPEC.md for any deviations
5. Update relevant phase stub (phases/PHASE_X.md) if needed
```

---

## 🎯 Practical Rules for AI Agents

### Rule 1: PROGRESS.md is Your Journal
**Always update after completing tasks, even small ones.**

```markdown
❌ BAD: Complete 5 tasks, update once at end of day
✅ GOOD: Complete each task, check it off immediately
```

### Rule 2: Document Solutions, Not Problems
**If debugging took >30 min, add solution to DEVELOPER_NOTES.md**

```markdown
❌ BAD: "Firebase not working"
✅ GOOD: "Firebase emulator error: Port conflict. Solution: Kill process on 8080"
```

### Rule 3: Specs Change, That's OK
**Update SPEC.md when behavior intentionally differs**

```markdown
<!-- CHANGED: 2025-10-22 - User requested cleaner UI -->
- Removed: Settings button from header
- Added: Settings button to FloatingNav
```

### Rule 4: Keep Schema in Sync
**If you modify Firestore structure, update DATA_SCHEMA.md immediately**

```typescript
// Added new field to CheckIn interface
export interface CheckIn {
  // ... existing fields
  tags?: string[]; // NEW: Optional tags for categorization
}
```

### Rule 5: Quick Notes > Perfect Documentation
**Better to have rough notes than no notes**

```markdown
❌ BAD: Skip documentation because you're not sure of wording
✅ GOOD: "TODO: Check if this is correct. Auth redirect seems flaky."
```

---

## 🚨 When to Stop and Update Docs

### Critical Updates (Do Immediately)

**Stop coding and update IF:**

1. **Schema changes** → Update DATA_SCHEMA.md now
   - Added/removed Firestore fields
   - Changed TypeScript interfaces
   - Modified security rules

2. **API changes** → Update relevant docs now
   - Cloud Function signatures changed
   - New endpoints added
   - Breaking changes to hooks

3. **Major bugs found in specs** → Update SPEC.md now
   - Requirements were wrong
   - User flows don't make sense
   - Acceptance criteria impossible

### Can Wait Updates (End of Session)

**Update at end of work session:**

1. **PROGRESS.md** → Mark all completed tasks
2. **DEVELOPER_NOTES.md** → Add lessons learned
3. **CHANGELOG.md** → Note significant features completed

### Rare Updates (End of Phase)

**Only update these for major changes:**

1. **OVERVIEW.md** → Philosophy or approach changed
2. **ARCHITECTURE.md** → System design fundamentally different
3. **Phase stubs** → Different approach needed than described

---

## 📊 Document Update Matrix

| Document | Update Frequency | Update Trigger | Required? |
|----------|-----------------|----------------|-----------|
| PROGRESS.md | Every task | Task completed/blocked | ✅ YES |
| DEVELOPER_NOTES.md | As needed | Found solution (>30min) | ✅ YES |
| SPEC.md | When behavior changes | Intentional deviation | ⚠️ IF DIFFERENT |
| DATA_SCHEMA.md | When schema changes | Firestore fields modified | ✅ YES |
| CHANGELOG.md | End of phase | Feature completed | ✅ YES |
| FILE_STRUCTURE.md | Rarely | New directory pattern | ❌ RARE |
| QUICKSTART.md | Rarely | Steps fundamentally changed | ❌ RARE |
| OVERVIEW.md | Very rarely | Major philosophy shift | ❌ VERY RARE |
| ARCHITECTURE.md | Very rarely | System redesign | ❌ VERY RARE |

---

## 🤖 AI Agent Checklist

### Before Each Coding Session
- [ ] Read PROGRESS.md to see current status
- [ ] Check DEVELOPER_NOTES.md for known issues
- [ ] Review SPEC.md section for what you're building

### During Coding (Every 30-60 Minutes)
- [ ] Update PROGRESS.md with completed tasks
- [ ] Note blockers in PROGRESS.md
- [ ] If spent >30min debugging, document solution

### After Making Changes
- [ ] Schema changed? → Update DATA_SCHEMA.md
- [ ] Behavior differs from spec? → Update SPEC.md (with note)
- [ ] Found useful pattern? → Add to DEVELOPER_NOTES.md

### End of Each Session
- [ ] All completed tasks marked in PROGRESS.md
- [ ] Blockers documented
- [ ] Solutions documented
- [ ] Commit changes with good message

### End of Each Phase
- [ ] All phase tasks complete in PROGRESS.md
- [ ] Update CHANGELOG.md
- [ ] Major learnings in DEVELOPER_NOTES.md
- [ ] Review SPEC.md for deviations

---

## 💡 Automation Ideas

### Git Commit Hook
```bash
# Remind to update docs before commit
if git diff --cached | grep -q "src/features/kamehameha"; then
  echo "⚠️  Remember to update PROGRESS.md!"
fi
```

### VS Code Snippet
```json
{
  "Update Progress": {
    "prefix": "progress",
    "body": [
      "- [x] ${1:task description} ✅"
    ]
  }
}
```

### Daily Reminder
```markdown
At end of each day, ask yourself:
1. Did I update PROGRESS.md?
2. Did I document any solutions in DEVELOPER_NOTES.md?
3. Did any schemas change that need updating?
```

---

## 🎯 Real-World Examples

### Example 1: Bug Fix (No Doc Update)

**Scenario:** Streak timer showing wrong time

```markdown
❌ Don't update SPEC.md - bug was in code, not requirements
✅ Do update PROGRESS.md:
  - [x] Fix streak timer calculation bug ✅
  - Issue: Using minutes instead of seconds
  - Solution: Fixed in streakCalculations.ts
```

### Example 2: Schema Change (Update Required)

**Scenario:** Added `completedAt` field to CheckIn

```markdown
✅ Update DATA_SCHEMA.md:
  export interface CheckIn {
    // ... existing fields
    completedAt?: number; // Timestamp when check-in was completed
  }

✅ Update PROGRESS.md:
  - [x] Add completedAt field to CheckIn schema ✅

✅ Update DEVELOPER_NOTES.md:
  Note: Added completedAt for better analytics later
```

### Example 3: Spec Change (Update Required)

**Scenario:** User wants 5 tasks instead of 3

```markdown
✅ Update SPEC.md:
  <!-- CHANGED 2025-10-22: User requested 5 priorities -->
  **FR-3.1: Task Management**
  - Number of tasks: 5 (was: 3)

✅ Update PROGRESS.md:
  - [x] Increase task limit from 3 to 5 ✅
  - Reason: User feedback

❌ Don't update ARCHITECTURE.md - not a system-level change
```

### Example 4: Major Discovery (Document It!)

**Scenario:** Firebase emulator quirk discovered

```markdown
✅ Add to DEVELOPER_NOTES.md:

### Firebase Emulator Quirks (Added 2025-10-22)

**Offline Persistence Confusion:**
- Problem: Data shows old values then updates
- Cause: Firebase caches data offline by default
- Not a bug: This is expected behavior
- Solution: Understand the cache-then-network pattern

This saved me 2 hours of debugging!
```

---

## 📈 Success Metrics

**Documentation is well-maintained if:**

✅ PROGRESS.md reflects actual current state  
✅ DEVELOPER_NOTES.md has solutions to issues you hit  
✅ DATA_SCHEMA.md matches actual Firestore structure  
✅ SPEC.md describes actual implemented behavior  
✅ New AI agent can pick up where you left off without confusion  

---

## 🚫 Common Mistakes to Avoid

### Mistake 1: "I'll Update Docs Later"
```markdown
❌ BAD: Finish entire phase, then update all docs
✅ GOOD: Update as you go, takes 30 seconds per task
```

### Mistake 2: Updating Everything
```markdown
❌ BAD: Small bug fix → Update OVERVIEW, SPEC, ARCHITECTURE
✅ GOOD: Small bug fix → Update PROGRESS.md only
```

### Mistake 3: No Context in Updates
```markdown
❌ BAD: "- [x] Fixed bug"
✅ GOOD: "- [x] Fixed streak timer showing negative seconds ✅"
```

### Mistake 4: Perfect Documentation Paralysis
```markdown
❌ BAD: Spend 1 hour writing perfect docs for 10min feature
✅ GOOD: Quick bullet points in PROGRESS.md, move on
```

### Mistake 5: Ignoring Deviations
```markdown
❌ BAD: Implement differently than spec, say nothing
✅ GOOD: Note change in SPEC.md with reason
```

---

## 🎓 Philosophy

**Documentation is a TOOL, not a BURDEN.**

Good documentation maintenance:
- Takes 5-10% of development time
- Saves 50%+ time for next person (or you in 2 weeks)
- Prevents "What was I thinking?" moments
- Makes handoffs smooth
- Enables AI agents to continue work

**Remember:** The goal is USEFUL documentation, not PERFECT documentation.

---

## 📞 Questions to Ask Yourself

**Before committing code:**
- [ ] Is PROGRESS.md up to date?
- [ ] Did I document any tricky solutions?
- [ ] Did any schemas change?
- [ ] Does my implementation match the spec?

**If No to last question:**
- [ ] Is this a bug? → Fix code
- [ ] Is this intentional? → Update spec with reason

---

**TL;DR:** Update PROGRESS.md constantly, document solutions in DEVELOPER_NOTES.md, update DATA_SCHEMA.md when schemas change, update SPEC.md when behavior intentionally differs. Everything else rarely needs updates.

Happy coding! 🚀

