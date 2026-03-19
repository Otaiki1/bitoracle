'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from './WalletProvider';
import { placeTrade, getBTCPrice } from '@/lib/stacks';
import { PAYOUT_RATES } from '@/lib/constants';
import { TrendingUp, TrendingDown, Clock, ShieldCheck } from 'lucide-react';

export function TradePanel() {
  const { connected, connect } = useWallet();
  const [direction, setDirection] = useState<boolean | null>(null);
  const [timeframe, setTimeframe] = useState<number>(2); // Default to 1m
  const [amount, setAmount] = useState('0.001');
  const [loading, setLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  useEffect(() => {
    const fetchPrice = async () => {
      const price = await getBTCPrice();
      if (price > 0) setCurrentPrice(price);
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    if (direction === null || !amount || !connected || currentPrice === 0) return;
    
    setLoading(true);
    try {
      const amountSats = Math.round(parseFloat(amount) * 1e8);
      await placeTrade(direction, timeframe, amountSats, currentPrice);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const timeframes = [
    { id: 1, label: '30s' },
    { id: 2, label: '1m' },
    { id: 3, label: '5m' },
    { id: 4, label: '15m' },
  ];

  const payoutRate = PAYOUT_RATES[timeframe as keyof typeof PAYOUT_RATES] || 0;
  const potentialProfit = amount ? (parseFloat(amount) * (payoutRate / 100)).toFixed(5) : '0';

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden h-full">
      <div className="relative z-10 flex flex-col h-full">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Execution</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">BTC/USD Market</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-green-500 font-black">ACTIVE</span>
          </div>
        </div>

        {/* Timeframe Tabs */}
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-1 bg-black/40 p-1 rounded-xl border border-gray-800/50">
            {timeframes.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  timeframe === tf.id 
                    ? 'bg-gray-800 text-white shadow-md' 
                    : 'text-gray-500 hover:text-gray-400'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4 transition-colors hover:bg-white/[0.05]">
            <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Price</p>
            <p className="text-lg font-mono font-bold text-orange-500 leading-none">
              ${(currentPrice / 1e8).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4 transition-colors hover:bg-white/[0.05]">
            <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Payout</p>
            <p className="text-lg font-bold text-white leading-none">
              {payoutRate}%
              <span className="text-[10px] text-gray-500 ml-1 font-normal tracking-wide italic">RATE</span>
            </p>
          </div>
        </div>

        {/* Stake Input */}
        <div className="mb-6 flex-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block ml-1">Investment Amount</label>
          <div className="relative group">
            <input
              type="number"
              placeholder="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-black/60 border-2 border-gray-800 rounded-2xl px-5 py-4 text-xl font-mono text-white focus:outline-none focus:border-orange-500/50 transition-all"
            />
            <div className="absolute right-5 top-4 flex items-center gap-2">
              <span className="text-orange-500 font-bold text-sm tracking-tight italic">sBTC</span>
            </div>
          </div>
          
          <div className="mt-3 flex justify-between items-center px-2">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Potential Profit:</span>
            <span className="text-xs text-green-400 font-mono font-bold">+{potentialProfit} sBTC</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mt-auto">
          {connected ? (
            <>
              <button
                onClick={() => setDirection(true)}
                disabled={loading || currentPrice === 0}
                className="w-full group relative py-5 bg-[#00c076] hover:bg-[#00d086] text-white rounded-[1.25rem] font-black text-xl shadow-lg shadow-green-500/20 transition-all active:scale-[0.98] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                <div className="relative flex items-center justify-center gap-3">
                  <TrendingUp size={24} className="group-hover:-translate-y-1 transition-transform" />
                  <span>{loading && direction === true ? 'WAITING...' : 'BUY / UP'}</span>
                </div>
              </button>
              
              <button
                onClick={() => setDirection(false)}
                disabled={loading || currentPrice === 0}
                className="w-full group relative py-5 bg-[#ff4d4d] hover:bg-[#ff5d5d] text-white rounded-[1.25rem] font-black text-xl shadow-lg shadow-red-500/20 transition-all active:scale-[0.98] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                <div className="relative flex items-center justify-center gap-3">
                  <TrendingDown size={24} className="group-hover:translate-y-1 transition-transform" />
                  <span>{loading && direction === false ? 'WAITING...' : 'SELL / DOWN'}</span>
                </div>
              </button>
            </>
          ) : (
            <button
              onClick={connect}
              className="w-full h-[120px] bg-orange-500 hover:bg-orange-400 text-white font-black text-xl rounded-2xl shadow-xl shadow-orange-500/20 transition-all active:scale-[0.98]"
            >
              CONNECT WALLET
            </button>
          )}
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-800">
          <div className="flex items-center justify-between text-[9px] font-black text-gray-600 uppercase tracking-widest">
            <div className="flex items-center gap-1">
              <ShieldCheck size={10} />
              Secured
            </div>
            <div className="flex items-center gap-1">
              <Clock size={10} />
              Instance 0x1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
