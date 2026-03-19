'use client';

import React from 'react';
import { Trade } from '@/types';
import { TrendingUp, TrendingDown, Clock, ExternalLink } from 'lucide-react';
import { PAYOUT_RATES } from '@/lib/constants';
import { Countdown } from './Countdown';

interface TradeListProps {
  trades: Trade[];
}

export function TradeList({ trades }: TradeListProps) {
  if (trades.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-12 text-center">
        <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-600">
          <Clock size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-400">No active trades</h3>
        <p className="text-gray-600 text-sm mt-2">Your open positions will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trades.map((trade) => (
        <div 
          key={trade.id} 
          className={`bg-gray-900 border border-gray-800 rounded-2xl p-5 transition-all hover:border-gray-700 ${
            trade.status === 1 ? 'ring-1 ring-green-500/30 bg-green-500/[0.02]' : 
            trade.status === 2 ? 'ring-1 ring-red-500/30 bg-red-500/[0.02]' : ''
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${trade.direction ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {trade.direction ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white">BTC/USD {trade.direction ? 'UP' : 'DOWN'}</h4>
                  <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-md font-mono">#{trade.id}</span>
                </div>
                <p className="text-xs text-gray-500 font-mono">Entry: ${(Number(trade.entryPrice) / 1e8).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="text-right flex flex-col items-end">
              {trade.status === 0 ? (
                <div className="flex items-center gap-2 text-orange-500 text-[10px] font-bold bg-orange-500/10 px-3 py-1 rounded-full uppercase tracking-tighter">
                  <Clock size={10} className="animate-spin" />
                  Live Position
                </div>
              ) : trade.status === 1 ? (
                <div className="text-green-500 text-[10px] font-bold bg-green-500/10 px-3 py-1 rounded-full uppercase tracking-tighter">
                  WON +{PAYOUT_RATES[trade.timeframe as keyof typeof PAYOUT_RATES]}%
                </div>
              ) : (
                <div className="text-red-500 text-[10px] font-bold bg-red-500/10 px-3 py-1 rounded-full uppercase tracking-tighter">
                  LOSS
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-gray-800 pt-4 mt-4">
            <div>
              <p className="text-[10px] text-gray-600 font-bold uppercase mb-1">Stake</p>
              <p className="text-sm font-mono text-white">{Number(trade.stake) / 1e8} sBTC</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-600 font-bold uppercase mb-1">Timeframe</p>
              <p className="text-sm text-white font-medium">{trade.timeframe === 1 ? '30s' : trade.timeframe === 2 ? '1m' : trade.timeframe === 3 ? '5m' : '15m'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-600 font-bold uppercase mb-1">Result</p>
              <p className={`text-sm font-mono font-bold ${trade.status === 1 ? 'text-green-500' : 'text-white'}`}>
                {trade.status === 1 ? `+${Number(trade.payoutAmount) / 1e8}` : trade.status === 0 ? '---' : '0.00' }
              </p>
            </div>
          </div>
          {trade.status === 0 && trade.expiryTime && (
            <div className="mt-4 pt-4 border-t border-gray-800/50">
              <Countdown expiryTime={trade.expiryTime} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
