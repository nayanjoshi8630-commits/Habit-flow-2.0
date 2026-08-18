import React from 'react';
import { Habit, DailyLog } from '../types';

interface CalendarViewProps {
  habits: Habit[];
  dailyLogs: { [key: string]: DailyLog };
  activeDate: string;
  onSelectDate: (dateStr: string) => void;
  weekStartMonday?: boolean;
}

export default function CalendarView({
  habits,
  dailyLogs,
  activeDate,
  onSelectDate,
  weekStartMonday,
}: CalendarViewProps) {
  return (
    <div className="space-y-4 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Calendar</h2>
        <p className="text-gray-400">View your habit history</p>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-bold text-gray-400">
            {day}
          </div>
        ))}

        {Array.from({ length: 35 }).map((_, idx) => {
          const date = new Date();
          date.setDate(date.getDate() - (new Date().getDate() - 1 - idx));
          const dateStr = date.toISOString().split('T')[0];
          const isActive = dateStr === activeDate;

          return (
            <button
              key={idx}
              onClick={() => onSelectDate(dateStr)}
              className={`p-2 rounded text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
