"use client";

import type { ActivityLogEntry } from "@/lib/state";

interface StreakCalendarProps {
  activityLog: ActivityLogEntry[];
}

export default function StreakCalendar({ activityLog }: StreakCalendarProps) {
  const activeDates = new Set(activityLog.map((e) => e.date));

  const today = new Date();
  const days: { date: string; active: boolean; dayOfWeek: number }[] = [];

  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({
      date: dateStr,
      active: activeDates.has(dateStr),
      dayOfWeek: d.getDay(),
    });
  }

  const weeks: typeof days[] = [];
  let currentWeek: typeof days = [];
  for (const day of days) {
    currentWeek.push(day);
    if (day.dayOfWeek === 6) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  return (
    <div className="bg-card rounded-2xl p-5">
      <p className="text-xs text-muted mb-4">Activity</p>
      <div className="flex gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}${day.active ? " — Active" : ""}`}
                className={`w-3 h-3 rounded-[3px] transition-colors ${
                  day.active
                    ? "bg-accent/70 hover:bg-accent"
                    : "bg-subtle hover:bg-border"
                }`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-3">
        <span className="text-[10px] text-muted">Less</span>
        <div className="w-3 h-3 rounded-[3px] bg-subtle" />
        <div className="w-3 h-3 rounded-[3px] bg-accent/25" />
        <div className="w-3 h-3 rounded-[3px] bg-accent/50" />
        <div className="w-3 h-3 rounded-[3px] bg-accent" />
        <span className="text-[10px] text-muted">More</span>
      </div>
    </div>
  );
}
