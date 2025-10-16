import { AmbientSound } from '../data/ambientSounds';
import { getAudioFile, isAudioFileAvailable } from '../data/audioFiles';

export interface ActiveSound {
  id: string;
  audio: HTMLAudioElement | undefined;
  gainNode: GainNode | null;
  volume: number;
  usingSynthesis: boolean; // Track if using fallback synthesis
}

class AmbientAudioEngineV2 {
  private context: AudioContext | null = null;
  private activeSounds: Map<string, ActiveSound> = new Map();
  private masterGainNode: GainNode | null = null;
  private preloadedAudio: Map<string, HTMLAudioElement> = new Map();

  /**
   * Initialize audio context
   */
  private initContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
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
   * Preload an audio file
   */
  async preloadAudio(soundId: string): Promise<HTMLAudioElement | null> {
    const audioFile = getAudioFile(soundId);
    if (!audioFile) return null;

    // Check if already preloaded
    if (this.preloadedAudio.has(soundId)) {
      return this.preloadedAudio.get(soundId)!;
    }

    try {
      const audio = new Audio();
      audio.src = audioFile.url;
      audio.loop = true;
      audio.preload = 'auto';
      
      // Wait for audio to load
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true });
        audio.addEventListener('error', reject, { once: true });
        audio.load();
      });

      this.preloadedAudio.set(soundId, audio);
      console.log(`[AmbientAudioV2] Preloaded: ${soundId}`);
      return audio;
    } catch (error) {
      console.warn(`[AmbientAudioV2] Failed to preload ${soundId}:`, error);
      // Try fallback URL
      if (audioFile.fallback) {
        try {
          const audio = new Audio();
          audio.src = audioFile.fallback;
          audio.loop = true;
          audio.preload = 'auto';
          await new Promise((resolve, reject) => {
            audio.addEventListener('canplaythrough', resolve, { once: true });
            audio.addEventListener('error', reject, { once: true });
            audio.load();
          });
          this.preloadedAudio.set(soundId, audio);
          console.log(`[AmbientAudioV2] Preloaded fallback: ${soundId}`);
          return audio;
        } catch (fallbackError) {
          console.error(`[AmbientAudioV2] Fallback also failed for ${soundId}:`, fallbackError);
        }
      }
      return null;
    }
  }

  /**
   * Create synthesized sound (fallback)
   */
  private createSynthesizedSound(sound: AmbientSound, volume: number): { oscillator?: OscillatorNode; noiseNode?: AudioBufferSourceNode; gainNode: GainNode } | null {
    if (!this.context || !this.masterGainNode) return null;

    const gainNode = this.context.createGain();
    gainNode.connect(this.masterGainNode);
    gainNode.gain.value = volume / 100;

    // Simple oscillator for pure tones
    if (sound.complexity === 'simple') {
      const oscillator = this.context.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = sound.frequency;
      oscillator.connect(gainNode);
      oscillator.start();
      return { oscillator, gainNode };
    } else {
      // For complex sounds, use filtered noise
      const bufferSize = this.context.sampleRate * 2;
      const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
      const output = buffer.getChannelData(0);
      
      // Generate white noise
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noiseNode = this.context.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;
      
      const filter = this.context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = sound.frequency * 2;
      filter.Q.value = 0.5;
      
      noiseNode.connect(filter);
      filter.connect(gainNode);
      noiseNode.start();
      
      return { noiseNode, gainNode };
    }
  }

  /**
   * Start playing an ambient sound
   */
  async startSound(sound: AmbientSound, volume: number = 50): Promise<void> {
    try {
      this.initContext();
      if (!this.context || !this.masterGainNode) return;

      // Stop if already playing
      if (this.activeSounds.has(sound.id)) {
        this.stopSound(sound.id);
      }

      // Try to use audio file first
      if (isAudioFileAvailable(sound.id)) {
        try {
          // Get or preload audio
          let audio = this.preloadedAudio.get(sound.id);
          if (!audio) {
            const preloadedAudio = await this.preloadAudio(sound.id);
            audio = preloadedAudio || undefined;
          }

          if (audio) {
            // Clone the audio element to allow multiple plays
            const audioClone = audio.cloneNode() as HTMLAudioElement;
            audioClone.loop = true;
            audioClone.volume = volume / 100;

            // Connect to Web Audio API for better control
            const source = this.context.createMediaElementSource(audioClone);
            const gainNode = this.context.createGain();
            gainNode.gain.value = volume / 100;
            
            source.connect(gainNode);
            gainNode.connect(this.masterGainNode);

            // Play
            await audioClone.play();

            const activeSound: ActiveSound = {
              id: sound.id,
              audio: audioClone,
              gainNode,
              volume,
              usingSynthesis: false
            };

            this.activeSounds.set(sound.id, activeSound);
            console.log(`[AmbientAudioV2] Playing audio file: ${sound.id}`);
            return;
          }
        } catch (error) {
          console.warn(`[AmbientAudioV2] Failed to play audio file for ${sound.id}, falling back to synthesis:`, error);
        }
      }

      // Fallback to synthesized sound
      const synth = this.createSynthesizedSound(sound, volume);
      if (synth) {
        const activeSound: ActiveSound = {
          id: sound.id,
          audio: undefined,
          gainNode: synth.gainNode,
          volume,
          usingSynthesis: true
        };
        this.activeSounds.set(sound.id, activeSound);
        console.log(`[AmbientAudioV2] Playing synthesized sound: ${sound.id}`);
      }
    } catch (error) {
      console.error(`[AmbientAudioV2] Failed to start sound ${sound.id}:`, error);
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
      if (activeSound.gainNode && this.context) {
        activeSound.gainNode.gain.setValueAtTime(
          activeSound.gainNode.gain.value,
          this.context.currentTime
        );
        activeSound.gainNode.gain.linearRampToValueAtTime(
          0,
          this.context.currentTime + 0.5
        );
      }

      // Stop after fade
      setTimeout(() => {
        if (activeSound.audio) {
          activeSound.audio.pause();
          activeSound.audio.currentTime = 0;
          activeSound.audio = undefined;
        }
        if (activeSound.gainNode) {
          activeSound.gainNode.disconnect();
        }
        this.activeSounds.delete(soundId);
      }, 500);
    } catch (error) {
      console.error(`[AmbientAudioV2] Failed to stop sound ${soundId}:`, error);
      this.activeSounds.delete(soundId);
    }
  }

  /**
   * Update sound volume
   */
  setVolume(soundId: string, volume: number): void {
    const activeSound = this.activeSounds.get(soundId);
    if (!activeSound) return;

    try {
      activeSound.volume = volume;

      if (activeSound.audio) {
        // For HTML5 audio
        activeSound.audio.volume = volume / 100;
      }

      if (activeSound.gainNode && this.context) {
        // For Web Audio API
        activeSound.gainNode.gain.setValueAtTime(
          activeSound.gainNode.gain.value,
          this.context.currentTime
        );
        activeSound.gainNode.gain.linearRampToValueAtTime(
          volume / 100,
          this.context.currentTime + 0.1
        );
      }
    } catch (error) {
      console.error(`[AmbientAudioV2] Failed to set volume for ${soundId}:`, error);
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
    soundIds.forEach(id => this.stopSound(id));
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
      console.error('[AmbientAudioV2] Failed to set master volume:', error);
    }
  }

  /**
   * Preload multiple sounds
   */
  async preloadSounds(soundIds: string[]): Promise<void> {
    console.log(`[AmbientAudioV2] Preloading ${soundIds.length} sounds...`);
    const promises = soundIds.map(id => this.preloadAudio(id).catch(err => {
      console.warn(`[AmbientAudioV2] Failed to preload ${id}:`, err);
      return null;
    }));
    await Promise.all(promises);
    console.log(`[AmbientAudioV2] Preloading complete. ${this.preloadedAudio.size} sounds ready.`);
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopAll();
    this.preloadedAudio.clear();
    if (this.context) {
      this.context.close();
      this.context = null;
    }
    this.masterGainNode = null;
  }
}

// Singleton instance
export const ambientAudioEngineV2 = new AmbientAudioEngineV2();

