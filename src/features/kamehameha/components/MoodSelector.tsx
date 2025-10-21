/**
 * MoodSelector Component
 * 
 * Five emoji buttons for selecting mood (1-5 scale)
 * Used in CheckInModal for mood tracking
 */

import { type Mood, MOOD_EMOJIS } from '../types/kamehameha.types';

interface MoodSelectorProps {
  selectedMood?: Mood;
  onMoodSelect: (mood: Mood) => void;
}

const moods: Mood[] = ['veryBad', 'bad', 'neutral', 'good', 'veryGood'];

export function MoodSelector({ selectedMood, onMoodSelect }: MoodSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        How are you feeling? 💭
      </label>
      
      <div className="flex justify-between gap-2">
        {moods.map((mood) => (
          <button
            key={mood}
            type="button"
            onClick={() => onMoodSelect(mood)}
            className={`
              flex-1 py-4 px-2 rounded-xl text-4xl transition-all duration-200
              ${
                selectedMood === mood
                  ? 'bg-purple-500/30 border-2 border-purple-400 scale-110 shadow-lg shadow-purple-500/20'
                  : 'bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105'
              }
            `}
            title={getMoodLabel(mood)}
          >
            {MOOD_EMOJIS[mood]}
          </button>
        ))}
      </div>
      
      {/* Mood labels */}
      <div className="flex justify-between text-xs text-gray-400">
        <span>Very Bad</span>
        <span>Bad</span>
        <span>Neutral</span>
        <span>Good</span>
        <span>Very Good</span>
      </div>
    </div>
  );
}

/**
 * Get human-readable mood label
 */
function getMoodLabel(mood: Mood): string {
  const labels: Record<Mood, string> = {
    veryBad: 'Very Bad',
    bad: 'Bad',
    neutral: 'Neutral',
    good: 'Good',
    veryGood: 'Very Good',
  };
  return labels[mood];
}

