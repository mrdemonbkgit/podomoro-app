import { useState } from 'react';
import { Settings as SettingsType, MIN_DURATION, MAX_DURATION, MIN_SESSIONS, MAX_SESSIONS } from '../types/settings';

interface SettingsProps {
  settings: SettingsType;
  onSave: (settings: SettingsType) => void;
  onReset: () => void;
  onClose: () => void;
}

export const Settings = ({ settings, onSave, onReset, onClose }: SettingsProps) => {
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
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={cancelReset}
          />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Reset to Defaults?
            </h3>
            <p className="text-gray-600 mb-6">
              This will reset all timer durations and session settings to their default values (25/5/15/4).
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelReset}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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
          <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Work Duration */}
        <div>
          <label htmlFor="workDuration" className="block text-sm font-medium text-gray-700 mb-2">
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
                errors.workDuration ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent`}
            />
            <span className="text-gray-600 min-w-[60px]">minutes</span>
          </div>
          {errors.workDuration && (
            <p className="mt-1 text-sm text-red-600">{errors.workDuration}</p>
          )}
        </div>

        {/* Short Break Duration */}
        <div>
          <label htmlFor="shortBreakDuration" className="block text-sm font-medium text-gray-700 mb-2">
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
                errors.shortBreakDuration ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            />
            <span className="text-gray-600 min-w-[60px]">minutes</span>
          </div>
          {errors.shortBreakDuration && (
            <p className="mt-1 text-sm text-red-600">{errors.shortBreakDuration}</p>
          )}
        </div>

        {/* Long Break Duration */}
        <div>
          <label htmlFor="longBreakDuration" className="block text-sm font-medium text-gray-700 mb-2">
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
                errors.longBreakDuration ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            <span className="text-gray-600 min-w-[60px]">minutes</span>
          </div>
          {errors.longBreakDuration && (
            <p className="mt-1 text-sm text-red-600">{errors.longBreakDuration}</p>
          )}
        </div>

        {/* Sessions Until Long Break */}
        <div>
          <label htmlFor="sessionsUntilLongBreak" className="block text-sm font-medium text-gray-700 mb-2">
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
                errors.sessionsUntilLongBreak ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
            />
            <span className="text-gray-600 min-w-[60px]">sessions</span>
          </div>
          {errors.sessionsUntilLongBreak && (
            <p className="mt-1 text-sm text-red-600">{errors.sessionsUntilLongBreak}</p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Desktop Notifications Toggle */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label htmlFor="notificationsEnabled" className="block text-sm font-medium text-gray-700 mb-1">
                Desktop Notifications 🔔
              </label>
              <p className="text-xs text-gray-500">
                Get notified when timer completes (works in background)
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                localSettings.notificationsEnabled ? 'bg-green-500' : 'bg-gray-300'
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

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> If the timer hasn't started, settings apply immediately. Otherwise, they apply to the next session without interrupting the current one.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={handleReset}
          className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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

