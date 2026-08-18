import React from 'react';
import { HabitTemplate } from '../utils/dummyData';

interface OnboardingProps {
  onComplete: (data: {
    userName: string;
    appAccent: 'emerald' | 'indigo' | 'rose' | 'amber' | 'cyan';
    selectedTemplates: HabitTemplate[];
  }) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to HabitFlow</h1>
        <p className="text-gray-400 mb-8">Getting you started...</p>
        <button
          onClick={() =>
            onComplete({
              userName: 'User',
              appAccent: 'indigo',
              selectedTemplates: [],
            })
          }
          className="px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
