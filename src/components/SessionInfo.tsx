import { SessionType } from '../types/timer';
import { SessionDots } from './SessionDots';

interface SessionInfoProps {
  sessionType: SessionType;
  completedSessions: number;
  sessionsUntilLongBreak: number;
  isDark: boolean;
}

export const SessionInfo = ({ sessionType, completedSessions, sessionsUntilLongBreak, isDark }: SessionInfoProps) => {
  return (
    <div className="text-center mb-4">
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

