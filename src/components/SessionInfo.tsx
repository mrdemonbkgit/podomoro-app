import { SessionType } from '../types/timer';

interface SessionInfoProps {
  sessionType: SessionType;
  completedSessions: number;
  sessionsUntilLongBreak: number;
}

export const SessionInfo = ({ sessionType, completedSessions, sessionsUntilLongBreak }: SessionInfoProps) => {
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
        return 'text-red-500 dark:text-red-400';
      case 'shortBreak':
        return 'text-green-500 dark:text-green-400';
      case 'longBreak':
        return 'text-blue-500 dark:text-blue-400';
      default:
        return 'text-gray-900 dark:text-gray-100';
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
      <p className="text-gray-600 dark:text-gray-400 text-lg transition-colors duration-200">
        Session {currentSessionNumber} of {sessionsUntilLongBreak}
      </p>
    </div>
  );
};

