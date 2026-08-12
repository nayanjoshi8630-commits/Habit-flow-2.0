/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  CheckSquare, 
  Calendar, 
  TrendingUp, 
  Sliders, 
  Coins, 
  Sparkles, 
  Clock, 
  X, 
  Bell, 
  Tv, 
  User, 
  ShieldAlert,
  Trophy
} from 'lucide-react';

import { HabitFlowState, Habit, DailyLog, DayChallenge, UserStats, AppSettings } from './types';
import { 
  INITIAL_USER_STATS, 
  INITIAL_SETTINGS, 
  PRESET_CHALLENGES, 
  HabitTemplate,
  COLOR_ACCENTS
} from './utils/dummyData';

import Onboarding from './components/Onboarding';
import PinLock from './components/PinLock';
import ConfettiEffect, { playConfetti } from './components/ConfettiEffect';
import TodayView from './components/TodayView';
import CalendarView from './components/CalendarView';
import ChallengesView from './components/ChallengesView';
import StatsView from './components/StatsView';
import SettingsView from './components/SettingsView';
import HabitForm from './components/HabitForm';

export default function App() {
  // Global App States
  const [state, setState] = useState<HabitFlowState>({
    habits: [],
    dailyLogs: {},
    challenges: PRESET_CHALLENGES,
    userStats: INITIAL_USER_STATS,
    settings: INITIAL_SETTINGS,
  });

  const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'stats' | 'settings'>('today');
  const [calendarSubTab, setCalendarSubTab] = useState<'log' | 'challenges'>('log');
  
  const [activeDate, setActiveDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [screenLocked, setScreenLocked] = useState(false);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

  // Gamification Alerts
  const [showCheckInBonus, setShowCheckInBonus] = useState(false);
  
  // Real-time Alarm / Reminder System
  const [activeAlarm, setActiveAlarm] = useState<{
    habit: Habit;
    subtask: { id: string; name: string };
  } | null>(null);
  
  const [snoozedAlarms, setSnoozedAlarms] = useState<{ [subtaskId: string]: number }>({}); // Timestamp when snooze expires
  const lastAlarmCheckedMinute = useRef<string>('');

  // 1. Initial State Loading from LocalStorage
  useEffect(() => {
    const rawData = localStorage.getItem('habitflow_state');
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData) as HabitFlowState;
        
        // Backwards compatibility safety checks
        const sanitState: HabitFlowState = {
          habits: parsed.habits || [],
          dailyLogs: parsed.dailyLogs || {},
          challenges: parsed.challenges && parsed.challenges.length > 0 ? parsed.challenges : PRESET_CHALLENGES,
          userStats: parsed.userStats ? { ...INITIAL_USER_STATS, ...parsed.userStats } : INITIAL_USER_STATS,
          settings: parsed.settings ? { ...INITIAL_SETTINGS, ...parsed.settings } : INITIAL_SETTINGS,
        };

        setState(sanitState);

        // Security check
        if (sanitState.userStats.pinCode) {
          setScreenLocked(true);
        }
      } catch (e) {
        console.error('Failed restoration of state from LocalStorage:', e);
      }
    }
  }, []);

  // 2. Synchronize to LocalStorage
  const saveState = (newState: HabitFlowState) => {
    setState(newState);
    localStorage.setItem('habitflow_state', JSON.stringify(newState));
  };

  // 3. Daily check-in logic checks on startup
  useEffect(() => {
    if (state.userStats.onboardingCompleted && !screenLocked) {
      const todayStr = new Date().toISOString().split('T')[0];
      if (state.userStats.lastCheckInDate !== todayStr) {
        setShowCheckInBonus(true);
      }
    }
  }, [state.userStats.onboardingCompleted, screenLocked]);

  // 4. Real-time Alarm checks every 10 seconds
  useEffect(() => {
    if (!state.userStats.onboardingCompleted || screenLocked) return;

    const interval = setInterval(() => {
      const now = new Date();
      const HH = now.getHours().toString().padStart(2, '0');
      const MM = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${HH}:${MM}`;
      const todayStr = now.toISOString().split('T')[0];

      // Prevent triggering repeatedly inside the same minute
      if (lastAlarmCheckedMinute.current === currentTimeStr) return;

      // Scan subtasks for scheduled alarms
      for (const h of state.habits) {
        if (h.isArchived) continue;

        // Skip if not scheduled for today
        const dow = now.getDay();
        let isScheduledToday = false;
        if (h.isTask) {
          isScheduledToday = h.dueDate === todayStr;
        } else {
          if (h.frequency === 'daily') isScheduledToday = true;
          else if (h.frequency === 'specific') isScheduledToday = h.frequencyDays?.includes(dow) ?? false;
          else isScheduledToday = true; // weekly
        }

        if (!isScheduledToday) continue;

        for (const sub of h.subtasks) {
          if (sub.reminderTime === currentTimeStr && sub.reminderEnabled) {
            // Check if subtask is already completed in today's logs
            const logId = `${h.id}_${todayStr}`;
            const log = state.dailyLogs[logId];
            const isCompleted = log?.completedSubtasks.includes(sub.id) ?? false;

            if (isCompleted) continue;

            // Check if alarm is currently in snooze
            const snoozeExpiry = snoozedAlarms[sub.id];
            if (snoozeExpiry && Date.now() < snoozeExpiry) continue;

            // Trigger alert alarm popup!
            setActiveAlarm({
              habit: h,
              subtask: { id: sub.id, name: sub.name },
            });
            
            // Set checked flag and play alarm chime
            lastAlarmCheckedMinute.current = currentTimeStr;
            if (!state.settings.muteSounds) {
              new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-84.wav').play().catch(() => {});
            }
            return; // Show one alarm at a time
          }
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [state.habits, state.dailyLogs, snoozedAlarms, state.userStats.onboardingCompleted, screenLocked, state.settings.muteSounds]);

  // Claims
  const claimCheckInBonus = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updatedStats: UserStats = {
      ...state.userStats,
      coins: state.userStats.coins + 20,
      lastCheckInDate: todayStr,
    };
    saveState({
      ...state,
      userStats: updatedStats,
    });
    setShowCheckInBonus(false);
    playConfetti();
    if (!state.settings.muteSounds) {
      new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-84.wav').play().catch(() => {});
    }
  };

  // State modification actions passed to sub views
  const handleOnboardingComplete = (data: {
    userName: string;
    appAccent: 'emerald' | 'indigo' | 'rose' | 'amber' | 'cyan';
    selectedTemplates: HabitTemplate[];
  }) => {
    // Construct starter habits from selected templates
    const createdHabits: Habit[] = data.selectedTemplates.map((temp, index) => {
      const hId = Math.random().toString(36).substring(2, 9);
      const subtasks = temp.subtaskNames.map((name, sIdx) => ({
        id: `sub_${hId}_${sIdx}`,
        name,
        reminderEnabled: false,
      }));

      return {
        id: hId,
        name: temp.name,
        description: temp.description,
        type: temp.type,
        isTask: false,
        emoji: temp.emoji,
        color: temp.color,
        category: temp.category,
        frequency: temp.frequency,
        targetFrequencyDays: temp.targetFrequencyDays,
        frequencyDays: temp.frequencyDays,
        targetValue: temp.targetValue,
        unit: temp.unit,
        targetMinutes: temp.targetMinutes,
        order: index,
        subtasks,
        createdAt: new Date().toISOString(),
        isArchived: false,
      };
    });

    const updatedState: HabitFlowState = {
      habits: createdHabits,
      dailyLogs: {},
      challenges: PRESET_CHALLENGES,
      userStats: {
        ...INITIAL_USER_STATS,
        userName: data.userName,
        onboardingCompleted: true,
      },
      settings: {
        ...state.settings,
        appAccent: data.appAccent,
      },
    };

    saveState(updatedState);
  };

  const handleUpdateLog = (newLog: DailyLog) => {
    saveState({
      ...state,
      dailyLogs: {
        ...state.dailyLogs,
        [newLog.id]: newLog,
      },
    });
  };

  const handleCreateOrUpdateHabit = (habitData: Omit<Habit, 'order' | 'createdAt'> & { id?: string }) => {
    if (habitData.id) {
      // Edit mode
      const updatedHabits = state.habits.map((h) => {
        if (h.id === habitData.id) {
          return {
            ...h,
            ...habitData,
          } as Habit;
        }
        return h;
      });
      saveState({ ...state, habits: updatedHabits });
    } else {
      // Creation mode
      const newHabit: Habit = {
        ...habitData,
        id: Math.random().toString(36).substring(2, 9),
        order: state.habits.length,
        createdAt: new Date().toISOString(),
      } as Habit;

      saveState({
        ...state,
        habits: [...state.habits, newHabit],
      });
    }
    setShowHabitForm(false);
    setHabitToEdit(null);
  };

  const handleDeleteHabit = (id: string) => {
    // Delete habit and any referenced logs belonging to it
    const updatedHabits = state.habits.filter((h) => h.id !== id);
    const updatedLogs = { ...state.dailyLogs };
    for (const logKey in updatedLogs) {
      if (updatedLogs[logKey].habitId === id) {
        delete updatedLogs[logKey];
      }
    }
    saveState({
      ...state,
      habits: updatedHabits,
      dailyLogs: updatedLogs,
    });
  };

  const handleDuplicateHabit = (habit: Habit) => {
    const dup: Habit = {
      ...habit,
      id: Math.random().toString(36).substring(2, 9),
      name: `${habit.name} (Copy)`,
      order: state.habits.length,
      createdAt: new Date().toISOString(),
      // copy subtasks with new IDs
      subtasks: habit.subtasks.map((sub, sIdx) => ({
        ...sub,
        id: `sub_dup_${sIdx}_${Math.random().toString(36).substring(2, 5)}`,
      })),
    };
    saveState({
      ...state,
      habits: [...state.habits, dup],
    });
    alert(`Duplicated: "${habit.name}" successfully!`);
  };

  const handleArchiveHabit = (id: string) => {
    const updatedHabits = state.habits.map((h) => {
      if (h.id === id) {
        return { ...h, isArchived: !h.isArchived };
      }
      return h;
    });
    saveState({ ...state, habits: updatedHabits });
    const isArchived = updatedHabits.find(h => h.id === id)?.isArchived;
    alert(isArchived ? 'Habit moved to archives. Past stats retained.' : 'Habit brought back from archives.');
  };

  const handleEarnCoins = (amount: number) => {
    saveState({
      ...state,
      userStats: {
        ...state.userStats,
        coins: Math.max(0, state.userStats.coins + amount),
      },
    });
  };

  const handleUpdateChallenge = (updatedChallenge: DayChallenge) => {
    const updatedChallenges = state.challenges.map((c) => {
      if (c.id === updatedChallenge.id) {
        return updatedChallenge;
      }
      return c;
    });
    saveState({
      ...state,
      challenges: updatedChallenges,
    });
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    saveState({
      ...state,
      settings: newSettings,
    });
  };

  const handleUpdateStats = (newStats: UserStats) => {
    saveState({
      ...state,
      userStats: newStats,
    });
  };

  // Data management routines
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `habitflow_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (importString: string) => {
    try {
      const parsed = JSON.parse(importString);
      if (parsed.habits && parsed.dailyLogs && parsed.userStats) {
        saveState(parsed as HabitFlowState);
        alert('Database restored successfully! Reloading...');
        window.location.reload();
      } else {
        alert('Invalid database backup structure. Please make sure files have active tables!');
      }
    } catch (e) {
      alert('Failed parsing backup. Files must be valid JSON strings.');
    }
  };

  const handleResetData = () => {
    localStorage.removeItem('habitflow_state');
    alert('All application data completely wiped out. Hard refreshing...');
    window.location.reload();
  };

  // Alarm Dialog responses
  const handleCompleteAlarmSubtask = () => {
    if (!activeAlarm) return;
    const { habit, subtask } = activeAlarm;
    const todayStr = new Date().toISOString().split('T')[0];
    const logId = `${habit.id}_${todayStr}`;
    const log = state.dailyLogs[logId] || {
      id: logId,
      habitId: habit.id,
      date: todayStr,
      completed: false,
      value: 0,
      completedSubtasks: [],
    };

    if (!log.completedSubtasks.includes(subtask.id)) {
      const updatedSubtasks = [...log.completedSubtasks, subtask.id];
      const allDone = habit.subtasks.every((sub) => updatedSubtasks.includes(sub.id));
      let mainDone = log.completed;

      if (state.settings.requireAllSubtasksComplete && habit.subtasks.length > 0) {
        mainDone = allDone;
        if (allDone && !log.completed) {
          handleEarnCoins(10);
          playConfetti();
        }
      }

      handleEarnCoins(2); // Gold per subtask completed!

      handleUpdateLog({
        ...log,
        completedSubtasks: updatedSubtasks,
        completed: mainDone,
      });

      playConfetti();
    }

    setActiveAlarm(null);
  };

  const handleSnoozeAlarm = () => {
    if (!activeAlarm) return;
    const { subtask } = activeAlarm;
    // Add 5 minutes active snooze block
    const resTimestamp = Date.now() + 5 * 60 * 1000;
    setSnoozedAlarms({
      ...snoozedAlarms,
      [subtask.id]: resTimestamp,
    });
    setActiveAlarm(null);
  };

  // Pre-configured custom theme classes matches accent settings
  const accentTheme = COLOR_ACCENTS.find((a) => a.name === state.settings.appAccent) || COLOR_ACCENTS[1];

  // 1. Onboarding Screen gating
  if (!state.userStats.onboardingCompleted) {
    return (
      <div className="dark bg-slate-950 text-white min-h-screen">
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  // 2. PIN Lock Overlay gating
  if (screenLocked && state.userStats.pinCode) {
    return (
      <div className="dark bg-slate-950 text-white min-h-screen">
        <PinLock
          storedPin={state.userStats.pinCode}
          onSuccess={() => setScreenLocked(false)}
          onEmergencyReset={() => {
            // Preservation wipe PIN only
            handleUpdateStats({
              ...state.userStats,
              pinCode: undefined,
            });
            setScreenLocked(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="dark bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between overflow-x-hidden">
      
      {/* Confetti Effects */}
      <ConfettiEffect />

      {/* Top Banner Dashboard header */}
      <header id="habitflow-main-header" className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 py-4 md:px-0">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl select-none">🌊</span>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white tracking-wide">
                Habit<span className={accentTheme.text}>Flow</span>
              </span>
              <span className="text-[10px] text-slate-500 font-extrabold flex items-center gap-1">
                <User className="w-3 h-3" /> Hi, {state.userStats.userName || 'Champion'}!
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick date display */}
            <div className="text-right">
              <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Active Logs focus</span>
              <span className="text-xs font-bold text-slate-350 block leading-tight">
                {new Date(activeDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}
              </span>
            </div>

            {/* Coins wallet display */}
            <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/15 py-1.5 px-3 rounded-2xl text-amber-400 font-extrabold text-xs shadow-inner animate-pulse">
              <Coins className="w-4.5 h-4.5 text-amber-500" strokeWidth={2.5} />
              <span>{state.userStats.coins}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main body viewport */}
      <main className="flex-1 w-full max-w-xl mx-auto pt-4 pb-20">
        
        {/* TAB 1: Today Dashboard */}
        {activeTab === 'today' && (
          <TodayView
            habits={state.habits}
            dailyLogs={state.dailyLogs}
            coins={state.userStats.coins}
            userName={state.userStats.userName}
            onUpdateLog={handleUpdateLog}
            onEditHabit={(h) => {
              setHabitToEdit(h);
              setShowHabitForm(true);
            }}
            onDeleteHabit={handleDeleteHabit}
            onDuplicateHabit={handleDuplicateHabit}
            onArchiveHabit={handleArchiveHabit}
            onCreateHabitClick={() => {
              setHabitToEdit(null);
              setShowHabitForm(true);
            }}
            onEarnCoins={handleEarnCoins}
            settings={state.settings}
            activeDate={activeDate}
          />
        )}

        {/* TAB 2: Calendar & Long-Term Challenges */}
        {activeTab === 'calendar' && (
          <div className="flex flex-col gap-4">
            {/* Embedded Sub-tabs for clean nav bar requirement */}
            <div className="flex bg-slate-900 border border-slate-850 p-1 rounded-2xl max-w-xs mx-auto">
              <button
                id="calendar-subtab-logs"
                type="button"
                onClick={() => setCalendarSubTab('log')}
                className={`flex-1 py-1.5 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors ${
                  calendarSubTab === 'log'
                    ? 'bg-slate-950 text-white shadow font-black'
                    : 'text-slate-400 hover:text-slate-250'
                }`}
              >
                📅 History Log
              </button>
              <button
                id="calendar-subtab-challenges"
                type="button"
                onClick={() => setCalendarSubTab('challenges')}
                className={`flex-1 py-1.5 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors ${
                  calendarSubTab === 'challenges'
                    ? 'bg-slate-950 text-white shadow font-black'
                    : 'text-slate-400 hover:text-slate-250'
                }`}
              >
                ⚔️ 30d Arena
              </button>
            </div>

            {calendarSubTab === 'log' ? (
              <CalendarView
                habits={state.habits}
                dailyLogs={state.dailyLogs}
                activeDate={activeDate}
                onSelectDate={(dStr) => {
                  setActiveDate(dStr);
                  setActiveTab('today'); // Switch to today dashboard showing selected date
                }}
                weekStartMonday={state.settings.weekStartMonday}
              />
            ) : (
              <ChallengesView
                challenges={state.challenges}
                onUpdateChallenge={handleUpdateChallenge}
                onEarnCoins={handleEarnCoins}
                coins={state.userStats.coins}
              />
            )}
          </div>
        )}

        {/* TAB 3: Statistics deep-dives & achievements badges */}
        {activeTab === 'stats' && (
          <StatsView
            habits={state.habits}
            dailyLogs={state.dailyLogs}
          />
        )}

        {/* TAB 4: Core settings controls */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={state.settings}
            userStats={state.userStats}
            onUpdateSettings={handleUpdateSettings}
            onUpdateStats={handleUpdateStats}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Form modal backdrop */}
      {showHabitForm && (
        <HabitForm
          habitToEdit={habitToEdit}
          categoriesList={state.userStats.customCategories}
          onSave={handleCreateOrUpdateHabit}
          onClose={() => {
            setShowHabitForm(false);
            setHabitToEdit(null);
          }}
        />
      )}

      {/* Gamification Level: Daily Check-in bonus Modal */}
      {showCheckInBonus && (
        <div id="check-in-bonus-popup" className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6 text-center">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-5 items-center shadow-2xl relative">
            
            <div className="h-16 w-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center rounded-3xl text-2xl select-none animate-bounce">
              🎁
            </div>

            <div>
              <h2 className="text-lg font-black text-white">Daily Spark Refilled!</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Welcome back to HabitFlow securely today, {state.userStats.userName || 'Champion'}! Here is your daily motivational streak gift:
              </p>
            </div>

            <div className="flex gap-1.5 items-center bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-850 text-amber-400 font-extrabold shrink-0 shadow-inner">
              <Coins className="w-5 h-5" />
              <span className="text-lg font-black">+20 Gold Coins</span>
            </div>

            <button
              id="claim-check-in-btn"
              type="button"
              onClick={claimCheckInBonus}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-600/15 shadow-xl text-white font-extrabold text-xs rounded-2xl uppercase tracking-wider transition-all"
            >
              Collect Rewards
            </button>
          </div>
        </div>
      )}

      {/* Gamification Level: Active Reminders / Alarm dialog popup */}
      {activeAlarm && (
        <div id="reminder-alarm-popup" className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-between py-12 px-6">
          <div className="flex flex-col items-center gap-2.5 mt-8 text-center animate-bounce">
            <span className="text-5xl bg-indigo-600/10 h-18 w-18 flex items-center justify-center border border-indigo-500/20 rounded-3xl text-indigo-400 select-none shadow">
              ⏰
            </span>
            <div className="text-center mt-2.5">
              <span className="text-[10px] uppercase font-black text-amber-500 tracking-wider flex items-center gap-1.5 justify-center">
                <Bell className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> scheduled notification
              </span>
              <h2 className="text-xl font-bold text-white mt-1">Routine Alert!</h2>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-center w-full max-w-xs flex flex-col gap-2.5 shadow-2xl shadow-indigo-600/5">
            <span className="text-3xl select-none">{activeAlarm.habit.emoji}</span>
            <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider block">Inside habit: {activeAlarm.habit.name}</span>
            <h4 className="text-sm font-black text-slate-200 mt-1">"{activeAlarm.subtask.name}"</h4>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              This scheduled subtask is due for tracking! Mark it finished to checkout gold coins.
            </p>
          </div>

          <div className="flex flex-col gap-3.5 w-full max-w-xs mb-8">
            <button
              id="alarm-btn-complete"
              type="button"
              onClick={handleCompleteAlarmSubtask}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl uppercase select-none tracking-wider shadow shadow-emerald-600/10 transition-colors"
            >
              Check off Completed (+2g)
            </button>
            
            <div className="grid grid-cols-2 gap-2.5">
              <button
                id="alarm-btn-snooze"
                type="button"
                onClick={handleSnoozeAlarm}
                className="py-2.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-350 font-extrabold text-[10px] uppercase rounded-xl transition-colors"
              >
                Snooze 5m
              </button>
              
              <button
                id="alarm-btn-dismiss"
                type="button"
                onClick={() => setActiveAlarm(null)}
                className="py-2.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white font-extrabold text-[10px] uppercase rounded-xl transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Bottom Navigation bar */}
      <nav id="habitflow-bottom-nav" className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/85 backdrop-blur-md border-t border-slate-900 py-3.5 px-2">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-2">
          {/* Nav Item 1 */}
          <button
            id="nav-tab-today"
            type="button"
            onClick={() => { setActiveTab('today'); }}
            className={`flex flex-col items-center gap-1 transition-colors outline-none cursor-pointer select-none ${
              activeTab === 'today' ? accentTheme.text : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <CheckSquare className="w-5 h-5" strokeWidth={activeTab === 'today' ? 2.5 : 2} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Today</span>
          </button>

          {/* Nav Item 2 */}
          <button
            id="nav-tab-calendar"
            type="button"
            onClick={() => { setActiveTab('calendar'); }}
            className={`flex flex-col items-center gap-1 transition-colors outline-none cursor-pointer select-none ${
              activeTab === 'calendar' ? accentTheme.text : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <Calendar className="w-5 h-5" strokeWidth={activeTab === 'calendar' ? 2.5 : 2} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Calendar</span>
          </button>

          {/* Nav Item 3 */}
          <button
            id="nav-tab-stats"
            type="button"
            onClick={() => { setActiveTab('stats'); }}
            className={`flex flex-col items-center gap-1 transition-colors outline-none cursor-pointer select-none ${
              activeTab === 'stats' ? accentTheme.text : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <TrendingUp className="w-5 h-5" strokeWidth={activeTab === 'stats' ? 2.5 : 2} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Analysis</span>
          </button>

          {/* Nav Item 4 */}
          <button
            id="nav-tab-settings"
            type="button"
            onClick={() => { setActiveTab('settings'); }}
            className={`flex flex-col items-center gap-1 transition-colors outline-none cursor-pointer select-none ${
              activeTab === 'settings' ? accentTheme.text : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <Sliders className="w-5 h-5" strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
