import { SessionType } from '../types/timer';

interface ResumePromptProps {
  time: number;
  sessionType: SessionType;
  elapsedWhileAway: number; // Seconds elapsed while tab was closed
  onResume: () => void;
  onStartFresh: () => void;
}

export const ResumePrompt = ({ time, sessionType, elapsedWhileAway, onResume, onStartFresh }: ResumePromptProps) => {
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
        return 'text-red-500';
      case 'shortBreak':
        return 'text-green-500';
      case 'longBreak':
        return 'text-blue-500';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Welcome Back! 👋
        </h2>
        
        {hasElapsed ? (
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">
              While you were away, <span className="font-semibold text-orange-600">
                {elapsedMinutes > 0 && `${elapsedMinutes}m `}
                {elapsedSeconds}s
              </span> elapsed.
            </p>
            <p className="text-gray-600">
              Continue from where the timer would be?
            </p>
          </div>
        ) : (
          <p className="text-gray-600 text-center mb-6">
            You have a saved timer session. Would you like to resume where you left off?
          </p>
        )}
        
        <div className="bg-gray-50 rounded-lg p-6 mb-6 text-center">
          <div className={`text-lg font-semibold mb-2 ${getSessionColor()}`}>
            {getSessionLabel()}
          </div>
          <div className="text-4xl font-bold text-gray-800">
            {formattedTime}
          </div>
          {hasElapsed && (
            <div className="mt-2 text-sm text-gray-500">
              (Updated from pause time)
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onStartFresh}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors duration-200"
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

