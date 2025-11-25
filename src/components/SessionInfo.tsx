import { SessionType } from '../types/timer';
import { SessionDots } from './SessionDots';

interface SessionInfoProps {
  sessionType: SessionType;
  completedSessions: number;
  sessionsUntilLongBreak: number;
  isDark: boolean;
  onEditTasks?: () => void;
  currentTask?: string;
}

export const SessionInfo = ({
  sessionType,
  completedSessions,
  sessionsUntilLongBreak,
  isDark,
  onEditTasks,
  currentTask,
}: SessionInfoProps) => {
  return (
    <div className="text-center mb-6 md:mb-8">
      {/* Question / Current Task */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3 flex-wrap">
          {currentTask || 'What do you want to focus on?'}
          <button
            onClick={onEditTasks}
            className="p-2 rounded-full hover:bg-white/10 transition-all hover:scale-110 cursor-pointer"
            aria-label="Edit focus priorities"
            title="Edit focus priorities"
          >
            <svg
              className="w-6 h-6 md:w-8 md:h-8 text-white/60 hover:text-white/90 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        </h2>
        {currentTask && (
          <p className="text-sm text-white/50 font-light italic">
            Working on your priority
          </p>
        )}
      </div>

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
