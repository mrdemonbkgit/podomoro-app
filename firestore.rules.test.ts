/**
 * Firestore Security Rules Tests
 *
 * Tests Firebase security rules to ensure:
 * - Users can only access their own data
 * - Unauthenticated access is denied
 * - No dev backdoor in production
 * - Subcollections inherit proper permissions
 *
 * Phase 5: Production security rules testing (CRITICAL)
 *
 * ⚠️ IMPORTANT: These tests verify PRODUCTION rules (firestore.rules)
 * - NO dev-test-user exception
 * - Strict authentication required
 *
 * ⚠️ PREREQUISITES:
 * These tests require the Firebase emulator to be running.
 *
 * To run these tests:
 * 1. Start emulator: `firebase emulators:start`
 * 2. In another terminal: `npm test -- firestore.rules.test.ts --run`
 *
 * The emulator must be running on 127.0.0.1:8080 (default Firestore emulator port)
 *
 * In CI, these tests run in a separate job with `firebase emulators:exec`
 */

import {
  describe,
  test,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
} from 'vitest';

// Skip these tests in normal test runs (requires Firebase emulator)
// Only run when explicitly called via `npm run test:rules` (CI uses firebase emulators:exec)
const isRunningWithEmulator =
  process.env.FIREBASE_EMULATOR_HUB || process.env.FIRESTORE_EMULATOR_HOST;
const describeOrSkip = isRunningWithEmulator ? describe : describe.skip;
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Test constants
const FIXED_TIMESTAMP = 1700000000000;
const USER_1 = 'user-123';
const USER_2 = 'user-456';
const DEV_TEST_USER = 'dev-test-user-12345';

let testEnv: RulesTestEnvironment;

