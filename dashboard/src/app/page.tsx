import { loadPlayerState } from "@/lib/state";
import { loadSkillTree } from "@/lib/references";
import { calculateTopicProgress } from "@/lib/calculations";
import XPBar from "@/components/XPBar";
import StreakWidget from "@/components/StreakWidget";
import TopicCard from "@/components/TopicCard";
import DailyChallenge from "@/components/DailyChallenge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [playerState, skillTree] = await Promise.all([
    loadPlayerState(),
    loadSkillTree(),
  ]);

  const { player, progress, challenges, activity_log, stats } = playerState;

  const lockedCount = Object.values(skillTree.topics).filter(
    (def) => !def.starter
  ).length;

  const topicProgressList = Object.entries(skillTree.topics)
    .filter(([, def]) => def.starter)
    .map(([id, def]) => calculateTopicProgress(id, def, progress[id]));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted mt-0.5">
          Track your Web Security Academy progress
        </p>
      </div>

      {/* XP + Streak */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <XPBar totalXP={player.total_xp} />
        </div>
        <StreakWidget streak={player.streak} />
      </div>

      {/* Daily Challenge */}
      <DailyChallenge
        challenge={challenges.daily.challenge}
        completed={challenges.daily.completed}
      />

      {/* Topics */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-foreground">Topics</h2>
          <span className="text-xs text-muted">
            {lockedCount} locked
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topicProgressList.map((tp) => (
            <TopicCard
              key={tp.topic}
              name={tp.name}
              category={tp.category}
              completed={tp.completed}
              total={tp.total}
              percent={tp.percent}
            />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-sm font-medium text-foreground mb-3">
          Recent Activity
        </h2>
        <div className="bg-card rounded-2xl p-5">
          {activity_log.length > 0 ? (
            <div className="space-y-3">
              {activity_log
                .slice(-5)
                .reverse()
                .map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted text-xs">
                      {entry.date}
                    </span>
                    <span className="text-foreground text-xs flex-1 mx-4 truncate">
                      {entry.action}
                    </span>
                    <span className="text-success text-xs font-medium">
                      +{entry.xp} XP
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted text-center py-4">
              No activity yet. Head to Labs to get started.
            </p>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Labs", value: stats.total_labs, color: "text-accent" },
          { label: "Quizzes", value: stats.total_quizzes, color: "text-success" },
          { label: "Hints", value: stats.hints_used, color: "text-warn" },
          { label: "Badges", value: playerState.achievements.earned.length, color: "text-accent-light" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl p-4 text-center">
            <div className={`text-xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-xs text-muted mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
