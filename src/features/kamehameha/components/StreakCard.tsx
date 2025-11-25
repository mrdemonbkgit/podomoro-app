/**
 * StreakCard - Rich streak display card for dashboard
 *
 * Displays current streak, longest streak, next milestone, and progress bar.
 */

import { motion } from 'framer-motion';
import type { StreakDisplay, StreakVariant } from '../types/kamehameha.types';
import {
  formatDays,
  getNextMilestone,
  getMilestoneProgress,
} from '../services/streakCalculations';

interface StreakCardProps {
  /** Current streak display */
  display: StreakDisplay | null;
  /** Longest streak in seconds */
  longestSeconds: number;
  /** Card title */
  label: string;
  /** Icon emoji */
  icon: string;
  /** Variant for styling */
  variant: StreakVariant;
  /** Loading state */
  loading?: boolean;
}

export function StreakCard({
  display,
  longestSeconds,
  label,
  icon,
  variant,
  loading = false,
}: StreakCardProps) {
  // Color schemes
  const colors = {
    main: {
      bg: 'from-purple-900/30 to-purple-800/20',
      border: 'border-purple-500/30',
      text: 'text-purple-200',
      progress: 'from-purple-500 to-purple-600',
      button: 'bg-purple-600 hover:bg-purple-700',
    },
    discipline: {
      bg: 'from-blue-900/30 to-blue-800/20',
      border: 'border-blue-500/30',
      text: 'text-blue-200',
      progress: 'from-blue-500 to-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const color = colors[variant];

  if (loading || !display) {
    return (
      <div
        className={`glass-panel rounded-2xl p-6 md:p-8 border-2 ${color.border} animate-pulse`}
      >
        <div className="h-64 flex items-center justify-center">
          <div className="text-4xl">{icon}</div>
        </div>
      </div>
    );
  }

  const nextMilestone = getNextMilestone(display.totalSeconds);
  const progress = getMilestoneProgress(display.totalSeconds);

  return (
    <motion.div
      className={`glass-panel bg-gradient-to-br ${color.bg} rounded-2xl p-6 md:p-8 border-2 ${color.border} backdrop-blur-xl`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl md:text-5xl">{icon}</span>
          <h2
            className={`text-xl md:text-2xl font-bold uppercase tracking-wide ${color.text}`}
          >
            {label}
          </h2>
        </div>
      </div>

      {/* Main Timer */}
      <div className="mb-6">
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-4xl md:text-6xl font-bold text-white tabular-nums">
            {display.days}
          </span>
          <span className={`text-lg md:text-xl ${color.text}`}>days</span>

          <span className="text-4xl md:text-6xl font-bold text-white tabular-nums">
            {String(display.hours).padStart(2, '0')}
          </span>
          <span className={`text-lg md:text-xl ${color.text}`}>hours</span>

          <span className="text-4xl md:text-6xl font-bold text-white tabular-nums">
            {String(display.minutes).padStart(2, '0')}
          </span>
          <span className={`text-lg md:text-xl ${color.text}`}>min</span>

          <span className="text-4xl md:text-6xl font-bold text-white tabular-nums">
            {String(display.seconds).padStart(2, '0')}
          </span>
          <span className={`text-lg md:text-xl ${color.text}`}>sec</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Current Streak */}
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-xs text-white/50 uppercase tracking-wide mb-1">
            Current
          </p>
          <p className="text-lg font-bold text-white">
            {formatDays(display.totalSeconds)}
          </p>
        </div>

        {/* Longest Streak */}
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-xs text-white/50 uppercase tracking-wide mb-1">
            Longest
          </p>
          <p className="text-lg font-bold text-white">
            {formatDays(longestSeconds)}
          </p>
        </div>
      </div>

      {/* Next Milestone */}
      {nextMilestone !== null && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/60">Next milestone</span>
            <span className={`text-sm font-semibold ${color.text}`}>
              {nextMilestone} days
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`absolute inset-y-0 left-0 bg-gradient-to-r ${color.progress} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>

          <div className="text-right mt-1">
            <span className="text-xs text-white/40">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      )}

      {nextMilestone === null && (
        <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
          <p className="text-center text-sm text-yellow-200">
            🏆 Maximum milestone reached! Keep going!
          </p>
        </div>
      )}
    </motion.div>
  );
}
