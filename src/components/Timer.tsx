import { useEffect } from 'react';
import { SessionType } from '../types/timer';

interface TimerProps {
  time: number;
  sessionType: SessionType;
}

export const Timer = ({ time, sessionType }: TimerProps) => {
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
        return 'text-red-500';
      case 'shortBreak':
        return 'text-green-500';
      case 'longBreak':
        return 'text-blue-500';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <div className={`text-9xl font-bold ${getTimerColor()} tabular-nums`}>
      {formattedTime}
    </div>
  );
};

