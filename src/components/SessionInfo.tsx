import { SessionType } from '../types/timer';

interface SessionInfoProps {
  sessionType: SessionType;
  completedSessions: number;
}

export const SessionInfo = ({ sessionType, completedSessions }: SessionInfoProps) => {
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
        return 'text-red-500';
      case 'shortBreak':
        return 'text-green-500';
      case 'longBreak':
        return 'text-blue-500';
      default:
        return 'text-gray-900';
    }
  };

  // Show current session number (1-4) during work sessions
  const currentSessionNumber = sessionType === 'work' ? (completedSessions % 4) + 1 : completedSessions % 4 || 4;

  return (
    <div className="text-center mb-8">
      <h2 className={`text-3xl font-semibold mb-2 ${getSessionColor()}`}>
        {getSessionLabel()}
      </h2>
      <p className="text-gray-600 text-lg">
        Session {currentSessionNumber} of 4
      </p>
    </div>
  );
};

