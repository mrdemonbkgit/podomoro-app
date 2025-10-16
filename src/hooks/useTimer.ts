import { useState, useEffect, useCallback } from 'react';
import {
  SessionType,
  PersistedTimerState,
  WORK_DURATION,
  SHORT_BREAK_DURATION,
  LONG_BREAK_DURATION,
  SESSIONS_UNTIL_LONG_BREAK,
  TIMER_STATE_KEY,
} from '../types/timer';
import { playNotification } from '../utils/audio';
import { usePersistedState, clearPersistedState, hasPersistedState } from './usePersistedState';

interface UseTimerReturn {
  time: number;
  isActive: boolean;
  sessionType: SessionType;
  completedSessions: number;
  hasResumableState: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  dismissResume: () => void;
}

const getDefaultState = (): PersistedTimerState => ({
  time: WORK_DURATION,
  isActive: false,
  sessionType: 'work',
  completedSessions: 0,
  timestamp: Date.now(),
});

const validateTimerState = (value: unknown): value is PersistedTimerState => {
  if (!value || typeof value !== 'object') return false;
  const state = value as Record<string, unknown>;
  
  return (
    typeof state.time === 'number' &&
    typeof state.isActive === 'boolean' &&
    typeof state.sessionType === 'string' &&
    ['work', 'shortBreak', 'longBreak'].includes(state.sessionType as string) &&
    typeof state.completedSessions === 'number' &&
    typeof state.timestamp === 'number'
  );
};

export const useTimer = (): UseTimerReturn => {
  const [state, setState] = usePersistedState<PersistedTimerState>(
    TIMER_STATE_KEY,
    getDefaultState(),
    { validator: validateTimerState }
  );

  const { time, isActive, sessionType, completedSessions } = state;
  
  // Check if there's resumable state on mount (only show once)
  const [showResume, setShowResume] = useState(() => {
    const hasSaved = hasPersistedState(TIMER_STATE_KEY);
    // Show resume if there's saved state that's not the default initial state
    return hasSaved;
  });
  
  // Only show resume prompt if state exists, timer is not active, and not default state
  const hasResumableState = showResume && !isActive && (time !== WORK_DURATION || completedSessions !== 0);

  const start = useCallback(() => {
    setShowResume(false); // Dismiss resume prompt when starting
    setState(prev => ({
      ...prev,
      isActive: true,
      timestamp: Date.now(),
    }));
  }, [setState]);

  const pause = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      timestamp: Date.now(),
    }));
  }, [setState]);

  const reset = useCallback(() => {
    setShowResume(false); // Dismiss resume prompt when resetting
    // Clear persisted state on reset
    clearPersistedState(TIMER_STATE_KEY);
    setState(getDefaultState());
  }, [setState]);

  const dismissResume = useCallback(() => {
    setShowResume(false);
    // Start fresh - reset to default state
    clearPersistedState(TIMER_STATE_KEY);
    setState(getDefaultState());
  }, [setState]);

  const switchToNextSession = useCallback(() => {
    playNotification();
    
    setState(prev => {
      if (prev.sessionType === 'work') {
        const newCompletedSessions = prev.completedSessions + 1;

        if (newCompletedSessions % SESSIONS_UNTIL_LONG_BREAK === 0) {
          return {
            ...prev,
            sessionType: 'longBreak',
            time: LONG_BREAK_DURATION,
            completedSessions: newCompletedSessions,
            isActive: false,
            timestamp: Date.now(),
          };
        } else {
          return {
            ...prev,
            sessionType: 'shortBreak',
            time: SHORT_BREAK_DURATION,
            completedSessions: newCompletedSessions,
            isActive: false,
            timestamp: Date.now(),
          };
        }
      } else {
        // After any break, go back to work
        // Reset session counter after long break
        return {
          ...prev,
          sessionType: 'work',
          time: WORK_DURATION,
          completedSessions: prev.sessionType === 'longBreak' ? 0 : prev.completedSessions,
          isActive: false,
          timestamp: Date.now(),
        };
      }
    });
    
    // Clear persisted state when timer completes (optional - keeps history)
    // Uncomment if you want to clear state on session completion:
    // clearPersistedState(TIMER_STATE_KEY);
  }, [setState]);

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && time > 0) {
      interval = window.setInterval(() => {
        setState(prev => ({
          ...prev,
          time: prev.time - 1,
          timestamp: Date.now(),
        }));
      }, 1000);
    } else if (time === 0) {
      switchToNextSession();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, time, switchToNextSession, setState]);

  return {
    time,
    isActive,
    sessionType,
    completedSessions,
    hasResumableState,
    start,
    pause,
    reset,
    dismissResume,
  };
};

