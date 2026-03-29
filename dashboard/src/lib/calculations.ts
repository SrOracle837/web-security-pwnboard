// XP, level, and streak calculation utilities
// Shared logic between the dashboard and the Claude Code skill

export interface LevelInfo {
  level: number;
  title: string;
  xp_required: number;
}

export const LEVELS: LevelInfo[] = [
  { level: 1, title: "Script Kiddie", xp_required: 0 },
  { level: 2, title: "Curious Hacker", xp_required: 200 },
  { level: 3, title: "Bug Hunter", xp_required: 600 },
  { level: 4, title: "Vulnerability Scout", xp_required: 1200 },
  { level: 5, title: "Exploit Apprentice", xp_required: 2000 },
  { level: 6, title: "Payload Crafter", xp_required: 3200 },
  { level: 7, title: "Attack Vectorist", xp_required: 4800 },
  { level: 8, title: "Security Analyst", xp_required: 7000 },
  { level: 9, title: "Penetration Tester", xp_required: 10000 },
  { level: 10, title: "Red Team Operator", xp_required: 14000 },
  { level: 11, title: "Exploit Developer", xp_required: 19000 },
  { level: 12, title: "Security Researcher", xp_required: 25000 },
  { level: 13, title: "Zero-Day Hunter", xp_required: 32000 },
  { level: 14, title: "Pentest Master", xp_required: 40000 },
  { level: 15, title: "Pentest Legend", xp_required: 50000 },
];

export function getLevelForXP(xp: number): LevelInfo {
  let result = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.xp_required) {
      result = level;
    } else {
      break;
    }
  }
  return result;
}

export function getNextLevel(currentLevel: number): LevelInfo | null {
  const idx = LEVELS.findIndex((l) => l.level === currentLevel);
  if (idx < 0 || idx >= LEVELS.length - 1) return null;
  return LEVELS[idx + 1];
}

export function getXPProgress(totalXP: number): {
  current: LevelInfo;
  next: LevelInfo | null;
  progressPercent: number;
  xpInLevel: number;
  xpForLevel: number;
} {
  const current = getLevelForXP(totalXP);
  const next = getNextLevel(current.level);
  if (!next) {
    return { current, next: null, progressPercent: 100, xpInLevel: 0, xpForLevel: 0 };
  }
  const xpInLevel = totalXP - current.xp_required;
  const xpForLevel = next.xp_required - current.xp_required;
  const progressPercent = Math.min(100, Math.round((xpInLevel / xpForLevel) * 100));
  return { current, next, progressPercent, xpInLevel, xpForLevel };
}

export function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 2.0;
  if (streakDays >= 14) return 1.75;
  if (streakDays >= 7) return 1.5;
  if (streakDays >= 3) return 1.2;
  return 1.0;
}

export function formatXP(xp: number): string {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}k`;
  }
  return xp.toString();
}

export interface TopicProgress {
  topic: string;
  name: string;
  category: string;
  completed: number;
  total: number;
  percent: number;
}

export function calculateTopicProgress(
  topicId: string,
  topicDef: { name: string; category: string; labs: { apprentice: number; practitioner: number; expert: number } },
  progress: { apprentice?: { completed: string[] }; practitioner?: { completed: string[] }; expert?: { completed: string[] } } | undefined
): TopicProgress {
  const total = topicDef.labs.apprentice + topicDef.labs.practitioner + topicDef.labs.expert;
  const completed =
    (progress?.apprentice?.completed?.length ?? 0) +
    (progress?.practitioner?.completed?.length ?? 0) +
    (progress?.expert?.completed?.length ?? 0);
  return {
    topic: topicId,
    name: topicDef.name,
    category: topicDef.category,
    completed,
    total,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}
