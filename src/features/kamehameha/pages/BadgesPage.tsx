/**
 * BadgesPage Component
 *
 * Dedicated page to view all earned and locked badges
 * Phase 5.1: Shows badges for current journey
 */

import { Link } from 'react-router-dom';
import { UserProfile } from '../../auth/components/UserProfile';
import { useStreaksContext } from '../context/StreaksContext';
import { useBadges } from '../hooks/useBadges';
import { BadgeGallery } from '../components/BadgeGallery';

export function BadgesPage() {
  const { currentJourneyId } = useStreaksContext();
  const { badges, loading } = useBadges(currentJourneyId); // Loads all badges (permanent records)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-start justify-between pointer-events-none">
        <div className="text-white flex items-center gap-3 pointer-events-auto">
          <span className="text-4xl">🏆</span>
          <div>
            <h1 className="text-3xl font-bold tracking-wide">Your Badges</h1>
            <p className="text-xs opacity-70 tracking-wide">
              Milestone Achievements
            </p>
          </div>
        </div>

        <div className="pointer-events-auto">
          <UserProfile />
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen pt-32 pb-16 px-4">
        <main className="max-w-6xl mx-auto">
          {/* Back button */}
          <div className="mb-8">
            <Link
              to="/kamehameha"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Back to Dashboard</span>
            </Link>
          </div>

          {/* Stats header */}
          {!loading && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 text-center">
              <div className="text-white">
                <div className="text-5xl font-bold mb-2">{badges.length}</div>
                <div className="text-lg opacity-80">Badges Earned</div>
              </div>
            </div>
          )}

          {/* Badge gallery */}
          <BadgeGallery badges={badges} loading={loading} />

          {/* Motivational footer */}
          {!loading && badges.length > 0 && (
            <div className="mt-12 text-center">
              <p className="text-white/60 text-lg">
                Keep going! Every milestone is a step forward. 💪
              </p>
            </div>
          )}

          {/* Empty state */}
          {!loading && badges.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold text-white mb-3">
                No badges yet!
              </h2>
              <p className="text-white/60 text-lg mb-8">
                Start your journey and earn your first milestone badge.
              </p>
              <Link
                to="/kamehameha"
                className="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-full shadow-lg transition-all hover:scale-105"
              >
                Go to Dashboard
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
