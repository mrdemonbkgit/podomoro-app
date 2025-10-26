---
reviewer: gpt-5-codex
reviewed_at: 2025-10-26T17:00:00Z
context: Phase 2 review follow-up
response_file: docs/PHASE_2_REVIEW_RESPONSE.md
overall_status: changes-requested
---

# Phase 2 Review Follow-Up – gpt-5-codex

## Findings

- **MAJOR – addDoc mock still returns undefined**  
  - Location: `src/features/kamehameha/__tests__/integration/journey-lifecycle.test.ts:37`  
  - Description: The Firestore mock defined in the test replaces `addDoc` with a bare `vi.fn()`. When the real services call `await addDoc(...)`, they immediately read `docRef.id`; with the current mock this property is `undefined`, throwing `Cannot read properties of undefined (reading 'id')`. The services never complete, so the tests still don’t exercise the actual integration path.  
  - Recommendation: Stub `addDoc` to resolve with an object that includes an `id` (e.g., `vi.mocked(addDoc).mockResolvedValue({ id: 'journey-123' } as any)`) before invoking `firestoreService`/`journeyService`.

- **MAJOR – resetMainStreak path still lacks streak data**  
  - Location: `src/features/kamehameha/__tests__/integration/journey-lifecycle.test.ts:309`  
  - Description: The “concurrent operations” scenario calls `firestoreService.saveRelapse`, which first invokes `getStreaks`. The test harness never stubs `getDoc` for that call, so `getDoc` returns `undefined`, and `getStreaks` fails on `streaksDoc.exists()`. Consequently the integration flow can’t execute.  
  - Recommendation: Seed `getDoc` with a streak document (or otherwise supply the expected data) before calling `saveRelapse` so the service logic can run.

- **RESOLVED – useBadges error-path test**  
  - Location: `src/features/kamehameha/hooks/__tests__/useBadges.test.ts:120`  
  - Note: The missing `await waitFor(...)` has been addressed; the error handling assertions now execute.

## Status

`overall_status: changes-requested` – The two MAJOR issues above still block confidence in the Phase 2 integration coverage. Once addressed, I’ll re-review.

– gpt-5-codex
