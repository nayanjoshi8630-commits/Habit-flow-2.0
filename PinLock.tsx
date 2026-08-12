/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Lock, Delete, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface PinLockProps {
  storedPin: string;
  onSuccess: () => void;
  title?: string;
  onEmergencyReset?: () => void;
}

export default function PinLock({ storedPin, onSuccess, title = 'Authentication Required', onEmergencyReset }: PinLockProps) {
  const [pin, setPin] = useState('');
  const [errorFlashing, setErrorFlashing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === storedPin) {
        setErrorMessage('');
        onSuccess();
      } else {
        setErrorFlashing(true);
        setErrorMessage('Incorrect security PIN. Please try again.');
        navigator.vibrate?.(100);
        const timer = setTimeout(() => {
          setErrorFlashing(false);
          setPin('');
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [pin, storedPin, onSuccess]);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + num);
      setErrorMessage('');
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  return (
    <div id="pin-lock-overlay" className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between py-12 px-6 overflow-y-auto">
      {/* Top Section */}
      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="h-16 w-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/5">
          <Lock className="w-8 h-8 animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white tracking-wide">{title}</h2>
          <p className="text-sm text-slate-400 mt-1">Enter PIN to access HabitFlow</p>
        </div>
      </div>

      {/* Middle Dots Display */}
      <div className="flex flex-col items-center gap-4 my-6">
        <div className={`flex gap-6 justify-center ${errorFlashing ? 'animate-bounce text-red-500' : ''}`}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={`h-4 w-4 rounded-full border transition-all duration-150 ${
                index < pin.length
                  ? 'bg-indigo-500 border-indigo-400 scale-110 shadow-md shadow-indigo-500/30'
                  : 'bg-slate-900 border-slate-700'
              }`}
            />
          ))}
        </div>
        {errorMessage && (
          <p className="text-red-400 text-xs text-center font-medium">{errorMessage}</p>
        )}
      </div>

      {/* Keypad Grid */}
      <div className="flex flex-col gap-3 w-full max-w-xs mb-4">
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              id={`pin-keypad-${num}`}
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="h-14 bg-slate-900 hover:bg-slate-850 active:bg-slate-800 text-white font-semibold text-lg flex items-center justify-center rounded-xl border border-slate-800 transition-colors shadow-md"
            >
              {num}
            </button>
          ))}
          
          <button
            id="pin-keypad-clear"
            type="button"
            onClick={handleClear}
            className="h-14 text-slate-400 hover:text-white font-medium text-xs flex items-center justify-center rounded-xl border border-slate-800 hover:bg-slate-900 transition-colors"
          >
            Clear
          </button>
          
          <button
            id="pin-keypad-0"
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-14 bg-slate-900 hover:bg-slate-850 active:bg-slate-800 text-white font-semibold text-lg flex items-center justify-center rounded-xl border border-slate-800 transition-colors shadow-md"
          >
            0
          </button>
          
          <button
            id="pin-keypad-delete"
            type="button"
            onClick={handleDelete}
            className="h-14 text-slate-400 hover:text-white flex items-center justify-center rounded-xl border border-slate-800 hover:bg-slate-900 active:bg-slate-800 transition-colors"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {onEmergencyReset && (
          <button
            id="pin-forgot-btn"
            type="button"
            onClick={() => {
              if (window.confirm('Forget your secure PIN? This will wipe the pin but preserved habit records. Reset PIN code?')) {
                onEmergencyReset();
              }
            }}
            className="text-xs text-slate-500 hover:text-slate-300 text-center mt-3 flex items-center justify-center gap-1.5 transition-colors self-center py-1.5 px-3 rounded-lg hover:bg-slate-900"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Forgot PIN code? Reset
          </button>
        )}
      </div>

      {/* Safety Footer */}
      <div className="flex items-center gap-1.5 text-slate-600 text-[11px] font-medium mt-2">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
        Encrypted Local Authentication Sandbox
      </div>
    </div>
  );
}
