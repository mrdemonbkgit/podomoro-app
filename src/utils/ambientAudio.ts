import { AmbientSound } from '../data/ambientSounds';
import { getAudioFile, isAudioFileAvailable } from '../data/audioFiles';

export interface ActiveSound {
  id: string;
  audio?: HTMLAudioElement; // For real audio files
  mediaSource?: MediaElementAudioSourceNode; // For real audio files
  gainNode: GainNode;
  oscillator?: OscillatorNode; // For synthesized oscillator sounds
  noiseSource?: AudioBufferSourceNode; // For synthesized noise sounds
  filterNode?: BiquadFilterNode; // For filtered noise
  volume: number;
  usingSynthesis: boolean; // Track if using fallback synthesis
}

class AmbientAudioEngine {
  private context: AudioContext | null = null;
  private activeSounds: Map<string, ActiveSound> = new Map();
  private masterGainNode: GainNode | null = null;
  private preloadedAudio: Map<string, HTMLAudioElement> = new Map();

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
   * Preload an audio file
   */
  async preloadAudio(soundId: string): Promise<HTMLAudioElement | null> {
    const audioFile = getAudioFile(soundId);
    if (!audioFile || !audioFile.url) return null;

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
      console.log(`[AmbientAudio] Preloaded: ${soundId}`);
      return audio;
    } catch (error) {
      console.warn(`[AmbientAudio] Failed to preload ${soundId}:`, error);
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
          console.log(`[AmbientAudio] Preloaded fallback: ${soundId}`);
          return audio;
        } catch (fallbackError) {
          console.error(
            `[AmbientAudio] Fallback also failed for ${soundId}:`,
            fallbackError
          );
        }
      }
      return null;
    }
  }

  /**
   * Create synthesized sound (fallback)
   */
  private createSynthesizedSound(
    sound: AmbientSound,
    volume: number
  ): {
    oscillator?: OscillatorNode;
    noiseNode?: AudioBufferSourceNode;
    filterNode?: BiquadFilterNode;
    gainNode: GainNode;
  } | null {
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
      const buffer = this.context.createBuffer(
        1,
        bufferSize,
        this.context.sampleRate
      );
      const output = buffer.getChannelData(0);

      // Generate white noise
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noiseNode = this.context.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;

      const filterNode = this.context.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.value = sound.frequency * 2;
      filterNode.Q.value = 0.5;

      noiseNode.connect(filterNode);
      filterNode.connect(gainNode);
      noiseNode.start();

      return { noiseNode, filterNode, gainNode };
    }
  }

  /**
   * Start playing an ambient sound
   */
  async startSound(sound: AmbientSound, volume: number = 50): Promise<void> {
    try {
      this.initContext();
      if (!this.context || !this.masterGainNode) return;

      // CRITICAL: Prevent duplicate starts - add placeholder IMMEDIATELY
      if (this.activeSounds.has(sound.id)) {
        console.warn(
          `[AmbientAudio] ⚠️ Sound ${sound.id} is ALREADY PLAYING or LOADING - ignoring duplicate start!`
        );
        return; // Don't start again!
      }

      console.log(`[AmbientAudio] 🎵 Starting sound: ${sound.id}`);

      // Reserve this sound ID immediately to prevent race condition
      // We'll replace this placeholder with the real ActiveSound once loaded
      const placeholderGain = this.context.createGain();
      placeholderGain.gain.value = 0; // Silent placeholder
      this.activeSounds.set(sound.id, {
        id: sound.id,
        gainNode: placeholderGain,
        volume: 0,
        usingSynthesis: false,
      });

      // Try to use audio file first
      if (isAudioFileAvailable(sound.id)) {
        try {
          // Create a NEW audio element for each play (don't reuse or clone)
          const audioFile = getAudioFile(sound.id);
          if (!audioFile || !audioFile.url) {
            throw new Error('Audio file URL not available');
          }

          // Create fresh audio element
          const audio = new Audio(audioFile.url);
          audio.loop = true;
          audio.preload = 'auto';

          // Load the audio
          await new Promise((resolve, reject) => {
            audio.addEventListener('canplaythrough', resolve, { once: true });
            audio.addEventListener('error', reject, { once: true });
            audio.load();
          });

          console.log(`[AmbientAudio] Audio loaded for ${sound.id}`);

          // Create Web Audio nodes
          const mediaSource = this.context.createMediaElementSource(audio);
          const gainNode = this.context.createGain();
          gainNode.gain.value = volume / 100;

          // Connect: audio -> mediaSource -> gainNode -> master -> destination
          mediaSource.connect(gainNode);
          gainNode.connect(this.masterGainNode);

          // Disconnect placeholder
          placeholderGain.disconnect();

          // Play
          await audio.play();
          console.log(`[AmbientAudio] Audio playing for ${sound.id}`);

          // Replace placeholder with real ActiveSound
          const activeSound: ActiveSound = {
            id: sound.id,
            audio,
            mediaSource,
            gainNode,
            volume,
            usingSynthesis: false,
          };

          this.activeSounds.set(sound.id, activeSound);
          console.log(`[AmbientAudio] ✅ Playing audio file: ${sound.id}`);
          return;
        } catch (error) {
          console.warn(
            `[AmbientAudio] Failed to play audio file for ${sound.id}, falling back to synthesis:`,
            error
          );
          // Remove placeholder, will be replaced by synth
          placeholderGain.disconnect();
          this.activeSounds.delete(sound.id);
        }
      }

      // Fallback to synthesized sound (or if no audio file available)
      const synth = this.createSynthesizedSound(sound, volume);
      if (synth) {
        // Disconnect placeholder if still exists
        if (this.activeSounds.has(sound.id)) {
          const placeholder = this.activeSounds.get(sound.id);
          if (placeholder?.gainNode) {
            placeholder.gainNode.disconnect();
          }
        }

        const activeSound: ActiveSound = {
          id: sound.id,
          gainNode: synth.gainNode,
          oscillator: synth.oscillator,
          noiseSource: synth.noiseNode,
          filterNode: synth.filterNode,
          volume,
          usingSynthesis: true,
        };
        this.activeSounds.set(sound.id, activeSound);
        console.log(`[AmbientAudio] ✅ Playing synthesized sound: ${sound.id}`);
      } else {
        // Failed to create synth, remove placeholder
        console.error(`[AmbientAudio] Failed to create sound for ${sound.id}`);
        this.activeSounds.delete(sound.id);
      }
    } catch (error) {
      console.error(`[AmbientAudio] Failed to start sound ${sound.id}:`, error);
      // Clean up placeholder on error
      this.activeSounds.delete(sound.id);
    }
  }

  /**
   * Stop playing an ambient sound
   */
  stopSound(soundId: string): void {
    const activeSound = this.activeSounds.get(soundId);
    if (!activeSound) {
      console.warn(`[AmbientAudio] Cannot stop sound ${soundId}: not found`);
      return;
    }

    console.log(`[AmbientAudio] 🛑 Stopping sound: ${soundId}`);

    try {
      // CRITICAL FIX: Pause HTML5 audio FIRST before disconnecting!
      // Once disconnected, the audio element plays independently!
      if (activeSound.audio) {
        console.log(`[AmbientAudio] Step 1: Pausing audio element FIRST`);
        activeSound.audio.pause();
        activeSound.audio.volume = 0; // Mute it
        activeSound.audio.currentTime = 0;
      }

      // Step 2: Stop oscillators/noise immediately
      if (activeSound.oscillator) {
        try {
          activeSound.oscillator.stop();
        } catch {
          // Already stopped
        }
      }

      if (activeSound.noiseSource) {
        try {
          activeSound.noiseSource.stop();
        } catch {
          // Already stopped
        }
      }

      // Step 3: NOW disconnect from audio graph
      if (activeSound.gainNode) {
        console.log(`[AmbientAudio] Step 2: Disconnecting gainNode`);
        activeSound.gainNode.disconnect();
      }

      if (activeSound.mediaSource) {
        console.log(`[AmbientAudio] Step 3: Disconnecting mediaSource`);
        activeSound.mediaSource.disconnect();
      }

      if (activeSound.filterNode) {
        activeSound.filterNode.disconnect();
      }

      if (activeSound.oscillator) {
        activeSound.oscillator.disconnect();
      }

      if (activeSound.noiseSource) {
        activeSound.noiseSource.disconnect();
      }

      // Step 4: Final cleanup of audio element
      if (activeSound.audio) {
        console.log(`[AmbientAudio] Step 4: Final audio cleanup`);
        activeSound.audio.src = '';
        activeSound.audio.load();
      }

      // Step 5: Remove from active sounds immediately
      this.activeSounds.delete(soundId);
      console.log(`[AmbientAudio] ✅ Sound stopped and removed: ${soundId}`);
    } catch (error) {
      console.error(
        `[AmbientAudio] ❌ Error stopping sound ${soundId}:`,
        error
      );
      // Force remove even if error
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
   * Preload multiple sounds
   */
  async preloadSounds(soundIds: string[]): Promise<void> {
    console.log(`[AmbientAudio] Preloading ${soundIds.length} sounds...`);
    const promises = soundIds.map((id) =>
      this.preloadAudio(id).catch((err) => {
        console.warn(`[AmbientAudio] Failed to preload ${id}:`, err);
        return null;
      })
    );
    await Promise.all(promises);
    console.log(
      `[AmbientAudio] Preloading complete. ${this.preloadedAudio.size} sounds ready.`
    );
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
export const ambientAudioEngine = new AmbientAudioEngine();
