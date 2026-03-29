"use client";

interface AchievementCardProps {
  name: string;
  description: string;
  category: string;
  tier: string;
  earned: boolean;
  earnedDate?: string;
  hint?: string;
  progress?: string;
}

const tierBadge: Record<string, string> = {
  bronze: "bg-warn/10 text-warn/70",
  silver: "bg-foreground/5 text-foreground/50",
  gold: "bg-warn/15 text-warn",
};

export default function AchievementCard({
  name,
  description,
  category,
  tier,
  earned,
  earnedDate,
  hint,
  progress,
}: AchievementCardProps) {
  const isHidden = category === "hidden" && !earned;

  return (
    <div
      className={`rounded-xl p-4 transition-all duration-150 ${
        earned
          ? "bg-card ring-1 ring-accent/20"
          : "bg-card/50 opacity-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`text-lg ${earned ? "" : "grayscale opacity-40"}`}>
          {isHidden ? "\u2753" : earned ? "\u{1F3C6}" : "\u{1F512}"}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground truncate">
            {isHidden ? "???" : name}
          </h4>
          <p className="text-xs text-muted mt-0.5">
            {isHidden ? (hint || "Keep playing to discover...") : description}
          </p>
          {earned && earnedDate && (
            <p className="text-[11px] text-success mt-1.5">
              Unlocked {earnedDate}
            </p>
          )}
          {!earned && progress && (
            <p className="text-[11px] text-accent mt-1.5">{progress}</p>
          )}
        </div>
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            tierBadge[tier] || tierBadge.bronze
          }`}
        >
          {tier}
        </span>
      </div>
    </div>
  );
}
