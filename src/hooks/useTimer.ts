import { useState, useEffect, useCallback } from 'react';
import {
  SessionType,
  PersistedTimerState,
  TIMER_STATE_KEY,
  minutesToSeconds,
} from '../types/timer';
import { Settings } from '../types/settings';
import { playNotification } from '../utils/audio';
import { notifySessionComplete } from '../utils/notifications';
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

interface UseTimerProps {
  settings: Settings;
}

const getDefaultState = (workDuration: number): PersistedTimerState => ({
  time: workDuration,
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

export const useTimer = ({ settings }: UseTimerProps): UseTimerReturn => {
  // Convert settings durations from minutes to seconds
  const workDuration = minutesToSeconds(settings.workDuration);
  const shortBreakDuration = minutesToSeconds(settings.shortBreakDuration);
  const longBreakDuration = minutesToSeconds(settings.longBreakDuration);
  const sessionsUntilLongBreak = settings.sessionsUntilLongBreak;

  const [state, setState] = usePersistedState<PersistedTimerState>(
    TIMER_STATE_KEY,
    getDefaultState(workDuration),
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
  const hasResumableState = showResume && !isActive && (time !== workDuration || completedSessions !== 0);

  // Update timer immediately if settings change and timer is in initial state
  useEffect(() => {
    // Only run when workDuration changes (from settings update)
    // Check if timer is in initial state: not active, work session, no completed sessions
    // AND time is at full duration (meaning never started, not paused mid-session)
    const isInitialState = 
      !isActive && 
      sessionType === 'work' && 
      completedSessions === 0 &&
      (time % 60 === 0); // Time is at a "round" minute (300s, 600s), not mid-session (256s)
    
    // Only update if in pristine initial state
    if (isInitialState && time !== workDuration) {
      setState(prev => ({
        ...prev,
        time: workDuration,
        timestamp: Date.now(),
      }));
    }
  }, [workDuration]); // Only depends on workDuration - runs when settings change

  // Handle sessions until long break changes
  useEffect(() => {
    // Check if current completed sessions exceeds the new sessions limit
    // This can happen when user reduces the sessions count
    // For example: currently on session 3 of 4, but user changes to 2 sessions
    
    if (completedSessions > 0 && completedSessions % sessionsUntilLongBreak === 0) {
      // Current session count is exactly at a long break point with new settings
      // This is fine, don't need to adjust
      return;
    }
    
    // If we've completed more sessions than the new limit allows before long break,
    // we should reset to avoid confusing states like "Session 3 of 2"
    if (completedSessions >= sessionsUntilLongBreak && sessionType === 'work') {
      setState(prev => ({
        ...prev,
        completedSessions: 0,
        timestamp: Date.now(),
      }));
    }
  }, [sessionsUntilLongBreak, completedSessions, sessionType, setState]);

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
    setState(getDefaultState(workDuration));
  }, [setState, workDuration]);

  const dismissResume = useCallback(() => {
    setShowResume(false);
    // Start fresh - reset to default state
    clearPersistedState(TIMER_STATE_KEY);
    setState(getDefaultState(workDuration));
  }, [setState, workDuration]);

  const switchToNextSession = useCallback(() => {
    playNotification();
    
    // Show desktop notification if enabled
    if (settings.notificationsEnabled) {
      notifySessionComplete(sessionType);
    }
    
    setState(prev => {
      if (prev.sessionType === 'work') {
        const newCompletedSessions = prev.completedSessions + 1;

        if (newCompletedSessions % sessionsUntilLongBreak === 0) {
          return {
            ...prev,
            sessionType: 'longBreak',
            time: longBreakDuration,
            completedSessions: newCompletedSessions,
            isActive: false,
            timestamp: Date.now(),
          };
        } else {
          return {
            ...prev,
            sessionType: 'shortBreak',
            time: shortBreakDuration,
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
          time: workDuration,
          completedSessions: prev.sessionType === 'longBreak' ? 0 : prev.completedSessions,
          isActive: false,
          timestamp: Date.now(),
        };
      }
    });
    
    // Clear persisted state when timer completes (optional - keeps history)
    // Uncomment if you want to clear state on session completion:
    // clearPersistedState(TIMER_STATE_KEY);
  }, [setState, workDuration, shortBreakDuration, longBreakDuration, sessionsUntilLongBreak, settings.notificationsEnabled, sessionType]);

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
      // Use timestamp-based calculation to handle browser throttling
      // This ensures timer accuracy even when tab is in background/minimized
      const startTime = Date.now();
      const startTimerValue = time;

      interval = window.setInterval(() => {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const newTime = Math.max(0, startTimerValue - elapsedSeconds);

        setState(prev => ({
          ...prev,
          time: newTime,
          timestamp: now,
        }));
      }, 100); // Update every 100ms for smooth display, but calculate based on real time
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

