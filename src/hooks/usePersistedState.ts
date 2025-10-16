import { useState, useEffect, Dispatch, SetStateAction } from 'react';

/**
 * Generic hook for persisting state to localStorage with automatic serialization/deserialization
 * @param key - localStorage key to use
 * @param defaultValue - Default value if no persisted state exists
 * @param options - Configuration options
 * @returns [state, setState] tuple like useState
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  options?: {
    maxAge?: number; // Maximum age in milliseconds (default: 2 hours)
    validator?: (value: unknown) => value is T; // Optional validation function
  }
): [T, Dispatch<SetStateAction<T>>] {
  const maxAge = options?.maxAge ?? 2 * 60 * 60 * 1000; // 2 hours default

  // Initialize state from localStorage or default
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        return defaultValue;
      }

      const parsed = JSON.parse(item);
      
      // Check if data has timestamp and if it's stale
      if (parsed.timestamp && typeof parsed.timestamp === 'number') {
        const age = Date.now() - parsed.timestamp;
        if (age > maxAge) {
          console.log(`Persisted state for "${key}" is stale (${Math.round(age / 1000 / 60)} minutes old), using default`);
          localStorage.removeItem(key);
          return defaultValue;
        }
      }

      // Run custom validator if provided
      if (options?.validator && !options.validator(parsed)) {
        console.warn(`Persisted state for "${key}" failed validation, using default`);
        localStorage.removeItem(key);
        return defaultValue;
      }

      return parsed as T;
    } catch (error) {
      console.error(`Error loading persisted state for "${key}":`, error);
      localStorage.removeItem(key);
      return defaultValue;
    }
  });

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error saving state to localStorage for "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}

/**
 * Clear persisted state from localStorage
 * @param key - localStorage key to clear
 */
export function clearPersistedState(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing persisted state for "${key}":`, error);
  }
}

/**
 * Check if persisted state exists
 * @param key - localStorage key to check
 * @returns true if state exists and is not stale
 */
export function hasPersistedState(key: string, maxAge?: number): boolean {
  try {
    const item = localStorage.getItem(key);
    if (!item) return false;

    const parsed = JSON.parse(item);
    if (parsed.timestamp && typeof parsed.timestamp === 'number') {
      const age = Date.now() - parsed.timestamp;
      const ageLimit = maxAge ?? 2 * 60 * 60 * 1000;
      return age <= ageLimit;
    }

    return true;
  } catch {
    return false;
  }
}

