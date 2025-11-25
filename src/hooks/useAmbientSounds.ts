import { useState, useEffect, useCallback } from 'react';
import { usePersistedState, clearPersistedState } from './usePersistedState';

export interface AmbientSoundSettings {
  activeSounds: { id: string; volume: number }[];
  masterVolume: number;
}

const DEFAULT_SETTINGS: AmbientSoundSettings = {
  activeSounds: [],
  masterVolume: 100,
};

const AMBIENT_SOUND_SETTINGS_KEY = 'pomodoro_ambient_sound_settings';

/**
 * Hook for managing ambient sound settings with localStorage persistence
 */
export const useAmbientSounds = () => {
  const [settings, setSettings] = usePersistedState<AmbientSoundSettings>(
    AMBIENT_SOUND_SETTINGS_KEY,
    DEFAULT_SETTINGS
  );

  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Add or update an active sound
   */
  const setSound = useCallback(
    (id: string, volume: number) => {
      setSettings((prev) => {
        const existing = prev.activeSounds.find((s) => s.id === id);
        if (existing) {
          // Update volume
          return {
            ...prev,
            activeSounds: prev.activeSounds.map((s) =>
              s.id === id ? { ...s, volume } : s
            ),
          };
        } else {
          // Add new sound
          return {
            ...prev,
            activeSounds: [...prev.activeSounds, { id, volume }],
          };
        }
      });
    },
    [setSettings]
  );

  /**
   * Remove a sound
   */
  const removeSound = useCallback(
    (id: string) => {
      setSettings((prev) => ({
        ...prev,
        activeSounds: prev.activeSounds.filter((s) => s.id !== id),
      }));
    },
    [setSettings]
  );

  /**
   * Clear all sounds
   */
  const clearAll = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      activeSounds: [],
    }));
  }, [setSettings]);

  /**
   * Set master volume
   */
  const setMasterVolume = useCallback(
    (volume: number) => {
      setSettings((prev) => ({
        ...prev,
        masterVolume: volume,
      }));
    },
    [setSettings]
  );

  /**
   * Load a preset
   */
  const loadPreset = useCallback(
    (sounds: { id: string; volume: number }[]) => {
      setSettings((prev) => ({
        ...prev,
        activeSounds: sounds,
      }));
    },
    [setSettings]
  );

  /**
   * Reset to defaults
   */
  const resetSettings = useCallback(() => {
    clearPersistedState(AMBIENT_SOUND_SETTINGS_KEY);
    setSettings(DEFAULT_SETTINGS);
  }, [setSettings]);

  /**
   * Mark as initialized
   */
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [isInitialized]);

  return {
    settings,
    setSound,
    removeSound,
    clearAll,
    setMasterVolume,
    loadPreset,
    resetSettings,
    isInitialized,
  };
};
