/**
 * RelapseFlow Component
 * 
 * 4-step wizard for marking relapses with compassionate UI
 * Steps: 1) Type Selection, 2) Reasons, 3) Reflection, 4) Confirmation
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type RelapseType, type StreakDisplay, DEFAULT_RULE_VIOLATIONS } from '../types/kamehameha.types';

interface RelapseFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (relapseData: RelapseFormData) => Promise<void>;
  mainStreak: StreakDisplay | null;
}

export interface RelapseFormData {
  type: RelapseType;
  streakType: 'main' | 'discipline';
  previousStreakSeconds: number;
  reasons?: string[];
  reflection?: {
    whatLed: string;
    whatNext: string;
  };
}

export function RelapseFlow({
  isOpen,
  onClose,
  onComplete,
  mainStreak,
}: RelapseFlowProps) {
  const [step, setStep] = useState(1);
  const [relapseType, setRelapseType] = useState<RelapseType | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [otherReason, setOtherReason] = useState('');
  const [whatLed, setWhatLed] = useState('');
  const [whatNext, setWhatNext] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (step === 1 && relapseType === 'fullPMO') {
      // Skip reasons for full PMO, go to reflection
      setStep(3);
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step === 3 && relapseType === 'fullPMO') {
      // Skip reasons when going back from reflection
      setStep(1);
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!relapseType) return;

    setIsSubmitting(true);

    try {
      const streakType = relapseType === 'fullPMO' ? 'main' : 'discipline';
      // Phase 5.1: Always use main streak duration (no discipline streak tracking)
      const previousSeconds = mainStreak?.totalSeconds || 0;

      const relapseData: RelapseFormData = {
        type: relapseType,
        streakType,
        previousStreakSeconds: previousSeconds,
      };

      // Add reasons if rule violation
      if (relapseType === 'ruleViolation' && selectedReasons.length > 0) {
        relapseData.reasons = [
          ...selectedReasons.filter((r) => r !== 'Other'),
          ...(otherReason.trim() ? [otherReason.trim()] : []),
        ];
      }

      // Add reflection if provided
      if (whatLed.trim() || whatNext.trim()) {
        relapseData.reflection = {
          whatLed: whatLed.trim(),
          whatNext: whatNext.trim(),
        };
      }

      await onComplete(relapseData);

      // Reset form
      setStep(1);
      setRelapseType(null);
      setSelectedReasons([]);
      setOtherReason('');
      setWhatLed('');
      setWhatNext('');

      onClose();
    } catch (error) {
      console.error('Failed to submit relapse:', error);
      // Error handling by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setStep(1);
      setRelapseType(null);
      setSelectedReasons([]);
      setOtherReason('');
      setWhatLed('');
      setWhatNext('');
      onClose();
    }
  };

  const toggleReason = (reason: string) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter((r) => r !== reason));
      if (reason === 'Other') setOtherReason('');
    } else {
      setSelectedReasons([...selectedReasons, reason]);
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
                    <h2 className="text-2xl font-bold text-white">Mark Relapse</h2>
                    <p className="text-sm text-gray-400 mt-1">Step {step} of 4</p>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Step Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {/* Step 1: Type Selection */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-semibold text-white mb-4">What happened?</h3>

                      {/* Full PMO */}
                      <button
                        type="button"
                        onClick={() => setRelapseType('fullPMO')}
                        className={`w-full p-6 rounded-xl text-left transition-all ${
                          relapseType === 'fullPMO'
                            ? 'bg-red-500/20 border-2 border-red-400'
                            : 'bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-6 h-6 rounded-full border-2 mt-1 flex items-center justify-center ${
                              relapseType === 'fullPMO'
                                ? 'bg-red-500 border-red-400'
                                : 'bg-transparent border-white/30'
                            }`}
                          >
                            {relapseType === 'fullPMO' && (
                              <div className="w-3 h-3 bg-white rounded-full" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-white mb-2">Full PMO</h4>
                            <p className="text-sm text-gray-300 mb-2">Resets: Main Streak</p>
                            <p className="text-sm text-gray-400">
                              Current: {mainStreak?.formatted || '0s'}
                            </p>
                          </div>
                        </div>
                      </button>

                      {/* Rule Violation */}
                      <button
                        type="button"
                        onClick={() => setRelapseType('ruleViolation')}
                        className={`w-full p-6 rounded-xl text-left transition-all ${
                          relapseType === 'ruleViolation'
                            ? 'bg-orange-500/20 border-2 border-orange-400'
                            : 'bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-6 h-6 rounded-full border-2 mt-1 flex items-center justify-center ${
                              relapseType === 'ruleViolation'
                                ? 'bg-orange-500 border-orange-400'
                                : 'bg-transparent border-white/30'
                            }`}
                          >
                            {relapseType === 'ruleViolation' && (
                              <div className="w-3 h-3 bg-white rounded-full" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-white mb-2">Rule Violation</h4>
                            <p className="text-sm text-gray-300 mb-2">Effect: Logs violation (journey continues)</p>
                            <p className="text-sm text-gray-400">
                              Journey: {mainStreak?.formatted || '0s'}
                            </p>
                          </div>
                        </div>
                      </button>

                      {/* Next Button */}
                      <div className="flex justify-end pt-4">
                        <button
                          type="button"
                          onClick={handleNext}
                          disabled={!relapseType}
                          className="py-3 px-8 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl text-white font-medium shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next →
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Reasons (Rule Violation only) */}
                  {step === 2 && relapseType === 'ruleViolation' && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Which rules did you violate?
                      </h3>
                      <p className="text-sm text-gray-400">Select all that apply</p>

                      <div className="grid grid-cols-1 gap-3">
                        {DEFAULT_RULE_VIOLATIONS.map((reason) => (
                          <button
                            key={reason}
                            type="button"
                            onClick={() => toggleReason(reason)}
                            className={`flex items-center gap-3 p-4 rounded-lg text-left transition-all ${
                              selectedReasons.includes(reason)
                                ? 'bg-orange-500/20 border-2 border-orange-400'
                                : 'bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                selectedReasons.includes(reason)
                                  ? 'bg-orange-500 border-orange-400'
                                  : 'bg-transparent border-white/30'
                              }`}
                            >
                              {selectedReasons.includes(reason) && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-gray-200">{reason}</span>
                          </button>
                        ))}
                      </div>

                      {/* Other reason input */}
                      {selectedReasons.includes('Other') && (
                        <input
                          type="text"
                          value={otherReason}
                          onChange={(e) => setOtherReason(e.target.value)}
                          placeholder="Describe other reason..."
                          className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        />
                      )}

                      {/* Buttons */}
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl text-white font-medium transition-all"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={handleNext}
                          className="flex-1 py-3 px-8 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl text-white font-medium shadow-lg shadow-purple-500/20 transition-all"
                        >
                          Next →
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Reflection */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Reflection</h3>
                        <p className="text-sm text-gray-400">Optional but helpful for growth</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            What led to this moment?
                          </label>
                          <textarea
                            value={whatLed}
                            onChange={(e) => setWhatLed(e.target.value)}
                            placeholder="I was feeling stressed about work, hadn't slept well..."
                            rows={4}
                            className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            What will you do differently next time?
                          </label>
                          <textarea
                            value={whatNext}
                            onChange={(e) => setWhatNext(e.target.value)}
                            placeholder="I'll call a friend when I feel triggered, go for a walk..."
                            rows={4}
                            className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                          />
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl text-white font-medium transition-all"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={handleNext}
                          className="flex-1 py-3 px-8 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl text-white font-medium shadow-lg shadow-purple-500/20 transition-all"
                        >
                          Next →
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Confirmation */}
                  {step === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-semibold text-white mb-4">Please confirm</h3>

                      <div className="bg-white/5 rounded-xl p-6 space-y-3 border border-white/10">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Type:</span>
                          <span className="text-white font-medium">
                            {relapseType === 'fullPMO' ? 'Full PMO' : 'Rule Violation'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">
                            {relapseType === 'fullPMO' ? 'Resets:' : 'Effect:'}
                          </span>
                          <span className="text-white font-medium">
                            {relapseType === 'fullPMO' ? 'Main Streak (Journey Ends)' : 'Logs Violation (Journey Continues)'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Previous:</span>
                          <span className="text-white font-medium">
                            {mainStreak?.formatted || '0s'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Longest:</span>
                          <span className="text-green-400 font-medium">(preserved)</span>
                        </div>
                      </div>

                      {/* Motivational message */}
                      <div className="bg-purple-500/10 border-2 border-purple-500/30 rounded-xl p-6">
                        <p className="text-purple-200 text-center italic">
                          "Every setback is a setup for a comeback. Your honesty is strength."
                        </p>
                      </div>

                      <p className="text-sm text-gray-400 text-center">
                        This cannot be undone.
                      </p>

                      {/* Buttons */}
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={handleBack}
                          disabled={isSubmitting}
                          className="py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="flex-1 py-3 px-8 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-xl text-white font-medium shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting 
                            ? 'Saving...' 
                            : relapseType === 'fullPMO' 
                              ? 'Confirm Reset' 
                              : 'Log Violation'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

