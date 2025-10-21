# Documentation Reorganization Plan

**Date:** October 21, 2025  
**Purpose:** Organize scattered root-level docs into the new structured system

---

## 📊 Current Situation

**Root directory has 30+ documentation files!** This makes it hard to:
- Find relevant information
- Know what's current vs outdated
- Maintain organization

---

## 🎯 New Structure

```
docs/
├── INDEX.md (already exists)
├── AI_SETUP_GUIDE.md (already exists)
│
├── core/ (shared architecture)
│   └── ARCHITECTURE.md (already exists)
│
├── zenfocus/ (Timer feature docs) ← NEW
│   ├── OVERVIEW.md
│   ├── features/
│   │   ├── TASK_MANAGEMENT.md
│   │   ├── AUDIO_SYSTEM.md
│   │   ├── SETTINGS.md
│   │   └── SOUNDS.md
│   ├── releases/
│   │   ├── V2.0.md
│   │   └── V3.0.md
│   └── development/
│       ├── BUILD_SYSTEM.md
│       ├── TESTING.md
│       └── UI_UX_IMPROVEMENTS.md
│
├── kamehameha/ (already well-organized)
│   └── [existing structure]
│
└── archive/ (old/superseded docs) ← NEW
    └── [historical files]
```

---

## 📁 File Categorization

### Keep in Root (Essential Project Files)
These are universal project files:
- ✅ `README.md` - Project overview
- ✅ `CHANGELOG.md` - Version history
- ✅ `ROADMAP.md` - Future plans
- ✅ `AI_AGENT_GUIDE.md` - AI instructions
- ✅ `.cursorrules` - AI auto-load
- ✅ `package.json`, config files, etc.

### Move to `docs/zenfocus/features/`
Timer feature documentation:
- `FEATURE_TASK_MANAGEMENT.md` → `TASK_MANAGEMENT.md`
- `AUDIO_SETUP_GUIDE.md` → `AUDIO_SYSTEM.md`
- `AUDIO_ENGINE_REDESIGN.md` → Include in `AUDIO_SYSTEM.md`
- `AUDIO_FILES_INTEGRATION_COMPLETE.md` → Include in `AUDIO_SYSTEM.md`
- `NEW_SOUNDS_INTEGRATED.md` → Include in `AUDIO_SYSTEM.md`
- `SOUNDS_STATUS.md` → Include in `AUDIO_SYSTEM.md`
- `ENHANCEMENT_INSTANT_SETTINGS.md` → `SETTINGS.md`
- `SAFETY_IMPROVEMENTS.md` → Include in relevant feature doc

### Move to `docs/zenfocus/releases/`
Release documentation:
- `RELEASE_NOTES_V2.0.md` → `V2.0.md`
- `RELEASE_NOTES_V3.0.md` → `V3.0.md`
- `UI_CLEANUP_OCT_2025.md` → Reference in V3.0.md

### Move to `docs/zenfocus/development/`
Development process docs:
- `BUILD_SYSTEM.md` → Keep name
- `TESTING.md` → Keep name
- `UI_UX_UPGRADE_PLAN.md` → `UI_UX_IMPROVEMENTS.md`
- `UI_UX_UPGRADE_COMPLETE.md` → Include in above
- `IMPLEMENTATION_SUMMARY.md` → Include in relevant docs

### Move to `docs/archive/` (Historical)
These are completed/superseded:
- `BUG_FIX_*.md` files (historical bug fixes)
- `BUGFIX_*.md` files
- `FIX_*.md` files
- `BACKWARD_COMPATIBILITY_FIX.md`
- `FEATURE_2.*.md` files (old summaries)
- `TEST_*.md` files (old test reports)
- `SESSION_SUMMARY.md`
- `CI_CD_SETUP_SUMMARY.md`
- `UX_IMPROVEMENT_*.md` (completed)

### Move to `docs/tools/` (Development Tools)
Tool-specific documentation:
- `MCP_SETUP_GUIDE.md` → Keep name
- `MCP_TESTING_WORKFLOW.md` → Keep name
- `CURSOR_MCP_SETUP_STEPS.md` → Keep name
- `download-sounds.md` → Keep name

---

## 🗂️ Consolidation Opportunities

### Audio System (Consolidate 5 files → 1)
Create `docs/zenfocus/features/AUDIO_SYSTEM.md` combining:
- AUDIO_SETUP_GUIDE.md
- AUDIO_ENGINE_REDESIGN.md
- AUDIO_FILES_INTEGRATION_COMPLETE.md
- NEW_SOUNDS_INTEGRATED.md
- SOUNDS_STATUS.md

### UI/UX (Consolidate 3 files → 1)
Create `docs/zenfocus/development/UI_UX_IMPROVEMENTS.md` combining:
- UI_UX_UPGRADE_PLAN.md
- UI_UX_UPGRADE_COMPLETE.md
- UI_CLEANUP_OCT_2025.md

### Bug Fixes (Archive ~10 files)
Move all completed bug fix docs to archive with index

---

## 📋 Implementation Steps

### Step 1: Create New Directories
```bash
mkdir docs/zenfocus
mkdir docs/zenfocus/features
mkdir docs/zenfocus/releases
mkdir docs/zenfocus/development
mkdir docs/archive
mkdir docs/tools
```

### Step 2: Move Essential Files
Move files to their new homes (preserving git history)

### Step 3: Create Consolidated Files
Combine related files into comprehensive docs

### Step 4: Update References
Update links in:
- README.md
- docs/INDEX.md
- CHANGELOG.md
- Any other files referencing moved docs

### Step 5: Create Overview Files
- `docs/zenfocus/OVERVIEW.md` - Timer feature overview
- `docs/archive/README.md` - Archive index
- `docs/tools/README.md` - Tools index

### Step 6: Clean Up
Remove redundant/superseded files

---

## 🎯 Benefits

**After reorganization:**
- ✅ Clear separation: Core / Timer / Kamehameha / Tools / Archive
- ✅ Easy to find relevant docs
- ✅ Consolidated information (no duplicate content)
- ✅ Clean root directory
- ✅ Maintained git history
- ✅ All links updated

**Root directory will only have:**
- Essential project files (README, CHANGELOG, etc.)
- Config files (package.json, vite.config, etc.)
- Scripts and source code

---

## ⚠️ Cautions

1. **Use git mv** - Preserve file history
2. **Update all links** - Check for broken references
3. **Create redirects** - Note old → new locations
4. **Test thoroughly** - Verify all docs accessible
5. **Backup first** - Commit before starting

---

## 📈 Estimated Impact

**Before:**
- 30+ doc files in root
- Hard to navigate
- Duplicated information
- Unclear what's current

**After:**
- 5-6 doc files in root (essentials only)
- Organized by feature/purpose
- Consolidated information
- Clear documentation hierarchy

---

## ✅ Ready to Execute?

Would you like me to:
1. **Execute full reorganization** - Move and consolidate all files
2. **Start with one category** - E.g., just archive old bug fixes
3. **Review plan first** - Discuss changes before executing

Let me know and I'll proceed!

