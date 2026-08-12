/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Sliders, 
  Trash2, 
  Download, 
  Upload, 
  Lock, 
  EyeOff, 
  Tag, 
  Square,
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  RefreshCw,
  Plus,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { AppSettings, UserStats } from '../types';
import { COLOR_ACCENTS } from '../utils/dummyData';

interface SettingsViewProps {
  settings: AppSettings;
  userStats: UserStats;
  onUpdateSettings: (settings: AppSettings) => void;
  onUpdateStats: (stats: UserStats) => void;
  onExportData: () => void;
  onImportData: (importString: string) => void;
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
  const [pinInput, setPinInput] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle boolean settings
  const handleToggleMute = () => {
    onUpdateSettings({ ...settings, muteSounds: !settings.muteSounds });
  };

  const handleToggleWeekStart = () => {
    onUpdateSettings({ ...settings, weekStartMonday: !settings.weekStartMonday });
  };

  const handleToggleAllSubtasksRule = () => {
    onUpdateSettings({ ...settings, requireAllSubtasksComplete: !settings.requireAllSubtasksComplete });
  };

  // Change primary color theme accent
  const handleSelectAccent = (colorName: 'emerald' | 'indigo' | 'rose' | 'amber' | 'cyan') => {
    onUpdateSettings({ ...settings, appAccent: colorName });
  };

