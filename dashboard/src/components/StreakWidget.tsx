"use client";

import { getStreakMultiplier } from "@/lib/calculations";
import type { PlayerStreak } from "@/lib/state";

interface StreakWidgetProps {
  streak: PlayerStreak;
}

export default function StreakWidget({ streak }: StreakWidgetProps) {
  const multiplier = getStreakMultiplier(streak.current);
  const isActive = streak.current > 0;

  return (
    <div className="bg-card rounded-2xl p-5">
      <p className="text-xs text-muted mb-3">Streak</p>
      <div className="flex items-center gap-3">
        <span className={`text-2xl ${isActive ? "" : "opacity-30"}`}>
          {isActive ? "\u{1F525}" : "\u2744\uFE0F"}
        </span>
        <div>
          <p className="text-xl font-bold text-foreground">
            {streak.current}{" "}
            <span className="text-sm font-normal text-muted">
              day{streak.current !== 1 ? "s" : ""}
            </span>
          </p>
          <p className="text-[11px] text-muted">
            Best: {streak.longest}d
          </p>
        </div>
        {multiplier > 1 && (
          <div className="ml-auto bg-warn/10 text-warn text-xs font-semibold px-2.5 py-1 rounded-full">
            {multiplier}x
          </div>
        )}
      </div>
    </div>
  );
}
