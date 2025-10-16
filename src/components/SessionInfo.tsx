import { SessionType } from '../types/timer';

interface SessionInfoProps {
  sessionType: SessionType;
  completedSessions: number;
  sessionsUntilLongBreak: number;
  isDark: boolean;
}

export const SessionInfo = ({ sessionType, completedSessions, sessionsUntilLongBreak, isDark }: SessionInfoProps) => {
  const getSessionLabel = () => {
    switch (sessionType) {
      case 'work':
        return 'Work Time';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return '';
    }
  };

  const getSessionColor = () => {
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

  // Show current session number during work sessions
  const currentSessionNumber = sessionType === 'work' 
    ? (completedSessions % sessionsUntilLongBreak) + 1 
    : completedSessions % sessionsUntilLongBreak || sessionsUntilLongBreak;

  return (
    <div className="text-center mb-8">
      <h2 className={`text-3xl font-semibold mb-2 ${getSessionColor()} transition-colors duration-200`}>
        {getSessionLabel()}
      </h2>
      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-lg transition-colors duration-200`}>
        Session {currentSessionNumber} of {sessionsUntilLongBreak}
      </p>
    </div>
  );
};

