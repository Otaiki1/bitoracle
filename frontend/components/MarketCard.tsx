'use client';

import React from 'react';
import { Round } from '@/types';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface MarketCardProps {
  round: Round;
  onSelect: (id: number) => void;
}

export function MarketCard({ round, onSelect }: MarketCardProps) {
  const totalPool = round.totalUp + round.totalDown;
  const upPercent = totalPool > 0n ? (Number(round.totalUp * 100n / totalPool)) : 50;
  const downPercent = 100 - upPercent;

  return (
    <div 
      onClick={() => onSelect(round.id)}
      className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-orange-500/50 cursor-pointer transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{round.asset}</h3>
          <p className="text-gray-400 text-sm">Round #{round.id}</p>
        </div>
        <div className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Clock size={12} />
          {round.status.toUpperCase()}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-1 text-green-400 font-medium">
            <TrendingUp size={16} />
            {upPercent}% UP
          </div>
          <div className="flex items-center gap-1 text-red-400 font-medium">
            <TrendingDown size={16} />
            {downPercent}% DOWN
          </div>
        </div>

        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden flex">
          <div className="bg-green-500 h-full transition-all" style={{ width: `${upPercent}%` }} />
          <div className="bg-red-500 h-full transition-all" style={{ width: `${downPercent}%` }} />
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-gray-500 text-xs uppercase font-bold">Total Pool</p>
            <p className="text-white font-mono">{Number(totalPool) / 1e8} sBTC</p>
          </div>
          <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all">
            View Market
          </button>
        </div>
      </div>
    </div>
  );
}
