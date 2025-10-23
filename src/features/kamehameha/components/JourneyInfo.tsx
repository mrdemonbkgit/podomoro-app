/**
 * JourneyInfo Component
 * 
 * Displays journey number with motivational message
 * Phase 5.1 - Journey System
 */

interface JourneyInfoProps {
  /** Journey number (e.g., 5 for "Journey #5") */
  journeyNumber: number;
  /** Loading state */
  loading?: boolean;
}

const MOTIVATIONAL_MESSAGES = [
  "Every step forward is progress",
  "Your journey, your strength",
  "Building a better tomorrow",
  "One day at a time",
  "You're doing amazing",
  "Keep moving forward",
  "Strength through consistency",
  "Your story is being written",
  "Progress over perfection",
  "This is your comeback story",
  "Every journey begins somewhere",
  "You've got this",
  "Building resilience daily",
  "Your future self will thank you",
  "Small steps, big changes",
];

export function JourneyInfo({
  journeyNumber,
  loading = false,
}: JourneyInfoProps) {
  if (loading) {
    return (
      <div className="glass-morphism p-4 rounded-xl mb-6 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-48 mx-auto"></div>
      </div>
    );
  }

  // Select motivational message based on journey number (consistent per journey)
  const messageIndex = (journeyNumber - 1) % MOTIVATIONAL_MESSAGES.length;
  const message = MOTIVATIONAL_MESSAGES[messageIndex];

  return (
    <div className="glass-morphism p-4 rounded-xl mb-6 text-center">
      <h2 className="text-2xl font-bold text-white mb-1">
        Journey #{journeyNumber}
      </h2>
      <p className="text-white/70 text-sm italic">
        "{message}"
      </p>
    </div>
  );
}

