import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePersistedState } from '../usePersistedState';

describe('usePersistedState Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should use default value when localStorage is empty', () => {
      const { result } = renderHook(() =>
        usePersistedState('test-key', { count: 0 })
      );

      expect(result.current[0]).toEqual({ count: 0 });
    });

    it('should load value from localStorage if exists', () => {
      const savedValue = { count: 42 };
      localStorage.setItem('test-key', JSON.stringify(savedValue));

      const { result } = renderHook(() =>
        usePersistedState('test-key', { count: 0 })
      );

      expect(result.current[0]).toEqual(savedValue);
    });

    it('should handle primitive values', () => {
      localStorage.setItem('test-string', JSON.stringify('hello'));

      const { result } = renderHook(() =>
        usePersistedState('test-string', 'default')
      );

      expect(result.current[0]).toBe('hello');
    });

    it('should handle number values', () => {
      localStorage.setItem('test-number', JSON.stringify(123));

      const { result } = renderHook(() =>
        usePersistedState('test-number', 0)
      );

      expect(result.current[0]).toBe(123);
    });

    it('should handle boolean values', () => {
      localStorage.setItem('test-bool', JSON.stringify(true));

      const { result } = renderHook(() =>
        usePersistedState('test-bool', false)
      );

      expect(result.current[0]).toBe(true);
    });

    it('should handle array values', () => {
      const savedArray = [1, 2, 3];
      localStorage.setItem('test-array', JSON.stringify(savedArray));

      const { result } = renderHook(() =>
        usePersistedState('test-array', [] as number[])
      );

      expect(result.current[0]).toEqual(savedArray);
    });

    it('should use default value for invalid JSON', () => {
      localStorage.setItem('test-invalid', 'not valid json{');

      const { result } = renderHook(() =>
        usePersistedState('test-invalid', { count: 0 })
      );

      expect(result.current[0]).toEqual({ count: 0 });
    });

    it('should use default value for null in localStorage', () => {
      localStorage.setItem('test-null', 'null');

      const { result } = renderHook(() =>
        usePersistedState('test-null', { count: 0 })
      );

      expect(result.current[0]).toEqual({ count: 0 });
    });
  });

  describe('State Updates', () => {
    it('should update state and persist to localStorage', () => {
      const { result } = renderHook(() =>
        usePersistedState('test-key', { count: 0 })
      );

      const newValue = { count: 5 };

      act(() => {
        result.current[1](newValue);
      });

      expect(result.current[0]).toEqual(newValue);

      const stored = JSON.parse(localStorage.getItem('test-key')!);
      expect(stored).toEqual(newValue);
    });

    it('should support functional updates', () => {
      const { result } = renderHook(() =>
        usePersistedState('test-count', 0)
      );

      act(() => {
        result.current[1](prev => prev + 1);
      });

      expect(result.current[0]).toBe(1);

      act(() => {
        result.current[1](prev => prev + 1);
      });

      expect(result.current[0]).toBe(2);
    });

    it('should persist complex object updates', () => {
      interface TestState {
        user: { name: string; age: number };
        settings: { theme: string };
      }

      const initialState: TestState = {
        user: { name: 'John', age: 30 },
        settings: { theme: 'light' },
      };

      const { result } = renderHook(() =>
        usePersistedState('test-complex', initialState)
      );

      const updatedState: TestState = {
        user: { name: 'Jane', age: 25 },
        settings: { theme: 'dark' },
      };

      act(() => {
        result.current[1](updatedState);
      });

      expect(result.current[0]).toEqual(updatedState);

      const stored = JSON.parse(localStorage.getItem('test-complex')!);
      expect(stored).toEqual(updatedState);
    });

    it('should handle rapid successive updates', () => {
      const { result } = renderHook(() =>
        usePersistedState('test-rapid', 0)
      );

      act(() => {
        result.current[1](1);
        result.current[1](2);
        result.current[1](3);
      });

      expect(result.current[0]).toBe(3);

      const stored = JSON.parse(localStorage.getItem('test-rapid')!);
      expect(stored).toBe(3);
    });
  });

  describe('Persistence Across Remounts', () => {
    it('should persist state across hook remounts', () => {
      const { result: result1 } = renderHook(() =>
        usePersistedState('test-remount', { count: 0 })
      );

      act(() => {
        result1.current[1]({ count: 42 });
      });

      // Unmount and remount
      const { result: result2 } = renderHook(() =>
        usePersistedState('test-remount', { count: 0 })
      );

      expect(result2.current[0]).toEqual({ count: 42 });
    });

    it('should handle multiple instances with same key', () => {
      const { result: result1 } = renderHook(() =>
        usePersistedState('shared-key', 0)
      );

      const { result: result2 } = renderHook(() =>
        usePersistedState('shared-key', 0)
      );

      act(() => {
        result1.current[1](5);
      });

      // Both should have the same initial value
      // Note: They won't automatically sync - localStorage is read only on mount
      const stored = JSON.parse(localStorage.getItem('shared-key')!);
      expect(stored).toBe(5);
    });
  });

  describe('Different Keys', () => {
    it('should manage different keys independently', () => {
      const { result: result1 } = renderHook(() =>
        usePersistedState('key1', 1)
      );

      const { result: result2 } = renderHook(() =>
        usePersistedState('key2', 2)
      );

      act(() => {
        result1.current[1](10);
      });

      act(() => {
        result2.current[1](20);
      });

      expect(result1.current[0]).toBe(10);
      expect(result2.current[0]).toBe(20);

      expect(JSON.parse(localStorage.getItem('key1')!)).toBe(10);
      expect(JSON.parse(localStorage.getItem('key2')!)).toBe(20);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string as value', () => {
      const { result } = renderHook(() =>
        usePersistedState('test-empty', 'default')
      );

      act(() => {
        result.current[1]('');
      });

      expect(result.current[0]).toBe('');

      const stored = JSON.parse(localStorage.getItem('test-empty')!);
      expect(stored).toBe('');
    });

    it('should handle zero as value', () => {
      const { result } = renderHook(() =>
        usePersistedState('test-zero', 100)
      );

      act(() => {
        result.current[1](0);
      });

      expect(result.current[0]).toBe(0);

      const stored = JSON.parse(localStorage.getItem('test-zero')!);
      expect(stored).toBe(0);
    });

    it('should handle false as value', () => {
      const { result } = renderHook(() =>
        usePersistedState('test-false', true)
      );

      act(() => {
        result.current[1](false);
      });

      expect(result.current[0]).toBe(false);

      const stored = JSON.parse(localStorage.getItem('test-false')!);
      expect(stored).toBe(false);
    });

    it('should handle empty object as value', () => {
      const { result } = renderHook(() =>
        usePersistedState('test-empty-obj', { key: 'value' })
      );

      act(() => {
        result.current[1]({});
      });

      expect(result.current[0]).toEqual({});

      const stored = JSON.parse(localStorage.getItem('test-empty-obj')!);
      expect(stored).toEqual({});
    });

    it('should handle empty array as value', () => {
      const { result } = renderHook(() =>
        usePersistedState('test-empty-arr', [1, 2, 3])
      );

      act(() => {
        result.current[1]([]);
      });

      expect(result.current[0]).toEqual([]);

      const stored = JSON.parse(localStorage.getItem('test-empty-arr')!);
      expect(stored).toEqual([]);
    });
  });

  describe('TypeScript Types', () => {
    it('should maintain type safety for typed objects', () => {
      interface User {
        id: number;
        name: string;
        active: boolean;
      }

      const defaultUser: User = {
        id: 1,
        name: 'Test',
        active: true,
      };

      const { result } = renderHook(() =>
        usePersistedState<User>('test-typed', defaultUser)
      );

      const newUser: User = {
        id: 2,
        name: 'New User',
        active: false,
      };

      act(() => {
        result.current[1](newUser);
      });

      expect(result.current[0]).toEqual(newUser);
    });
  });
});

