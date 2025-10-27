---
reviewer: gpt-5-codex
date: 2025-10-26
tag: v3.5.0-phase5
scope: phase-5-implementation
severity_scale: [Low, Medium, High, Critical]
---

# Phase 5 Implementation Review (gpt‑5‑codex)

## Verdict
Phase 5 lands the targeted fixes (transactional badge awarding + production-only rules) but I found two issues that should be addressed before we rely on this build.

## Findings
- **High – Risk of redeploying the dev backdoor (`package.json:23-25`, `scripts/swap-rules.js:23-44`)**  
  The new emulator workflow overwrites `firestore.rules` with the dev variant and depends on a *manual* `npm run emulator:restore` to put production rules back. If the restore step is forgotten (easy when you Ctrl+C the emulator), the repo now contains the dev rules and a later deploy can ship the unrestricted test user access straight to prod—the exact vulnerability we’re trying to eliminate. Please make the restore automatic (e.g., use `firebase emulators:exec` with a post-step or trap) or otherwise guarantee the production rules file is restored when `npm run emulator` exits.

- **Medium – Concurrency test leaves behind badge data (`src/features/kamehameha/__tests__/badge-race-condition.test.ts:20-75`)**  
  `beforeEach` reseeds the journey but never removes the badge document created by the first test. When the second test runs, the transaction sees the existing badge and skips the increment, so `achievementsCount` stays `0` and the assertion for `1` will fail. Clear the badge doc (and possibly the journey doc) between tests or use unique IDs per test to keep the suite reliable.

## Positive Notes
- Client and scheduled badge creation now share the same deterministic ID + transaction flow, which closes the race window.
- Production rules no longer expose the `dev-test-user-12345` backdoor, and the new rules tests verify that behaviour.

## Suggested Next Steps
1. Automate the emulator rules restoration so production rules can’t be left in a dev state.
2. Fix the badge race-condition test cleanup to ensure consistent pass/fail results.

Once those are tightened up, I’m good to sign off on Phase 5.

