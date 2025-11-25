/**
 * TriggerSelector Component
 *
 * Multi-select checkboxes for common triggers
 * Used in CheckInModal and RelapseFlow
 */

import { useState } from 'react';
import { type Trigger } from '../types/kamehameha.types';

interface TriggerSelectorProps {
  selectedTriggers: Trigger[];
  onTriggersChange: (triggers: Trigger[]) => void;
  otherTrigger?: string;
  onOtherTriggerChange?: (value: string) => void;
}

const triggers: { value: Trigger; label: string }[] = [
  { value: 'stress', label: 'Stress' },
  { value: 'boredom', label: 'Boredom' },
  { value: 'loneliness', label: 'Loneliness' },
  { value: 'anger', label: 'Anger' },
  { value: 'tired', label: 'Tired/Fatigue' },
  { value: 'other', label: 'Other' },
];

export function TriggerSelector({
  selectedTriggers,
  onTriggersChange,
  otherTrigger,
  onOtherTriggerChange,
}: TriggerSelectorProps) {
  const [showOtherInput, setShowOtherInput] = useState(
    selectedTriggers.includes('other')
  );

  const toggleTrigger = (trigger: Trigger) => {
    if (selectedTriggers.includes(trigger)) {
      // Remove trigger
      onTriggersChange(selectedTriggers.filter((t) => t !== trigger));

      // Hide other input if unchecking 'other'
      if (trigger === 'other') {
        setShowOtherInput(false);
        if (onOtherTriggerChange) {
          onOtherTriggerChange('');
        }
      }
    } else {
      // Add trigger
      onTriggersChange([...selectedTriggers, trigger]);

      // Show other input if checking 'other'
      if (trigger === 'other') {
        setShowOtherInput(true);
      }
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        Triggers experienced? (optional)
      </label>

      <div className="grid grid-cols-2 gap-3">
        {triggers.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => toggleTrigger(value)}
            className={`
              flex items-center gap-2 py-3 px-4 rounded-lg transition-all duration-200
              ${
                selectedTriggers.includes(value)
                  ? 'bg-purple-500/20 border-2 border-purple-400 text-purple-200'
                  : 'bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-300'
              }
            `}
          >
            {/* Checkbox */}
            <div
              className={`
                w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                ${
                  selectedTriggers.includes(value)
                    ? 'bg-purple-500 border-purple-400'
                    : 'bg-transparent border-white/30'
                }
              `}
            >
              {selectedTriggers.includes(value) && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Other trigger text input */}
      {showOtherInput && onOtherTriggerChange && (
        <div className="mt-3">
          <input
            type="text"
            value={otherTrigger || ''}
            onChange={(e) => onOtherTriggerChange(e.target.value)}
            placeholder="Describe other trigger..."
            className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>
      )}
    </div>
  );
}
