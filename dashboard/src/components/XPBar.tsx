"use client";

import { getXPProgress, formatXP } from "@/lib/calculations";

interface XPBarProps {
  totalXP: number;
}

export default function XPBar({ totalXP }: XPBarProps) {
  const { current, next, progressPercent, xpInLevel, xpForLevel } =
    getXPProgress(totalXP);

  return (
    <div className="bg-card rounded-2xl p-5">
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">
            Lv.{current.level}
          </span>
          <span className="text-sm text-muted">
            {current.title}
          </span>
        </div>
        <span className="text-xs text-muted font-mono">
          {formatXP(totalXP)} XP
        </span>
      </div>

      <div className="w-full bg-subtle rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full animate-progress transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex justify-between mt-2">
        <span className="text-[11px] text-muted">
          {formatXP(xpInLevel)} / {formatXP(xpForLevel)}
        </span>
        {next ? (
          <span className="text-[11px] text-muted">
            Next: {next.title}
          </span>
        ) : (
          <span className="text-[11px] text-accent">MAX LEVEL</span>
        )}
      </div>
    </div>
  );
}
