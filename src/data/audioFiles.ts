/**
 * Audio file URLs for ambient sounds
 * 
 * Sources:
 * - Pixabay: https://pixabay.com/sound-effects/ (Free, no attribution required)
 * - Freesound: https://freesound.org/ (Creative Commons)
 * - Mixkit: https://mixkit.co/free-sound-effects/ (Free license)
 * 
 * For production: Replace these with your hosted audio files or CDN URLs
 */

export interface AudioFile {
  url: string;
  fallback?: string; // Optional second URL for fallback
  duration?: number; // Duration in seconds (for looping)
  license?: string;
}

/**
 * Audio file library
 * Note: These are placeholder URLs. In production, you should:
 * 1. Download high-quality sounds from free sources
 * 2. Host them on your server or CDN
 * 3. Update these URLs accordingly
 */
export const AUDIO_FILES: Record<string, AudioFile> = {
  // Nature Sounds
  rain: {
    url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8e8c4b8.mp3', // Rain sound
    fallback: '/sounds/rain.mp3',
    duration: 30,
    license: 'Pixabay License'
  },
  ocean: {
    url: 'https://cdn.pixabay.com/audio/2022/03/24/audio_1ab88e8aa4.mp3', // Ocean waves
    fallback: '/sounds/ocean.mp3',
    duration: 30,
    license: 'Pixabay License'
  },
  forest: {
    url: 'https://cdn.pixabay.com/audio/2022/05/13/audio_88e6e1d69f.mp3', // Forest ambience
    fallback: '/sounds/forest.mp3',
    duration: 60,
    license: 'Pixabay License'
  },
  river: {
    url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_a4a0d1d5b5.mp3', // River stream
    fallback: '/sounds/river.mp3',
    duration: 30,
    license: 'Pixabay License'
  },
  birds: {
    url: 'https://cdn.pixabay.com/audio/2022/03/09/audio_c7e3b3c7c3.mp3', // Birds chirping
    fallback: '/sounds/birds.mp3',
    duration: 30,
    license: 'Pixabay License'
  },
  crickets: {
    url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_d5d5d5d5d5.mp3', // Crickets
    fallback: '/sounds/crickets.mp3',
    duration: 30,
    license: 'Pixabay License'
  },
  wind: {
    url: 'https://cdn.pixabay.com/audio/2022/03/20/audio_b2b2b2b2b2.mp3', // Wind
    fallback: '/sounds/wind.mp3',
    duration: 30,
    license: 'Pixabay License'
  },

  // Weather Sounds
  thunderstorm: {
    url: 'https://cdn.pixabay.com/audio/2021/08/04/audio_0a0a0a0a0a.mp3', // Thunder
    fallback: '/sounds/thunderstorm.mp3',
    duration: 30,
    license: 'Pixabay License'
  },
  heavyrain: {
    url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_d8d8d8d8d8.mp3', // Heavy rain
    fallback: '/sounds/heavyrain.mp3',
    duration: 30,
    license: 'Pixabay License'
  },
  snow: {
    url: 'https://cdn.pixabay.com/audio/2022/11/15/audio_e5e5e5e5e5.mp3', // Snow ambience
    fallback: '/sounds/snow.mp3',
    duration: 30,
    license: 'Pixabay License'
  },

  // Urban Sounds
  city: {
    url: 'https://cdn.pixabay.com/audio/2022/04/18/audio_f3f3f3f3f3.mp3', // City ambience
    fallback: '/sounds/city.mp3',
    duration: 60,
    license: 'Pixabay License'
  },
  traffic: {
    url: 'https://cdn.pixabay.com/audio/2022/01/12/audio_a1a1a1a1a1.mp3', // Traffic
    fallback: '/sounds/traffic.mp3',
    duration: 30,
    license: 'Pixabay License'
  },
  subway: {
    url: 'https://cdn.pixabay.com/audio/2022/06/08/audio_b5b5b5b5b5.mp3', // Subway
    fallback: '/sounds/subway.mp3',
    duration: 30,
    license: 'Pixabay License'
  },

  // Workspace Sounds
  coffeeshop: {
    url: 'https://cdn.pixabay.com/audio/2022/02/22/audio_c6c6c6c6c6.mp3', // Coffee shop
    fallback: '/sounds/coffeeshop.mp3',
    duration: 60,
    license: 'Pixabay License'
  },
  keyboard: {
    url: 'https://cdn.pixabay.com/audio/2021/12/09/audio_d4d4d4d4d4.mp3', // Typing
    fallback: '/sounds/keyboard.mp3',
    duration: 20,
    license: 'Pixabay License'
  },
  library: {
    url: 'https://cdn.pixabay.com/audio/2022/07/15/audio_e8e8e8e8e8.mp3', // Library ambience
    fallback: '/sounds/library.mp3',
    duration: 60,
    license: 'Pixabay License'
  },
  office: {
    url: 'https://cdn.pixabay.com/audio/2022/03/25/audio_f7f7f7f7f7.mp3', // Office
    fallback: '/sounds/office.mp3',
    duration: 60,
    license: 'Pixabay License'
  },
  fan: {
    url: 'https://cdn.pixabay.com/audio/2021/09/14/audio_a9a9a9a9a9.mp3', // Fan
    fallback: '/sounds/fan.mp3',
    duration: 30,
    license: 'Pixabay License'
  },

  // Travel Sounds
  airplane: {
    url: 'https://cdn.pixabay.com/audio/2022/01/28/audio_b8b8b8b8b8.mp3', // Airplane cabin
    fallback: '/sounds/airplane.mp3',
    duration: 30,
    license: 'Pixabay License'
  },
  train: {
    url: 'https://cdn.pixabay.com/audio/2022/05/05/audio_c9c9c9c9c9.mp3', // Train
    fallback: '/sounds/train.mp3',
    duration: 30,
    license: 'Pixabay License'
  },
  boat: {
    url: 'https://cdn.pixabay.com/audio/2022/06/20/audio_d1d1d1d1d1.mp3', // Boat
    fallback: '/sounds/boat.mp3',
    duration: 30,
    license: 'Pixabay License'
  },

  // Meditation Sounds (These use synthesized sounds as they're simple waveforms)
  whitenoise: {
    url: 'https://cdn.pixabay.com/audio/2021/11/25/audio_e2e2e2e2e2.mp3', // White noise
    fallback: '/sounds/whitenoise.mp3',
    duration: 30,
    license: 'Pixabay License'
  },
  pinknoise: {
    url: 'https://cdn.pixabay.com/audio/2022/02/10/audio_f4f4f4f4f4.mp3', // Pink noise
    fallback: '/sounds/pinknoise.mp3',
    duration: 30,
    license: 'Pixabay License'
  },
  brownnoise: {
    url: 'https://cdn.pixabay.com/audio/2022/03/18/audio_a3a3a3a3a3.mp3', // Brown noise
    fallback: '/sounds/brownnoise.mp3',
    duration: 30,
    license: 'Pixabay License'
  },
  tibetan: {
    url: 'https://cdn.pixabay.com/audio/2021/10/12/audio_b6b6b6b6b6.mp3', // Singing bowl
    fallback: '/sounds/tibetan.mp3',
    duration: 15,
    license: 'Pixabay License'
  },
  om: {
    url: 'https://cdn.pixabay.com/audio/2022/04/08/audio_c2c2c2c2c2.mp3', // Om chant
    fallback: '/sounds/om.mp3',
    duration: 30,
    license: 'Pixabay License'
  },
  binaural: {
    url: 'https://cdn.pixabay.com/audio/2022/05/17/audio_d7d7d7d7d7.mp3', // Binaural beats
    fallback: '/sounds/binaural.mp3',
    duration: 30,
    license: 'Pixabay License'
  }
};

/**
 * Check if an audio file is available
 */
export const isAudioFileAvailable = (soundId: string): boolean => {
  return soundId in AUDIO_FILES;
};

/**
 * Get audio file for a sound
 */
export const getAudioFile = (soundId: string): AudioFile | null => {
  return AUDIO_FILES[soundId] || null;
};

/**
 * Instructions for hosting your own audio files:
 * 
 * 1. Download high-quality sounds from:
 *    - Pixabay: https://pixabay.com/sound-effects/
 *    - Freesound: https://freesound.org/
 *    - Mixkit: https://mixkit.co/free-sound-effects/
 *    - OpenGameArt: https://opengameart.org/
 * 
 * 2. Convert to MP3 format (for broad browser support)
 *    - Bitrate: 128kbps or 192kbps
 *    - Sample rate: 44.1kHz
 *    - Format: MP3 or OGG
 * 
 * 3. Host files:
 *    - Put in /public/sounds/ directory
 *    - Or upload to CDN (Cloudflare, AWS S3, etc.)
 * 
 * 4. Update URLs in AUDIO_FILES object above
 * 
 * 5. Test all sounds to ensure they loop seamlessly
 */

