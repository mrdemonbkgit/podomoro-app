/**
 * CheckInModal Component
 *
 * Daily check-in form with mood, urges, triggers, and journal
 * All fields optional except timestamp (auto-filled)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Mood, type Trigger } from '../types/kamehameha.types';
import { MoodSelector } from './MoodSelector';
import { TriggerSelector } from './TriggerSelector';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (checkInData: CheckInFormData) => Promise<void>;
}

export interface CheckInFormData {
  mood?: Mood;
  urgeIntensity?: number;
  triggers?: Trigger[];
  otherTrigger?: string;
  journalEntry?: string;
}

export function CheckInModal({ isOpen, onClose, onSubmit }: CheckInModalProps) {
  const [mood, setMood] = useState<Mood | undefined>();
  const [urgeIntensity, setUrgeIntensity] = useState(0);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [otherTrigger, setOtherTrigger] = useState('');
  const [journalEntry, setJournalEntry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const checkInData: CheckInFormData = {};

      // Only include fields that have values
      if (mood) checkInData.mood = mood;
      if (urgeIntensity > 0) checkInData.urgeIntensity = urgeIntensity;
      if (triggers.length > 0) checkInData.triggers = triggers;
      if (otherTrigger.trim()) checkInData.otherTrigger = otherTrigger.trim();
      if (journalEntry.trim()) checkInData.journalEntry = journalEntry.trim();

      await onSubmit(checkInData);

      // Reset form
      setMood(undefined);
      setUrgeIntensity(0);
      setTriggers([]);
      setOtherTrigger('');
      setJournalEntry('');

      onClose();
    } catch (error) {
      console.error('Failed to submit check-in:', error);
      // Error handling will be done by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-b from-slate-900/95 to-slate-900/80 backdrop-blur-lg px-6 py-5 border-b border-white/10 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Daily Check-In 💭
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                  >
                    <svg
                      className="w-6 h-6"
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
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Mood Selector */}
                <MoodSelector selectedMood={mood} onMoodSelect={setMood} />

                {/* Urge Intensity Slider */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Urge intensity:{' '}
                    <span className="text-purple-400 font-bold">
                      {urgeIntensity}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={urgeIntensity}
                    onChange={(e) => setUrgeIntensity(Number(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>None</span>
                    <span>Extreme</span>
                  </div>
                </div>

                {/* Trigger Selector */}
                <TriggerSelector
                  selectedTriggers={triggers}
                  onTriggersChange={setTriggers}
                  otherTrigger={otherTrigger}
                  onOtherTriggerChange={setOtherTrigger}
                />

                {/* Journal Entry */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Journal Entry (optional)
                  </label>
                  <textarea
                    value={journalEntry}
                    onChange={(e) => setJournalEntry(e.target.value)}
                    placeholder="Write your thoughts, feelings, or reflections..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                  />
                  <p className="text-xs text-gray-400">
                    {journalEntry.length} characters
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl text-white font-medium shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Check-In'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
