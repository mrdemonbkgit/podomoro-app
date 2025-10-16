import { useEffect } from 'react';
import { SessionType } from '../types/timer';

interface TimerProps {
  time: number;
  sessionType: SessionType;
  isDark: boolean;
}

export const Timer = ({ time, sessionType, isDark }: TimerProps) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  useEffect(() => {
    // Update document title with countdown
    document.title = `${formattedTime} - Pomodoro Timer`;
    
    return () => {
      document.title = 'Pomodoro Timer';
    };
  }, [formattedTime]);

  const getTimerColor = () => {
    switch (sessionType) {
      case 'work':
        return isDark ? 'text-red-400' : 'text-red-500';
      case 'shortBreak':
        return isDark ? 'text-green-400' : 'text-green-500';
      case 'longBreak':
        return isDark ? 'text-blue-400' : 'text-blue-500';
      default:
        return isDark ? 'text-gray-100' : 'text-gray-900';
    }
  };

  return (
    <div className={`text-9xl font-bold ${getTimerColor()} tabular-nums transition-colors duration-200`}>
      {formattedTime}
    </div>
  );
};

