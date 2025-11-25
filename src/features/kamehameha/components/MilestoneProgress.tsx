/**
 * MilestoneProgress Component
 *
 * Shows progress bar towards the next milestone
 * Phase 5.1: Only shows PMO journey milestones (no discipline)
 */

import { motion } from 'framer-motion';
import {
  getMilestoneProgress,
  getTimeToNextMilestone,
} from '../constants/milestones';

interface MilestoneProgressProps {
  /** Current streak duration in seconds */
  currentSeconds: number;
}

export function MilestoneProgress({ currentSeconds }: MilestoneProgressProps) {
  const progressData = getMilestoneProgress(currentSeconds);
  const timeRemaining = getTimeToNextMilestone(currentSeconds);

  // If at max milestone, show completion message
  if (!progressData.next) {
    return (
      <div
        className="bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-yellow-600 dark:to-orange-600 
                      rounded-xl p-6 text-white text-center"
      >
        <div className="text-3xl mb-2">🏆</div>
        <div className="font-bold text-lg">Maximum Level Reached!</div>
        <div className="text-sm opacity-90 mt-1">
          You've earned all available badges!
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(progressData.progress * 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Next Milestone
          </h3>
        </div>
        <div className="text-4xl">{progressData.next.emoji}</div>
      </div>

      {/* Badge name */}
      <div className="mb-2">
        <div className="font-bold text-lg text-gray-900 dark:text-white">
          {progressData.next.name}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
        />
      </div>

      {/* Progress info */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {progressPercent}% complete
        </span>
        {timeRemaining && (
          <span className="font-medium text-gray-900 dark:text-white">
            {timeRemaining.formatted} to go
          </span>
        )}
      </div>

      {/* Motivational message */}
      <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <p className="text-sm text-purple-900 dark:text-purple-200 text-center">
          {getMotivationalMessage(progressPercent)}
        </p>
      </div>
    </div>
  );
}

/**
 * Get an encouraging message based on progress percentage
 */
function getMotivationalMessage(progressPercent: number): string {
  if (progressPercent === 0) {
    return "Every journey begins with a single step. You've got this! 💪";
  } else if (progressPercent < 25) {
    return 'Great start! Keep building momentum. 🚀';
  } else if (progressPercent < 50) {
    return "You're making progress! Stay strong. 💪";
  } else if (progressPercent < 75) {
    return "Halfway there! You're doing amazing. ⭐";
  } else if (progressPercent < 95) {
    return 'Almost there! Keep pushing forward. 🔥';
  } else {
    return 'So close! The next milestone is within reach! 🏆';
  }
}
