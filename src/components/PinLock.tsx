import React, { useState } from 'react';

interface PinLockProps {
  storedPin: string;
  onSuccess: () => void;
  onEmergencyReset: () => void;
}

export default function PinLock({
  storedPin,
  onSuccess,
  onEmergencyReset,
}: PinLockProps) {
  const [enteredPin, setEnteredPin] = useState('');

  const handlePinEntry = (digit: string) => {
    const newPin = enteredPin + digit;
    setEnteredPin(newPin);

    if (newPin === storedPin) {
      onSuccess();
    }
  };

  const handleClear = () => {
    setEnteredPin('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-8">Enter PIN</h1>
        <div className="mb-8 text-4xl tracking-widest">
          {'•'.repeat(enteredPin.length)}
          {enteredPin.length < (storedPin?.length || 4) && '○'.repeat((storedPin?.length || 4) - enteredPin.length)}
        </div>
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-xs mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handlePinEntry(String(num))}
              className="p-4 text-2xl font-bold bg-slate-800 rounded-lg hover:bg-slate-700"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handlePinEntry('0')}
            className="col-span-2 p-4 text-2xl font-bold bg-slate-800 rounded-lg hover:bg-slate-700"
          >
            0
          </button>
          <button
            onClick={handleClear}
            className="p-4 text-lg font-bold bg-red-600 rounded-lg hover:bg-red-700"
          >
            Clear
          </button>
        </div>
        <button
          onClick={onEmergencyReset}
          className="text-sm text-gray-400 hover:text-gray-300 underline"
        >
          Emergency Reset
        </button>
      </div>
    </div>
  );
}
