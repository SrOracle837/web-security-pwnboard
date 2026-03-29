// Load and parse YAML reference files

import { readFile } from "fs/promises";
import path from "path";
import YAML from "yaml";

const REFS_DIR = path.join(process.cwd(), "..", "references");

export interface TopicDefinition {
  name: string;
  category: string;
  starter: boolean;
  description: string;
  labs: { apprentice: number; practitioner: number; expert: number };
  prerequisites?: { topic: string; min_apprentice: number }[];
  prerequisite_mode?: string;
  min_level?: number;
}

export interface SkillTreeData {
  categories: Record<string, { label: string; color: string }>;
  topics: Record<string, TopicDefinition>;
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: string;
  icon: string;
  hint?: string;
  criteria: Record<string, unknown>;
}

export interface AchievementsData {
  achievements: AchievementDefinition[];
}

export interface LabDefinition {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  url?: string;
}

export interface LabCatalogData {
  labs: LabDefinition[];
}

export interface XPTablesData {
  xp_rewards: Record<string, unknown>;
  streak_multipliers: { min_days: number; max_days: number; multiplier: number }[];
  levels: { level: number; title: string; xp_required: number }[];
  gates: { practitioner_unlock_level: number; expert_unlock_level: number };
  hint_costs: { first_hint: number; subsequent: number };
}

async function loadYAML<T>(filename: string): Promise<T> {
  const raw = await readFile(path.join(REFS_DIR, filename), "utf-8");
  return YAML.parse(raw) as T;
}

export async function loadSkillTree(): Promise<SkillTreeData> {
  return loadYAML<SkillTreeData>("skill-tree.yaml");
}

export async function loadAchievements(): Promise<AchievementsData> {
  return loadYAML<AchievementsData>("achievements.yaml");
}

export async function loadLabCatalog(): Promise<LabCatalogData> {
  return loadYAML<LabCatalogData>("lab-catalog.yaml");
}

export async function loadXPTables(): Promise<XPTablesData> {
  return loadYAML<XPTablesData>("xp-tables.yaml");
}

export interface QuizQuestion {
  id: string;
  topic: string;
  type: string;
  difficulty: string;
  question: string;
  options?: { [key: string]: string }[];
  answer: string;
  explanation: string;
}

export interface QuizBankData {
  questions: QuizQuestion[];
}

export async function loadQuizBank(): Promise<QuizBankData> {
  return loadYAML<QuizBankData>("quiz-bank.yaml");
}
