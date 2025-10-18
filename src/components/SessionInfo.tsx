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
    <div className="text-center mb-6 md:mb-8">
      {/* Question */}
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 flex items-center justify-center gap-3 flex-wrap">
        What do you want to focus on?
        <svg className="w-6 h-6 md:w-8 md:h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </h2>
      
      {/* Session Type Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
        <button 
          className={`px-6 py-3 rounded-full text-base md:text-lg font-semibold transition-all ${
            sessionType === 'work' 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'bg-white/20 text-white border-2 border-white/40 hover:bg-white/30'
          }`}
          disabled
        >
          Focus
        </button>
        <button 
          className={`px-6 py-3 rounded-full text-base md:text-lg font-semibold transition-all ${
            sessionType === 'shortBreak' 
              ? 'bg-pink-600 text-white shadow-lg' 
              : 'bg-white/0 text-white border-2 border-white/40 hover:bg-white/10'
          }`}
          disabled
        >
          Short Break
        </button>
        <button 
          className={`px-6 py-3 rounded-full text-base md:text-lg font-semibold transition-all ${
            sessionType === 'longBreak' 
              ? 'bg-pink-600 text-white shadow-lg' 
              : 'bg-white/0 text-white border-2 border-white/40 hover:bg-white/10'
          }`}
          disabled
        >
          Long Break
        </button>
      </div>

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

