import React, { useState, useEffect } from 'react';
import { HabitFlowState, Habit, DailyLog, UserStats, AppSettings } from './types';
import { INITIAL_USER_STATS, INITIAL_SETTINGS } from './utils/dummyData';
import Onboarding from './components/Onboarding';
import PinLock from './components/PinLock';
import ConfettiEffect, { playConfetti } from './components/ConfettiEffect';
import TodayView from './components/TodayView';
import CalendarView from './components/CalendarView';
import ChallengesView from './components/ChallengesView';
import StatsView from './components/StatsView';
import SettingsView from './components/SettingsView';
import HabitForm from './components/HabitForm';

type ViewType = 'today' | 'calendar' | 'challenges' | 'stats' | 'settings';

const App: React.FC = () => {
  const [state, setState] = useState<HabitFlowState>({
    habits: [],
    dailyLogs: {},
    challenges: [],
    userStats: INITIAL_USER_STATS,
    settings: INITIAL_SETTINGS,
  });

  const [currentView, setCurrentView] = useState<ViewType>('today');
  const [activeDate, setActiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [pinLocked, setPinLocked] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('habitflow-state');
    if (savedState) {
      setState(JSON.parse(savedState));
      if (JSON.parse(savedState).userStats.pinCode) {
        setPinLocked(true);
      }
    } else {
      setState((prev) => ({
        ...prev,
        userStats: { ...prev.userStats, onboardingCompleted: false },
      }));
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('habitflow-state', JSON.stringify(state));
  }, [state]);

  const handleOnboardingComplete = (data: {
    userName: string;
    appAccent: 'emerald' | 'indigo' | 'rose' | 'amber' | 'cyan';
    selectedTemplates: any[];
  }) => {
    setState((prev) => ({
      ...prev,
      userStats: {
        ...prev.userStats,
        userName: data.userName,
        onboardingCompleted: true,
      },
      settings: {
        ...prev.settings,
        appAccent: data.appAccent,
      },
    }));
  };

  const handlePinSuccess = () => {
    setPinLocked(false);
  };

  const handleSaveHabit = (habitData: Omit<Habit, 'order' | 'createdAt'> & { id?: string }) => {
    if (habitToEdit) {
      setState((prev) => ({
        ...prev,
        habits: prev.habits.map((h) => (h.id === habitToEdit.id ? { ...h, ...habitData } : h)),
      }));
    } else {
      const newHabit: Habit = {
        ...habitData,
        id: Date.now().toString(),
        order: state.habits.length,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        habits: [...prev.habits, newHabit],
      }));
    }
    setShowHabitForm(false);
    setHabitToEdit(null);
  };

  const handleUpdateLog = (log: DailyLog) => {
    setState((prev) => ({
      ...prev,
      dailyLogs: {
        ...prev.dailyLogs,
        [log.id]: log,
      },
    }));
  };

  const handleEarnCoins = (amount: number) => {
    setState((prev) => ({
      ...prev,
      userStats: {
        ...prev.userStats,
        coins: prev.userStats.coins + amount,
      },
    }));
    playConfetti();
  };

  const handleUpdateSettings = (settings: AppSettings) => {
    setState((prev) => ({
      ...prev,
      settings,
    }));
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `habitflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportData = (dataStr: string) => {
    try {
      const imported = JSON.parse(dataStr);
      setState(imported);
      alert('Data imported successfully!');
    } catch (error) {
      alert('Failed to import data. Invalid format.');
    }
  };

  if (!state.userStats.onboardingCompleted) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (pinLocked && state.userStats.pinCode) {
    return (
      <PinLock
        storedPin={state.userStats.pinCode}
        onSuccess={handlePinSuccess}
        onEmergencyReset={() => setPinLocked(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white">
      <ConfettiEffect />

      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">HabitFlow</h1>
            <div className="text-right">
              <p className="text-sm text-gray-400">Welcome, {state.userStats.userName}</p>
              <p className="text-lg font-semibold text-amber-400">💰 {state.userStats.coins}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'today', label: '📅 Today', emoji: '📅' },
              { id: 'calendar', label: '📆 Calendar', emoji: '📆' },
              { id: 'challenges', label: '🎯 Challenges', emoji: '🎯' },
              { id: 'stats', label: '📊 Stats', emoji: '📊' },
              { id: 'settings', label: '⚙️ Settings', emoji: '⚙️' },
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setCurrentView(view.id as ViewType)}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  currentView === view.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
              >
                {view.emoji} {view.label.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto">
        {currentView === 'today' && (
          <TodayView
            habits={state.habits}
            dailyLogs={state.dailyLogs}
            coins={state.userStats.coins}
            userName={state.userStats.userName}
            onUpdateLog={handleUpdateLog}
            onEditHabit={(habit) => {
              setHabitToEdit(habit);
              setShowHabitForm(true);
            }}
            onDeleteHabit={(id) => {
              setState((prev) => ({
                ...prev,
                habits: prev.habits.filter((h) => h.id !== id),
              }));
            }}
            onDuplicateHabit={(habit) => {
              const newHabit: Habit = {
                ...habit,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
              };
              setState((prev) => ({
                ...prev,
                habits: [...prev.habits, newHabit],
              }));
            }}
            onArchiveHabit={(id) => {
              setState((prev) => ({
                ...prev,
                habits: prev.habits.map((h) => (h.id === id ? { ...h, isArchived: true } : h)),
              }));
            }}
            onCreateHabitClick={() => {
              setHabitToEdit(null);
              setShowHabitForm(true);
            }}
            onEarnCoins={handleEarnCoins}
            settings={state.settings}
            activeDate={activeDate}
          />
        )}

        {currentView === 'calendar' && (
          <CalendarView
            habits={state.habits}
            dailyLogs={state.dailyLogs}
            activeDate={activeDate}
            onSelectDate={setActiveDate}
            weekStartMonday={state.settings.weekStartMonday}
          />
        )}

        {currentView === 'challenges' && (
          <ChallengesView
            challenges={state.challenges}
            onUpdateChallenge={() => {}}
            onEarnCoins={handleEarnCoins}
            coins={state.userStats.coins}
          />
        )}

        {currentView === 'stats' && (
          <StatsView habits={state.habits} dailyLogs={state.dailyLogs} />
        )}

        {currentView === 'settings' && (
          <SettingsView
            settings={state.settings}
            userStats={state.userStats}
            onUpdateSettings={handleUpdateSettings}
            onUpdateStats={(stats) => {
              setState((prev) => ({
                ...prev,
                userStats: stats,
              }));
            }}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onResetData={() => {
              if (window.confirm('Are you sure? This will delete all data.')) {
                setState({
                  habits: [],
                  dailyLogs: {},
                  challenges: [],
                  userStats: INITIAL_USER_STATS,
                  settings: INITIAL_SETTINGS,
                });
              }
            }}
          />
        )}
      </div>

      {/* Habit Form Modal */}
      {showHabitForm && (
        <HabitForm
          habitToEdit={habitToEdit}
          categoriesList={state.userStats.customCategories}
          onSave={handleSaveHabit}
          onClose={() => {
            setShowHabitForm(false);
            setHabitToEdit(null);
          }}
        />
      )}
    </div>
  );
};

export default App;
