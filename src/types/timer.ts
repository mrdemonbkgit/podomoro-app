export type SessionType = 'work' | 'shortBreak' | 'longBreak';

export interface TimerState {
  time: number;
  isActive: boolean;
  sessionType: SessionType;
  completedSessions: number;
}

export interface PersistedTimerState extends TimerState {
  timestamp: number; // When the state was saved
}

// Default durations (for backwards compatibility)
export const WORK_DURATION = 25 * 60; // 1500 seconds
export const SHORT_BREAK_DURATION = 5 * 60; // 300 seconds
export const LONG_BREAK_DURATION = 15 * 60; // 900 seconds
export const SESSIONS_UNTIL_LONG_BREAK = 4;
export const TIMER_STATE_KEY = 'pomodoro-timer-state';

// Helper to convert minutes to seconds
export const minutesToSeconds = (minutes: number): number => minutes * 60;

