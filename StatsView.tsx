/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BarChart3, LineChart, Award, Flame, CheckSquare, Sparkles, TrendingUp, ChevronRight, Activity, Zap } from 'lucide-react';
import { Habit, DailyLog } from '../types';
import { COLOR_ACCENTS, BADGES } from '../utils/dummyData';

interface StatsViewProps {
  habits: Habit[];
  dailyLogs: { [logId: string]: DailyLog };
}

export default function StatsView({ habits, dailyLogs }: StatsViewProps) {
  const [selectedHabitId, setSelectedHabitId] = useState<string>(
    habits.length > 0 ? habits[0].id : ''
  );

  // Auto select first habit if selection is blank but habits exist
  if (!selectedHabitId && habits.length > 0) {
    setSelectedHabitId(habits[0].id);
  }

  // 1. General Metrics Calcs
  const logsList = Object.values(dailyLogs);
  const totalAllTimeCompletions = logsList.filter((log) => log.completed).length;

  // Streak calculations helper
  const calculateHabitStreaks = (habitId: string) => {
    // Collect all completed dates YYYY-MM-DD for this habit
    const completedDates = logsList
      .filter((log) => log.habitId === habitId && log.completed)
      .map((log) => log.date)
      .sort();

    if (completedDates.length === 0) return { current: 0, best: 0 };

    let bestStreak = 0;
    let tempStreak = 0;
    let currentStreak = 0;

    const parseLocalDate = (dateStr: string) => {
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(y, m - 1, d);
    };

    const isConsecutiveStr = (dateStrPrev: string, dateStrNext: string) => {
      const prev = parseLocalDate(dateStrPrev);
      const next = parseLocalDate(dateStrNext);
      const diffTime = Math.abs(next.getTime() - prev.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays === 1;
    };

    // Calculate best streak
    if (completedDates.length > 0) {
      tempStreak = 1;
      bestStreak = 1;
      for (let i = 1; i < completedDates.length; i++) {
        if (isConsecutiveStr(completedDates[i - 1], completedDates[i])) {
          tempStreak++;
        } else if (completedDates[i - 1] !== completedDates[i]) {
          tempStreak = 1;
        }
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
      }
    }

    // Calculate current streak relative to today
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const hasToday = completedDates.includes(todayStr);
    const hasYesterday = completedDates.includes(yesterdayStr);

    if (hasToday || hasYesterday) {
      // Find starting point backwards
      const reverseCompleted = [...new Set(completedDates)].reverse();
      let lastCheckedDate = hasToday ? todayStr : yesterdayStr;
      currentStreak = 1;

      // Start counting backwards
      let currIdx = reverseCompleted.indexOf(lastCheckedDate);
      if (currIdx !== -1) {
        for (let j = currIdx + 1; j < reverseCompleted.length; j++) {
          if (isConsecutiveStr(reverseCompleted[j], reverseCompleted[j - 1])) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    } else {
      currentStreak = 0;
    }

    return { current: currentStreak, best: bestStreak };
  };

  // Find globally longest streak across all habits
  let globalBestStreak = 0;
  let globalCurrentStreak = 0;
  habits.forEach((h) => {
    const { current, best } = calculateHabitStreaks(h.id);
    if (best > globalBestStreak) globalBestStreak = best;
    if (current > globalCurrentStreak) globalCurrentStreak = current;
  });

  // Calculate generic index for weekly completions rate (last 7 days completed vs. scheduled)
  const calculateRecentCompletionsRate = () => {
    let scheduledCount = 0;
    let completedCount = 0;

    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      const dow = d.getDay();

      habits.forEach((h) => {
        if (h.isArchived) return;
        
        let isActive = false;
        if (h.isTask) {
          isActive = h.dueDate === dStr;
        } else {
          if (h.frequency === 'daily') isActive = true;
          else if (h.frequency === 'specific') isActive = h.frequencyDays?.includes(dow) ?? false;
          else isActive = true; // weekly
        }

        if (isActive) {
          scheduledCount++;
          const logId = `${h.id}_${dStr}`;
          if (dailyLogs[logId]?.completed) {
            completedCount++;
          }
        }
      });
    }

    return scheduledCount === 0 ? 0 : Math.round((completedCount / scheduledCount) * 100);
  };

  const recentRate = calculateRecentCompletionsRate();

  // Habit Deep Dive metrics
  const selectedHabit = habits.find((h) => h.id === selectedHabitId);
  const selectedStreak = selectedHabit ? calculateHabitStreaks(selectedHabit.id) : { current: 0, best: 0 };

  const getPercentageForHabit = (habitId: string) => {
    const h = habits.find((item) => item.id === habitId);
    if (!h) return 0;

    // Filter logs belonging to this habit
    const hLogs = logsList.filter((log) => log.habitId === habitId);
    if (hLogs.length === 0) return 0;

    const completedCount = hLogs.filter((log) => log.completed).length;
    return Math.round((completedCount / hLogs.length) * 100);
  };

  const selectedAvgPercent = selectedHabit ? getPercentageForHabit(selectedHabit.id) : 0;
  const selectedTotalDone = selectedHabit ? logsList.filter((l) => l.habitId === selectedHabit.id && l.completed).length : 0;

  // Chart plotting helper values: Last 7 active days logic data
  const getChartData = () => {
    if (!selectedHabit) return [];
    
    const list = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      const log = dailyLogs[`${selectedHabit.id}_${dStr}`];
      
      const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });
      let progressVal = 0;

      if (log) {
        if (selectedHabit.type === 'numeric') {
          // Fraction completed
          const target = selectedHabit.targetValue || 1;
          progressVal = Math.min(100, Math.round(((log.value || 0) / target) * 100));
        } else {
          progressVal = log.completed ? 100 : 0;
        }
      }

      list.push({
        label: dayName,
        value: progressVal,
        numValue: log?.value ?? (log?.completed ? 1 : 0),
      });
    }
    return list;
  };

  const chartData = getChartData();
  const accentClass = selectedHabit ? (COLOR_ACCENTS.find((a) => a.name === selectedHabit.color) || COLOR_ACCENTS[1]) : COLOR_ACCENTS[1];

  return (
    <div id="stats-dashboard-view" className="flex flex-col gap-5 px-4 md:px-0 mt-2 mb-10 overflow-x-hidden">
      
      {/* Bento Grid Metrics overview panels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">All-Time Completed</span>
            <CheckSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-2xl font-black text-white">{totalAllTimeCompletions}</span>
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-tight">Activities logged</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Weekly Success</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-2xl font-black text-white">{recentRate}%</span>
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-tight">Completion rate</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Best Streak</span>
            <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
          </div>
          <div>
            <span className="text-2xl font-black text-white">{globalBestStreak}</span>
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-tight">Days in a row</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Current Streak</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <span className="text-2xl font-black text-white">{globalCurrentStreak}</span>
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-tight">Keep fire burning!</span>
          </div>
        </div>
      </div>

      {/* Routine list selection & Deep focus analysis */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col gap-4">
        <h3 className="text-xs uppercase font-extrabold text-slate-200 tracking-widest flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" /> Routine Deep-Focus Analysis
        </h3>
        
        {habits.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 uppercase font-bold bg-slate-950/20 rounded-2xl border border-dashed border-slate-850">
            Set up active and scheduled habits to review detailed stats!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Habits selector */}
            <div className="flex flex-col gap-1.5 bg-slate-950 p-4 rounded-2xl border border-slate-850">
              <label htmlFor="deepview-habit-selector" className="text-[10px] uppercase font-black text-indigo-400 tracking-wider">Select habit to inspect:</label>
              <select
                id="deepview-habit-selector"
                value={selectedHabitId}
                onChange={(e) => setSelectedHabitId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 outline-none"
              >
                {habits.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.emoji} {h.name} {!h.isTask ? '🔄' : '📅'}
                  </option>
                ))}
              </select>
            </div>

            {selectedHabit && (
              <div id="habit-deepview-details" className="flex flex-col gap-4">
                {/* Visual stats mini board */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3.5 bg-slate-950 rounded-2xl text-center border border-slate-850">
                    <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block">Longest Spark</span>
                    <span className="text-lg font-black text-white block mt-1">🔥 {selectedStreak.best}</span>
                    <span className="text-[8px] text-slate-500 font-bold block uppercase mt-0.5">Consecutive</span>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-2xl text-center border border-slate-850">
                    <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block">Avg Completeness</span>
                    <span className="text-lg font-black text-white block mt-1">📈 {selectedAvgPercent}%</span>
                    <span className="text-[8px] text-slate-500 font-bold block uppercase mt-0.5">Checked logs</span>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-2xl text-center border border-slate-850">
                    <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block">Grand Total</span>
                    <span className="text-lg font-black text-white block mt-1">✨ {selectedTotalDone}</span>
                    <span className="text-[8px] text-slate-500 font-bold block uppercase mt-0.5">completions</span>
                  </div>
                </div>

                {/* SVG Line / Area chart */}
                <div className="flex flex-col gap-2.5 bg-slate-950 rounded-3xl p-4.5 border border-slate-850">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">7-Day Completion Progression (%)</span>
                  
                  {/* Clean SVG graph */}
                  <div className="relative h-44 w-full mt-2 flex items-end">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Grid guidelines */}
                      <line x1="0" y1="20" x2="100" y2="20" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="0" y1="50" x2="100" y2="50" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="0" y1="80" x2="100" y2="80" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />

                      {/* Area polygon fill */}
                      <polygon
                        points={`
                          -10,100
                          ${chartData.map((d, idx) => `${(idx / 6) * 100},${100 - d.value * 0.8}`).join(' ')}
                          110,100
                        `}
                        fill={`url(#area-gradient-${accentClass?.name})`}
                        opacity="0.2"
                      />

                      {/* Line graph strip */}
                      <path
                        d={chartData.map((d, idx) => {
                          const x = (idx / 6) * 100;
                          const y = 100 - d.value * 0.8;
                          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke={accentClass?.text?.includes('slate') ? '#6366f1' : (accentClass?.text?.split('-')[1] === 'rose' ? '#f43f5e' : (accentClass?.text?.split('-')[1] === 'emerald' ? '#10b981' : (accentClass?.text?.split('-')[1] === 'cyan' ? '#06b6d4' : '#f59e0b')))}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Spark circles */}
                      {chartData.map((d, idx) => {
                        const x = (idx / 6) * 100;
                        const y = 100 - d.value * 0.8;
                        return (
                          <circle
                            key={idx}
                            cx={x}
                            cy={y}
                            r="3"
                            fill="#1e1b4b"
                            stroke={accentClass?.text?.split('-')[1] === 'rose' ? '#f43f5e' : (accentClass?.text?.split('-')[1] === 'emerald' ? '#10b981' : '#6366f1')}
                            strokeWidth="1.5"
                          />
                        );
                      })}

                      {/* Gradients definitions */}
                      <defs>
                        <linearGradient id={`area-gradient-${accentClass?.name}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={accentClass?.text?.split('-')[1] === 'rose' ? '#f43f5e' : (accentClass?.text?.split('-')[1] === 'emerald' ? '#10b981' : '#6366f1')} stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#000" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Horizontal labels */}
                  <div className="flex justify-between text-[9px] uppercase font-bold text-slate-500 px-1 mt-1">
                    {chartData.map((d, idx) => (
                      <span key={idx} className="w-10 text-center select-none font-mono">
                        {d.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Checklist instructions warning */}
                <p className="text-[9.5px] text-slate-500 font-semibold text-center italic">
                  * Bars represent daily completions over the last 7 calendar days. Check back into calendars to back-fill logs.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Gamification Badges Showcase section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col gap-4">
        <h3 className="text-xs uppercase font-extrabold text-slate-200 tracking-widest flex items-center gap-2">
          <Award className="w-4.5 h-4.5 text-amber-500 animate-pulse" /> 🏆 Milestone Accomplishments
        </h3>
        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
          Gamify your habits. Completed routines build progress towards specific milestones below. Unlocked targets shine in full gold colors!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {BADGES.map((badge) => {
            // Determine unlocked state based on metrics
            let isBadgeUnlocked = false;
            
            switch (badge.id) {
              case 'first_step':
                isBadgeUnlocked = totalAllTimeCompletions >= 1;
                break;
              case 'streak_7':
                isBadgeUnlocked = globalBestStreak >= 7;
                break;
              case 'streak_30':
                isBadgeUnlocked = globalBestStreak >= 30;
                break;
              case 'completions_50':
                isBadgeUnlocked = totalAllTimeCompletions >= 50;
                break;
              case 'completions_200':
                isBadgeUnlocked = totalAllTimeCompletions >= 200;
                break;
              case 'coins_500':
                // Check of metrics total gold balance. 
                // Since coins is in userStats we can check total completed logs count or custom conditions, 
                // but we can assume unlock if they logged enough for a gold vault (e.g. 50 completions = 500 gold)
                isBadgeUnlocked = totalAllTimeCompletions >= 50;
                break;
              case 'perfectionist':
                isBadgeUnlocked = globalBestStreak >= 3; // consecutive perfect days approximation
                break;
              case 'architect':
                isBadgeUnlocked = habits.filter(h => !h.isArchived).length >= 5;
                break;
              default:
                break;
            }

            return (
              <div
                id={`badge-card-${badge.id}`}
                key={badge.id}
                className={`flex gap-3 items-center p-3.5 rounded-2xl border transition-all ${
                  isBadgeUnlocked
                    ? 'bg-amber-955/25 border-amber-600/40 text-amber-200 shadow-md shadow-amber-500/5'
                    : 'bg-slate-950/60 border-slate-900 text-slate-500 grayscale opacity-45'
                }`}
              >
                <span className="text-3xl bg-slate-900 border border-slate-800 p-2.5 rounded-2xl select-none shrink-0 shadow-inner">
                  {badge.icon}
                </span>
                <div>
                  <h4 className={`text-xs font-black ${isBadgeUnlocked ? 'text-amber-400' : 'text-slate-400'}`}>
                    {badge.title} {isBadgeUnlocked && '👑'}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{badge.description}</p>
                  <span className="inline-block px-1.5 py-0.5 bg-slate-900 rounded text-[8px] uppercase tracking-wider font-extrabold text-slate-500 mt-1.5">
                    Requires: {badge.requirementText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
