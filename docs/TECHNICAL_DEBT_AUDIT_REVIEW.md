# Technical Debt Audit – Review Notes (For Agents)

Date: October 26, 2025  
Source: `TECHNICAL_DEBT_AUDIT.md`  
Audience: Future agents and contributors

---

## High-level

Strong, actionable audit with clear prioritization. A few inconsistencies and several high-impact omissions to add. Below are corrections, additions, and quick wins you can execute safely.

---

## Corrections and clarifications

- Completed markers in “Recommended Action Plan”: They currently imply tasks are done. Replace with unchecked boxes or plain bullets to avoid confusion.
- Logging strategy: Keep the `logger` wrapper, and also strip logs at build time to remove dead code in production.

```ts
// vite.config.ts
export default defineConfig({
  esbuild: { drop: ['console', 'debugger'] }
});
```

- Firestore `onSnapshot`: Ensure unsubscribe on unmount and guard on `user?.uid` (example in audit is good).
- Delete path bugs: In addition to fixing `deleteCheckIn`/`deleteRelapse` paths, centralize collection path builders (single source of truth) to prevent regressions.
- Deprecated types: Before removal, run a usage sweep (`npx tsc --noEmit`, `ts-prune`) and update docs where types are schema-adjacent.

---

## Notable omissions to add to the audit

- Build artifacts tracked in Git:
  - `dist/` is present; should be ignored and removed from Git.
  - `tsconfig.tsbuildinfo` is tracked; ignore and remove from Git.
  - `firebase-debug.log` and `firestore-debug.log` are present; ignore and remove from Git.

```gitignore
# Build output
dist/
functions/lib/

# TypeScript build info
*.tsbuildinfo

# Firebase logs
firebase-debug.log
firestore-debug.log

# Env files
.env.local
.env
```

- Nested Cloud Functions folder: `functions/functions/` exists alongside `functions/src/`. Consolidate to a single `functions/` workspace and delete the nested folder to avoid accidental bad deploys.
- Linting/formatting baseline: Add ESLint + Prettier with TypeScript config; enable `no-console` (allow `error`). Run in CI and pre-commit.
- Firestore rules tests: Add emulator-based tests to assert ownership checks and write constraints.
- Runtime validation: Add `zod` (or similar) for Cloud Function inputs and Firestore reads to prevent runtime type drift.
- CI guardrails: CI should run `npx tsc --noEmit`, `vitest`, `eslint`, Cloud Functions build, and deploy previews for rules/indexes.

---

## Priority tweaks

- Group “compiled JS in Git” and “nested functions folder” into a single high-priority item: Functions build and layout hygiene.
- For logging, explicitly include the Vite `esbuild.drop` setting as a quick win.

---

## Quick wins (1–2 hours)

1. Add `.gitignore` entries above and remove tracked artifacts (`dist/`, `*.tsbuildinfo`, Firebase logs).
2. Delete `functions/functions/` after verifying it’s unused in `firebase.json`.
3. Add `esbuild.drop` to `vite.config.ts` to strip logs in production.
4. Fix incorrect delete paths and centralize collection path helpers.
5. Replace polling with `onSnapshot` in `JourneyHistoryPage`.

---

## Notes for maintainers

- If you change Firestore collection paths or types, update `docs/kamehameha/DATA_SCHEMA.md` and related TypeScript interfaces in the same PR.
- If scheduled queries require indexes, add `firestore.indexes.json` and deploy with `firebase deploy --only firestore:indexes`.
- Always update `docs/kamehameha/PROGRESS.md` when executing any of the actions above.


