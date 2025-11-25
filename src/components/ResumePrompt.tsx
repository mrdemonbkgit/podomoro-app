import { SessionType } from '../types/timer';

interface ResumePromptProps {
  time: number;
  sessionType: SessionType;
  elapsedWhileAway: number; // Seconds elapsed while tab was closed
  onResume: () => void;
  onStartFresh: () => void;
  isDark: boolean;
}

export const ResumePrompt = ({
  time,
  sessionType,
  elapsedWhileAway,
  onResume,
  onStartFresh,
  isDark,
}: ResumePromptProps) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Calculate elapsed time display
  const elapsedMinutes = Math.floor(elapsedWhileAway / 60);
  const elapsedSeconds = elapsedWhileAway % 60;
  const hasElapsed = elapsedWhileAway > 0;

  const getSessionLabel = () => {
    switch (sessionType) {
      case 'work':
        return 'Work Session';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Session';
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

  return (
    <div
      className={`fixed inset-0 ${isDark ? 'bg-black/70' : 'bg-black/50'} flex items-center justify-center z-50 p-4`}
    >
      <div
        className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-8 max-w-md w-full transition-colors duration-200`}
      >
        <h2
          className={`text-2xl font-bold text-center ${isDark ? 'text-gray-100' : 'text-gray-800'} mb-4 transition-colors duration-200`}
        >
          Welcome Back! 👋
        </h2>

        {hasElapsed ? (
          <div className="text-center mb-6">
            <p
              className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 transition-colors duration-200`}
            >
              While you were away,{' '}
              <span
                className={`font-semibold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}
              >
                {elapsedMinutes > 0 && `${elapsedMinutes}m `}
                {elapsedSeconds}s
              </span>{' '}
              elapsed.
            </p>
            <p
              className={`${isDark ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-200`}
            >
              Continue from where the timer would be?
            </p>
          </div>
        ) : (
          <p
            className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-center mb-6 transition-colors duration-200`}
          >
            You have a saved timer session. Would you like to resume where you
            left off?
          </p>
        )}

        <div
          className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6 mb-6 text-center transition-colors duration-200`}
        >
          <div
            className={`text-lg font-semibold mb-2 ${getSessionColor()} transition-colors duration-200`}
          >
            {getSessionLabel()}
          </div>
          <div
            className={`text-4xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'} transition-colors duration-200`}
          >
            {formattedTime}
          </div>
          {hasElapsed && (
            <div
              className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-200`}
            >
              (Updated from pause time)
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onStartFresh}
            className={`flex-1 px-6 py-3 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} font-semibold rounded-lg transition-colors duration-200`}
          >
            Start Fresh
          </button>
          <button
            onClick={onResume}
            className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Resume
          </button>
        </div>
      </div>
    </div>
  );
};
