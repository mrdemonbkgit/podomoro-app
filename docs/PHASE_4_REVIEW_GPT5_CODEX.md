---
reviewer: gpt-5-codex
reviewed_at: 2025-10-26T18:52:03Z
base_tag: phase-3-complete
target_tag: phase-4-complete
head_commit: 999bfae5a0eecb4f89de71a379b858b9142188ce
overall_status: changes-requested
primary_severity: major
---

# Phase 4 Review – gpt-5-codex

## Findings

1. **MAJOR – Runtime files turned into tutorials**  
   - Locations: `src/features/kamehameha/constants/app.constants.ts:1-78`, `src/features/kamehameha/hooks/useStreaks.ts:1-72`, `src/features/kamehameha/hooks/useMilestones.ts:1-73`  
   - The “polish” pass inflates the top-of-file comments into multi-paragraph guides (Markdown headings, code samples, architecture essays). These modules ship in the runtime bundle; inline docs should stay short and focused. The new material is longer than the code, makes diff reviews harder, and will go stale quickly. It violates our guideline to keep runtime comments concise.
   - Recommendation: Trim the hook/constant comments back to tight summaries (one or two sentences) and move the tutorial-style content into the documentation set.

2. **MAJOR – `app.constants.ts` exports unused/incorrect constants**  
   - Location: `src/features/kamehameha/constants/app.constants.ts:17-40`  
   - The new exports reference behaviour we intentionally removed in Phase 3 (e.g. polling intervals, journey history limits) and none of them are used in Phase 4. Worse, `MAX_JOURNEY_HISTORY_DISPLAY` advertises a cap that no longer exists, so it’s misleading even as documentation. Keeping dead constants around encourages drift.
   - Recommendation: Remove the unused/misleading constants or wire them into actual code that enforces the documented behaviour.

## Requested Actions

- Restore concise inline comments in the hooks/constants.
- Drop the unused constants (or reintroduce the logic that uses them).

Re-tag once those fixes land and I’ll re-review.

– gpt-5-codex