  // PIN settings
  const handleSetPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length !== 4 || isNaN(Number(pinInput))) {
      alert('Security PIN must be exactly 4 numeric digits!');
      return;
    }
    onUpdateStats({ ...userStats, pinCode: pinInput });
    setPinInput('');
    setShowPinSetup(false);
    alert('Secure screen block PIN initialized successfully!');
  };

  const handleRemovePin = () => {
    onUpdateStats({ ...userStats, pinCode: undefined });
    alert('Secure screen block PIN disabled successfully.');
  };

  // Categories list management
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    if (userStats.customCategories.includes(newCatName.trim())) {
      alert('This Category label already exists!');
      return;
    }

    onUpdateStats({
      ...userStats,
      customCategories: [...userStats.customCategories, newCatName.trim()],
    });

    setNewCatName('');
  };

  const handleRemoveCategory = (cat: string) => {
    if (userStats.customCategories.length <= 1) {
      alert('Keep at least one category tag to register routine items!');
      return;
    }
    if (window.confirm(`Are you sure you want to remove the Category: "${cat}"? Individual habits won't be deleted but their tags will remain.`)) {
      onUpdateStats({
        ...userStats,
        customCategories: userStats.customCategories.filter((c) => c !== cat),
      });
    }
  };

  // Import handler helper
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        onImportData(text);
      }
    };
    reader.readAsText(file);
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div id="settings-view-main" className="flex flex-col gap-5 px-4 md:px-0 mt-2 mb-10 overflow-x-hidden animate-fadeIn">
      
      {/* Visual Customize settings block */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col gap-4">
        <h3 className="text-xs uppercase font-extrabold text-slate-200 tracking-widest flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" /> visual identity and theme
        </h3>

        {/* Dynamic theme accent picker */}
        <div className="flex flex-col gap-2 bg-slate-950 p-4 rounded-2xl border border-slate-850">
          <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider block">App Primary Theme Accent</span>
          <div className="grid grid-cols-5 gap-2.5 mt-1.5">
            {COLOR_ACCENTS.map((color) => (
              <button
                id={`settings-accent-btn-${color.name}`}
                key={color.name}
                type="button"
                onClick={() => handleSelectAccent(color.name as any)}
                className={`h-11 rounded-xl flex flex-col items-center justify-center border transition-all ${
                  settings.appAccent === color.name
                    ? 'bg-slate-900 border-indigo-500 shadow-md transform scale-105'
                    : 'bg-slate-900 border-slate-850 hover:border-slate-800'
                }`}
              >
                <div className={`h-4.5 w-4.5 rounded-full ${color.bg}`} />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mt-1">{color.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Routine rules guidelines setup */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col gap-4">
        <h3 className="text-xs uppercase font-extrabold text-slate-200 tracking-widest flex items-center gap-2">
          ⚙️ Routine Schedules and rules
        </h3>

        <div className="flex flex-col gap-3">
          {/* Rule 1: Sound muter */}
          <div className="flex justify-between items-center bg-slate-950 p-3 rounded-2xl border border-slate-850">
            <div className="flex items-center gap-3">
              {settings.muteSounds ? (
                <VolumeX className="w-5 h-5 text-red-400 shrink-0" />
              ) : (
                <Volume2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <div>
                <span className="text-xs font-bold text-slate-200 block">Sounds / completion chimes</span>
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Play sound on activity check-off</span>
              </div>
            </div>
            <button
              id="settings-toggle-mute"
              type="button"
              onClick={handleToggleMute}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase select-none transition-all ${
                settings.muteSounds
                  ? 'bg-rose-950/40 text-rose-450 border border-red-900/30'
                  : 'bg-emerald-950/40 text-emerald-450 border border-emerald-900/40'
              }`}
            >
              {settings.muteSounds ? 'Muted' : 'Enabled'}
            </button>
          </div>

          {/* Rule 2: Week starting date */}
          <div className="flex justify-between items-center bg-slate-950 p-3 rounded-2xl border border-slate-850">
            <div className="flex items-center gap-3">
              <span className="text-xl shrink-0 select-none">📅</span>
              <div>
                <span className="text-xs font-bold text-slate-200 block">First day of week</span>
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Start day on calendars and log boards</span>
              </div>
            </div>
            <button
              id="settings-toggle-week-start"
              type="button"
              onClick={handleToggleWeekStart}
              className="px-4 py-1.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 font-bold text-[10px] rounded-xl uppercase transition-all"
            >
              {settings.weekStartMonday ? 'Monday' : 'Sunday'}
            </button>
          </div>

          {/* Rule 3: require all subtasks */}
          <div className="flex justify-between items-center bg-slate-950 p-3 rounded-2xl border border-slate-850">
            <div className="flex items-center gap-3">
              <span className="text-xl shrink-0 select-none">🛡️</span>
              <div>
                <span className="text-xs font-bold text-slate-200 block">Subtasks checklock</span>
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Require all subtasks done to check habit card</span>
              </div>
            </div>
            <button
              id="settings-toggle-all-subs"
              type="button"
              onClick={handleToggleAllSubtasksRule}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase select-none transition-all ${
                settings.requireAllSubtasksComplete
                  ? 'bg-indigo-950/40 text-indigo-405 border border-indigo-900/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-850'
              }`}
            >
              {settings.requireAllSubtasksComplete ? 'Hardlock' : 'Loose'}
            </button>
          </div>
        </div>
      </div>

      {/* Screen PIN lock block */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col gap-4">
        <h3 className="text-xs uppercase font-extrabold text-slate-200 tracking-widest flex items-center gap-2">
          🔒 Secure screen block PIN
        </h3>

        <div className="flex flex-col gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-850">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-slate-200 block">PIN Code authentication</span>
              <span className="text-[9.5px] text-slate-500 block uppercase font-bold tracking-tight">Requires a 4-digit numeric code on startup</span>
            </div>
            
            {userStats.pinCode ? (
              <button
                id="settings-remove-pin"
                type="button"
                onClick={handleRemovePin}
                className="px-3 py-1.5 bg-rose-950/20 border border-rose-950 rounded-xl text-red-400 text-[10px] font-bold hover:bg-rose-950/45 transition-colors"
              >
                Disable LOCK
              </button>
            ) : (
              <button
                id="settings-trigger-pin-setup"
                type="button"
                onClick={() => setShowPinSetup(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow shadow-indigo-600/10 rounded-xl text-[10px] font-bold transition-colors"
              >
                Configure PIN
              </button>
            )}
          </div>

          {showPinSetup && (
            <form onSubmit={handleSetPin} className="flex gap-2.5 items-center mt-3 border-t border-slate-850 pt-3 animate-fadeIn">
              <input
                id="settings-pin-input-field"
                type="password"
                maxLength={4}
                placeholder="4-digit PIN..."
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                className="w-24 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 font-extrabold text-center text-xs outline-none"
              />
              <button
                id="settings-save-pin-btn"
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-[10.5px] font-bold hover:bg-emerald-500 transition-colors"
              >
                Launch Code
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Habits categories list manager */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col gap-4">
        <h3 className="text-xs uppercase font-extrabold text-slate-200 tracking-widest flex items-center gap-2">
          🗂️ Routine Category tags manager
        </h3>

        <div className="flex flex-col gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-850">
          <div className="flex gap-2">
            <input
              id="settings-add-cat-input"
              type="text"
              placeholder="Custom Category name..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 font-bold text-xs outline-none"
            />
            <button
              id="settings-add-cat-btn"
              type="button"
              onClick={handleAddCategory}
              className="px-3 bg-indigo-600 h-8 hover:bg-indigo-500 rounded-lg text-white font-extrabold text-xs flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <div id="settings-categories-list" className="flex flex-wrap gap-2 mt-2 max-h-40 overflow-y-auto pr-1">
            {userStats.customCategories.map((cat) => (
              <span
                id={`cat-badge-item-${cat}`}
                key={cat}
                className="flex items-center gap-2 bg-slate-900 border border-slate-850 text-slate-300 pl-3.5 pr-2 py-1 rounded-full text-[10px] font-bold"
              >
                {cat}
                <button
                  id={`remove-cat-btn-${cat}`}
                  type="button"
                  onClick={() => handleRemoveCategory(cat)}
                  className="p-0.5 rounded-full hover:bg-rose-950/40 text-slate-500 hover:text-red-400 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Routine logs & storage data options */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col gap-4">
        <h3 className="text-xs uppercase font-extrabold text-slate-200 tracking-widest flex items-center gap-2">
          💾 Data Backups & management
        </h3>

        <div className="grid grid-cols-2 gap-3.5">
          {/* Export JSON */}
          <button
            id="settings-export-json-btn"
            type="button"
            onClick={onExportData}
            className="flex flex-col items-center justify-center p-4 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-800 rounded-2xl gap-2 transition-all outline-none"
          >
            <Download className="w-5 h-5 text-indigo-400" />
            <div className="text-center">
              <span className="text-xs font-bold text-slate-100 block">Export JSON</span>
              <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-tight">Download routine records</span>
            </div>
          </button>

          {/* Import JSON file input hidden */}
          <input
            id="hidden-json-file-picker"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            id="settings-import-json-btn"
            type="button"
            onClick={triggerFilePicker}
            className="flex flex-col items-center justify-center p-4 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-800 rounded-2xl gap-2 transition-all outline-none"
          >
            <Upload className="w-5 h-5 text-cyan-400" />
            <div className="text-center">
              <span className="text-xs font-bold text-slate-100 block">Restore JSON</span>
              <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-tight">Upload routine database</span>
            </div>
          </button>
        </div>

        {/* Restore wipe and reset */}
        <button
          id="settings-wipe-data"
          type="button"
          onClick={() => {
            if (window.confirm('WARNING: Are you absolutely sure you want to completely erase and wipe all routines, completion logs, achievements, and user settings? This action CANNOT be reversed.')) {
              onResetData();
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-3 bg-rose-950/15 hover:bg-rose-950/40 border border-rose-950/30 text-rose-450 hover:text-red-400 text-xs font-black rounded-2xl transition-colors uppercase mt-1"
        >
          <Trash2 className="w-4 h-4" /> Wipe Entire Application State
        </button>
      </div>

      {/* Credit Info footer block */}
      <div className="flex gap-2 bg-slate-900/40 p-4 border border-slate-850 rounded-2xl items-start">
        <Info className="w-4.5 h-4.5 text-slate-500 shrink-0 mt-0.5" />
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase">Device Encrypted Sandboxed Store</span>
          <p className="text-[9.5px] text-slate-500 leading-relaxed mt-0.5">
            Your data remains totally secure inside local browser storage cookies. Export database backups periodically to preserve history when modifying caches or cleaning software drives.
          </p>
        </div>
      </div>
    </div>
  );
}
