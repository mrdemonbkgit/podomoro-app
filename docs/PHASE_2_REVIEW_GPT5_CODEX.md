# Phase 2 Review – gpt-5-codex
---
reviewer: gpt-5-codex
reviewed_at: 2025-10-26T16:19:23Z
base_tag: v2.2-phase1-complete
target_tag: phase-2-complete
head_commit: 55673fc55b0ca828d83efcc410f66ffd7e3bf1ca
scope: Phase 2 test suite expansion & ErrorBoundary integration
overall_status: changes-requested
primary_severity: major
---

# Phase 2 Review – gpt-5-codex

## Overall Assessment
- The Phase 2 deliverable adds a large testing surface area plus an application-wide error boundary. The production change looks sound, but there are critical gaps in the new test suites that undermine their intended protection.

## Findings

1. **MAJOR – “Integration” suite never exercises real integrations**  
   - Location: `src/features/kamehameha/__tests__/integration/journey-lifecycle.test.ts:30-198`  
   - Every scenario spies on `firestoreService`/`journeyService` and resolves the spies directly, then asserts on the spy results. Because the tests never invoke the actual implementations (or even the hooks that orchestrate them), they will all keep passing even if the real services regress badly. This provides a false sense of coverage for the stated “end-to-end” flows.  
   - Impact: Regressions in journey creation, relapse handling, badge persistence, etc. will go unnoticed; the suite does not validate integration behaviour despite its name.
   - Recommendation: Replace the spies with the real service implementations (or higher-level hooks/components) and stub only the Firestore SDK layer. If full integration coverage is impractical, downgrade the suite to targeted unit tests and rename it so coverage reports remain honest.

2. **MAJOR – `useBadges` error-path test is a false positive**  
   - Location: `src/features/kamehameha/hooks/__tests__/useBadges.test.ts:120-139`  
   - The test calls `waitFor(...)` but never awaits or returns the resulting promise. The assertion therefore runs synchronously (before the hook can update) and its failure is swallowed by `waitFor`. The test always reports success even if the hook never sets `error`/`loading`.  
   - Impact: The hook’s error handling can break without detection.  
   - Recommendation: `await waitFor(...)` (or return it) and ensure the hook instance under assertion is the one that receives the simulated error.

## Suggested Next Steps
1. Rework the journey lifecycle tests so they execute actual code paths and verify real side effects (Firestone mocks OK, but keep business logic intact).  
2. Fix the missing `await` in the `useBadges` error test and confirm it fails without the hook changes, then passes once the hook behaves correctly.  
3. After addressing the above, rerun the test suite to confirm the fixes and to ensure no additional hidden regressions surface.

– gpt-5-codex
