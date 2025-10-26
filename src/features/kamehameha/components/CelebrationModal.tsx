/**
 * CelebrationModal Component
 * 
 * Shows a beautiful celebration modal with confetti when user earns a new badge
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { Badge } from '../types/kamehameha.types';
import { TIMEOUTS } from '../constants/app.constants';

interface CelebrationModalProps {
  badge: Badge | null;
  onClose: () => void;
}

export function CelebrationModal({ badge, onClose }: CelebrationModalProps) {
  useEffect(() => {
    if (!badge) return;

    // Trigger confetti animation
    const duration = TIMEOUTS.TOAST_DURATION_MS;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

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

    // Auto-close after 5 seconds
    const autoCloseTimer = setTimeout(() => {
      onClose();
    }, TIMEOUTS.ERROR_MESSAGE_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(autoCloseTimer);
    };
  }, [badge, onClose]);

  return (
    <AnimatePresence>
      {badge && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 
                         rounded-3xl shadow-2xl max-w-md w-full p-8 text-white relative overflow-hidden"
            >
              {/* Decorative circles */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-20 translate-y-20" />

              {/* Content */}
              <div className="relative z-10 text-center">
                {/* Badge emoji */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.2, duration: 0.8 }}
                  className="text-8xl mb-6"
                >
                  {badge.badgeEmoji}
                </motion.div>

                {/* Badge name */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl font-bold mb-3"
                >
                  {badge.badgeName}
                </motion.h2>

                {/* Badge message */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg mb-6 text-white/90"
                >
                  {badge.congratsMessage}
                </motion.p>

                {/* Close button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  onClick={onClose}
                  className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm 
                             text-white font-semibold py-3 px-6 rounded-xl 
                             transition-colors duration-200"
                >
                  Continue Your Journey
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

