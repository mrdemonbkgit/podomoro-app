import { useEffect } from 'react';
import { SessionType } from '../types/timer';

interface TimerProps {
  time: number;
  initialTime: number; // Total duration for progress calculation
  sessionType: SessionType;
  isDark: boolean;
}

export const Timer = ({ time }: TimerProps) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  useEffect(() => {
    // Update document title with countdown
    document.title = `${formattedTime} - ZenFocus`;

    return () => {
      document.title = 'ZenFocus - Find Your Flow';
    };
  }, [formattedTime]);

  return (
    <div className="relative w-full flex items-center justify-center">
      {/* Timer Display - Large and centered */}
      <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white/90 tabular-nums tracking-tight drop-shadow-2xl">
        {formattedTime}
      </div>
    </div>
  );
};
