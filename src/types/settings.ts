import { SoundType } from '../utils/sounds';

export interface Settings {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsUntilLongBreak: number;
  notificationsEnabled: boolean;
  soundType: SoundType;
  volume: number; // 0-100
}

export const DEFAULT_SETTINGS: Settings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  notificationsEnabled: true,
  soundType: 'chime',
  volume: 100,
};

export const SETTINGS_KEY = 'pomodoro-settings';

// Validation constants
export const MIN_DURATION = 1; // minutes
export const MAX_DURATION = 60; // minutes
export const MIN_SESSIONS = 2;
export const MAX_SESSIONS = 8;
export const MIN_VOLUME = 0;
export const MAX_VOLUME = 100;

