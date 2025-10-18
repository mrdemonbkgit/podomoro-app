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
    <div className="flex gap-6 justify-center mt-8 items-center">
      {/* Start/Pause Button */}
      {isActive ? (
        <button
          onClick={onPause}
          className="px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full text-xl transition-all duration-200 shadow-2xl hover:scale-105"
        >
          Pause
        </button>
      ) : (
        <button
          onClick={onStart}
          className="px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full text-xl transition-all duration-200 shadow-2xl hover:scale-105"
        >
          Start
        </button>
      )}
      
      {/* Reset Button - Icon only */}
      <button
        onClick={onReset}
        className="p-5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full transition-all duration-200 hover:scale-110"
        aria-label="Reset timer"
        title="Reset"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
      
      {/* Skip button - icon only, visible during breaks */}
      {isBreak && (
        <button
          onClick={onSkip}
          className="p-5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full transition-all duration-200 hover:scale-110"
          aria-label="Skip break"
          title="Skip Break"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
};