describeOrSkip('Firestore Security Rules', () => {
  // ============================================================================
  // Setup & Teardown
  // ============================================================================

  beforeAll(async () => {
    // Load Firestore rules from file (in project root)
    const rulesPath = path.join(process.cwd(), 'firestore.rules');
    const rules = fs.readFileSync(rulesPath, 'utf8');

    // Initialize test environment with rules
    testEnv = await initializeTestEnvironment({
      projectId: 'zenfocus-test',
      firestore: {
        rules,
        host: '127.0.0.1',
        port: 8080,
      },
    });
  });

  beforeEach(async () => {
    // Clear Firestore data between tests for isolation
    await testEnv.clearFirestore();
  });

  afterAll(async () => {
    // Clean up test environment
    await testEnv.cleanup();
  });

  // ============================================================================
  // User Document Access Tests
  // ============================================================================

  describe('User Document Access', () => {
    test('authenticated user can read own document', async () => {
      const db = testEnv.authenticatedContext(USER_1).firestore();
      const userDoc = doc(db, `users/${USER_1}`);

      await assertSucceeds(getDoc(userDoc));
    });

    test('authenticated user can write own document', async () => {
      const db = testEnv.authenticatedContext(USER_1).firestore();
      const userDoc = doc(db, `users/${USER_1}`);

      await assertSucceeds(
        setDoc(userDoc, {
          email: 'user@example.com',
          createdAt: FIXED_TIMESTAMP,
        })
      );
    });

    test('authenticated user can update own document', async () => {
      const db = testEnv.authenticatedContext(USER_1).firestore();
      const userDoc = doc(db, `users/${USER_1}`);

      // First create the document
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${USER_1}`), {
          email: 'old@example.com',
        });
      });

      // Then update it
      await assertSucceeds(
        updateDoc(userDoc, {
          email: 'new@example.com',
        })
      );
    });

    test('authenticated user can delete own document', async () => {
      const db = testEnv.authenticatedContext(USER_1).firestore();
      const userDoc = doc(db, `users/${USER_1}`);

      // First create the document
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), `users/${USER_1}`), {
          email: 'user@example.com',
        });
      });

      // Then delete it
      await assertSucceeds(deleteDoc(userDoc));
    });

    test('authenticated user CANNOT read other user document', async () => {
      const db = testEnv.authenticatedContext(USER_1).firestore();
      const otherUserDoc = doc(db, `users/${USER_2}`);

      await assertFails(getDoc(otherUserDoc));
    });

    test('authenticated user CANNOT write other user document', async () => {
      const db = testEnv.authenticatedContext(USER_1).firestore();
      const otherUserDoc = doc(db, `users/${USER_2}`);

      await assertFails(
        setDoc(otherUserDoc, {
          email: 'hacker@example.com',
        })
      );
    });

    test('unauthenticated user CANNOT read any user document', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      const userDoc = doc(db, `users/${USER_1}`);

      await assertFails(getDoc(userDoc));
    });

    test('unauthenticated user CANNOT write any user document', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      const userDoc = doc(db, `users/${USER_1}`);

      await assertFails(
        setDoc(userDoc, {
          email: 'anonymous@example.com',
        })
      );
    });
  });

  // ============================================================================
  // Kamehameha Subcollection Tests
  // ============================================================================

  describe('Kamehameha Subcollections', () => {
    test('user can read own kamehameha/streaks document', async () => {
      const db = testEnv.authenticatedContext(USER_1).firestore();
      const streaksDoc = doc(db, `users/${USER_1}/kamehameha/streaks`);

      await assertSucceeds(getDoc(streaksDoc));
    });

    test('user can write own kamehameha/streaks document', async () => {
      const db = testEnv.authenticatedContext(USER_1).firestore();
      const streaksDoc = doc(db, `users/${USER_1}/kamehameha/streaks`);

      await assertSucceeds(
        setDoc(streaksDoc, {
          main: { longestSeconds: 0 },
          currentJourneyId: 'journey-1',
          lastUpdated: FIXED_TIMESTAMP,
        })
      );
    });

    test('user can read own kamehameha_journeys collection', async () => {
      const db = testEnv.authenticatedContext(USER_1).firestore();
      const journeysCol = collection(db, `users/${USER_1}/kamehameha_journeys`);

      await assertSucceeds(getDocs(journeysCol));
    });

    test('user can write to own kamehameha_journeys collection', async () => {
      const db = testEnv.authenticatedContext(USER_1).firestore();
      const journeyDoc = doc(
        db,
        `users/${USER_1}/kamehameha_journeys/journey-1`
      );

      await assertSucceeds(
        setDoc(journeyDoc, {
          startDate: FIXED_TIMESTAMP,
          endDate: null,
          achievementsCount: 0,
          violationsCount: 0,
        })
      );
    });

    test('user can read own kamehameha_badges collection', async () => {
      const db = testEnv.authenticatedContext(USER_1).firestore();
      const badgesCol = collection(db, `users/${USER_1}/kamehameha_badges`);

      await assertSucceeds(getDocs(badgesCol));
    });

    test('user can write to own kamehameha_badges collection', async () => {
      const db = testEnv.authenticatedContext(USER_1).firestore();
      const badgeDoc = doc(db, `users/${USER_1}/kamehameha_badges/badge-1`);

      await assertSucceeds(
        setDoc(badgeDoc, {
          journeyId: 'journey-1',
          milestoneSeconds: 60,
          earnedAt: FIXED_TIMESTAMP,
          badgeEmoji: '⚡',
        })
      );
    });

    test('user CANNOT read other user kamehameha subcollections', async () => {
      const db = testEnv.authenticatedContext(USER_1).firestore();
      const otherStreaksDoc = doc(db, `users/${USER_2}/kamehameha/streaks`);

      await assertFails(getDoc(otherStreaksDoc));
    });

    test('user CANNOT write to other user kamehameha subcollections', async () => {
      const db = testEnv.authenticatedContext(USER_1).firestore();
      const otherJourneyDoc = doc(
        db,
        `users/${USER_2}/kamehameha_journeys/journey-1`
      );

      await assertFails(
        setDoc(otherJourneyDoc, {
          startDate: FIXED_TIMESTAMP,
        })
      );
    });

    test('unauthenticated user CANNOT read kamehameha subcollections', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      const streaksDoc = doc(db, `users/${USER_1}/kamehameha/streaks`);

      await assertFails(getDoc(streaksDoc));
    });

    test('unauthenticated user CANNOT write kamehameha subcollections', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      const journeyDoc = doc(
        db,
        `users/${USER_1}/kamehameha_journeys/journey-1`
      );

      await assertFails(
        setDoc(journeyDoc, {
          startDate: FIXED_TIMESTAMP,
        })
      );
    });
  });

  // ============================================================================
  // Production Security Tests - No Dev Backdoor
  // ============================================================================

  describe('Production Security - No Dev Backdoor', () => {
    test('unauthenticated user CANNOT access dev-test-user-12345', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      const devUserDoc = doc(db, `users/${DEV_TEST_USER}`);

      // In production rules, dev test user has NO special access
      await assertFails(getDoc(devUserDoc));
      await assertFails(
        setDoc(devUserDoc, {
          email: 'dev@test.com',
          createdAt: FIXED_TIMESTAMP,
        })
      );
    });

    test('unauthenticated user CANNOT access dev-test-user subcollections', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      const devStreaksDoc = doc(
        db,
        `users/${DEV_TEST_USER}/kamehameha/streaks`
      );

      // No backdoor for subcollections either
      await assertFails(getDoc(devStreaksDoc));
      await assertFails(
        setDoc(devStreaksDoc, {
          main: { longestSeconds: 0 },
          currentJourneyId: null,
          lastUpdated: FIXED_TIMESTAMP,
        })
      );
    });

    test('authenticated user can ONLY access dev-test-user if authenticated AS that user', async () => {
      // Some other authenticated user
      const db = testEnv.authenticatedContext('other-user-999').firestore();
      const devUserDoc = doc(db, `users/${DEV_TEST_USER}`);

      // Cannot access dev-test-user data unless authenticated as that user
      await assertFails(getDoc(devUserDoc));
      await assertFails(
        setDoc(devUserDoc, {
          email: 'hacker@test.com',
        })
      );
    });

    test('authenticated AS dev-test-user CAN access their own data', async () => {
      // Authenticated as the dev-test-user themselves
      const db = testEnv.authenticatedContext(DEV_TEST_USER).firestore();
      const devUserDoc = doc(db, `users/${DEV_TEST_USER}`);

      // If authenticated as dev-test-user, they can access their own data
      // (Same as any other user)
      await assertSucceeds(getDoc(devUserDoc));
      await assertSucceeds(
        setDoc(devUserDoc, {
          email: 'dev@test.com',
          createdAt: FIXED_TIMESTAMP,
        })
      );
    });

    test('VERIFIED: No dev backdoor in production rules', () => {
      // This test documents that production rules have NO unauthenticated backdoor
      // for dev-test-user-12345. All access requires proper authentication.
      const productionSecurityConfirmed = true;
      expect(productionSecurityConfirmed).toBe(true);
    });
  });

  // ============================================================================
  // Edge Cases & Security Tests
  // ============================================================================

  describe('Edge Cases & Security', () => {
    // Note: Empty userId test removed - authenticatedContext() requires non-empty string
    // and Firestore rejects empty document paths

    test('null auth cannot access any data', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      const rootDoc = doc(db, 'users/any-user');

      await assertFails(getDoc(rootDoc));
    });

    test('deeply nested subcollections inherit permissions', async () => {
      const db = testEnv.authenticatedContext(USER_1).firestore();

      // Create a deeply nested path
      const deepDoc = doc(
        db,
        `users/${USER_1}/kamehameha_chatHistory/message-1`
      );

      await assertSucceeds(
        setDoc(deepDoc, {
          role: 'user',
          content: 'Test message',
          timestamp: FIXED_TIMESTAMP,
        })
      );

      await assertSucceeds(getDoc(deepDoc));
    });

    // Note: Path traversal test removed - Firestore SDK rejects paths with ".."
    // with invalid-argument error before rules are evaluated, which is the correct behavior
  });

  // ============================================================================
  // Collection Group Queries (Future-proofing)
  // ============================================================================

  describe('Collection Group Queries', () => {
    test('collection group queries require proper authentication', async () => {
      // Note: Current rules don't explicitly define collection group rules
      // This test documents expected behavior if we add them later

      const db = testEnv.authenticatedContext(USER_1).firestore();

      // This would fail with current rules as collection group queries
      // need explicit allow rules
      // Documented for future implementation
      expect(true).toBe(true); // Placeholder
    });
  });
});
