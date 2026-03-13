'use client';

import React, { useState } from 'react';
import { Direction } from '@/types';
import { placePrediction } from '@/lib/stacks';
import { useWallet } from './WalletProvider';

interface PredictionPanelProps {
  roundId: number;
}

export function PredictionPanel({ roundId }: PredictionPanelProps) {
  const { connected, connect } = useWallet();
  const [direction, setDirection] = useState<Direction | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!direction || !amount || !connected) return;
    
    setLoading(true);
    try {
      const amountSats = Math.round(parseFloat(amount) * 1e8);
      await placePrediction(roundId, direction, amountSats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
      <h3 className="text-xl font-bold mb-6">Place Your Prediction</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setDirection('UP')}
          className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
            direction === 'UP' 
              ? 'border-green-500 bg-green-500/10 text-green-500' 
              : 'border-gray-800 bg-gray-950 text-gray-400 hover:border-gray-700'
          }`}
        >
          <span className="text-2xl mb-1">↑</span>
          <span className="font-bold">UP</span>
        </button>
        <button
          onClick={() => setDirection('DOWN')}
          className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
            direction === 'DOWN' 
              ? 'border-red-500 bg-red-500/10 text-red-500' 
              : 'border-gray-800 bg-gray-950 text-gray-400 hover:border-gray-700'
          }`}
        >
          <span className="text-2xl mb-1">↓</span>
          <span className="font-bold">DOWN</span>
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Stake Amount (sBTC)</label>
        <div className="relative">
          <input
            type="number"
            placeholder="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-all"
          />
          <span className="absolute right-4 top-3 text-orange-500 font-bold">sBTC</span>
        </div>
      </div>

      {connected ? (
        <button
          onClick={handleSubmit}
          disabled={!direction || !amount || loading}
          className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all"
        >
          {loading ? 'Confirming...' : direction ? `Predict ${direction}` : 'Select a direction'}
        </button>
      ) : (
        <button
          onClick={connect}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-xl transition-all"
        >
          Connect Wallet to Trade
        </button>
      )}
    </div>
  );
}
