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
  elapsedWhileAway: number; // Seconds elapsed while tab was closed
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
  
  // Track elapsed time while tab was closed
  const [elapsedWhileAway, setElapsedWhileAway] = useState(0);
  
  // Track if we need to switch session due to timer completion while away
  const [shouldSwitchSession, setShouldSwitchSession] = useState(false);
  
  // Check if there's resumable state on mount (only show once)
  const [showResume, setShowResume] = useState(() => {
    const hasSaved = hasPersistedState(TIMER_STATE_KEY);
    return hasSaved;
  });
  
  // Calculate elapsed time if timer was active when tab closed
  useEffect(() => {
    if (state.isActive && state.timestamp) {
      const elapsed = Math.floor((Date.now() - state.timestamp) / 1000);
      
      // Only calculate if significant time passed (>2 seconds)
      if (elapsed > 2) {
        const newTime = state.time - elapsed;
        
        if (newTime <= 0) {
          // Timer would have completed while away
          console.log(`Timer completed while away (${Math.abs(newTime)}s ago)`);
          setShouldSwitchSession(true);
        } else {
          // Update time to reflect elapsed duration
          setElapsedWhileAway(elapsed);
          setState(prev => ({
            ...prev,
            time: newTime,
            isActive: false, // Pause it so user can see and resume
            timestamp: Date.now(),
          }));
        }
      } else if (isActive) {
        // Timer was active but minimal time passed - dismiss resume prompt
        setShowResume(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount
  
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

  // Handle session switch if timer completed while away
  useEffect(() => {
    if (shouldSwitchSession) {
      setShouldSwitchSession(false);
      switchToNextSession();
    }
  }, [shouldSwitchSession, switchToNextSession]);

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
    elapsedWhileAway,
    start,
    pause,
    reset,
    dismissResume,
  };
};

