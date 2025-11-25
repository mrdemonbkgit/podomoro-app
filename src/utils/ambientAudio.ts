import { AmbientSound } from '../data/ambientSounds';

export interface ActiveSound {
  id: string;
  oscillator: OscillatorNode | null;
  gainNode: GainNode;
  noiseNode: AudioBufferSourceNode | null;
  volume: number;
}

class AmbientAudioEngine {
  private context: AudioContext | null = null;
  private activeSounds: Map<string, ActiveSound> = new Map();
  private masterGainNode: GainNode | null = null;

  /**
   * Initialize audio context
   */
  private initContext() {
    if (!this.context) {
      this.context = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      this.masterGainNode = this.context.createGain();
      this.masterGainNode.connect(this.context.destination);
      this.masterGainNode.gain.value = 1.0;
    }

    // Resume context if suspended (browser autoplay policy)
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  /**
   * Generate noise buffer for complex sounds
   */
  private createNoiseBuffer(type: 'white' | 'pink' | 'brown'): AudioBuffer {
    if (!this.context) throw new Error('Audio context not initialized');

    const bufferSize = this.context.sampleRate * 2; // 2 seconds
    const buffer = this.context.createBuffer(
      1,
      bufferSize,
      this.context.sampleRate
    );
    const output = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'pink') {
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // Gain compensation
        b6 = white * 0.115926;
      }
    } else if (type === 'brown') {
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain compensation
      }
    }

    return buffer;
  }

  /**
   * Start playing an ambient sound
   */
  startSound(sound: AmbientSound, volume: number = 50): void {
    try {
      this.initContext();
      if (!this.context || !this.masterGainNode) return;

      // Stop if already playing
      if (this.activeSounds.has(sound.id)) {
        this.stopSound(sound.id);
      }

      const gainNode = this.context.createGain();
      gainNode.connect(this.masterGainNode);
      gainNode.gain.value = volume / 100;

      const activeSound: ActiveSound = {
        id: sound.id,
        oscillator: null,
        gainNode,
        noiseNode: null,
        volume,
      };

      // Create sound based on type
      if (sound.complexity === 'simple') {
        // Simple oscillator for pure tones
        const oscillator = this.context.createOscillator();

        // Determine oscillator type based on sound characteristics
        if (sound.id.includes('noise') || sound.id === 'whitenoise') {
          oscillator.type = 'sawtooth';
        } else if (sound.id === 'fan' || sound.id === 'airplane') {
          oscillator.type = 'sawtooth';
        } else if (sound.id === 'om' || sound.id === 'tibetan') {
          oscillator.type = 'sine';
        } else {
          oscillator.type = 'triangle';
        }

        oscillator.frequency.value = sound.frequency;
        oscillator.connect(gainNode);
        oscillator.start();

        activeSound.oscillator = oscillator;
      } else {
        // Complex sounds use noise buffer
        let noiseType: 'white' | 'pink' | 'brown' = 'white';

        if (sound.id === 'pinknoise' || sound.frequency < 150) {
          noiseType = 'pink';
        } else if (sound.id === 'brownnoise' || sound.frequency < 100) {
          noiseType = 'brown';
        }

        const noiseBuffer = this.createNoiseBuffer(noiseType);
        const noiseNode = this.context.createBufferSource();
        noiseNode.buffer = noiseBuffer;
        noiseNode.loop = true;

        // Add filter for character
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = sound.frequency * 2;
        filter.Q.value = 0.5;

        noiseNode.connect(filter);
        filter.connect(gainNode);
        noiseNode.start();

        activeSound.noiseNode = noiseNode;
      }

      this.activeSounds.set(sound.id, activeSound);
    } catch (error) {
      console.error(`[AmbientAudio] Failed to start sound ${sound.id}:`, error);
    }
  }

  /**
   * Stop playing an ambient sound
   */
  stopSound(soundId: string): void {
    const activeSound = this.activeSounds.get(soundId);
    if (!activeSound) return;

    try {
      // Fade out for smooth stop
      if (activeSound.gainNode) {
        activeSound.gainNode.gain.setValueAtTime(
          activeSound.gainNode.gain.value,
          this.context!.currentTime
        );
        activeSound.gainNode.gain.linearRampToValueAtTime(
          0,
          this.context!.currentTime + 0.5
        );
      }

      // Stop after fade
      setTimeout(() => {
        if (activeSound.oscillator) {
          activeSound.oscillator.stop();
          activeSound.oscillator.disconnect();
        }
        if (activeSound.noiseNode) {
          activeSound.noiseNode.stop();
          activeSound.noiseNode.disconnect();
        }
        if (activeSound.gainNode) {
          activeSound.gainNode.disconnect();
        }
        this.activeSounds.delete(soundId);
      }, 500);
    } catch (error) {
      console.error(`[AmbientAudio] Failed to stop sound ${soundId}:`, error);
      this.activeSounds.delete(soundId);
    }
  }

  /**
   * Update sound volume
   */
  setVolume(soundId: string, volume: number): void {
    const activeSound = this.activeSounds.get(soundId);
    if (!activeSound || !this.context) return;

    try {
      activeSound.volume = volume;
      activeSound.gainNode.gain.setValueAtTime(
        activeSound.gainNode.gain.value,
        this.context.currentTime
      );
      activeSound.gainNode.gain.linearRampToValueAtTime(
        volume / 100,
        this.context.currentTime + 0.1
      );
    } catch (error) {
      console.error(
        `[AmbientAudio] Failed to set volume for ${soundId}:`,
        error
      );
    }
  }

  /**
   * Check if sound is playing
   */
  isPlaying(soundId: string): boolean {
    return this.activeSounds.has(soundId);
  }

  /**
   * Get active sound volume
   */
  getVolume(soundId: string): number {
    const activeSound = this.activeSounds.get(soundId);
    return activeSound ? activeSound.volume : 0;
  }

  /**
   * Stop all sounds
   */
  stopAll(): void {
    const soundIds = Array.from(this.activeSounds.keys());
    soundIds.forEach((id) => this.stopSound(id));
  }

  /**
   * Get all active sound IDs
   */
  getActiveSounds(): string[] {
    return Array.from(this.activeSounds.keys());
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    if (!this.masterGainNode || !this.context) return;

    try {
      this.masterGainNode.gain.setValueAtTime(
        this.masterGainNode.gain.value,
        this.context.currentTime
      );
      this.masterGainNode.gain.linearRampToValueAtTime(
        volume / 100,
        this.context.currentTime + 0.1
      );
    } catch (error) {
      console.error('[AmbientAudio] Failed to set master volume:', error);
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopAll();
    if (this.context) {
      this.context.close();
      this.context = null;
    }
    this.masterGainNode = null;
  }
}

// Singleton instance
export const ambientAudioEngine = new AmbientAudioEngine();
