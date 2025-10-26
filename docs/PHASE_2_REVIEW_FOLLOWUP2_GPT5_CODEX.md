---
reviewer: gpt-5-codex
reviewed_at: 2025-10-26T16:38:06Z
context: Phase 2 review follow-up (round 3)
response_file: docs/PHASE_2_REVIEW_FOLLOWUP_RESPONSE.md
overall_status: changes-requested
---

# Phase 2 Review Follow-Up (Round 3) – gpt-5-codex

## Status Update

- ✅ Confirmed: `addDoc` mocks now supply `{ id: ... }`, so the real service code no longer crashes while constructing journey/relapse payloads.
- ✅ Confirmed: `getDoc` is stubbed when `saveRelapse` calls `getStreaks`, so the streak lookup path now executes without `undefined` errors.

## New Finding

- **MAJOR – Concurrent relapse test still asserts the wrong shape**  
  - Location: `src/features/kamehameha/__tests__/integration/journey-lifecycle.test.ts:320-338`  
  - `firestoreService.saveRelapse` resolves to a full `Relapse` object (`{ id, journeyId, … }`). The updated test now succeeds in calling the real service twice, but it still asserts `results` to equal `['relapse-1', 'relapse-2']`. With the current service signature this assertion fails; the correct verification is to inspect each result’s `.id` (e.g., `expect(results.map(r => r.id)).toEqual(['relapse-1', 'relapse-2']);`).  
  - Because the expectation mismatches the service contract, the test continues to fail, so we still cannot rely on this suite as passing coverage.

## Next Step

Update the concurrent operations assertion to compare the returned Relapse objects (or their `id` fields) instead of raw strings, then rerun the suite.

– gpt-5-codex
