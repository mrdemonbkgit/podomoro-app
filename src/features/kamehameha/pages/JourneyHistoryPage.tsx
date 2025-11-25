/**
 * JourneyHistoryPage Component
 *
 * Displays complete journey history with violations details
 * Phase 5.1 - Journey System
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../services/firebase/config';
import { UserProfile } from '../../auth/components/UserProfile';
import { logger } from '../../../utils/logger';
import { useAuth } from '../../auth/context/AuthContext';
import { getJourneyViolations } from '../services/journeyService';
import { COLLECTION_PATHS } from '../services/paths';
import type { Journey, Relapse } from '../types/kamehameha.types';

export function JourneyHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [expandedJourneyId, setExpandedJourneyId] = useState<string | null>(
    null
  );
  const [journeyViolations, setJourneyViolations] = useState<
    Record<string, Relapse[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [loadingViolations, setLoadingViolations] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    if (!user?.uid) return;

    // Real-time listener for journey history (all journeys)
    const journeysRef = collection(db, COLLECTION_PATHS.journeys(user.uid));
    const q = query(journeysRef, orderBy('startDate', 'desc'));

    logger.debug('🔄 Setting up real-time journey history listener...');

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const journeysList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Journey[];

        setJourneys(journeysList);
        setLoading(false);

        logger.debug(
          '✅ Journey history updated:',
          journeysList.length,
          'journeys'
        );
        if (journeysList.length > 0) {
          const latest = journeysList[0];
          const duration = latest.endDate
            ? latest.finalSeconds || 0
            : Math.floor((Date.now() - latest.startDate) / 1000);
          const minutes = Math.floor(duration / 60);
          const seconds = duration % 60;
          logger.debug('   Latest journey:', {
            id: latest.id,
            achievementsCount: latest.achievementsCount,
            violationsCount: latest.violationsCount,
            endReason: latest.endReason,
            durationSeconds: duration,
            durationDisplay: `${minutes}m ${seconds}s`,
            isActive: !latest.endDate,
          });
        }
      },
      (error) => {
        logger.error('Journey history listener error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const toggleJourneyExpansion = async (journeyId: string) => {
    if (expandedJourneyId === journeyId) {
      setExpandedJourneyId(null);
    } else {
      setExpandedJourneyId(journeyId);

      // Load violations if not already loaded
      if (!journeyViolations[journeyId] && user) {
        setLoadingViolations((prev) => ({ ...prev, [journeyId]: true }));
        try {
          const violations = await getJourneyViolations(user.uid, journeyId);
          setJourneyViolations((prev) => ({
            ...prev,
            [journeyId]: violations,
          }));
        } catch (error) {
          logger.error('Failed to load violations:', error);
        } finally {
          setLoadingViolations((prev) => ({ ...prev, [journeyId]: false }));
        }
      }
    }
  };

  const formatDuration = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading journey history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-start justify-between pointer-events-none">
        <div className="text-white flex items-center gap-3 pointer-events-auto">
          <span className="text-4xl">📖</span>
          <div>
            <h1 className="text-3xl font-bold tracking-wide">
              Journey History
            </h1>
            <p className="text-xs opacity-70 tracking-wide">
              Your Recovery Path
            </p>
          </div>
        </div>

        <div className="pointer-events-auto">
          <UserProfile />
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/kamehameha')}
            className="mb-6 text-white/70 hover:text-white transition-colors flex items-center gap-2"
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </button>

          {/* Journey List */}
          <div className="space-y-4">
            {journeys.length === 0 ? (
              <div className="glass-morphism p-8 rounded-xl text-center">
                <p className="text-white/70">
                  No journey history yet. Start your first journey!
                </p>
              </div>
            ) : (
              journeys.map((journey, index) => {
                const isActive = journey.endReason === 'active';
                const isExpanded = expandedJourneyId === journey.id;
                const violations = journeyViolations[journey.id] || [];
                const journeyNumber = journeys.length - index;

                return (
                  <div
                    key={journey.id}
                    className="glass-morphism p-6 rounded-xl transition-all hover:bg-white/5"
                  >
                    {/* Journey Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
                          {isActive ? '►' : '○'} Journey #{journeyNumber}
                          {isActive && (
                            <span className="text-sm font-normal px-3 py-1 bg-green-500/20 text-green-300 rounded-full">
                              Current
                            </span>
                          )}
                        </h2>
                        <p className="text-white/70 text-sm">
                          {formatDate(journey.startDate)} -
                          {isActive
                            ? ' Present'
                            : ` ${formatDate(journey.endDate!)}`}
                          {' | '}
                          <span className="font-semibold">
                            {formatDuration(journey.finalSeconds)}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Journey Stats */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-purple-300">
                          {journey.achievementsCount}
                        </div>
                        <div className="text-white/70 text-sm">
                          Achievements
                        </div>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-blue-300">
                          {journey.violationsCount}
                        </div>
                        <div className="text-white/70 text-sm">Violations</div>
                      </div>
                    </div>

                    {/* Expand Violations Button */}
                    {journey.violationsCount > 0 && (
                      <button
                        onClick={() => toggleJourneyExpansion(journey.id)}
                        className="mt-4 w-full py-2 text-white/70 hover:text-white text-sm transition-colors"
                      >
                        {isExpanded
                          ? '▼ Hide Violations'
                          : '▶ View Violations'}
                      </button>
                    )}

                    {/* Violations List (Expanded) */}
                    {isExpanded && (
                      <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                        {loadingViolations[journey.id] ? (
                          <div className="text-center py-4">
                            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
                          </div>
                        ) : violations.length > 0 ? (
                          violations.map((violation) => {
                            const dayNumber =
                              Math.floor(
                                (violation.timestamp - journey.startDate) /
                                  (1000 * 60 * 60 * 24)
                              ) + 1;

                            return (
                              <div
                                key={violation.id}
                                className="bg-white/5 p-4 rounded-lg"
                              >
                                <div className="text-white font-medium mb-2 flex items-center gap-2">
                                  <span className="text-red-400">●</span>
                                  {formatDate(violation.timestamp)}
                                  <span className="text-white/50 text-sm">
                                    (Day {dayNumber})
                                  </span>
                                </div>
                                <div className="text-white/70 text-sm space-y-2 ml-4">
                                  {violation.reasons &&
                                    violation.reasons.length > 0 && (
                                      <div>
                                        <strong className="text-white/90">
                                          Triggers:
                                        </strong>{' '}
                                        {violation.reasons.join(', ')}
                                      </div>
                                    )}
                                  {violation.reflection?.whatLed && (
                                    <div>
                                      <strong className="text-white/90">
                                        What led to this:
                                      </strong>{' '}
                                      {violation.reflection.whatLed}
                                    </div>
                                  )}
                                  {violation.reflection?.whatNext && (
                                    <div>
                                      <strong className="text-white/90">
                                        Next time:
                                      </strong>{' '}
                                      {violation.reflection.whatNext}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-white/50 text-center py-4">
                            No violation details available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
