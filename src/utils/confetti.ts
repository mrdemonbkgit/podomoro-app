import confetti from 'canvas-confetti';
import { SessionType } from '../types/timer';

/**
 * Trigger confetti celebration based on session type
 */
export const celebrateCompletion = (sessionType: SessionType): void => {
  const colors = getSessionColors(sessionType);

  if (sessionType === 'work') {
    // Work session completed - single burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });
  } else if (sessionType === 'longBreak') {
    // Long break completed - bigger celebration!
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0, colors };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      // Left side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });

      // Right side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  } else {
    // Short break completed - gentle celebration
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.7 },
      colors,
    });
  }
};

/**
 * Get colors for confetti based on session type
 */
const getSessionColors = (sessionType: SessionType): string[] => {
  switch (sessionType) {
    case 'work':
      return ['#ef4444', '#f87171', '#fca5a5', '#fecaca']; // reds
    case 'shortBreak':
      return ['#22c55e', '#4ade80', '#86efac', '#bbf7d0']; // greens
    case 'longBreak':
      return ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe']; // blues
    default:
      return ['#fbbf24', '#fcd34d', '#fde68a', '#fef3c7']; // yellows
  }
};

/**
 * Celebrate achieving a milestone (e.g., 10 work sessions)
 */
export const celebrateMilestone = (): void => {
  const duration = 5000;
  const animationEnd = Date.now() + duration;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#fbbf24', '#f59e0b', '#d97706'],
    });

    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#fbbf24', '#f59e0b', '#d97706'],
    });
  }, 50);
};

