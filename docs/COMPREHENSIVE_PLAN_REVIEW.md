# Review – Comprehensive Implementation Plan (All 21 Technical Debt Issues)

Date: October 26, 2025
Source: COMPREHENSIVE_IMPLEMENTATION_PLAN.md
Audience: Coding agent implementing the plan

---

## Summary

The plan is strong: correct prioritization (infrastructure → quality → tests → performance → polish), explicit steps, validation gates, and rollback. A few adjustments will improve accuracy and execution speed.

---

## Must-fix corrections (apply before execution)

- Testing libs reference:
  - Replace @testing-library/react-hooks with @testing-library/react + built‑in renderHook (works with Vitest + jsdom already configured in vitest.config.ts).
  - Add @testing-library/jest-dom to setup for matchers if used.
  - Install:
    ```bash
    npm i -D @testing-library/react @testing-library/user-event @testing-library/jest-dom msw
    ```

- Relapses index fields and type:
  - The plan adds an index on kamehameha_relapses including streakType. Current code still references streakType in several places; confirm the intended schema per Phase 5.1.
  - If keeping streakType, the index is fine. If migrating to relapseType, update the index snippet accordingly.
  - Also correct Firestore index shape: for collection-group indexes use queryScope: "COLLECTION_GROUP" with collectionGroup (not "COLLECTION").

- Windows grep commands:
  - Replace raw grep in verification steps with cross‑platform npm scripts or Node checks (PowerShell Select-String), or use Ripgrep (rg) if available.

---

## Strong points to keep

- Quick Wins sequence – minimal risk, high leverage.
- Build‑time log stripping plus logger utility.
- Zod runtime validation for Cloud Functions.
- Comprehensive test plan: services, hooks, integration, rules tests.
- ErrorBoundary addition and production readiness checklist.

---

## Clarifications and alignments

- Functions source root is correct (firebase.json → source: functions). Safe to remove functions/functions/.
- Vitest environment already set (environment: jsdom; setupFiles: src/test/setup.ts). Add @testing-library/jest-dom to setup if needed.
- Centralize collection paths in a shared services/paths.ts and import everywhere (not only inside firestoreService.ts).

---

## Plan enhancements (low effort, high value)

- CI pipeline guardrails: add tsc --noEmit, lint, vitest --run, functions build, and rules tests.
- Zod coverage: apply to all callable functions (chatWithAI, getChatHistory, clearChatHistory).
- Place firestore.indexes.json at repo root and document deploy in README.

---

## Suggested edits to the plan (snippets)

- Testing deps section:
  ```diff
  - @testing-library/react-hooks 
  + @testing-library/react @testing-library/user-event @testing-library/jest-dom
  ```

- Relapses index snippet (only if streakType is being removed):
  ```diff
  - { "fieldPath": "streakType", "order": "ASCENDING" },
  + { "fieldPath": "relapseType", "order": "ASCENDING" },
  ```

- Firestore index queryScope correction (collection-group):
  ```diff
  - "queryScope": "COLLECTION",
  + "queryScope": "COLLECTION_GROUP",
  ```

- Verification commands (Windows‑friendly):
  ```bash
  # package.json script example
  "scripts": {
    "scan:console": "node scripts/scan-console.js"
  }
  ```

---

## Execution risks to watch

- Incomplete console replacement → noisy prod logs. Verify bundle scan post‑build.
- Partial path centralization. Enforce via usage scan or lint rule.
- Rules tests flakiness. Isolate emulator env; deterministic fixtures.

---

## Go/No‑Go

Go, after applying the must‑fix corrections above. The plan is executable and production‑oriented.

---

## Next actions

1. Update plan with testing libs change and clarify streakType vs relapseType and index fields.
2. Create paths.ts and refactor usages with tests.
3. Add CI steps (tsc, lint, unit, rules tests, functions build).
