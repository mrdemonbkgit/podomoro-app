import { useState, useEffect, useCallback } from 'react';
import {
  SessionType,
  WORK_DURATION,
  SHORT_BREAK_DURATION,
  LONG_BREAK_DURATION,
  SESSIONS_UNTIL_LONG_BREAK,
} from '../types/timer';
import { playNotification } from '../utils/audio';

interface UseTimerReturn {
  time: number;
  isActive: boolean;
  sessionType: SessionType;
  completedSessions: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

export const useTimer = (): UseTimerReturn => {
  const [time, setTime] = useState(WORK_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [completedSessions, setCompletedSessions] = useState(0);

  const start = useCallback(() => {
    setIsActive(true);
  }, []);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = useCallback(() => {
    setIsActive(false);
    setTime(WORK_DURATION);
    setSessionType('work');
    setCompletedSessions(0);
  }, []);

  const switchToNextSession = useCallback(() => {
    if (sessionType === 'work') {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);

      if (newCompletedSessions % SESSIONS_UNTIL_LONG_BREAK === 0) {
        setSessionType('longBreak');
        setTime(LONG_BREAK_DURATION);
      } else {
        setSessionType('shortBreak');
        setTime(SHORT_BREAK_DURATION);
      }
    } else {
      // After any break, go back to work
      setSessionType('work');
      setTime(WORK_DURATION);
      
      // Reset session counter after long break
      if (sessionType === 'longBreak') {
        setCompletedSessions(0);
      }
    }
    
    playNotification();
    setIsActive(false);
  }, [sessionType, completedSessions]);

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && time > 0) {
      interval = window.setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      switchToNextSession();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, time, switchToNextSession]);

  return {
    time,
    isActive,
    sessionType,
    completedSessions,
    start,
    pause,
    reset,
  };
};

