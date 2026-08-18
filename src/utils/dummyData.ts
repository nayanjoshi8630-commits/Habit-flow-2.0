import { UserStats, AppSettings, DayChallenge } from '../types';

export interface HabitTemplate {
  name: string;
  description: string;
  type: string;
  emoji: string;
  color: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'specific';
  targetFrequencyDays?: number;
  frequencyDays?: number[];
  subtaskNames: string[];
  targetValue?: number;
  unit?: string;
  targetMinutes?: number;
}

export const INITIAL_USER_STATS: UserStats = {
  onboardingCompleted: false,
  userName: '',
  coins: 0,
  customCategories: [],
};

export const INITIAL_SETTINGS: AppSettings = {
  appAccent: 'indigo',
  weekStartMonday: false,
  muteSounds: false,
  requireAllSubtasksComplete: false,
};

export const PRESET_CHALLENGES: DayChallenge[] = [];

export const COLOR_ACCENTS = [
  { name: 'emerald', text: 'text-emerald-400' },
  { name: 'indigo', text: 'text-indigo-400' },
  { name: 'rose', text: 'text-rose-400' },
  { name: 'amber', text: 'text-amber-400' },
  { name: 'cyan', text: 'text-cyan-400' },
];

export const HABIT_TEMPLATES: HabitTemplate[] = [];
