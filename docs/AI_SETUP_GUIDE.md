# Setting Up AI Agents to Auto-Read Instructions

**Purpose:** Configure AI coding assistants to automatically read project instructions without you asking every time.

---

## 🎯 The Problem

Every time you start a new chat with an AI agent, you have to tell them:
- "Read AI_AGENT_GUIDE.md"
- "Check PROGRESS.md for current status"
- "Follow the documentation structure"

**Solution:** Configure AI tools to automatically load instructions when they start!

---

## ✅ Files Created for Auto-Loading

### 1. `.cursorrules` (Root Directory)
**For:** Cursor AI, GitHub Copilot, Continue.dev, and similar tools

**What it does:**
- Automatically loaded when AI starts in this project
- Provides quick reference to documentation
- Shows critical rules and checklists
- Points to detailed guides

**Status:** ✅ Created and ready

### 2. `.github/CLAUDE_AI_INSTRUCTIONS.md`
**For:** Claude-based AI assistants

**What it does:**
- Standard location for AI instructions
- Quick-start guide for AI agents
- Links to comprehensive documentation

**Status:** ✅ Created and ready

---

## 🛠️ Setup Instructions by Tool

### Cursor AI (Recommended)

**Already set up!** ✅

Cursor automatically reads `.cursorrules` file in your project root.

**To verify:**
1. Open Cursor
2. Start a new chat
3. The AI should already know about your documentation structure
4. Test by asking: "What's the current project status?"
   - AI should reference `docs/kamehameha/PROGRESS.md`

**Optional: Add as workspace instruction:**
1. Cursor Settings → Features → Rules for AI
2. Add: "Read and follow .cursorrules in project root"

---

### GitHub Copilot

**Already set up!** ✅

GitHub Copilot reads `.cursorrules` automatically.

**To enhance:**
1. Create `.github/copilot-instructions.md`:
```markdown
Read AI_AGENT_GUIDE.md and follow all instructions in .cursorrules
Update docs/kamehameha/PROGRESS.md after completing tasks
```

---

### Continue.dev

**Already set up!** ✅

Continue.dev reads `.cursorrules` automatically.

**To enhance:**
1. Open Continue.dev settings
2. Add custom instructions:
```
Before starting any task, read:
1. .cursorrules in project root
2. docs/kamehameha/PROGRESS.md for current status
3. docs/kamehameha/QUICKSTART.md for phase guidance
```

---

### Claude (via API/Custom integrations)

**Setup required:**

If you're using Claude through an API or custom integration:

1. Add this to your system prompt:
```
Read and follow instructions in .github/CLAUDE_AI_INSTRUCTIONS.md
Always check docs/kamehameha/PROGRESS.md for current project status
Update PROGRESS.md after completing tasks
```

2. Or load `.cursorrules` content as part of initial context

---

### ChatGPT / OpenAI API

**Setup required:**

1. In ChatGPT:
   - Go to Settings → Custom Instructions
   - Add: "When working on ZenFocus project, read .cursorrules in repo root"

2. Via API:
   - Add `.cursorrules` content to system message
   - Include reference to documentation in initial prompt

---

### Cline (VSCode Extension)

**Already set up!** ✅

Cline reads `.cursorrules` automatically.

**To enhance:**
1. Cline Settings → Instructions
2. Add: "Always follow .cursorrules and update PROGRESS.md"

---

## 📋 What AI Agents Will Automatically Know

When AI starts working on your project, they'll automatically know:

✅ **Project Structure**
- Dual-purpose app (Timer + Kamehameha)
- Documentation organization
- File structure and naming conventions

✅ **Current Status**
- Where to check: `docs/kamehameha/PROGRESS.md`
- What phase we're in
- Any blockers

✅ **How to Work**
- Read QUICKSTART.md for phase guide
- Read SPEC.md for requirements
- Update PROGRESS.md after tasks
- Document solutions in DEVELOPER_NOTES.md

✅ **Critical Rules**
- Never expose API keys in frontend
- Always update PROGRESS.md
- Test security rules
- Support dark mode and mobile

✅ **Where to Find Info**
- Requirements: `docs/kamehameha/SPEC.md`
- Data structures: `docs/kamehameha/DATA_SCHEMA.md`
- File organization: `docs/kamehameha/FILE_STRUCTURE.md`
- Tips: `docs/kamehameha/DEVELOPER_NOTES.md`

---

## 🧪 Testing the Setup

### Test 1: Auto-Load Verification

**Ask AI:**
> "What documentation should you read before starting work on this project?"

**Expected response should mention:**
- `.cursorrules` or `AI_AGENT_GUIDE.md`
- `docs/kamehameha/PROGRESS.md`
- `docs/kamehameha/QUICKSTART.md`
- Documentation structure

