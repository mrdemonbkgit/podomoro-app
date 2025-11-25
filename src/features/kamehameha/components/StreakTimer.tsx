/**
 * StreakTimer - Live updating countdown timer display
 *
 * Shows days, hours, minutes, seconds in a large, readable format.
 * Updates every second via the parent component.
 */

import { motion } from 'framer-motion';
import type { StreakDisplay, StreakVariant } from '../types/kamehameha.types';

interface StreakTimerProps {
  /** Formatted streak display data */
  display: StreakDisplay | null;
  /** Timer label (e.g., "MAIN STREAK") */
  label: string;
  /** Icon emoji */
  icon: string;
  /** Variant for styling */
  variant: StreakVariant;
}

export function StreakTimer({
  display,
  label,
  icon,
  variant,
}: StreakTimerProps) {
  if (!display) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse">
          <div className="text-6xl mb-4">{icon}</div>
          <div className="h-8 bg-white/10 rounded w-48 mx-auto"></div>
        </div>
      </div>
    );
  }

  const { days, hours, minutes, seconds } = display;

  // Color scheme based on variant
  const colors = {
    main: {
      gradient: 'from-purple-500 to-purple-700',
      text: 'text-purple-200',
      glow: 'shadow-purple-500/50',
    },
    discipline: {
      gradient: 'from-blue-500 to-blue-700',
      text: 'text-blue-200',
      glow: 'shadow-blue-500/50',
    },
  };

  const color = colors[variant];

  return (
    <div className="text-center">
      {/* Icon */}
      <motion.div
        className="text-6xl md:text-7xl mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        {icon}
      </motion.div>

      {/* Label */}
      <h3
        className={`text-sm md:text-base font-semibold uppercase tracking-wider mb-4 ${color.text}`}
      >
        {label}
      </h3>

      {/* Time Display */}
      <div className="flex items-center justify-center gap-2 md:gap-4">
        {/* Days */}
        <TimeUnit value={days} label="days" color={color} />

        <span className="text-2xl md:text-4xl text-white/50 font-light">:</span>

        {/* Hours */}
        <TimeUnit value={hours} label="hours" color={color} />

        <span className="text-2xl md:text-4xl text-white/50 font-light">:</span>

        {/* Minutes */}
        <TimeUnit value={minutes} label="min" color={color} />

        <span className="text-2xl md:text-4xl text-white/50 font-light">:</span>

        {/* Seconds */}
        <TimeUnit value={seconds} label="sec" color={color} isAnimated />
      </div>

      {/* Compact Format (Mobile Friendly) */}
      <div className="mt-4 text-sm md:text-base text-white/60 font-mono">
        {display.formatted}
      </div>
    </div>
  );
}

// ============================================================================
// TimeUnit Sub-Component
// ============================================================================

interface TimeUnitProps {
  value: number;
  label: string;
  color: {
    gradient: string;
    text: string;
    glow: string;
  };
  isAnimated?: boolean;
}

function TimeUnit({ value, label, color, isAnimated = false }: TimeUnitProps) {
  const formattedValue = String(value).padStart(2, '0');

  return (
    <div className="flex flex-col items-center">
      {/* Number */}
      <motion.div
        className={`text-3xl md:text-5xl lg:text-6xl font-bold text-white tabular-nums ${
          isAnimated ? 'animate-pulse-subtle' : ''
        }`}
        key={value} // Re-render on value change for animation
        initial={isAnimated ? { opacity: 0.5, scale: 0.95 } : {}}
        animate={isAnimated ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.3 }}
      >
        {formattedValue}
      </motion.div>

      {/* Label */}
      <span
        className={`text-xs md:text-sm uppercase tracking-wide mt-1 ${color.text}`}
      >
        {label}
      </span>
    </div>
  );
}
