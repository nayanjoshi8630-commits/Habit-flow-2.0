export interface HabitFlowState {
  habits: Habit[];
  dailyLogs: { [key: string]: DailyLog };
  challenges: DayChallenge[];
  userStats: UserStats;
  settings: AppSettings;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  type: string;
  isTask: boolean;
  emoji: string;
  color: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'specific';
  targetFrequencyDays?: number;
  frequencyDays?: number[];
  targetValue?: number;
  unit?: string;
  targetMinutes?: number;
  order: number;
  subtasks: Subtask[];
  createdAt: string;
  isArchived: boolean;
  dueDate?: string;
}

export interface Subtask {
  id: string;
  name: string;
  reminderEnabled?: boolean;
  reminderTime?: string;
}

export interface DailyLog {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  value: number;
  completedSubtasks: string[];
}

export interface DayChallenge {
  id: string;
  [key: string]: any;
}

export interface UserStats {
  onboardingCompleted: boolean;
  userName: string;
  coins: number;
  lastCheckInDate?: string;
  customCategories: string[];
  pinCode?: string;
}

export interface AppSettings {
  appAccent: 'emerald' | 'indigo' | 'rose' | 'amber' | 'cyan';
  weekStartMonday?: boolean;
  muteSounds?: boolean;
  requireAllSubtasksComplete?: boolean;
}
