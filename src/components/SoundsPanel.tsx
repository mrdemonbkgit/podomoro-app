import { useState, useEffect } from 'react';
import {
  AMBIENT_SOUNDS,
  SOUND_PRESETS,
  SoundCategory,
  getAllCategories,
  getCategoryName,
  getCategoryEmoji,
  getSoundsByCategory,
} from '../data/ambientSounds';
import { ambientAudioEngine } from '../utils/ambientAudio';
import { useAmbientSounds } from '../hooks/useAmbientSounds';

interface SoundsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const SoundsPanel = ({ isOpen, onClose, isDark }: SoundsPanelProps) => {
  const [selectedCategory, setSelectedCategory] =
    useState<SoundCategory>('nature');
  const [activeSounds, setActiveSounds] = useState<Map<string, number>>(
    new Map()
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const {
    settings: soundSettings,
    setSound,
    removeSound,
    clearAll,
    loadPreset,
  } = useAmbientSounds();

  // Restore saved sounds on mount
  useEffect(() => {
    if (isOpen && soundSettings.activeSounds.length > 0) {
      soundSettings.activeSounds.forEach(({ id, volume }) => {
        const sound = AMBIENT_SOUNDS.find((s) => s.id === id);
        if (sound && !ambientAudioEngine.isPlaying(id)) {
          ambientAudioEngine.startSound(sound, volume);
        }
      });
    }
  }, [isOpen, soundSettings.activeSounds]);

  // Sync with audio engine
  useEffect(() => {
    const interval = setInterval(() => {
      const active = ambientAudioEngine.getActiveSounds();
      const newMap = new Map<string, number>();
      active.forEach((id) => {
        newMap.set(id, ambientAudioEngine.getVolume(id));
      });
      setActiveSounds(newMap);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = (soundId: string) => {
    const sound = AMBIENT_SOUNDS.find((s) => s.id === soundId);
    if (!sound) return;

    if (activeSounds.has(soundId)) {
      ambientAudioEngine.stopSound(soundId);
      removeSound(soundId);
    } else {
      ambientAudioEngine.startSound(sound, 50);
      setSound(soundId, 50);
    }
  };

  const handleVolumeChange = (soundId: string, volume: number) => {
    ambientAudioEngine.setVolume(soundId, volume);
    setSound(soundId, volume);
  };

  const handlePresetClick = (presetId: string) => {
    const preset = SOUND_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setIsAnimating(true);

    // Stop all current sounds
    ambientAudioEngine.stopAll();
    clearAll();

    // Start preset sounds after a short delay
    setTimeout(() => {
      preset.sounds.forEach(({ soundId, volume }) => {
        const sound = AMBIENT_SOUNDS.find((s) => s.id === soundId);
        if (sound) {
          ambientAudioEngine.startSound(sound, volume);
        }
      });
      // Map soundId to id for persistence
      loadPreset(
        preset.sounds.map(({ soundId, volume }) => ({ id: soundId, volume }))
      );
      setIsAnimating(false);
    }, 300);
  };

  const handleStopAll = () => {
    ambientAudioEngine.stopAll();
    clearAll();
  };

  const categories = getAllCategories();
  const currentSounds = getSoundsByCategory(selectedCategory);

  const panelClasses = `
    fixed right-0 top-0 bottom-0 w-full md:w-[480px] z-50 overflow-y-auto
    transform transition-transform duration-300 ease-out
    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    ${isDark ? 'glass-panel-dark' : 'glass-panel-light'}
    shadow-2xl
  `;

  const overlayClasses = `
    fixed inset-0 bg-black/50 backdrop-blur-sm z-40
    transition-opacity duration-300
    ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
  `;

  return (
    <>
      {/* Backdrop */}
      <div className={overlayClasses} onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div
        className={panelClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sounds-panel-title"
      >
        {/* Header */}
        <div
          className={`sticky top-0 ${isDark ? 'bg-gray-900/90' : 'bg-white/90'} backdrop-blur-lg border-b ${isDark ? 'border-white/10' : 'border-gray-200'} p-6 z-10`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              id="sounds-panel-title"
              className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
            >
              🎵 Ambient Sounds
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-all`}
              aria-label="Close sounds panel"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Stop All Button */}
          {activeSounds.size > 0 && (
            <button
              onClick={handleStopAll}
              className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all mb-4"
            >
              ⏹️ Stop All Sounds ({activeSounds.size})
            </button>
          )}

          {/* Presets */}
          <div className="mb-4">
            <h3
              className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}
            >
              Quick Presets
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {SOUND_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetClick(preset.id)}
                  disabled={isAnimating}
                  className={`p-3 rounded-lg ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/10'
                      : 'bg-gray-100 hover:bg-gray-200'
                  } transition-all text-center ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={preset.description}
                >
                  <div className="text-2xl mb-1">{preset.emoji}</div>
                  <div
                    className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {preset.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? isDark
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-900 text-white'
                    : isDark
                      ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {getCategoryEmoji(category)} {getCategoryName(category)}
              </button>
            ))}
          </div>
        </div>

        {/* Sound Cards */}
        <div className="p-6 space-y-3">
          {currentSounds.map((sound) => {
            const isActive = activeSounds.has(sound.id);
            const volume = activeSounds.get(sound.id) || 50;

            return (
              <div
                key={sound.id}
                className={`p-4 rounded-xl ${
                  isDark ? 'bg-white/5' : 'bg-gray-50'
                } ${
                  isActive ? 'ring-2 ring-green-500' : ''
                } transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-start gap-3">
                  {/* Play/Stop Button */}
                  <button
                    onClick={() => handleToggleSound(sound.id)}
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : isDark
                          ? 'bg-white/10 hover:bg-white/20 text-gray-300'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    {isActive ? (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    {/* Sound Info */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{sound.emoji}</span>
                      <h4
                        className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
                      >
                        {sound.name}
                      </h4>
                    </div>
                    <p
                      className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}
                    >
                      {sound.description}
                    </p>

                    {/* Volume Slider */}
                    {isActive && (
                      <div className="flex items-center gap-3 animate-slide-up">
                        <svg
                          className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                          />
                        </svg>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={(e) =>
                            handleVolumeChange(
                              sound.id,
                              parseInt(e.target.value)
                            )
                          }
                          className="flex-1"
                        />
                        <span
                          className={`text-sm font-medium w-12 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          {volume}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visual Indicator */}
                {isActive && (
                  <div className="mt-3 flex gap-1 h-8 items-end justify-center">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-green-500 rounded-full animate-pulse"
                        style={{
                          height: `${20 + Math.sin(Date.now() / 200 + i) * 15}%`,
                          animationDelay: `${i * 0.05}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
};
