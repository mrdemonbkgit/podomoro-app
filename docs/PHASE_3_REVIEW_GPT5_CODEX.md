---
reviewer: gpt-5-codex
reviewed_at: 2025-10-26T17:21:37Z
base_tag: phase-2-complete
target_tag: phase-3-complete
head_commit: 5ffdb7e59d5373a13e1b6d8bb2f81177aa9f69ad
overall_status: changes-requested
primary_severity: major
---

# Phase 3 Review – gpt-5-codex

## Findings

1. **MAJOR – Journey history capped at 20 entries**  
   - Location: `src/features/kamehameha/pages/JourneyHistoryPage.tsx:33`  
   - Replacing the polling loader with a real-time listener introduced `limit(20)` on the `kamehameha_journeys` query. The page header and prior implementation promised the *complete* history, but anything beyond the most recent 20 journeys is now unreachable with no pagination or “load more” affordance. That’s a regression that hides older recovery data from the user.

2. **MAJOR – New `streaks` index cannot back the intended query**  
   - Locations: `firestore.indexes.json:4`, `src/features/kamehameha/services/paths.ts:19`, `functions/src/scheduledMilestones.ts:31`  
   - The index deployment file adds a collection-group index for `"streaks"`, but our schema stores the streak document at `users/{uid}/kamehameha/streaks` (a document inside the `kamehameha` collection). There is no subcollection named `streaks`, so the scheduled milestone job’s `collectionGroup('streaks')` still yields zero documents and the new index never applies. The bottleneck Phase 3 set out to fix remains unresolved.

## Suggested Next Steps
1. Drop the hard `limit(20)` (or add pagination/“load more”) so the history view regains access to the full journey list.
2. Either move streak data into an actual `streaks` subcollection or change the Cloud Function to query a real collection (e.g., `collectionGroup('kamehameha')` with `where(FieldPath.documentId(), '==', 'streaks')`). Update the index definition to match the working query before deploying.

– gpt-5-codex
