export type SoundType = 'chime' | 'bell' | 'beep' | 'piano' | 'gentle';

export interface SoundOption {
  id: SoundType;
  name: string;
  description: string;
  icon: string;
}

export const SOUND_OPTIONS: SoundOption[] = [
  {
    id: 'chime',
    name: 'Chime',
    description: 'Two-tone pleasant chime',
    icon: '🔔',
  },
  {
    id: 'bell',
    name: 'Bell',
    description: 'Classic bell ring',
    icon: '🛎️',
  },
  {
    id: 'beep',
    name: 'Beep',
    description: 'Simple digital beep',
    icon: '📟',
  },
  {
    id: 'piano',
    name: 'Piano',
    description: 'Soft piano notes',
    icon: '🎹',
  },
  {
    id: 'gentle',
    name: 'Gentle',
    description: 'Calm ambient tone',
    icon: '🌊',
  },
];

/**
 * Play a sound with the specified type and volume
 */
export const playSound = (soundType: SoundType, volume: number): void => {
  try {
    // Normalize volume (0-100 to 0-1)
    const normalizedVolume = Math.max(0, Math.min(100, volume)) / 100;

    // Don't play if volume is 0
    if (normalizedVolume === 0) return;

    // Create audio context
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    switch (soundType) {
      case 'chime':
        playChime(audioContext, normalizedVolume);
        break;
      case 'bell':
        playBell(audioContext, normalizedVolume);
        break;
      case 'beep':
        playBeep(audioContext, normalizedVolume);
        break;
      case 'piano':
        playPiano(audioContext, normalizedVolume);
        break;
      case 'gentle':
        playGentle(audioContext, normalizedVolume);
        break;
      default:
        playChime(audioContext, normalizedVolume);
    }
  } catch (error) {
    console.error('Failed to play sound:', error);
  }
};

/**
 * Chime: Two-tone pleasant chime (original sound)
 */
function playChime(audioContext: AudioContext, volume: number): void {
  const playTone = (frequency: number, startTime: number, duration: number) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    // Envelope for smooth sound
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3 * volume, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };

  // Play two-tone chime (ding-dong)
  const now = audioContext.currentTime;
  playTone(800, now, 0.15); // First tone
  playTone(600, now + 0.15, 0.2); // Second tone
}

/**
 * Bell: Classic bell ring with harmonics
 */
function playBell(audioContext: AudioContext, volume: number): void {
  const now = audioContext.currentTime;
  const duration = 0.8;

  // Create multiple harmonics for bell-like sound
  [523.25, 659.25, 783.99].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    const harmonicVolume = volume * (1 - index * 0.2);
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2 * harmonicVolume, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  });
}

/**
 * Beep: Simple digital beep
 */
function playBeep(audioContext: AudioContext, volume: number): void {
  const now = audioContext.currentTime;
  const duration = 0.2;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 880; // A5 note
  oscillator.type = 'square';

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.15 * volume, now + 0.01);
  gainNode.gain.linearRampToValueAtTime(0, now + duration);

  oscillator.start(now);
  oscillator.stop(now + duration);
}

/**
 * Piano: Soft piano notes
 */
function playPiano(audioContext: AudioContext, volume: number): void {
  const now = audioContext.currentTime;

  // C major chord: C, E, G
  const notes = [523.25, 659.25, 783.99];

  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'triangle';

    const startTime = now + index * 0.1;
    const duration = 0.5;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.2 * volume, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  });
}

/**
 * Gentle: Calm ambient tone
 */
function playGentle(audioContext: AudioContext, volume: number): void {
  const now = audioContext.currentTime;
  const duration = 1.0;

  // Two gentle tones with slight detuning
  [440, 442].forEach((frequency) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.15 * volume, now + 0.1);
    gainNode.gain.linearRampToValueAtTime(0.15 * volume, now + duration * 0.7);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  });
}
