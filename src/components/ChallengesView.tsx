import React from 'react';
import { DayChallenge } from '../types';

interface ChallengesViewProps {
  challenges: DayChallenge[];
  onUpdateChallenge: (challenge: DayChallenge) => void;
  onEarnCoins: (amount: number) => void;
  coins: number;
}

export default function ChallengesView({
  challenges,
  onUpdateChallenge,
  onEarnCoins,
  coins,
}: ChallengesViewProps) {
  return (
    <div className="space-y-4 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">30-Day Arena</h2>
        <p className="text-gray-400">Complete challenges to earn coins</p>
      </div>

      {challenges.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No challenges available yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="p-4 bg-slate-900 rounded-lg border border-slate-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">Challenge #{challenge.id}</h3>
                  <p className="text-xs text-gray-400">Progress tracking</p>
                </div>
                <button className="px-4 py-2 bg-emerald-600 rounded hover:bg-emerald-700">
                  +10g
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
