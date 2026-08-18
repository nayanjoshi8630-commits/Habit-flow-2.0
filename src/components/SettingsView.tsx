import React, { useState } from 'react';
import { AppSettings, UserStats } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  userStats: UserStats;
  onUpdateSettings: (settings: AppSettings) => void;
  onUpdateStats: (stats: UserStats) => void;
  onExportData: () => void;
  onImportData: (data: string) => void;
  onResetData: () => void;
}

export default function SettingsView({
  settings,
  userStats,
  onUpdateSettings,
  onUpdateStats,
  onExportData,
  onImportData,
  onResetData,
}: SettingsViewProps) {
  const [showImportInput, setShowImportInput] = useState(false);
  const [importData, setImportData] = useState('');

  const handleImport = () => {
    if (importData.trim()) {
      onImportData(importData);
      setImportData('');
      setShowImportInput(false);
    }
  };

  const handleThemeChange = (
    theme: 'emerald' | 'indigo' | 'rose' | 'amber' | 'cyan'
  ) => {
    onUpdateSettings({
      ...settings,
      appAccent: theme,
    });
  };

  return (
    <div className="space-y-6 px-4 pb-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-gray-400">Customize your experience</p>
      </div>

      {/* Theme Selection */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg">App Theme</h3>
        <div className="grid grid-cols-5 gap-2">
          {['emerald', 'indigo', 'rose', 'amber', 'cyan'].map((theme) => (
            <button
              key={theme}
              onClick={() =>
                handleThemeChange(
                  theme as 'emerald' | 'indigo' | 'rose' | 'amber' | 'cyan'
                )
              }
              className={`p-3 rounded-lg text-sm font-bold capitalize transition-all ${
                settings.appAccent === theme
                  ? `bg-${theme}-600 text-white ring-2 ring-offset-2 ring-offset-slate-950`
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
              }`}
            >
              {theme.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle Settings */}
      <div className="space-y-3 border-t border-slate-800 pt-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.muteSounds ?? false}
            onChange={(e) =>
              onUpdateSettings({
                ...settings,
                muteSounds: e.target.checked,
              })
            }
            className="rounded"
          />
          <span className="font-semibold">Mute Sounds</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.weekStartMonday ?? false}
            onChange={(e) =>
              onUpdateSettings({
                ...settings,
                weekStartMonday: e.target.checked,
              })
            }
            className="rounded"
          />
          <span className="font-semibold">Week Starts on Monday</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.requireAllSubtasksComplete ?? false}
            onChange={(e) =>
              onUpdateSettings({
                ...settings,
                requireAllSubtasksComplete: e.target.checked,
              })
            }
            className="rounded"
          />
          <span className="font-semibold">Require All Subtasks Complete</span>
        </label>
      </div>

      {/* Data Management */}
      <div className="space-y-3 border-t border-slate-800 pt-4">
        <h3 className="font-bold text-lg">Data Management</h3>
        <button
          onClick={onExportData}
          className="w-full px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700 font-semibold"
        >
          Export Data
        </button>

        <button
          onClick={() => setShowImportInput(!showImportInput)}
          className="w-full px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 font-semibold"
        >
          Import Data
        </button>

        {showImportInput && (
          <div className="space-y-2">
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste your backup JSON here..."
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500"
              rows={6}
            />
            <button
              onClick={handleImport}
              className="w-full px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700 font-semibold"
            >
              Restore Backup
            </button>
          </div>
        )}

        <button
          onClick={onResetData}
          className="w-full px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 font-semibold"
        >
          Reset All Data
        </button>
      </div>
    </div>
  );
}
