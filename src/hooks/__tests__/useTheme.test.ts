import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';

describe('useTheme Hook', () => {
  let matchMediaMock: any;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Mock matchMedia
    matchMediaMock = {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(), // Legacy Safari support
      removeListener: vi.fn(), // Legacy Safari support
    };

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query) => matchMediaMock),
    });

    // Clear document class list
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with system theme when localStorage is empty', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('system');
    });

    it('should initialize with saved theme from localStorage', () => {
      localStorage.setItem('pomodoro-theme', 'dark');

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('dark');
    });

    it('should detect dark system preference', () => {
      matchMediaMock.matches = true;

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should detect light system preference', () => {
      matchMediaMock.matches = false;

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(false);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('Toggle Theme', () => {
    it('should toggle from system (dark) to light', () => {
      matchMediaMock.matches = true; // System prefers dark

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(true);

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.isDark).toBe(false);
    });

    it('should toggle from system (light) to dark', () => {
      matchMediaMock.matches = false; // System prefers light

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(false);

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.isDark).toBe(true);
    });

    it('should toggle from light to dark', () => {
      localStorage.setItem('pomodoro-theme', 'light');

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.isDark).toBe(true);
    });

    it('should toggle from dark to light', () => {
      localStorage.setItem('pomodoro-theme', 'dark');

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.isDark).toBe(false);
    });
  });

  describe('Persistence', () => {
    it('should persist theme across remounts', () => {
      const { result: result1 } = renderHook(() => useTheme());

      act(() => {
        result1.current.toggleTheme();
      });

      const themeAfterToggle = result1.current.theme;

      // Unmount and remount
      const { result: result2 } = renderHook(() => useTheme());

      expect(result2.current.theme).toBe(themeAfterToggle);
    });
  });

  describe('System Preference Changes', () => {
    it('should register system preference listener', () => {
      renderHook(() => useTheme());

      // Should register listener (or addListener for legacy browsers)
      const registered =
        matchMediaMock.addEventListener.mock.calls.length > 0 ||
        matchMediaMock.addListener.mock.calls.length > 0;

      expect(registered).toBe(true);
    });

    it('should update isDark when system preference changes (system theme)', () => {
      matchMediaMock.matches = false;

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(false);

      // Simulate system preference change
      act(() => {
        matchMediaMock.matches = true;
        // Trigger the change handler
        const handler =
          matchMediaMock.addEventListener.mock.calls[0]?.[1] ||
          matchMediaMock.addListener.mock.calls[0]?.[0];

        if (handler) {
          handler({ matches: true });
        }
      });

      expect(result.current.isDark).toBe(true);
    });
  });

  describe('Legacy Browser Support', () => {
    it('should use addListener/removeListener when addEventListener is not available', () => {
      // Remove modern methods
      delete matchMediaMock.addEventListener;
      delete matchMediaMock.removeEventListener;

      const { unmount } = renderHook(() => useTheme());

      expect(matchMediaMock.addListener).toHaveBeenCalled();

      unmount();

      expect(matchMediaMock.removeListener).toHaveBeenCalled();
    });
  });

  describe('DOM Integration', () => {
    it('should apply dark class based on theme', () => {
      localStorage.setItem('pomodoro-theme', 'dark');

      renderHook(() => useTheme());

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should remove dark class for light theme', () => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pomodoro-theme', 'light');

      renderHook(() => useTheme());

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });
});

