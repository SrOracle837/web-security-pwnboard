"use client";

import { useEffect, useState } from "react";
import { getXPProgress, getStreakMultiplier, formatXP, calculateTopicProgress } from "@/lib/calculations";
import { LabsPerWeekChart, TopicRadarChart } from "@/components/StatsChart";
import StreakCalendar from "@/components/StreakCalendar";
import type { PlayerState } from "@/lib/state";
import type { SkillTreeData } from "@/lib/references";

interface APIData {
  player: PlayerState;
  skillTree: SkillTreeData;
}

export default function StatsPage() {
  const [data, setData] = useState<APIData | null>(null);

  useEffect(() => { fetch("/api/state").then((r) => r.json()).then(setData); }, []);

  if (!data) return <div className="flex items-center justify-center h-full text-muted">Loading...</div>;

  const { player: playerState, skillTree } = data;
  const { player, stats, activity_log, achievements, quiz_state } = playerState;
  const multiplier = getStreakMultiplier(player.streak.current);

  const activeDays = new Set(activity_log.map((e) => e.date)).size;
  const avgXPPerDay = activeDays > 0 ? Math.round(player.total_xp / activeDays) : 0;

  const labsByDifficulty = { apprentice: 0, practitioner: 0, expert: 0 };
  const labsByDifficultyTotal = { apprentice: 0, practitioner: 0, expert: 0 };
  const labsByCategory: Record<string, { done: number; total: number }> = {};

  const topicProgressList = Object.entries(skillTree.topics).map(([id, def]) => {
    const prog = playerState.progress[id];
    const tp = calculateTopicProgress(id, def, prog);
    for (const diff of ["apprentice", "practitioner", "expert"] as const) {
      labsByDifficultyTotal[diff] += def.labs[diff];
      labsByDifficulty[diff] += prog?.[diff]?.completed?.length ?? 0;
    }
    if (!labsByCategory[def.category]) labsByCategory[def.category] = { done: 0, total: 0 };
    labsByCategory[def.category].done += tp.completed;
    labsByCategory[def.category].total += tp.total;
    return tp;
  });

  const totalLabsDone = Object.values(labsByDifficulty).reduce((a, b) => a + b, 0);
  const totalLabsAll = Object.values(labsByDifficultyTotal).reduce((a, b) => a + b, 0);
  const masteredQuestions = Object.values(quiz_state.questions).filter((q) => q.ef > 2.5).length;

  const diffBarColor: Record<string, string> = { apprentice: "bg-success", practitioner: "bg-accent", expert: "bg-danger" };
  const catBarColor: Record<string, string> = { "server-side": "bg-danger", "client-side": "bg-success", advanced: "bg-accent" };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Stats</h1>
        <p className="text-sm text-muted mt-0.5">Your learning analytics</p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total XP", value: formatXP(player.total_xp), color: "text-accent" },
          { label: "Level", value: `${player.level}`, color: "text-accent" },
          { label: "Labs", value: `${totalLabsDone}/${totalLabsAll}`, color: "text-success" },
          { label: "Days Active", value: `${activeDays}`, color: "text-success" },
          { label: "Avg XP/Day", value: `${avgXPPerDay}`, color: "text-warn" },
          { label: "Badges", value: `${achievements.earned.length}`, color: "text-accent-light" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl p-4 text-center">
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[11px] text-muted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl p-5">
          <p className="text-xs text-muted mb-4">Labs per Week</p>
          <LabsPerWeekChart activityLog={activity_log} />
        </div>
        <div className="bg-card rounded-2xl p-5">
          <p className="text-xs text-muted mb-4">Topic Mastery</p>
          <TopicRadarChart topics={topicProgressList} />
        </div>
      </div>

      <StreakCalendar activityLog={activity_log} />

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl p-5">
          <p className="text-xs text-muted mb-4">By Difficulty</p>
          {(["apprentice", "practitioner", "expert"] as const).map((d) => {
            const done = labsByDifficulty[d], total = labsByDifficultyTotal[d];
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div key={d} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground capitalize">{d}</span>
                  <span className="text-muted">{done}/{total} ({pct}%)</span>
                </div>
                <div className="w-full bg-subtle rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full ${diffBarColor[d]}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-card rounded-2xl p-5">
          <p className="text-xs text-muted mb-4">By Category</p>
          {Object.entries(labsByCategory).map(([cat, { done, total }]) => {
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div key={cat} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground capitalize">{cat.replace("-", " ")}</span>
                  <span className="text-muted">{done}/{total} ({pct}%)</span>
                </div>
                <div className="w-full bg-subtle rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full ${catBarColor[cat] || "bg-accent"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Streak + Quiz */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl p-5">
          <p className="text-xs text-muted mb-3">Streaks</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted">Current</span><span className="text-foreground">{player.streak.current}d</span></div>
            <div className="flex justify-between"><span className="text-muted">Longest</span><span className="text-foreground">{player.streak.longest}d</span></div>
            <div className="flex justify-between"><span className="text-muted">Multiplier</span><span className={multiplier > 1 ? "text-warn" : "text-foreground"}>{multiplier}x</span></div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5">
          <p className="text-xs text-muted mb-3">Quizzes</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted">Answered</span><span className="text-foreground">{stats.total_quizzes}</span></div>
            <div className="flex justify-between"><span className="text-muted">Mastered</span><span className="text-success">{masteredQuestions}</span></div>
            <div className="flex justify-between"><span className="text-muted">Hints Used</span><span className="text-warn">{stats.hints_used}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
