import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Mock Firebase config before any other imports that might use it
// This prevents Firebase initialization errors in tests (auth/invalid-api-key)
vi.mock('../services/firebase/config', () => ({
  auth: {
    onAuthStateChanged: vi.fn((callback) => {
      callback(null);
      return vi.fn();
    }),
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
    currentUser: null,
  },
  db: {},
  functions: {},
  googleProvider: {},
  default: {},
}));

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock localStorage
const localStorageMock = {
  getItem: (key: string): string | null => {
    return localStorageMock.store[key] || null;
  },
  setItem: (key: string, value: string): void => {
    localStorageMock.store[key] = value;
  },
  removeItem: (key: string): void => {
    delete localStorageMock.store[key];
  },
  clear: (): void => {
    localStorageMock.store = {};
  },
  key: (index: number): string | null => {
    const keys = Object.keys(localStorageMock.store);
    return keys[index] || null;
  },
  get length(): number {
    return Object.keys(localStorageMock.store).length;
  },
  store: {} as Record<string, string>,
};

(globalThis as any).localStorage = localStorageMock as Storage;

// Mock Audio API
(globalThis as any).Audio = class Audio {
  play = () => Promise.resolve();
  pause = () => {};
  load = () => {};
} as any;
