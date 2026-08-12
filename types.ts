/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type HabitType = 'simple' | 'numeric' | 'timer';
export type FrequencyType = 'daily' | 'weekly' | 'specific';

export interface Subtask {
  id: string;
  name: string;
  reminderTime?: string; // e.g. "08:30"
  reminderEnabled?: boolean;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  type: HabitType;
  isTask: boolean; // true = one-time task, false = recurring habit
  emoji: string;
  color: string; // Tailwind color classes e.g. "emerald", "indigo", "rose", "amber", "cyan"
  category: string;
  frequency: FrequencyType;
  targetFrequencyDays?: number; // e.g., 3 times a week for 'weekly'
  frequencyDays?: number[]; // e.g. [1, 3, 5] (Monday, Wednesday, Friday) for 'specific'. 0 = Sunday, 1 = Monday etc.
  targetValue?: number; // for numeric e.g. 8 (glasses)
  unit?: string; // for numeric e.g. "glasses", "ml"
  targetMinutes?: number; // for timer e.g. 20 (minutes)
  order: number;
  subtasks: Subtask[];
  createdAt: string; // ISO string
  dueDate?: string; // for one-time tasks: YYYY-MM-DD
  isArchived: boolean;
}

export interface DailyLog {
  id: string; // e.g. "habitId_YYYY-MM-DD"
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  value?: number; // for numeric: current tracked total (e.g. 5)
  completedSubtasks: string[]; // list of completed subtask IDs for this day
}

export interface DayChallenge {
  id: string;
  name: string;
  description: string;
  startDate?: string; // YYYY-MM-DD when started, if active
  days: {
    dayNumber: number; // 1 to 30
    title: string;
    completed: boolean;
    dateCompleted?: string; // YYYY-MM-DD
  }[];
  category: string;
  emoji: string;
  color: string;
  isCustom?: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streaks' | 'completions' | 'coins' | 'habits' | 'special';
  requirementText: string;
}

export interface UserStats {
  coins: number;
  lastCheckInDate?: string; // YYYY-MM-DD
  unlockedBadges: string[]; // Badge ids
  userName: string;
  onboardingCompleted: boolean;
  pinCode?: string; // Optional 4-digit PIN lock
  customCategories: string[];
}

export interface AppSettings {
  appAccent: 'emerald' | 'indigo' | 'rose' | 'amber' | 'cyan';
  theme: 'light' | 'dark';
  muteSounds: boolean;
  weekStartMonday: boolean;
  requireAllSubtasksComplete: boolean;
}

export interface HabitFlowState {
  habits: Habit[];
  dailyLogs: { [logId: string]: DailyLog }; // Key is habitId_YYYY-MM-DD
  challenges: DayChallenge[];
  userStats: UserStats;
  settings: AppSettings;
}
