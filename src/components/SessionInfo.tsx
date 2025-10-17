import { SessionType } from '../types/timer';
import { SessionDots } from './SessionDots';

interface SessionInfoProps {
  sessionType: SessionType;
  completedSessions: number;
  sessionsUntilLongBreak: number;
  isDark: boolean;
}

export const SessionInfo = ({ sessionType, completedSessions, sessionsUntilLongBreak, isDark }: SessionInfoProps) => {
  // Show current session number during work sessions
  const currentSessionNumber = sessionType === 'work' 
    ? (completedSessions % sessionsUntilLongBreak) + 1 
    : completedSessions % sessionsUntilLongBreak || sessionsUntilLongBreak;

  return (
    <div className="text-center mb-6">
      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-lg mb-3 transition-colors duration-200`}>
        Session {currentSessionNumber} of {sessionsUntilLongBreak}
      </p>
      
      {/* Visual session progress dots */}
      <SessionDots 
        completedSessions={completedSessions}
        totalSessions={sessionsUntilLongBreak}
        sessionType={sessionType}
        isDark={isDark}
      />
    </div>
  );
};

