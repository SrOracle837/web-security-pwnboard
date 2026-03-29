"use client";

interface DailyChallengeProps {
  challenge: string | null;
  completed: boolean;
}

export default function DailyChallenge({
  challenge,
  completed,
}: DailyChallengeProps) {
  return (
    <div
      className={`bg-card rounded-2xl p-5 ${
        completed ? "ring-1 ring-success/30" : ""
      }`}
    >
      <p className="text-xs text-muted mb-2">Daily Challenge</p>
      {challenge ? (
        <div className="flex items-center gap-3">
          <span className="text-lg">{completed ? "\u2705" : "\u{1F3AF}"}</span>
          <div className="flex-1">
            <p className="text-sm text-foreground">{challenge}</p>
            <p
              className={`text-xs mt-1 ${
                completed ? "text-success" : "text-warn"
              }`}
            >
              {completed ? "Completed \u2014 +150 XP" : "+150 XP reward"}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted">
          No challenge set yet. Start completing labs to generate challenges.
        </p>
      )}
    </div>
  );
}
