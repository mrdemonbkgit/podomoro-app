/**
 * Audio file URLs for ambient sounds
 * 
 * IMPORTANT: Currently using synthesized sounds as primary method.
 * To use real audio files, download sounds and place in public/sounds/ directory.
 * 
 * Free Sound Sources:
 * - Pixabay: https://pixabay.com/sound-effects/
 * - Freesound: https://freesound.org/
 * - Mixkit: https://mixkit.co/free-sound-effects/
 * 
 * How to add your own sounds:
 * 1. Download MP3 files from free sources
 * 2. Place in public/sounds/ directory (create it if needed)
 * 3. Uncomment the 'url' lines below
 * 4. Files will be automatically used instead of synthesis
 */

export interface AudioFile {
  url?: string; // Optional: Path to audio file (e.g., '/sounds/rain.mp3')
  fallback?: string; // Optional: Alternative URL
  duration?: number; // Duration in seconds (for reference)
  license?: string;
}

/**
 * Audio file configuration
 * 
 * By default, URLs are commented out, so the app uses high-quality synthesis.
 * Uncomment 'url' after adding files to public/sounds/ directory.
 */
export const AUDIO_FILES: Record<string, AudioFile> = {
  // Nature Sounds
  rain: {
    url: '/sounds/rain.mp3', // ✅ File available
    duration: 30,
    license: 'Downloaded from Pixabay'
  },
  ocean: {
    url: '/sounds/ocean-waves-376898.mp3', // ✅ File available
    duration: 30,
    license: 'Downloaded from Pixabay'
  },
  forest: {
    url: '/sounds/forest-ambience-296528.mp3', // ✅ File available
    duration: 60,
    license: 'Downloaded from Pixabay'
  },
  river: {
    url: '/sounds/soothing-river-flow-372456.mp3', // ✅ File available
    duration: 30,
    license: 'Downloaded from Pixabay'
  },
  birds: {
    url: '/sounds/sparrow-and-crickets-382498.mp3', // ✅ File available
    duration: 30,
    license: 'Downloaded from Pixabay'
  },
  crickets: {
    url: '/sounds/sparrow-and-crickets-382498.mp3', // ✅ File available (shared with birds)
    duration: 30,
    license: 'Downloaded from Pixabay'
  },
  wind: {
    url: '/sounds/winter-wind-402331.mp3', // ✅ File available
    duration: 30,
    license: 'Downloaded from Pixabay'
  },

  // Weather Sounds
  thunderstorm: {
    url: '/sounds/rain-with-thunderstorm-420333.mp3', // ✅ File available
    duration: 30,
    license: 'Downloaded from Pixabay'
  },
  heavyrain: {
    url: '/sounds/heavy-rain-314309.mp3', // ✅ File available
    duration: 30,
    license: 'Downloaded from Pixabay'
  },
  snow: {
    url: '/sounds/cold-snowfall-ambience-5-minutes-sound-effect-164512.mp3', // ✅ File available
    duration: 300,
    license: 'Downloaded from Pixabay'
  },

  // Urban Sounds
  city: {
    url: '/sounds/city-ambiance-62632.mp3', // ✅ File available
    duration: 60,
    license: 'Downloaded from Pixabay'
  },
  traffic: {
    // url: '/sounds/traffic.mp3',
    duration: 30,
    license: 'Add your own'
  },
  subway: {
    url: '/sounds/subway.mp3', // ✅ File available
    duration: 30,
    license: 'Downloaded from Pixabay'
  },

  // Workspace Sounds
  coffeeshop: {
    url: '/sounds/coffeeshop.mp3', // ✅ File available
    duration: 60,
    license: 'Downloaded from Pixabay'
  },
  keyboard: {
    url: '/sounds/keyboard.mp3', // ✅ File available
    duration: 20,
    license: 'Downloaded from Pixabay'
  },
  library: {
    url: '/sounds/library.mp3', // ✅ File available
    duration: 60,
    license: 'Downloaded from Pixabay'
  },
  office: {
    url: '/sounds/office.mp3', // ✅ File available
    duration: 60,
    license: 'Downloaded from Pixabay'
  },
  fan: {
    url: '/sounds/fan.mp3', // ✅ File available
    duration: 30,
    license: 'Downloaded from Pixabay'
  },

  // Travel Sounds
  airplane: {
    // url: '/sounds/airplane.mp3',
    duration: 30,
    license: 'Add your own'
  },
  train: {
    // url: '/sounds/train.mp3',
    duration: 30,
    license: 'Add your own'
  },
  boat: {
    // url: '/sounds/boat.mp3',
    duration: 30,
    license: 'Add your own'
  },

  // Meditation Sounds - These work great with synthesis, so URLs optional
  whitenoise: {
    // url: '/sounds/whitenoise.mp3',
    duration: 30,
    license: 'Add your own (or use synthesis)'
  },
  pinknoise: {
    // url: '/sounds/pinknoise.mp3',
    duration: 30,
    license: 'Add your own (or use synthesis)'
  },
  brownnoise: {
    // url: '/sounds/brownnoise.mp3',
    duration: 30,
    license: 'Add your own (or use synthesis)'
  },
  tibetan: {
    // url: '/sounds/tibetan.mp3',
    duration: 15,
    license: 'Add your own'
  },
  om: {
    // url: '/sounds/om.mp3',
    duration: 30,
    license: 'Add your own'
  },
  binaural: {
    // url: '/sounds/binaural.mp3',
    duration: 30,
    license: 'Add your own'
  }
};

/**
 * Check if an audio file is available
 */
export const isAudioFileAvailable = (soundId: string): boolean => {
  const audioFile = AUDIO_FILES[soundId];
  return audioFile && (!!audioFile.url || !!audioFile.fallback);
};

/**
 * Get audio file for a sound
 */
export const getAudioFile = (soundId: string): AudioFile | null => {
  return AUDIO_FILES[soundId] || null;
};

/**
 * QUICK START GUIDE:
 * 
 * Current Status: ✅ App works perfectly with synthesized sounds
 * 
 * To add real audio files (optional upgrade):
 * 
 * 1. Create directory:
 *    public/sounds/
 * 
 * 2. Download sounds from free sources:
 *    - Pixabay: https://pixabay.com/sound-effects/search/rain%20loop/
 *    - Freesound: https://freesound.org/search/?q=rain%20loop
 *    - Search: "[sound name] ambient loop"
 * 
 * 3. Save as MP3 (128-192kbps):
 *    public/sounds/rain.mp3
 *    public/sounds/ocean.mp3
 *    etc.
 * 
 * 4. Uncomment URLs in this file:
 *    rain: {
 *      url: '/sounds/rain.mp3', // <-- Uncomment this line
 *      duration: 30
 *    }
 * 
 * 5. Rebuild and test:
 *    npm run build
 * 
 * That's it! The app will automatically use your audio files.
 * If files are missing, it falls back to synthesis automatically.
 * 
 * Recommended Search Terms:
 * - "rain ambient loop"
 * - "ocean waves loop"
 * - "forest birds loop"
 * - "coffee shop ambience"
 * - "white noise loop"
 * 
 * File Requirements:
 * - Format: MP3
 * - Bitrate: 128-192kbps recommended
 * - Duration: 20-60 seconds
 * - Must loop seamlessly
 * 
 * Total download: ~10-15MB for all sounds
 */
