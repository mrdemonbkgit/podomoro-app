/**
 * QuickActions - Quick access buttons for common actions
 *
 * Phase 3: Check-in and Relapse tracking enabled
 */

interface QuickActionsProps {
  onCheckInClick: () => void;
  onRelapseClick: () => void;
}

export function QuickActions({
  onCheckInClick,
  onRelapseClick,
}: QuickActionsProps) {
  return (
    <div className="glass-panel bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10 backdrop-blur-xl">
      <h3 className="text-xl font-bold text-white mb-4 text-center">
        Quick Actions
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Check In Button - NOW ACTIVE */}
        <button
          onClick={onCheckInClick}
          className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all"
        >
          <span className="text-4xl">📝</span>
          <span className="text-white font-semibold">Daily Check-In</span>
          <span className="text-xs text-green-400">✨ Active</span>
        </button>

        {/* Relapse Button - NOW ACTIVE */}
        <button
          onClick={onRelapseClick}
          className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/5 border-2 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 hover:scale-105 transition-all"
        >
          <span className="text-4xl">⚠️</span>
          <span className="text-white font-semibold">Report Relapse</span>
          <span className="text-xs text-green-400">✨ Active</span>
        </button>

        {/* AI Support Button - Phase 4 */}
        <button
          disabled
          className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/5 border-2 border-white/10 opacity-50 cursor-not-allowed transition-all"
          title="Coming in Phase 4"
        >
          <span className="text-4xl">💬</span>
          <span className="text-white font-semibold">AI Support</span>
          <span className="text-xs text-white/50">Phase 4</span>
        </button>
      </div>

      <p className="text-center text-xs text-white/40 mt-6">
        ✅ Phase 3 features now available!
      </p>
    </div>
  );
}
