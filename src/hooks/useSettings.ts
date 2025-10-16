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

const validateSettings = (value: unknown): value is Settings => {
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

const loadSettings = (): Settings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(stored);
    if (validateSettings(parsed)) {
      return parsed;
    }
    console.warn('Invalid settings in localStorage, using defaults');
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

