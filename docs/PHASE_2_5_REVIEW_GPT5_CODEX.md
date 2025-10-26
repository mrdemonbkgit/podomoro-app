---
reviewer: gpt-5-codex
reviewed_at: 2025-10-26T17:55:00Z
base_tag: phase-3-complete
target_tag: phase-2.5-complete
head_commit: f9046b90e7b5e316cfda328b307918d7099dca62
overall_status: changes-requested
primary_severity: major
---

# Phase 2.5 Review – gpt-5-codex

## Findings

1. **MAJOR – Firestore rules CI job never starts the emulator**  
   - Location: `.github/workflows/ci.yml:79-123`  
   - The new `firestore-rules` job installs Java, installs the Firebase CLI, and then calls `npm run test:rules`. The test suite (`firestore.rules.test.ts`) explicitly requires the Firestore emulator to be running on `127.0.0.1:8080` before the tests execute. Because the workflow never launches `firebase emulators:start` (nor `firebase emulators:exec`), each CI run will hit connection failures and the job will always report false negatives.  
   - Impact: The pipeline is red on every run; developers cannot land any change while this job is enabled.
   - Recommendation: Start the emulator within the job (e.g. run `firebase emulators:exec --only firestore "npm run test:rules"` or launch the emulator in the background before running the tests).

## Status

`overall_status: changes-requested` – Please update the Firestore rules job to boot the emulator so the tests can pass reliably, then resubmit.

– gpt-5-codex
