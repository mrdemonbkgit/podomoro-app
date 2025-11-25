import { motion } from 'framer-motion';
import { SessionType } from '../types/timer';

interface CircularProgressProps {
  progress: number; // 0-100
  sessionType: SessionType;
  isDark: boolean;
  size?: number;
}

export const CircularProgress = ({
  progress,
  sessionType,
  isDark,
  size = 400,
}: CircularProgressProps) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const getStrokeColor = () => {
    switch (sessionType) {
      case 'work':
        return isDark ? '#f87171' : '#ef4444'; // red
      case 'shortBreak':
        return isDark ? '#4ade80' : '#22c55e'; // green
      case 'longBreak':
        return isDark ? '#60a5fa' : '#3b82f6'; // blue
      default:
        return isDark ? '#9ca3af' : '#6b7280'; // gray
    }
  };

  return (
    <svg
      width={size}
      height={size}
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ zIndex: -1 }}
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}
        strokeWidth={strokeWidth}
      />

      {/* Progress circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={getStrokeColor()}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{
          filter: `drop-shadow(0 0 8px ${getStrokeColor()})`,
        }}
      />
    </svg>
  );
};
