/**
 * Firebase mocks for testing
 * Provides mock implementations of Firestore and Auth
 */

import { vi } from 'vitest';

/**
 * Mock Firestore instance
 */
export const mockFirestore = {
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(),
  runTransaction: vi.fn(),
  batch: vi.fn(),
};

/**
 * Mock Auth instance
 */
export const mockAuth = {
  currentUser: {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
  },
  signInWithPopup: vi.fn(),
  signInAnonymously: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
};

/**
 * Mock Firebase user
 */
export const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: '2025-01-01T00:00:00.000Z',
    lastSignInTime: '2025-10-26T00:00:00.000Z',
  },
  providerData: [],
  refreshToken: 'mock-refresh-token',
  tenantId: null,
  delete: vi.fn(),
  getIdToken: vi.fn().mockResolvedValue('mock-id-token'),
  getIdTokenResult: vi.fn(),
  reload: vi.fn(),
  toJSON: vi.fn(),
  photoURL: null,
  phoneNumber: null,
  providerId: 'firebase',
};

/**
 * Mock Firestore document snapshot
 */
export const createMockDocSnapshot = (data: any, id: string = 'mock-id') => ({
  id,
  exists: () => !!data,
  data: () => data,
  ref: {
    id,
    path: `users/test-user-123/kamehameha/${id}`,
  },
});

/**
 * Mock Firestore query snapshot
 */
export const createMockQuerySnapshot = (docs: any[]) => ({
  empty: docs.length === 0,
  size: docs.length,
  docs: docs.map((data, index) => createMockDocSnapshot(data, `doc-${index}`)),
  forEach: (callback: (doc: any) => void) => {
    docs.forEach((data, index) =>
      callback(createMockDocSnapshot(data, `doc-${index}`))
    );
  },
});

/**
 * Reset all Firebase mocks
 */
export const resetFirebaseMocks = () => {
  Object.values(mockFirestore).forEach((mockFn) => {
    if (typeof mockFn === 'function' && 'mockClear' in mockFn) {
      mockFn.mockClear();
    }
  });

  Object.values(mockAuth).forEach((mockFn) => {
    if (typeof mockFn === 'function' && 'mockClear' in mockFn) {
      mockFn.mockClear();
    }
  });
};
