import React from 'react';
import { Habit, DailyLog, AppSettings } from '../types';

interface TodayViewProps {
  habits: Habit[];
  dailyLogs: { [key: string]: DailyLog };
  coins: number;
  userName: string;
  onUpdateLog: (log: DailyLog) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (id: string) => void;
  onDuplicateHabit: (habit: Habit) => void;
  onArchiveHabit: (id: string) => void;
  onCreateHabitClick: () => void;
  onEarnCoins: (amount: number) => void;
  settings: AppSettings;
  activeDate: string;
}

export default function TodayView({
  habits,
  dailyLogs,
  coins,
  userName,
  onUpdateLog,
  onEditHabit,
  onDeleteHabit,
  onDuplicateHabit,
  onArchiveHabit,
  onCreateHabitClick,
  onEarnCoins,
  settings,
  activeDate,
}: TodayViewProps) {
  return (
    <div className="space-y-4 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Today's Habits</h2>
        <p className="text-gray-400">Stay consistent and build momentum</p>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No habits yet. Create your first one!</p>
          <button
            onClick={onCreateHabitClick}
            className="px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            + New Habit
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="p-4 bg-slate-900 rounded-lg border border-slate-800"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{habit.emoji}</span>
                  <div>
                    <h3 className="font-bold">{habit.name}</h3>
                    <p className="text-xs text-gray-400">{habit.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditHabit(habit)}
                    className="px-3 py-1 text-sm bg-slate-800 rounded hover:bg-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteHabit(habit.id)}
                    className="px-3 py-1 text-sm bg-red-900 rounded hover:bg-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
