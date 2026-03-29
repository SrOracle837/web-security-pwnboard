// Game engine — all state mutation logic lives here
// Called by API routes to process actions and update player.json

import { type PlayerState } from "./state";
import { getLevelForXP, getStreakMultiplier, LEVELS } from "./calculations";
import type { SkillTreeData, AchievementsData, LabDefinition } from "./references";

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function now(): string {
  return new Date().toTimeString().slice(0, 5);
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

/** Update streak based on last_active date */
function updateStreak(state: PlayerState): void {
  const t = today();
  const last = state.player.streak.last_active;

  if (last === t) return; // already active today

  if (last === yesterday()) {
    state.player.streak.current += 1;
  } else {
    state.player.streak.current = 1;
  }

  if (state.player.streak.current > state.player.streak.longest) {
    state.player.streak.longest = state.player.streak.current;
  }
  state.player.streak.last_active = t;
}

/** Recalculate level from XP */
function recalcLevel(state: PlayerState): { leveled: boolean; newLevel: number; newTitle: string } {
  const info = getLevelForXP(state.player.total_xp);
  const leveled = info.level > state.player.level;
  state.player.level = info.level;
  state.player.title = info.title;
  return { leveled, newLevel: info.level, newTitle: info.title };
}

/** Add an activity log entry (capped at 100) */
function logActivity(state: PlayerState, action: string, xp: number): void {
  state.activity_log.push({ date: today(), time: now(), action, xp });
  if (state.activity_log.length > 100) {
    state.activity_log = state.activity_log.slice(-100);
  }
}

/** Check all achievement criteria and award any newly earned */
function checkAchievements(
  state: PlayerState,
  achievementsDef: AchievementsData,
  skillTree: SkillTreeData
): string[] {
  const earnedIds = new Set(state.achievements.earned.map((a) => a.id));
  const newlyEarned: string[] = [];

  for (const ach of achievementsDef.achievements) {
    if (earnedIds.has(ach.id)) continue;

    let earned = false;
    const c = ach.criteria as Record<string, unknown>;

    switch (c.type) {
      case "total_labs":
        earned = state.stats.total_labs >= (c.count as number);
        break;
      case "min_level":
        earned = state.player.level >= (c.level as number);
        break;
      case "streak":
        earned = state.player.streak.current >= (c.days as number);
        break;
      case "labs_without_hints":
        earned = state.labs_without_hints >= (c.count as number);
        break;
      case "labs_in_one_day": {
        const todayLabs = state.activity_log.filter(
          (e) => e.date === today() && e.action.startsWith("Completed lab:")
        ).length;
        earned = todayLabs >= (c.count as number);
        break;
      }
      case "topics_with_labs": {
        const topicsWithProgress = Object.values(state.progress).filter((tp) => {
          const total =
            (tp.apprentice?.completed?.length ?? 0) +
            (tp.practitioner?.completed?.length ?? 0) +
            (tp.expert?.completed?.length ?? 0);
          return total > 0;
        }).length;
        earned = topicsWithProgress >= (c.count as number);
        break;
      }
      case "topic_mastery": {
        const topicId = c.topic as string;
        const topicDef = skillTree.topics[topicId];
        const prog = state.progress[topicId];
        if (topicDef && prog) {
          const appDone = prog.apprentice?.completed?.length ?? 0;
          const pracDone = prog.practitioner?.completed?.length ?? 0;
          earned =
            appDone >= topicDef.labs.apprentice &&
            pracDone >= topicDef.labs.practitioner;
        }
        break;
      }
      case "expert_lab_complete":
        earned = Object.values(state.progress).some(
          (tp) => (tp.expert?.completed?.length ?? 0) > 0
        );
        break;
      case "dailies_completed":
        earned = state.challenges.daily_history.completed_count >= (c.count as number);
        break;
      case "weeklies_completed":
        earned = state.challenges.weekly_history.completed_count >= (c.count as number);
        break;
      case "lab_after_hour": {
        const hour = new Date().getHours();
        earned = hour >= (c.hour as number);
        break;
      }
      case "weekend_labs": {
        const dow = new Date().getDay();
        const recentDates = state.activity_log.slice(-20).map((e) => e.date);
        if (dow === 0) {
          // Sunday — check if Saturday also had a lab
          const sat = yesterday();
          earned = recentDates.includes(sat) && recentDates.includes(today());
        }
        break;
      }
      case "return_after_gap": {
        const last = state.player.streak.last_active;
        if (last && state.player.streak.current === 1) {
          const gap =
            (new Date(today()).getTime() - new Date(last).getTime()) /
            (1000 * 60 * 60 * 24);
          earned = gap >= (c.days as number);
        }
        break;
      }
      case "all_labs_complete": {
        const totalLabs = Object.values(skillTree.topics).reduce(
          (sum, t) => sum + t.labs.apprentice + t.labs.practitioner + t.labs.expert,
          0
        );
        earned = state.stats.total_labs >= totalLabs;
        break;
      }
      case "perfect_quiz":
        // Checked at quiz submission time, not here
        break;
      case "first_quiz_perfect":
        // Checked at quiz submission time, not here
        break;
    }

    if (earned) {
      state.achievements.earned.push({ id: ach.id, date: today() });
      newlyEarned.push(ach.id);

      // Award XP for the achievement
      const tierXP: Record<string, number> = { bronze: 50, silver: 100, gold: 200 };
      const bonusXP = tierXP[ach.tier] ?? 50;
      state.player.total_xp += bonusXP;
    }
  }

  return newlyEarned;
}

export interface LogLabResult {
  success: boolean;
  alreadyCompleted?: boolean;
  labNotFound?: boolean;
  xpEarned: number;
  streakMultiplier: number;
  baseXP: number;
  newAchievements: string[];
  leveledUp: boolean;
  newLevel?: number;
  newTitle?: string;
  topicCompleted: number;
  topicTotal: number;
}

export function logLab(
  state: PlayerState,
  labId: string,
  lab: LabDefinition,
  skillTree: SkillTreeData,
  achievementsDef: AchievementsData
): LogLabResult {
  const topicId = lab.topic;
  const difficulty = lab.difficulty as "apprentice" | "practitioner" | "expert";

  // Initialize topic progress if needed
  if (!state.progress[topicId]) {
    const topicDef = skillTree.topics[topicId];
    state.progress[topicId] = {
      apprentice: { completed: [], total: topicDef?.labs.apprentice ?? 0 },
      practitioner: { completed: [], total: topicDef?.labs.practitioner ?? 0 },
      expert: { completed: [], total: topicDef?.labs.expert ?? 0 },
    };
  }

  const topicProg = state.progress[topicId];
  if (!topicProg[difficulty]) {
    topicProg[difficulty] = { completed: [], total: 0 };
  }

  // Check if already completed
  if (topicProg[difficulty]!.completed.includes(labId)) {
    return {
      success: false,
      alreadyCompleted: true,
      xpEarned: 0,
      streakMultiplier: 1,
      baseXP: 0,
      newAchievements: [],
      leveledUp: false,
      topicCompleted: 0,
      topicTotal: 0,
    };
  }

  // Update streak
  updateStreak(state);

  // Calculate XP
  const baseXP = difficulty === "expert" ? 500 : difficulty === "practitioner" ? 250 : 100;
  const multiplier = getStreakMultiplier(state.player.streak.current);
  const finalXP = Math.round(baseXP * multiplier);

  // Apply changes
  topicProg[difficulty]!.completed.push(labId);
  state.player.total_xp += finalXP;
  state.stats.total_labs += 1;

  // Track hint-free labs
  if (!state.hints_used_per_lab[labId]) {
    state.labs_without_hints += 1;
  }

  // Log activity
  logActivity(state, `Completed lab: ${lab.title.slice(0, 50)}`, finalXP);

  // Recalc level
  const { leveled, newLevel, newTitle } = recalcLevel(state);

  // Check achievements
  const newAchievements = checkAchievements(state, achievementsDef, skillTree);
  if (newAchievements.length > 0) {
    recalcLevel(state); // re-check after achievement XP
  }

  // Topic totals
  const topicDef = skillTree.topics[topicId];
  const topicCompleted =
    (topicProg.apprentice?.completed?.length ?? 0) +
    (topicProg.practitioner?.completed?.length ?? 0) +
    (topicProg.expert?.completed?.length ?? 0);
  const topicTotal = topicDef
    ? topicDef.labs.apprentice + topicDef.labs.practitioner + topicDef.labs.expert
    : 0;

  return {
    success: true,
    xpEarned: finalXP,
    streakMultiplier: multiplier,
    baseXP,
    newAchievements,
    leveledUp: leveled,
    newLevel: leveled ? newLevel : undefined,
    newTitle: leveled ? newTitle : undefined,
    topicCompleted,
    topicTotal,
  };
}

export interface QuizSubmitResult {
  correct: boolean;
  xpEarned: number;
  newAchievements: string[];
}

export function submitQuizAnswer(
  state: PlayerState,
  questionId: string,
  quality: number, // 0-5 SM-2 scale
  skillTree: SkillTreeData,
  achievementsDef: AchievementsData
): QuizSubmitResult {
  updateStreak(state);

  // Initialize SM-2 state for question if needed
  if (!state.quiz_state.questions[questionId]) {
    state.quiz_state.questions[questionId] = {
      ef: 2.5,
      interval: 1,
      reps: 0,
      next_review: null,
      history: [],
    };
  }

  const q = state.quiz_state.questions[questionId];
  q.history.push({ date: today(), quality });

  const correct = quality >= 3;
  let xpEarned = 0;

  if (correct) {
    xpEarned = 25;
    state.player.total_xp += xpEarned;

    if (q.reps === 0) q.interval = 1;
    else if (q.reps === 1) q.interval = 6;
    else q.interval = Math.round(q.interval * q.ef);
    q.reps += 1;
  } else {
    q.reps = 0;
    q.interval = 1;
  }

  // Update easiness factor
  q.ef = q.ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  q.ef = Math.max(1.3, q.ef);
  q.next_review = addDays(today(), q.interval);

  if (correct) {
    logActivity(state, `Quiz correct: ${questionId}`, xpEarned);
  }

  state.stats.total_quizzes += 1;
  recalcLevel(state);

  const newAchievements = checkAchievements(state, achievementsDef, skillTree);

  return { correct, xpEarned, newAchievements };
}
