import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserProfile } from '../../auth/components/UserProfile';
import { useStreaksContext } from '../context/StreaksContext';
import { useCheckIns } from '../hooks/useCheckIns';
import { useRelapses } from '../hooks/useRelapses';
import { useBadges } from '../hooks/useBadges';
import { CheckInModal, type CheckInFormData } from '../components/CheckInModal';
import { RelapseFlow, type RelapseFormData } from '../components/RelapseFlow';
import { CelebrationModal } from '../components/CelebrationModal';
import { MilestoneProgress } from '../components/MilestoneProgress';
import { type StreakDisplay } from '../types/kamehameha.types';

/**
 * Kamehameha Recovery Tool - Main Page
 * 
 * Single-timer display with tab switching.
 * Phase 3: Check-in and relapse tracking enabled.
 * Phase 5: Milestone progress and badge celebrations.
 */

type ActiveStreak = 'main' | 'discipline';

export function KamehamehaPage() {
  const { streaks, mainDisplay, disciplineDisplay, loading, error, refreshStreaks } = useStreaksContext();
  const { createCheckIn } = useCheckIns();
  const { createRelapse } = useRelapses();
  const { celebrationBadge, dismissCelebration } = useBadges();
  
  // Active streak tab
  const [activeStreak, setActiveStreak] = useState<ActiveStreak>('main');
  
  // Modal state
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isRelapseOpen, setIsRelapseOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle check-in submission
  const handleCheckInSubmit = async (checkInData: CheckInFormData) => {
    try {
      await createCheckIn(checkInData);
      setSuccessMessage('✅ Check-in saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save check-in:', error);
      // Error notification could be added here
    }
  };

  // Handle relapse submission
  const handleRelapseSubmit = async (relapseData: RelapseFormData) => {
    try {
      await createRelapse(relapseData);
      setSuccessMessage('✅ Relapse recorded. Streak reset. You got this!');
      setTimeout(() => setSuccessMessage(null), 5000);
      // Refresh streaks to show updated data
      await refreshStreaks();
    } catch (error) {
      console.error('Failed to save relapse:', error);
      // Error notification could be added here
    }
  };

  // Get active display and stats
  const activeDisplay = activeStreak === 'main' ? mainDisplay : disciplineDisplay;
  const activeLongest = activeStreak === 'main' 
    ? streaks?.main.longestSeconds || 0 
    : streaks?.discipline.longestSeconds || 0;

  // Format large timer display
  const formatLargeTime = (display: StreakDisplay | null) => {
    if (!display) return '0:00:00:00';
    const days = display.days.toString();
    const hours = String(display.hours).padStart(2, '0');
    const minutes = String(display.minutes).padStart(2, '0');
    const seconds = String(display.seconds).padStart(2, '0');
    return `${days}:${hours}:${minutes}:${seconds}`;
  };

  const timeDisplay = formatLargeTime(activeDisplay);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-start justify-between pointer-events-none">
        <div className="text-white flex items-center gap-3 pointer-events-auto">
          <span className="text-4xl">🔥</span>
          <div>
            <h1 className="text-3xl font-bold tracking-wide">Kamehameha</h1>
            <p className="text-xs opacity-70 tracking-wide">Recovery Journey</p>
          </div>
        </div>
        
        <div className="pointer-events-auto">
          <UserProfile />
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6">
        <main className="w-full max-w-4xl flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 3rem)' }}>
          
          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl max-w-2xl">
              <p className="text-green-200 text-sm text-center">{successMessage}</p>
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl max-w-2xl">
              <p className="text-red-200 text-sm text-center">⚠️ {error.message}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/60">Loading your streaks...</p>
            </div>
          ) : (
            <>
              {/* Streak Type Tabs */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                <button 
                  onClick={() => setActiveStreak('main')}
                  className={`px-6 py-3 rounded-full text-base md:text-lg font-semibold transition-all ${
                    activeStreak === 'main'
                      ? 'bg-purple-600 text-white shadow-lg' 
                      : 'bg-white/0 text-white border-2 border-white/40 hover:bg-white/10'
                  }`}
                >
                  🏆 Main Streak
                </button>
                <button 
                  onClick={() => setActiveStreak('discipline')}
                  className={`px-6 py-3 rounded-full text-base md:text-lg font-semibold transition-all ${
                    activeStreak === 'discipline'
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-white/0 text-white border-2 border-white/40 hover:bg-white/10'
                  }`}
                >
                  ⚡ Discipline Streak
                </button>
              </div>

              {/* Large Timer Display */}
              <div className="flex justify-center my-6 md:my-8">
                <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white/90 tabular-nums tracking-tight drop-shadow-2xl">
                  {timeDisplay}
                </div>
              </div>

              {/* Current and Longest Stats */}
              <div className="flex items-center justify-center gap-8 text-white/70 text-sm md:text-base mb-8">
                <div>
                  <span className="opacity-60">Current: </span>
                  <span className="font-semibold">{activeDisplay?.days || 0} days</span>
                </div>
                <div>
                  <span className="opacity-60">Longest: </span>
                  <span className="font-semibold">{Math.floor((activeLongest || 0) / 86400)} days</span>
                </div>
              </div>

              {/* Milestone Progress */}
              {activeDisplay && (
                <div className="w-full max-w-2xl mb-8">
                  <MilestoneProgress 
                    currentSeconds={activeDisplay.totalSeconds}
                    streakType={activeStreak}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-center flex-wrap gap-4 mt-8">
                <button
                  onClick={() => setIsCheckInOpen(true)}
                  className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-full shadow-lg transition-all hover:scale-105"
                >
                  📝 Daily Check-In
                </button>
                <Link
                  to="/kamehameha/chat"
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-full shadow-lg transition-all hover:scale-105"
                >
                  💬 AI Therapist
                </Link>
                <Link
                  to="/kamehameha/badges"
                  className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-lg font-semibold rounded-full shadow-lg transition-all hover:scale-105"
                >
                  🏆 View Badges
                </Link>
                <button
                  onClick={() => setIsRelapseOpen(true)}
                  className="px-8 py-4 bg-white/20 hover:bg-white/30 border-2 border-white/40 text-white text-lg font-semibold rounded-full shadow-lg transition-all hover:scale-105"
                >
                  ⚠️ Report Relapse
                </button>
              </div>

              {/* Back to Timer Link */}
              <div className="mt-12 text-center">
                <Link
                  to="/timer"
                  className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Timer</span>
                </Link>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSubmit={handleCheckInSubmit}
      />

      <RelapseFlow
        isOpen={isRelapseOpen}
        onClose={() => setIsRelapseOpen(false)}
        onComplete={handleRelapseSubmit}
        mainStreak={mainDisplay}
        disciplineStreak={disciplineDisplay}
      />

      {/* Celebration Modal for Badge Milestones */}
      <CelebrationModal
        badge={celebrationBadge}
        onClose={dismissCelebration}
      />
    </div>
  );
}

