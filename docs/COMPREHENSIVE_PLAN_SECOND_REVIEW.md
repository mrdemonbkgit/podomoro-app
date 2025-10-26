## Comprehensive Implementation Plan – Second Review

**Date:** October 26, 2025  
**Reviewer:** GPT-5 Codex (plan QA pass)

### Findings

- **High:** The new `services/paths.ts` spec maps chat history to `kamehameha_chat_messages`, but production code (Cloud Functions and frontend services) uses `kamehameha_chatHistory`. Adopting the helper would silently split data and break the existing chat experience.
- **High:** `COLLECTION_PATHS.streaks` resolves to the document `users/{uid}/kamehameha/streaks`, yet the plan instructs downstream code to call `collection(db, COLLECTION_PATHS.streaks(userId))`. Treating a document path as a collection throws at runtime, and the companion helper `getDocPath.streak` appends an extra `/streaks`, yielding an invalid path.
- **Medium:** The plan still sets `esbuild.drop = ['console','debugger']`, which strips `console.error` in production. Because `logger.error` forwards to `console.error`, this change would remove the only remaining production logging path.
- **Medium:** `scripts/scan-hardcoded-paths.js` uses `readdirSync(..., { recursive: true })`, an option Node.js does not support. Running the verification step would crash before scanning any files.

### Open Questions

- Should the scheduled milestone job keep querying via `collectionGroup('streaks')`, or does the data model need to change before the proposed index can be effective?

### Summary

The revised plan fixes the previous index scope bug and adds cross-platform scanners, but the centralized path helpers still break streak and chat storage, console stripping would suppress production errors, and the path-scanning script cannot run as written. Address these items before executing the plan.
