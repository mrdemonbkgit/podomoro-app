import { useState } from 'react';
import { Settings as SettingsType, MIN_DURATION, MAX_DURATION, MIN_SESSIONS, MAX_SESSIONS, MIN_VOLUME, MAX_VOLUME } from '../types/settings';
import { SOUND_OPTIONS, SoundType } from '../utils/sounds';
import { playSound } from '../utils/sounds';

interface SettingsProps {
  settings: SettingsType;
  onSave: (settings: SettingsType) => void;
  onReset: () => void;
  onClose: () => void;
  isDark: boolean;
}

export const Settings = ({ settings, onSave, onReset, onClose, isDark }: SettingsProps) => {
  const [localSettings, setLocalSettings] = useState<SettingsType>(settings);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const validateField = (name: keyof SettingsType, value: number): string | null => {
    if (name === 'sessionsUntilLongBreak') {
      if (value < MIN_SESSIONS) return `Minimum ${MIN_SESSIONS} sessions`;
      if (value > MAX_SESSIONS) return `Maximum ${MAX_SESSIONS} sessions`;
    } else if (name !== 'notificationsEnabled') {
      if (value < MIN_DURATION) return `Minimum ${MIN_DURATION} minute`;
      if (value > MAX_DURATION) return `Maximum ${MAX_DURATION} minutes`;
    }
    return null;
  };

  const handleChange = (field: keyof SettingsType, value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;

    const error = validateField(field, numValue);
    setErrors(prev => ({
      ...prev,
      [field]: error || '',
    }));

    setLocalSettings(prev => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const handleToggleNotifications = () => {
    setLocalSettings(prev => ({
      ...prev,
      notificationsEnabled: !prev.notificationsEnabled,
    }));
  };

  const handleSoundChange = (soundType: SoundType) => {
    setLocalSettings(prev => ({
      ...prev,
      soundType,
    }));
  };

  const handleVolumeChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;
    
    const clampedValue = Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, numValue));
    setLocalSettings(prev => ({
      ...prev,
      volume: clampedValue,
    }));
  };

  const handleTestSound = (soundType?: SoundType) => {
    const sound = soundType || localSettings.soundType;
    playSound(sound, localSettings.volume);
  };

  const handleSave = () => {
    // Validate all fields (skip boolean fields)
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    (Object.keys(localSettings) as Array<keyof SettingsType>).forEach(key => {
      // Skip boolean fields (like notificationsEnabled)
      if (typeof localSettings[key] === 'boolean') return;
      
      const error = validateField(key, localSettings[key] as number);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    onSave(localSettings);
    onClose();
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    setShowResetConfirm(false);
    onReset();
    onClose();
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  return (
    <>
      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className={`absolute inset-0 ${isDark ? 'bg-black/70' : 'bg-black/50'}`}
            onClick={cancelReset}
          />
          <div className={`relative ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl p-6 max-w-sm mx-4 transition-colors duration-200`}>
            <h3 className={`text-lg font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'} mb-2 transition-colors duration-200`}>
              Reset to Defaults?
            </h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6 transition-colors duration-200`}>
              This will reset all timer durations and session settings to their default values (25/5/15/4).
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelReset}
                className={`flex-1 px-4 py-2 ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-lg transition-colors font-medium`}
              >
                Cancel
              </button>
              <button
                onClick={confirmReset}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'} transition-colors duration-200`}>Settings</h2>
          <button
            onClick={onClose}
            className={`${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors text-2xl leading-none`}
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Work Duration */}
        <div>
          <label htmlFor="workDuration" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2 transition-colors duration-200`}>
            Work Duration
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              id="workDuration"
              min={MIN_DURATION}
              max={MAX_DURATION}
              value={localSettings.workDuration}
              onChange={(e) => handleChange('workDuration', e.target.value)}
              className={`flex-1 px-4 py-2 border ${
                errors.workDuration ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${isDark ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'} transition-colors duration-200`}
            />
            <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'} min-w-[60px] transition-colors duration-200`}>minutes</span>
          </div>
          {errors.workDuration && (
            <p className={`mt-1 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{errors.workDuration}</p>
          )}
        </div>

        {/* Short Break Duration */}
        <div>
          <label htmlFor="shortBreakDuration" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2 transition-colors duration-200`}>
            Short Break Duration
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              id="shortBreakDuration"
              min={MIN_DURATION}
              max={MAX_DURATION}
              value={localSettings.shortBreakDuration}
              onChange={(e) => handleChange('shortBreakDuration', e.target.value)}
              className={`flex-1 px-4 py-2 border ${
                errors.shortBreakDuration ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDark ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'} transition-colors duration-200`}
            />
            <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'} min-w-[60px] transition-colors duration-200`}>minutes</span>
          </div>
          {errors.shortBreakDuration && (
            <p className={`mt-1 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{errors.shortBreakDuration}</p>
          )}
        </div>

        {/* Long Break Duration */}
        <div>
          <label htmlFor="longBreakDuration" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2 transition-colors duration-200`}>
            Long Break Duration
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              id="longBreakDuration"
              min={MIN_DURATION}
              max={MAX_DURATION}
              value={localSettings.longBreakDuration}
              onChange={(e) => handleChange('longBreakDuration', e.target.value)}
              className={`flex-1 px-4 py-2 border ${
                errors.longBreakDuration ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'} transition-colors duration-200`}
            />
            <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'} min-w-[60px] transition-colors duration-200`}>minutes</span>
          </div>
          {errors.longBreakDuration && (
            <p className={`mt-1 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{errors.longBreakDuration}</p>
          )}
        </div>

        {/* Sessions Until Long Break */}
        <div>
          <label htmlFor="sessionsUntilLongBreak" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2 transition-colors duration-200`}>
            Sessions Until Long Break
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              id="sessionsUntilLongBreak"
              min={MIN_SESSIONS}
              max={MAX_SESSIONS}
              value={localSettings.sessionsUntilLongBreak}
              onChange={(e) => handleChange('sessionsUntilLongBreak', e.target.value)}
              className={`flex-1 px-4 py-2 border ${
                errors.sessionsUntilLongBreak ? 'border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDark ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'} transition-colors duration-200`}
            />
            <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'} min-w-[60px] transition-colors duration-200`}>sessions</span>
          </div>
          {errors.sessionsUntilLongBreak && (
            <p className={`mt-1 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{errors.sessionsUntilLongBreak}</p>
          )}
        </div>

        {/* Divider */}
        <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}></div>

        {/* Desktop Notifications Toggle */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label htmlFor="notificationsEnabled" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors duration-200`}>
                Desktop Notifications 🔔
              </label>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-200`}>
                Get notified when timer completes (works in background)
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${isDark ? 'focus:ring-offset-gray-800' : ''} ${
                localSettings.notificationsEnabled ? 'bg-green-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'
              }`}
              aria-label="Toggle notifications"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}></div>

        {/* Sound Selection */}
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-3 transition-colors duration-200`}>
            Notification Sound 🔊
          </label>
          <div className="grid grid-cols-1 gap-2">
            {SOUND_OPTIONS.map((sound) => (
              <button
                key={sound.id}
                type="button"
                onClick={() => {
                  handleSoundChange(sound.id);
                  handleTestSound(sound.id);
                }}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                  localSettings.soundType === sound.id
                    ? isDark
                      ? 'border-blue-500 bg-blue-900/30'
                      : 'border-blue-500 bg-blue-50'
                    : isDark
                    ? 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{sound.icon}</span>
                  <div className="text-left">
                    <div className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                      {sound.name}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {sound.description}
                    </div>
                  </div>
                </div>
                {localSettings.soundType === sound.id && (
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Volume Control */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="volume" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-200`}>
              Volume
            </label>
            <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {localSettings.volume}%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              id="volume"
              min={MIN_VOLUME}
              max={MAX_VOLUME}
              value={localSettings.volume}
              onChange={(e) => handleVolumeChange(e.target.value)}
              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: isDark
                  ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${localSettings.volume}%, #4b5563 ${localSettings.volume}%, #4b5563 100%)`
                  : `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${localSettings.volume}%, #d1d5db ${localSettings.volume}%, #d1d5db 100%)`,
              }}
            />
            <button
              type="button"
              onClick={() => handleTestSound()}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              disabled={localSettings.volume === 0}
            >
              Test
            </button>
          </div>
          {localSettings.volume === 0 && (
            <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              🔇 Sound is muted (volume at 0%)
            </p>
          )}
        </div>

        {/* Info Box */}
        <div className={`${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4 transition-colors duration-200`}>
          <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'} transition-colors duration-200`}>
            <strong>Note:</strong> If the timer hasn't started, settings apply immediately. Otherwise, they apply to the next session without interrupting the current one.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={handleReset}
          className={`flex-1 px-6 py-3 ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-lg transition-colors font-medium`}
        >
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all font-medium shadow-lg"
        >
          Save Settings
        </button>
      </div>
      </div>
    </>
  );
};
