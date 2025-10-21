/**
 * StreakBadge - Top bar streak display
 * 
 * Shows main streak in top-right corner on all pages when user is authenticated.
 * Updates every second. Non-interactive display only.
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { StreakDisplay } from '../../features/kamehameha/types/kamehameha.types';

interface StreakBadgeProps {
  /** Formatted streak display */
  display: StreakDisplay | null;
  /** Whether badge should be visible */
  isVisible: boolean;
}

export function StreakBadge({ display, isVisible }: StreakBadgeProps) {
  if (!isVisible || !display) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-4 z-40"
      >
        <div className="glass-panel bg-gradient-to-r from-purple-900/40 to-purple-800/30 backdrop-blur-lg rounded-full px-4 py-2 border border-purple-500/30 shadow-lg">
          <div className="flex items-center gap-2">
            {/* Shield Icon */}
            <span className="text-xl">🛡️</span>

            {/* Time Display */}
            <div className="flex items-center gap-1 text-sm font-mono font-semibold text-white">
              {display.days > 0 && (
                <>
                  <span className="tabular-nums">{display.days}</span>
                  <span className="text-purple-300">d</span>
                </>
              )}
              
              {(display.days > 0 || display.hours > 0) && (
                <>
                  <span className="tabular-nums">{display.hours}</span>
                  <span className="text-purple-300">h</span>
                </>
              )}
              
              <span className="tabular-nums">{display.minutes}</span>
              <span className="text-purple-300">m</span>
              
              <span className="tabular-nums">{display.seconds}</span>
              <span className="text-purple-300">s</span>
            </div>
          </div>
        </div>

        {/* Tooltip */}
        <div className="absolute top-full left-0 mt-2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-slate-900/95 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
            Main Streak: {display.humanReadable}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

