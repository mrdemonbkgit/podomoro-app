import { renderHook, act } from '@testing-library/react';
import { useSettings } from '../useSettings';
import { DEFAULT_SETTINGS } from '../../types/settings';
import { vi } from 'vitest';

describe('useSettings Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should initialize with default settings when localStorage is empty', () => {
      const { result } = renderHook(() => useSettings());

      expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
    });

    it('should load settings from localStorage if valid', () => {
      const customSettings = {
        workDuration: 30,
        shortBreakDuration: 10,
        longBreakDuration: 20,
        sessionsUntilLongBreak: 3,
        notificationsEnabled: false,
        soundType: 'bell' as const,
        volume: 80,
      };

      localStorage.setItem('pomodoro-settings', JSON.stringify(customSettings));

      const { result } = renderHook(() => useSettings());

      expect(result.current.settings).toEqual(customSettings);
    });
  });

  describe('Backward Compatibility', () => {
    it('should preserve old settings without notificationsEnabled field', () => {
      // Simulate old settings from before Feature 2.3 (no notificationsEnabled)
      const oldSettings = {
        workDuration: 30,
        shortBreakDuration: 10,
        longBreakDuration: 20,
        sessionsUntilLongBreak: 3,
        // notificationsEnabled is MISSING (old data)
      };

      localStorage.setItem('pomodoro-settings', JSON.stringify(oldSettings));

      const { result } = renderHook(() => useSettings());

      // Should preserve user's custom durations
      expect(result.current.settings.workDuration).toBe(30);
      expect(result.current.settings.shortBreakDuration).toBe(10);
      expect(result.current.settings.longBreakDuration).toBe(20);
      expect(result.current.settings.sessionsUntilLongBreak).toBe(3);

      // Should default notificationsEnabled to true (from DEFAULT_SETTINGS)
      expect(result.current.settings.notificationsEnabled).toBe(true);
    });

    it('should handle settings with extra fields gracefully', () => {
      const settingsWithExtra = {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsUntilLongBreak: 4,
        notificationsEnabled: true,
        extraField: 'should be ignored', // Future-proofing
      };

      localStorage.setItem(
        'pomodoro-settings',
        JSON.stringify(settingsWithExtra)
      );

      const { result } = renderHook(() => useSettings());

      // Should load without errors
      expect(result.current.settings.workDuration).toBe(25);
      expect(result.current.settings.notificationsEnabled).toBe(true);
    });
  });

  describe('Settings Validation', () => {
    it('should reject invalid duration values and use defaults', () => {
      const invalidSettings = {
        workDuration: 100, // > MAX_DURATION (60)
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsUntilLongBreak: 4,
        notificationsEnabled: true,
      };

      localStorage.setItem(
        'pomodoro-settings',
        JSON.stringify(invalidSettings)
      );

      const { result } = renderHook(() => useSettings());

      // Should fall back to defaults
      expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
    });

    it('should reject settings with missing required fields', () => {
      const incompleteSettings = {
        workDuration: 25,
        // Missing shortBreakDuration, longBreakDuration, sessionsUntilLongBreak
      };

      localStorage.setItem(
        'pomodoro-settings',
        JSON.stringify(incompleteSettings)
      );

      const { result } = renderHook(() => useSettings());

      // Should fall back to defaults
      expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
    });

    it('should handle corrupt localStorage data', () => {
      localStorage.setItem('pomodoro-settings', 'invalid json{');

      const { result } = renderHook(() => useSettings());

      // Should fall back to defaults
      expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
    });

    it('should reject invalid notificationsEnabled type', () => {
      const invalidSettings = {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsUntilLongBreak: 4,
        notificationsEnabled: 'true', // String instead of boolean
      };

      localStorage.setItem(
        'pomodoro-settings',
        JSON.stringify(invalidSettings)
      );

      const { result } = renderHook(() => useSettings());

      // Should fall back to defaults
      expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
    });
  });

  describe('updateSettings', () => {
    it('should update settings and persist to localStorage', () => {
      const { result } = renderHook(() => useSettings());

      const newSettings = {
        workDuration: 30,
        shortBreakDuration: 10,
        longBreakDuration: 20,
        sessionsUntilLongBreak: 3,
        notificationsEnabled: false,
      };

      act(() => {
        result.current.updateSettings(newSettings);
      });

      expect(result.current.settings).toEqual(newSettings);

      // Verify localStorage
      const stored = JSON.parse(localStorage.getItem('pomodoro-settings')!);
      expect(stored).toEqual(newSettings);
    });

    it('should reject invalid settings in updateSettings', () => {
      const { result } = renderHook(() => useSettings());

      const invalidSettings = {
        workDuration: 100, // Invalid
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsUntilLongBreak: 4,
        notificationsEnabled: true,
      };

      // Mock console.error to suppress output
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      act(() => {
        result.current.updateSettings(invalidSettings as any);
      });

      // Should not update
      expect(result.current.settings).toEqual(DEFAULT_SETTINGS);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('resetSettings', () => {
    it('should reset settings to defaults', () => {
      const { result } = renderHook(() => useSettings());

      // First update to custom settings
      act(() => {
        result.current.updateSettings({
          workDuration: 30,
          shortBreakDuration: 10,
          longBreakDuration: 20,
          sessionsUntilLongBreak: 3,
          notificationsEnabled: false,
        });
      });

      expect(result.current.settings.workDuration).toBe(30);

      // Then reset
      act(() => {
        result.current.resetSettings();
      });

      expect(result.current.settings).toEqual(DEFAULT_SETTINGS);

      // Verify localStorage
      const stored = JSON.parse(localStorage.getItem('pomodoro-settings')!);
      expect(stored).toEqual(DEFAULT_SETTINGS);
    });
  });

  describe('Persistence', () => {
    it('should auto-save when settings change', () => {
      const { result } = renderHook(() => useSettings());

      const newSettings = {
        workDuration: 30,
        shortBreakDuration: 10,
        longBreakDuration: 20,
        sessionsUntilLongBreak: 3,
        notificationsEnabled: false,
      };

      act(() => {
        result.current.updateSettings(newSettings);
      });

      // Check localStorage immediately
      const stored = JSON.parse(localStorage.getItem('pomodoro-settings')!);
      expect(stored).toEqual(newSettings);
    });
  });
});
