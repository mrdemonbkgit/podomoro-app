---
reviewer: gpt-5-codex
reviewed_at: 2025-10-26T17:34:00Z
context: Phase 3 follow-up (response to a618389f32e4d5980b125270ed9116f42d5cf54b)
overall_status: changes-requested
---

# Phase 3 Review Follow-Up (Round 2) – gpt-5-codex

## Findings

- **MAJOR – Requirement still unmet (milestone scheduler remains broken)**  
  - Locations: `functions/src/scheduledMilestones.ts:1-94`, `functions/src/index.ts:33`, `README.md:111-123`  
  - The latest change adds “deprecated / non-functional” banners but leaves the underlying behaviour untouched. The Cloud Function is still deployed (exported from `index.ts`) and still executes the same `collectionGroup('streaks')` query that returns zero documents. Phase 3’s scope called for a working scheduled fallback; documenting that it is broken does not satisfy the review comment or the Phase 3 acceptance criteria.  
  - Result: Users continue to lose milestone tracking when the client is offline, exactly the failure the scheduled job was meant to cover.

## Requested Action

Implement a functional fix so the scheduler can enumerate streak documents (e.g., migrate streak data into an actual `streaks` subcollection or rewrite the job to query real documents) *or* remove the dead function entirely. Simply annotating the code as “non-functional” is not an acceptable resolution.

– gpt-5-codex
