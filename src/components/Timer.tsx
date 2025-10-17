import { useEffect } from 'react';
import { SessionType } from '../types/timer';
import { CircularProgress } from './CircularProgress';

interface TimerProps {
  time: number;
  initialTime: number; // Total duration for progress calculation
  sessionType: SessionType;
  isDark: boolean;
}

export const Timer = ({ time, initialTime, sessionType, isDark }: TimerProps) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Calculate progress percentage (inverted: 0 = complete, 100 = just started)
  const progress = initialTime > 0 ? ((initialTime - time) / initialTime) * 100 : 0;

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
    <div className="relative inline-block">
      {/* Circular Progress Ring */}
      <CircularProgress 
        progress={progress} 
        sessionType={sessionType} 
        isDark={isDark}
        size={500}
      />
      
      {/* Timer Display */}
      <div className={`relative z-10 text-8xl md:text-9xl lg:text-[12rem] xl:text-[14rem] font-black ${getTimerColor()} tabular-nums tracking-tight drop-shadow-2xl animate-pulse-subtle transition-all duration-200`}>
        {formattedTime}
      </div>
    </div>
  );
};

