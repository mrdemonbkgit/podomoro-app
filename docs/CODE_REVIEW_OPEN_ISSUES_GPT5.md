---
reviewer: gpt-5
date: 2025-10-26
repo: pomodoro-app
package_version: 3.0.0
scope: frontend, cloud-functions, firestore-rules
tags: [code-review, open-issues, kamehameha]
related: docs/CODE_REVIEW_SUMMARY_GPT5.md
---

# Code Review — Open Issues (gpt‑5)

This document captures high‑priority issues and actionable recommendations discovered during a focused review of Kamehameha (frontend + Cloud Functions). File references use repo‑relative paths with starting line numbers.

## 1) High‑Risk: Milestone Awarding Race + Double Increment

- Problem: Both client and scheduled function award badges and increment `achievementsCount` with separate writes, without a single transaction. Two writers can race and cause:
  - Duplicate increments of `achievementsCount`
  - Brief inconsistent state if a badge is created while the other path still tries to create/increment

- Evidence:
  - Client creates badge then increments journey count:
    - `src/features/kamehameha/hooks/useMilestones.ts:50`
  - Scheduled function does the same pattern on the server:
    - `functions/src/scheduledMilestones.ts:160`

- Recommendation (choose one, but ensure atomicity):
  1) Keep both client and scheduled creators, but wrap the “create badge if missing + increment achievements” inside a single Firestore transaction on each path. Transaction steps:
     - Read badge doc by deterministic ID (`{journeyId}_{milestoneSeconds}`)
     - If not exists → `set` badge and `update` journey with `increment(1)` within the same transaction; else do nothing
  2) Or centralize awarding in a single server‑only function (preferred for consistency), and let the client only signal/refresh. The scheduled function remains as offline safety net.

## 2) Security: Dev Test User Rule Grants Broad Access

- Problem: Firestore rules allow read/write to a special user document regardless of auth user. This is not gated by environment and would be a production risk if deployed as‑is.
  - `firestore.rules:8`
  - `firestore.rules:15`

- Recommendation:
  - Remove the dev backdoor from production rules. Options:
    - Maintain separate rules files for dev vs prod (load the dev version in emulator only)
    - Or delete this exception and update tests to not rely on the special user

- Follow‑ups:
  - Update `firestore.rules.test.ts` cases that assume dev backdoor access
    - Example references: `firestore.rules.test.ts:210`, `firestore.rules.test.ts:231`

## 3) Indexing: Composite Index Needed for Violations Query

- Problem: Query filters by `journeyId` and `streakType`, and orders by `timestamp desc`. This often needs a composite index; code falls back to client‑side filtering if the index is missing.
  - Query definition: `src/features/kamehameha/services/journeyService.ts:238`
  - Fallback path: `src/features/kamehameha/services/journeyService.ts:256`

- Recommendation:
  - Add a composite index for `kamehameha_relapses` collection on `(journeyId, streakType, timestamp desc)` and document it in `firestore.indexes.json`.
  - Keep the fallback for resilience, but it shouldn’t trigger in production.

## 4) API Consistency: Mixed Firestore Initialization Style

- Observation: Most frontend services import `db` from `src/services/firebase/config.ts`, but `journeyService` uses `getFirestore()` directly.
  - Example: `src/features/kamehameha/services/journeyService.ts:36`

- Recommendation:
  - Prefer a consistent approach for testability and mocking (e.g., always import `db`), unless there’s a specific reason to obtain a fresh instance.

## 5) PII Logging in Cloud Functions

- Observation: Cloud Function logs user IDs in success logs.
  - `functions/src/index.ts:180`

- Recommendation:
  - Keep user identifiers minimal or masked (e.g., partial UID) in logs. Consider a small server‑side logger helper (like the frontend) for sanitization.

## 6) `.env.local` hygiene

- Observation: `.env.local` exists in repo root. `.gitignore` excludes it, but verify it isn’t tracked.
  - File: `.env.local`

- Recommendation:
  - Ensure it is not committed. If any secrets were committed previously, rotate keys.

## 7) Client Update Cadence

- Observation: Client checks milestones every second (cheap computation). Writes only occur on threshold crossing.
  - `src/features/kamehameha/hooks/useMilestones.ts:82`

- Recommendation:
  - Acceptable as‑is. If performance issues appear, consider throttling checks to, e.g., 2–5 seconds without losing UX value.

---

## Proposed Fix Plan

1) Wrap badge creation + journey increment in a transaction on both client and scheduled function. Verify idempotency with deterministic badge IDs.
2) Remove dev test user rule from production rules and adjust tests. Optionally create `firestore.rules.dev` for emulator.
3) Add composite index for violations query; update `firestore.indexes.json` and reference it in docs.
4) Standardize Firestore instance usage in frontend services (prefer injected `db`).
5) Add minimal PII logging policy to Functions and sanitize UID in logs.
6) Confirm `.env.local` not tracked; rotate any exposed secrets.

## Notes for Implementers

- Unit/Integration tests:
  - Add tests that simulate concurrent awarding to confirm no double increments with transactions
  - Update rules tests to remove reliance on dev backdoor user
- Deployment:
  - Re‑deploy rules and indexes alongside app/functions changes
  - Document required indexes in README or `FIREBASE_SETUP.md`

