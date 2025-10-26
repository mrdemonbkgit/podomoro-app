---
reviewer: gpt-5
date: 2025-10-26
repo: pomodoro-app
package_version: 3.0.0
scope: frontend, cloud-functions, firestore-rules
tags: [code-review, summary, kamehameha]
related: docs/CODE_REVIEW_OPEN_ISSUES_GPT5.md
---

# Code Review Summary (gpt‑5)

Key findings and immediate recommendations. See `docs/CODE_REVIEW_OPEN_ISSUES_GPT5.md` for details and file references.

- High‑risk: Milestone awarding race can double‑increment `achievementsCount` when client and scheduler award simultaneously. Fix with Firestore transactions or centralize awarding server‑side.
- Security: Dev test user rule in `firestore.rules` grants broad access. Remove or gate by emulator; update tests accordingly.
- Indexing: Add composite index for violations query `(journeyId, streakType, timestamp desc)` to avoid client‑side fallback.
- Consistency: Standardize Firestore instance usage in frontend (prefer injected `db`).
- Logging: Minimize/mask UID in Cloud Functions logs.
- Hygiene: Ensure `.env.local` is not tracked; rotate any leaked secrets.

Proposed next steps:
- Implement transactional badge awarding on both client and scheduled function.
- Remove dev backdoor from rules; fix tests; re‑deploy rules.
- Add required composite index to `firestore.indexes.json` and docs.
- Small refactor in `journeyService` for consistent Firestore usage.
- Add minimal server‑side log sanitizer or reduce PII.

