import { loadPlayerState } from "@/lib/state";
import { loadAchievements } from "@/lib/references";
import AchievementCard from "@/components/AchievementCard";

export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  const [playerState, achievementsDef] = await Promise.all([
    loadPlayerState(),
    loadAchievements(),
  ]);

  const earnedIds = new Set(playerState.achievements.earned.map((a) => a.id));
  const earnedMap = new Map(playerState.achievements.earned.map((a) => [a.id, a.date]));

  const categories = [
    { key: "progression", label: "Progression" },
    { key: "streaks", label: "Streaks" },
    { key: "style", label: "Style" },
    { key: "topic-mastery", label: "Topic Mastery" },
    { key: "hidden", label: "Hidden" },
  ];

  const totalEarned = playerState.achievements.earned.length;
  const totalAchievements = achievementsDef.achievements.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Achievements</h1>
          <p className="text-sm text-muted mt-0.5">
            {totalEarned} of {totalAchievements} unlocked
          </p>
        </div>
      </div>

      <div className="w-full bg-subtle rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent to-warn rounded-full animate-progress"
          style={{ width: `${Math.round((totalEarned / totalAchievements) * 100)}%` }}
        />
      </div>

      {categories.map((cat) => {
        const badges = achievementsDef.achievements.filter((a) => a.category === cat.key);
        if (badges.length === 0) return null;

        return (
          <div key={cat.key}>
            <h2 className="text-sm font-medium text-muted mb-3">{cat.label}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {badges.map((badge) => (
                <AchievementCard
                  key={badge.id}
                  name={badge.name}
                  description={badge.description}
                  category={badge.category}
                  tier={badge.tier}
                  earned={earnedIds.has(badge.id)}
                  earnedDate={earnedMap.get(badge.id)}
                  hint={badge.hint}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
