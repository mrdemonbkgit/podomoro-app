/**
 * BadgeGallery Component
 * 
 * Displays all earned and locked badges in a beautiful grid layout
 * Phase 5.1: Only shows PMO journey badges (no discipline badges)
 */

import { motion } from 'framer-motion';
import type { Badge } from '../types/kamehameha.types';
import { MILESTONE_CONFIGS, formatMilestoneTime } from '../constants/milestones';

interface BadgeGalleryProps {
  badges: Badge[];
  loading?: boolean;
}

export function BadgeGallery({ badges, loading = false }: BadgeGalleryProps) {
  // Get all possible badges (earned + locked)
  const allPossibleBadges = Object.entries(MILESTONE_CONFIGS).map(([seconds, config]) => {
    // Check if this badge has been earned
    const earnedBadge = badges.find(
      (b) => b.milestoneSeconds === Number(seconds)
    );

    return {
      seconds: Number(seconds),
      config,
      badge: earnedBadge,
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500 dark:text-gray-400">Loading badges...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Badge grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {allPossibleBadges.map((item, index) => (
          <BadgeCard
            key={item.seconds}
            badge={item.badge}
            config={item.config}
            index={index}
          />
        ))}
      </div>

      {/* Empty state */}
      {badges.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-xl mb-2">No badges yet!</p>
          <p>Keep going to earn your first milestone badge.</p>
        </div>
      )}
    </div>
  );
}

interface BadgeCardProps {
  badge: Badge | undefined;
  config: { seconds: number; emoji: string; name: string; message: string };
  index: number;
}

function BadgeCard({ badge, config, index }: BadgeCardProps) {
  const isEarned = badge !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`relative rounded-2xl p-4 text-center transition-all duration-300 ${
        isEarned
          ? 'bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
          : 'bg-gray-200 dark:bg-gray-700 opacity-50 grayscale'
      }`}
    >
      {/* Badge emoji */}
      <div className="text-5xl mb-2">{config.emoji}</div>

      {/* Badge name */}
      <div className="font-semibold text-sm mb-1">{config.name}</div>

      {/* Milestone time */}
      <div className="text-xs opacity-80">{formatMilestoneTime(config.seconds)}</div>

      {/* Earned date */}
      {isEarned && badge && (
        <div className="mt-2 text-xs opacity-70">
          Earned {new Date(badge.earnedAt).toLocaleDateString()}
        </div>
      )}

      {/* Locked overlay */}
      {!isEarned && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl opacity-50">🔒</div>
        </div>
      )}
    </motion.div>
  );
}

