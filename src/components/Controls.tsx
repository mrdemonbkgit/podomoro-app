import { SessionType } from '../types/timer';

interface ControlsProps {
  isActive: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  sessionType: SessionType;
  isDark: boolean;
}

export const Controls = ({ isActive, onStart, onPause, onReset, onSkip, sessionType, isDark }: ControlsProps) => {
  const isBreak = sessionType !== 'work';
  return (
    <div className="flex gap-4 justify-center mt-12">
      {isActive ? (
        <button
          onClick={onPause}
          className="px-8 py-4 min-w-[140px] bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg text-xl transition-colors duration-200 shadow-lg"
        >
          Pause
        </button>
      ) : (
        <button
          onClick={onStart}
          className="px-8 py-4 min-w-[140px] bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg text-xl transition-colors duration-200 shadow-lg"
        >
          Start
        </button>
      )}
      
      {/* Skip button - only visible during breaks */}
      {isBreak && (
        <button
          onClick={onSkip}
          className={`px-8 py-4 min-w-[140px] ${isDark ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'} text-white font-semibold rounded-lg text-xl transition-colors duration-200 shadow-lg`}
        >
          Skip Break
        </button>
      )}
      
      <button
        onClick={onReset}
        className="px-8 py-4 min-w-[140px] bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg text-xl transition-colors duration-200 shadow-lg"
      >
        Reset
      </button>
    </div>
  );
};

