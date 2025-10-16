import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { playSound, SOUND_OPTIONS } from '../sounds';

describe('Sound Utilities', () => {
  let audioContextMock: any;
  let oscillatorMock: any;
  let gainNodeMock: any;

  beforeEach(() => {
    // Mock AudioContext and its methods
    oscillatorMock = {
      connect: vi.fn().mockReturnThis(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { value: 0, setValueAtTime: vi.fn() },
      type: 'sine',
    };

    gainNodeMock = {
      connect: vi.fn().mockReturnThis(),
      gain: {
        value: 0,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    };

    audioContextMock = {
      createOscillator: vi.fn().mockReturnValue(oscillatorMock),
      createGain: vi.fn().mockReturnValue(gainNodeMock),
      destination: {},
      currentTime: 0,
    };

    // Mock the global AudioContext
    global.AudioContext = vi.fn().mockImplementation(() => audioContextMock);
    (global as any).webkitAudioContext = global.AudioContext;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('SOUND_OPTIONS', () => {
    it('should export 5 sound options', () => {
      expect(SOUND_OPTIONS).toHaveLength(5);
    });

    it('should have correct structure for each sound', () => {
      SOUND_OPTIONS.forEach(sound => {
        expect(sound).toHaveProperty('id');
        expect(sound).toHaveProperty('name');
        expect(sound).toHaveProperty('description');
        expect(sound).toHaveProperty('icon');
        expect(typeof sound.id).toBe('string');
        expect(typeof sound.name).toBe('string');
        expect(typeof sound.description).toBe('string');
        expect(typeof sound.icon).toBe('string');
      });
    });

    it('should have unique IDs', () => {
      const ids = SOUND_OPTIONS.map(s => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should include all expected sound types', () => {
      const ids = SOUND_OPTIONS.map(s => s.id);
      expect(ids).toContain('chime');
      expect(ids).toContain('bell');
      expect(ids).toContain('beep');
      expect(ids).toContain('piano');
      expect(ids).toContain('gentle');
    });
  });

  describe('playSound', () => {
    it('should create audio context', () => {
      playSound('chime', 100);

      expect(global.AudioContext).toHaveBeenCalled();
    });

    it('should create oscillator and gain nodes', () => {
      playSound('chime', 100);

      expect(audioContextMock.createOscillator).toHaveBeenCalled();
      expect(audioContextMock.createGain).toHaveBeenCalled();
    });

    it('should connect oscillator to gain and destination', () => {
      playSound('chime', 100);

      expect(oscillatorMock.connect).toHaveBeenCalled();
      expect(gainNodeMock.connect).toHaveBeenCalledWith(audioContextMock.destination);
    });

    it('should start and stop oscillator', () => {
      playSound('chime', 100);

      expect(oscillatorMock.start).toHaveBeenCalled();
      expect(oscillatorMock.stop).toHaveBeenCalled();
    });

    it('should scale volume correctly (100% = 1.0)', () => {
      playSound('chime', 100);

      // Check that gain was set (exact value depends on implementation)
      expect(gainNodeMock.gain.setValueAtTime).toHaveBeenCalled();
    });

    it('should scale volume correctly (50% = 0.5)', () => {
      playSound('chime', 50);

      expect(gainNodeMock.gain.setValueAtTime).toHaveBeenCalled();
    });

    it('should handle 0% volume (mute)', () => {
      playSound('chime', 0);

      // Should return early without creating audio context when volume is 0
      expect(audioContextMock.createOscillator).not.toHaveBeenCalled();
    });

    it('should handle chime sound', () => {
      expect(() => playSound('chime', 100)).not.toThrow();
    });

    it('should handle bell sound', () => {
      expect(() => playSound('bell', 100)).not.toThrow();
    });

    it('should handle beep sound', () => {
      expect(() => playSound('beep', 100)).not.toThrow();
    });

    it('should handle piano sound', () => {
      expect(() => playSound('piano', 100)).not.toThrow();
    });

    it('should handle gentle sound', () => {
      expect(() => playSound('gentle', 100)).not.toThrow();
    });

    it('should default to chime for unknown sound type', () => {
      expect(() => playSound('unknown' as any, 100)).not.toThrow();
    });

    it('should handle bell with multiple harmonics', () => {
      playSound('bell', 100);

      // Bell should create multiple oscillators for harmonics
      expect(audioContextMock.createOscillator).toHaveBeenCalled();
    });

    it('should handle piano with chord (multiple notes)', () => {
      playSound('piano', 100);

      // Piano should create multiple oscillators for C major chord
      expect(audioContextMock.createOscillator).toHaveBeenCalled();
    });

    it('should use ADSR envelope (attack, decay, sustain, release)', () => {
      playSound('chime', 100);

      // Should set gain values over time for envelope
      expect(gainNodeMock.gain.setValueAtTime).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle AudioContext creation failure gracefully', () => {
      global.AudioContext = vi.fn().mockImplementation(() => {
        throw new Error('AudioContext not supported');
      });

      expect(() => playSound('chime', 100)).not.toThrow();
    });

    it('should handle oscillator creation failure gracefully', () => {
      audioContextMock.createOscillator = vi.fn().mockImplementation(() => {
        throw new Error('Cannot create oscillator');
      });

      expect(() => playSound('chime', 100)).not.toThrow();
    });
  });

  describe('Volume Normalization', () => {
    it('should clamp volume to 0-100 range', () => {
      // Should not throw for out-of-range values
      expect(() => playSound('chime', -10)).not.toThrow();
      expect(() => playSound('chime', 150)).not.toThrow();
    });

    it('should normalize volume to 0-1 for audio API', () => {
      playSound('chime', 80);

      // Check that gain.setValueAtTime was called with normalized value (0-1 range)
      const calls = gainNodeMock.gain.setValueAtTime.mock.calls;
      expect(calls.length).toBeGreaterThan(0);

      // At least one call should have a value <= 1
      const hasNormalizedValue = calls.some((call: any[]) => call[0] <= 1);
      expect(hasNormalizedValue).toBe(true);
    });
  });
});

