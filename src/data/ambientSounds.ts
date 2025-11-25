export type SoundCategory =
  | 'nature'
  | 'weather'
  | 'urban'
  | 'workspace'
  | 'travel'
  | 'meditation';

export interface AmbientSound {
  id: string;
  name: string;
  emoji: string;
  category: SoundCategory;
  description: string;
  frequency: number; // Base frequency for synthesis
  type: 'continuous' | 'rhythmic' | 'ambient';
  complexity: 'simple' | 'medium' | 'complex';
}

export const AMBIENT_SOUNDS: AmbientSound[] = [
  // Nature Sounds
  {
    id: 'rain',
    name: 'Rain',
    emoji: '🌧️',
    category: 'nature',
    description: 'Gentle rain falling',
    frequency: 200,
    type: 'continuous',
    complexity: 'complex',
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    emoji: '🌊',
    category: 'nature',
    description: 'Calming ocean waves',
    frequency: 150,
    type: 'rhythmic',
    complexity: 'complex',
  },
  {
    id: 'forest',
    name: 'Forest',
    emoji: '🌲',
    category: 'nature',
    description: 'Birds and rustling leaves',
    frequency: 300,
    type: 'ambient',
    complexity: 'complex',
  },
  {
    id: 'river',
    name: 'River Stream',
    emoji: '🏞️',
    category: 'nature',
    description: 'Flowing water',
    frequency: 180,
    type: 'continuous',
    complexity: 'medium',
  },
  {
    id: 'birds',
    name: 'Birds Chirping',
    emoji: '🐦',
    category: 'nature',
    description: 'Morning birds',
    frequency: 400,
    type: 'rhythmic',
    complexity: 'medium',
  },
  {
    id: 'crickets',
    name: 'Crickets',
    emoji: '🦗',
    category: 'nature',
    description: 'Night crickets',
    frequency: 500,
    type: 'rhythmic',
    complexity: 'medium',
  },
  {
    id: 'wind',
    name: 'Wind',
    emoji: '💨',
    category: 'nature',
    description: 'Gentle breeze',
    frequency: 120,
    type: 'continuous',
    complexity: 'simple',
  },

  // Weather Sounds
  {
    id: 'thunderstorm',
    name: 'Thunderstorm',
    emoji: '⛈️',
    category: 'weather',
    description: 'Rain with distant thunder',
    frequency: 100,
    type: 'rhythmic',
    complexity: 'complex',
  },
  {
    id: 'heavyrain',
    name: 'Heavy Rain',
    emoji: '🌧️',
    category: 'weather',
    description: 'Intense rainfall',
    frequency: 220,
    type: 'continuous',
    complexity: 'complex',
  },
  {
    id: 'snow',
    name: 'Snowfall',
    emoji: '❄️',
    category: 'weather',
    description: 'Soft falling snow',
    frequency: 140,
    type: 'ambient',
    complexity: 'simple',
  },

  // Urban Sounds
  {
    id: 'city',
    name: 'City Ambience',
    emoji: '🏙️',
    category: 'urban',
    description: 'Distant city sounds',
    frequency: 250,
    type: 'ambient',
    complexity: 'complex',
  },
  {
    id: 'traffic',
    name: 'Traffic',
    emoji: '🚗',
    category: 'urban',
    description: 'Distant traffic hum',
    frequency: 160,
    type: 'continuous',
    complexity: 'medium',
  },
  {
    id: 'subway',
    name: 'Subway',
    emoji: '🚇',
    category: 'urban',
    description: 'Underground train ambience',
    frequency: 130,
    type: 'rhythmic',
    complexity: 'medium',
  },

  // Workspace Sounds
  {
    id: 'coffeeshop',
    name: 'Coffee Shop',
    emoji: '☕',
    category: 'workspace',
    description: 'Café ambience',
    frequency: 280,
    type: 'ambient',
    complexity: 'complex',
  },
  {
    id: 'keyboard',
    name: 'Typing',
    emoji: '⌨️',
    category: 'workspace',
    description: 'Mechanical keyboard',
    frequency: 350,
    type: 'rhythmic',
    complexity: 'medium',
  },
  {
    id: 'library',
    name: 'Library',
    emoji: '📚',
    category: 'workspace',
    description: 'Quiet study space',
    frequency: 90,
    type: 'ambient',
    complexity: 'simple',
  },
  {
    id: 'office',
    name: 'Office',
    emoji: '🏢',
    category: 'workspace',
    description: 'Productive office buzz',
    frequency: 200,
    type: 'ambient',
    complexity: 'medium',
  },
  {
    id: 'fan',
    name: 'Fan',
    emoji: '🌀',
    category: 'workspace',
    description: 'White noise fan',
    frequency: 110,
    type: 'continuous',
    complexity: 'simple',
  },

  // Travel Sounds
  {
    id: 'airplane',
    name: 'Airplane Cabin',
    emoji: '✈️',
    category: 'travel',
    description: 'Airplane white noise',
    frequency: 140,
    type: 'continuous',
    complexity: 'simple',
  },
  {
    id: 'train',
    name: 'Train',
    emoji: '🚂',
    category: 'travel',
    description: 'Train journey',
    frequency: 150,
    type: 'rhythmic',
    complexity: 'medium',
  },
  {
    id: 'boat',
    name: 'Boat',
    emoji: '⛵',
    category: 'travel',
    description: 'Sailing ambience',
    frequency: 120,
    type: 'continuous',
    complexity: 'medium',
  },

  // Meditation Sounds
  {
    id: 'whitenoise',
    name: 'White Noise',
    emoji: '⚪',
    category: 'meditation',
    description: 'Pure white noise',
    frequency: 100,
    type: 'continuous',
    complexity: 'simple',
  },
  {
    id: 'pinknoise',
    name: 'Pink Noise',
    emoji: '🟣',
    category: 'meditation',
    description: 'Calming pink noise',
    frequency: 90,
    type: 'continuous',
    complexity: 'simple',
  },
  {
    id: 'brownnoise',
    name: 'Brown Noise',
    emoji: '🟤',
    category: 'meditation',
    description: 'Deep brown noise',
    frequency: 70,
    type: 'continuous',
    complexity: 'simple',
  },
  {
    id: 'tibetan',
    name: 'Tibetan Bowl',
    emoji: '🔔',
    category: 'meditation',
    description: 'Singing bowl resonance',
    frequency: 220,
    type: 'ambient',
    complexity: 'simple',
  },
  {
    id: 'om',
    name: 'Om Chant',
    emoji: '🕉️',
    category: 'meditation',
    description: 'Sacred om sound',
    frequency: 136,
    type: 'continuous',
    complexity: 'simple',
  },
  {
    id: 'binaural',
    name: 'Binaural Beats',
    emoji: '🧠',
    category: 'meditation',
    description: 'Focus-enhancing beats',
    frequency: 40,
    type: 'rhythmic',
    complexity: 'medium',
  },
];

