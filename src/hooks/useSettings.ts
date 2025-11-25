import { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  MIN_DURATION,
  MAX_DURATION,
  MIN_SESSIONS,
  MAX_SESSIONS,
} from '../types/settings';

/**
 * Validates core settings fields (backward compatible)
 * Only validates required numeric fields that must be present
 */
const validateCoreSettings = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') return false;
  const settings = value as Record<string, unknown>;

  return (
    typeof settings.workDuration === 'number' &&
    typeof settings.shortBreakDuration === 'number' &&
    typeof settings.longBreakDuration === 'number' &&
    typeof settings.sessionsUntilLongBreak === 'number' &&
    settings.workDuration >= MIN_DURATION &&
    settings.workDuration <= MAX_DURATION &&
    settings.shortBreakDuration >= MIN_DURATION &&
    settings.shortBreakDuration <= MAX_DURATION &&
    settings.longBreakDuration >= MIN_DURATION &&
    settings.longBreakDuration <= MAX_DURATION &&
    settings.sessionsUntilLongBreak >= MIN_SESSIONS &&
    settings.sessionsUntilLongBreak <= MAX_SESSIONS
  );
};

/**
 * Validates complete settings including all optional fields
 */
const validateSettings = (value: unknown): value is Settings => {
  if (!validateCoreSettings(value)) return false;
  const settings = value as Record<string, unknown>;

  // Validate optional fields if present
  if ('notificationsEnabled' in settings) {
    return typeof settings.notificationsEnabled === 'boolean';
  }

  return true;
};

/**
 * Loads settings from localStorage with backward compatibility
 * Merges stored settings with defaults to handle missing fields
 */
const loadSettings = (): Settings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(stored);

    // Validate core fields (durations and sessions)
    if (!validateCoreSettings(parsed)) {
      console.warn('Invalid core settings in localStorage, using defaults');
      return DEFAULT_SETTINGS;
    }

    // Merge with defaults to handle missing optional fields (backward compatibility)
    // This preserves user's custom durations while adding new fields with defaults
    const merged: Settings = {
      ...DEFAULT_SETTINGS, // Start with defaults
      ...parsed, // Override with user's saved values
    };

    // Validate merged result
    if (validateSettings(merged)) {
      return merged;
    }

    console.warn('Settings failed validation after merge, using defaults');
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return DEFAULT_SETTINGS;
  }
};

const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

interface UseSettingsReturn {
  settings: Settings;
  updateSettings: (newSettings: Settings) => void;
  resetSettings: () => void;
}

export const useSettings = (): UseSettingsReturn => {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  // Persist to localStorage whenever settings change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateSettings = useCallback((newSettings: Settings) => {
    if (validateSettings(newSettings)) {
      setSettings(newSettings);
    } else {
      console.error('Invalid settings provided:', newSettings);
    }
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
  };
};
