import { motion } from 'framer-motion';
import { SessionType } from '../types/timer';

interface SessionDotsProps {
  completedSessions: number;
  totalSessions: number;
  sessionType: SessionType;
  isDark: boolean;
}

export const SessionDots = ({ completedSessions, totalSessions, sessionType, isDark }: SessionDotsProps) => {
  const dots = Array.from({ length: totalSessions }, (_, index) => index);
  const currentSession = completedSessions % totalSessions;

  const getDotColor = (index: number, isCompleted: boolean) => {
    if (isCompleted) {
      return isDark ? '#4ade80' : '#22c55e'; // green for completed
    }
    if (index === currentSession && sessionType === 'work') {
      return isDark ? '#f87171' : '#ef4444'; // red for current work
    }
    return isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'; // gray for pending
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      {dots.map((index) => {
        const isCompleted = index < currentSession;
        const isCurrent = index === currentSession;
        
        return (
          <motion.div
            key={index}
            className="relative"
            initial={{ scale: 0 }}
            animate={{ 
              scale: isCurrent ? 1.3 : 1,
            }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
          >
            {/* Outer ring for current session */}
            {isCurrent && sessionType === 'work' && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  border: `2px solid ${getDotColor(index, false)}`,
                  width: '16px',
                  height: '16px',
                  left: '-2px',
                  top: '-2px',
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}

            {/* Dot */}
            <motion.div
              className="rounded-full"
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: getDotColor(index, isCompleted),
              }}
              animate={{
                backgroundColor: getDotColor(index, isCompleted),
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Checkmark for completed */}
              {isCompleted && (
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="white"
                  className="w-3 h-3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </motion.svg>
              )}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