export interface SoundPreset {
  id: string;
  name: string;
  emoji: string;
  description: string;
  sounds: { soundId: string; volume: number }[];
}

export const SOUND_PRESETS: SoundPreset[] = [
  {
    id: 'focus',
    name: 'Deep Focus',
    emoji: '🎯',
    description: 'Optimal concentration mix',
    sounds: [
      { soundId: 'rain', volume: 40 },
      { soundId: 'coffeeshop', volume: 30 },
      { soundId: 'pinknoise', volume: 20 },
    ],
  },
  {
    id: 'relax',
    name: 'Relaxation',
    emoji: '😌',
    description: 'Calm and peaceful',
    sounds: [
      { soundId: 'ocean', volume: 50 },
      { soundId: 'forest', volume: 30 },
      { soundId: 'wind', volume: 20 },
    ],
  },
  {
    id: 'nature',
    name: 'Nature Escape',
    emoji: '🌿',
    description: 'Immersive nature sounds',
    sounds: [
      { soundId: 'forest', volume: 40 },
      { soundId: 'birds', volume: 30 },
      { soundId: 'river', volume: 30 },
    ],
  },
  {
    id: 'productive',
    name: 'Productive',
    emoji: '💼',
    description: 'Office productivity boost',
    sounds: [
      { soundId: 'office', volume: 35 },
      { soundId: 'keyboard', volume: 25 },
      { soundId: 'coffeeshop', volume: 30 },
    ],
  },
  {
    id: 'sleep',
    name: 'Sleep',
    emoji: '😴',
    description: 'Drift off easily',
    sounds: [
      { soundId: 'rain', volume: 50 },
      { soundId: 'whitenoise', volume: 30 },
    ],
  },
  {
    id: 'storm',
    name: 'Storm',
    emoji: '⚡',
    description: 'Cozy rainy day',
    sounds: [
      { soundId: 'thunderstorm', volume: 50 },
      { soundId: 'heavyrain', volume: 40 },
      { soundId: 'wind', volume: 20 },
    ],
  },
];

/**
 * Get sounds by category
 */
export const getSoundsByCategory = (
  category: SoundCategory
): AmbientSound[] => {
  return AMBIENT_SOUNDS.filter((sound) => sound.category === category);
};

/**
 * Get all categories
 */
export const getAllCategories = (): SoundCategory[] => {
  return ['nature', 'weather', 'urban', 'workspace', 'travel', 'meditation'];
};

/**
 * Get category display name
 */
export const getCategoryName = (category: SoundCategory): string => {
  const names: Record<SoundCategory, string> = {
    nature: 'Nature',
    weather: 'Weather',
    urban: 'Urban',
    workspace: 'Workspace',
    travel: 'Travel',
    meditation: 'Meditation',
  };
  return names[category];
};

/**
 * Get category emoji
 */
export const getCategoryEmoji = (category: SoundCategory): string => {
  const emojis: Record<SoundCategory, string> = {
    nature: '🌿',
    weather: '🌦️',
    urban: '🏙️',
    workspace: '💼',
    travel: '✈️',
    meditation: '🧘',
  };
  return emojis[category];
};
