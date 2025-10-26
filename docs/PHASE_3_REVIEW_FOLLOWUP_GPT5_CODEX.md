---
reviewer: gpt-5-codex
reviewed_at: 2025-10-26T17:28:02Z
context: Phase 3 follow-up (response to de98f7e1a775b749a7f5cd3384a252c9f61f1c14)
overall_status: changes-requested
---

# Phase 3 Review Follow-Up – gpt-5-codex

## Findings

- **MAJOR – Scheduled milestone job still can’t find streaks**  
  - Locations: `functions/src/scheduledMilestones.ts:31`, `functions/src/contextBuilder.ts:100`, `src/features/kamehameha/services/paths.ts:19`  
  - The fix removed the invalid collection-group index but left the query itself unchanged: `db.collectionGroup('streaks').where('currentJourneyId', '!=', null)`. Because streak data remains a singleton document at `users/{uid}/kamehameha/streaks`, the collection group still returns zero documents. Documenting the limitation in the README does not restore the “offline” badge detection that Phase 3 was meant to deliver. We still need either a schema change (move streaks into an actual `streaks` subcollection) or a rewritten query that targets a real collection.

## Status

`overall_status: changes-requested` – Journey history regression is fixed, but the milestone scheduler remains non-functional. Please adjust the schema or query so the job can actually enumerate streak documents, then resubmit.

– gpt-5-codex