### Test 2: Status Check

**Ask AI:**
> "What's the current project status?"

**Expected response:**
- Should check `docs/kamehameha/PROGRESS.md`
- Mention current phase
- Note completed vs pending tasks

### Test 3: File Location

**Ask AI:**
> "Where should I create a new component for the check-in modal?"

**Expected response:**
- Should reference `docs/kamehameha/FILE_STRUCTURE.md`
- Suggest: `src/features/kamehameha/components/`
- Mention naming convention: `PascalCase.tsx`

---

## 🔄 Updating Instructions

### When to Update `.cursorrules`

**Update if:**
- Critical rules change
- New essential documentation added
- Project structure fundamentally changes
- New phase starts with different priorities

**Don't update for:**
- Minor doc updates
- Bug fixes
- Feature additions (those go in PROGRESS.md)

### How to Update

1. Edit `.cursorrules` file
2. Keep it concise (current length is good)
3. Link to detailed docs rather than duplicating content
4. Test with AI agent to verify changes work

---

## 💡 Pro Tips

### Tip 1: Keep .cursorrules Short
Current file is ~200 lines. This is good!
- Quick to load
- Easy to scan
- Points to detailed docs

### Tip 2: Use Checklists
AI agents respond well to checklists:
```markdown
- [ ] Check PROGRESS.md
- [ ] Read SPEC.md section
- [ ] Update PROGRESS.md after
```

### Tip 3: Emphasize Critical Files
Use emojis and formatting:
```markdown
⚡ ALWAYS UPDATE: docs/kamehameha/PROGRESS.md
```

### Tip 4: Link Everything
Every mention should be a link:
```markdown
[`docs/kamehameha/PROGRESS.md`](docs/kamehameha/PROGRESS.md)
```

### Tip 5: Test Regularly
Every few weeks:
- Start fresh AI chat
- Verify auto-loading works
- Check if instructions are clear

---

## 🎯 Success Criteria

**Setup is successful when:**

✅ AI agents start working without you saying "read the docs"
✅ AI agents check PROGRESS.md automatically
✅ AI agents follow project conventions without prompting
✅ AI agents update documentation as they work
✅ New AI sessions continue where previous ones left off

---

## 🆘 Troubleshooting

### AI Doesn't Seem to Know Project Structure

**Solution 1:** Explicitly mention `.cursorrules`
> "Read .cursorrules in the project root"

**Solution 2:** Check if file is in correct location
- Should be in project root, not in a subdirectory
- Should be named exactly `.cursorrules` (with leading dot)

**Solution 3:** Paste key instructions manually
> "Follow these rules: [paste critical section from .cursorrules]"

### AI Doesn't Update PROGRESS.md

**Reminder prompt:**
> "Remember to update docs/kamehameha/PROGRESS.md after completing each task"

**Add to .cursorrules:** (already there!)
```markdown
⚡ CRITICAL: Update docs/kamehameha/PROGRESS.md after EVERY task
```

### AI Doesn't Know Current Phase

**Direct them:**
> "Check docs/kamehameha/PROGRESS.md for current phase and status"

**Verify PROGRESS.md is updated:**
- If outdated, AI gets confused
- Keep it current yourself as backup

---

## 📊 Files Overview

```
Project Root/
├── .cursorrules ← Main AI instructions (auto-loaded by most tools)
├── AI_AGENT_GUIDE.md ← Complete guide (referenced by .cursorrules)
├── .github/
│   └── CLAUDE_AI_INSTRUCTIONS.md ← For Claude-based tools
└── docs/
    ├── INDEX.md ← Documentation hub
    ├── AI_SETUP_GUIDE.md ← This file
    └── kamehameha/
        ├── PROGRESS.md ← Current status (AI checks this!)
        ├── QUICKSTART.md ← Phase guides
        ├── SPEC.md ← Requirements
        ├── DATA_SCHEMA.md ← Database structure
        ├── DEVELOPER_NOTES.md ← Tips and solutions
        ├── FILE_STRUCTURE.md ← File organization
        ├── DOCUMENTATION_MAINTENANCE.md ← How to maintain
        └── [other docs...]
```

---

## ✅ You're All Set!

With this setup:
- AI agents automatically load project instructions
- They know where to find documentation
- They follow project conventions
- They update documentation as they work
- New AI sessions seamlessly continue previous work

**No more repeating yourself every time you start a chat!** 🎉

---

**Questions?** Check:
- [AI_AGENT_GUIDE.md](../AI_AGENT_GUIDE.md) - Complete AI agent instructions
- [DOCUMENTATION_MAINTENANCE.md](kamehameha/DOCUMENTATION_MAINTENANCE.md) - How to maintain docs
- [INDEX.md](INDEX.md) - Documentation hub

