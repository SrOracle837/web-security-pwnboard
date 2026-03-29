// Types and loading for player state (player.json)

import { readFile, writeFile } from "fs/promises";
import path from "path";

export interface PlayerStreak {
  current: number;
  longest: number;
  last_active: string | null;
}

export interface DifficultyProgress {
  completed: string[];
  total: number;
}

export interface TopicProgressState {
  apprentice?: DifficultyProgress;
  practitioner?: DifficultyProgress;
  expert?: DifficultyProgress;
}

export interface Achievement {
  id: string;
  date: string;
}

export interface QuizQuestionState {
  ef: number;
  interval: number;
  reps: number;
  next_review: string | null;
  history: { date: string; quality: number }[];
}

export interface ChallengeState {
  date: string | null;
  challenge: string | null;
  completed: boolean;
}

export interface ActivityLogEntry {
  date: string;
  time: string;
  action: string;
  xp: number;
}

export interface PlayerState {
  version: string;
  created_at: string;
  player: {
    level: number;
    title: string;
    total_xp: number;
    streak: PlayerStreak;
  };
  progress: Record<string, TopicProgressState>;
  achievements: {
    earned: Achievement[];
    hidden_progress: Record<string, unknown>;
  };
  quiz_state: {
    questions: Record<string, QuizQuestionState>;
  };
  challenges: {
    daily: ChallengeState;
    weekly: ChallengeState;
    daily_history: { completed_count: number };
    weekly_history: { completed_count: number };
  };
  hints_used_per_lab: Record<string, number>;
  labs_without_hints: number;
  activity_log: ActivityLogEntry[];
  stats: {
    total_labs: number;
    total_quizzes: number;
    hints_used: number;
    sessions: number;
    first_quiz_taken: boolean;
  };
}

const STATE_PATH = path.join(process.cwd(), "..", "state", "player.json");

export async function loadPlayerState(): Promise<PlayerState> {
  const raw = await readFile(STATE_PATH, "utf-8");
  return JSON.parse(raw) as PlayerState;
}

export async function savePlayerState(state: PlayerState): Promise<void> {
  await writeFile(STATE_PATH, JSON.stringify(state, null, 2), "utf-8");
}
