import { motion } from 'framer-motion';
import { SessionType } from '../types/timer';

interface SessionDotsProps {
  completedSessions: number;
  totalSessions: number;
  sessionType: SessionType;
  isDark: boolean;
}

export const SessionDots = ({ completedSessions, totalSessions, sessionType }: SessionDotsProps) => {
  const dots = Array.from({ length: totalSessions }, (_, index) => index);
  const currentSession = completedSessions % totalSessions;

  const getDotColor = (index: number, isCompleted: boolean) => {
    if (isCompleted) {
      return '#ffffff'; // white for completed
    }
    if (index === currentSession && sessionType === 'work') {
      return '#ffffff'; // white for current work
    }
    return 'rgba(255, 255, 255, 0.3)'; // transparent white for pending
  };

  return (
    <div className="flex items-center justify-center gap-3 mt-4">
      {dots.map((index) => {
        const isCompleted = index < currentSession;
        const isCurrent = index === currentSession;
        
        return (
          <motion.div
            key={index}
            className="relative"
            initial={{ scale: 0 }}
            animate={{ 
              scale: isCurrent ? 1.2 : 1,
            }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
          >
            {/* Dot */}
            <motion.div
              className="rounded-full"
              style={{
                width: '14px',
                height: '14px',
                backgroundColor: getDotColor(index, isCompleted),
              }}
              animate={{
                backgroundColor: getDotColor(index, isCompleted),
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

