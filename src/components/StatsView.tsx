import React from 'react';
import { Habit, DailyLog } from '../types';

interface StatsViewProps {
  habits: Habit[];
  dailyLogs: { [key: string]: DailyLog };
}

export default function StatsView({ habits, dailyLogs }: StatsViewProps) {
  const completedCount = Object.values(dailyLogs).filter(
    (log) => log.completed
  ).length;
  const totalCount = Object.keys(dailyLogs).length;

  return (
    <div className="space-y-4 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Statistics</h2>
        <p className="text-gray-400">Track your progress</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 text-center">
          <div className="text-3xl font-bold text-indigo-400">{habits.length}</div>
          <div className="text-sm text-gray-400">Active Habits</div>
        </div>

        <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 text-center">
          <div className="text-3xl font-bold text-emerald-400">
            {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-400">Completion Rate</div>
        </div>

        <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 text-center">
          <div className="text-3xl font-bold text-amber-400">{totalCount}</div>
          <div className="text-sm text-gray-400">Total Logs</div>
        </div>

        <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 text-center">
          <div className="text-3xl font-bold text-rose-400">{completedCount}</div>
          <div className="text-sm text-gray-400">Completed</div>
        </div>
      </div>
    </div>
  );
}
