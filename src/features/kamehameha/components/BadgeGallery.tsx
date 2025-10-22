/**
 * BadgeGallery Component
 * 
 * Displays all earned and locked badges in a beautiful grid layout
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Badge, StreakType } from '../types/kamehameha.types';
import { MILESTONE_CONFIGS, formatMilestoneTime } from '../constants/milestones';

interface BadgeGalleryProps {
  badges: Badge[];
  loading?: boolean;
}

type FilterType = 'all' | 'main' | 'discipline';

export function BadgeGallery({ badges, loading = false }: BadgeGalleryProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  // Get all possible badges (earned + locked)
  const allPossibleBadges = Object.entries(MILESTONE_CONFIGS).map(([seconds, config]) => {
    // Check if this badge has been earned (for main and discipline)
    const mainBadge = badges.find(
      (b) => b.milestoneSeconds === Number(seconds) && b.streakType === 'main'
    );
    const disciplineBadge = badges.find(
      (b) => b.milestoneSeconds === Number(seconds) && b.streakType === 'discipline'
    );

    return {
      seconds: Number(seconds),
      config,
      mainBadge,
      disciplineBadge,
    };
  });

  // Filter badges based on selected filter
  const filteredBadges = allPossibleBadges.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'main') return item.mainBadge !== undefined;
    if (filter === 'discipline') return item.disciplineBadge !== undefined;
    return true;
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
      {/* Filter tabs */}
      <div className="flex gap-2 justify-center">
        {(['all', 'main', 'discipline'] as FilterType[]).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              filter === filterType
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {filterType === 'all' && '🎖️ All Badges'}
            {filterType === 'main' && '🔥 Main Streak'}
            {filterType === 'discipline' && '⚔️ Discipline'}
          </button>
        ))}
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBadges.map((item, index) => (
          <div key={item.seconds} className="space-y-2">
            {/* Main streak badge */}
            {(filter === 'all' || filter === 'main') && (
              <BadgeCard
                badge={item.mainBadge}
                config={item.config}
                streakType="main"
                index={index}
              />
            )}

            {/* Discipline streak badge */}
            {(filter === 'all' || filter === 'discipline') && (
              <BadgeCard
                badge={item.disciplineBadge}
                config={item.config}
                streakType="discipline"
                index={index}
              />
            )}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredBadges.length === 0 && (
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
  streakType: StreakType;
  index: number;
}

function BadgeCard({ badge, config, streakType, index }: BadgeCardProps) {
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
      {/* Streak type indicator */}
      <div className="absolute top-2 right-2 text-xs">
        {streakType === 'main' ? '🔥' : '⚔️'}
      </div>

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

