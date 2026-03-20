'use client';

import React from 'react';
import { Trophy, Frown, X, ArrowUpRight, TrendingUp } from 'lucide-react';

interface ResultModalProps {
  type: 'win' | 'loss';
  amount: string;
  onClose: () => void;
}

export function ResultModal({ type, amount, onClose }: ResultModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className={`relative w-full max-w-sm overflow-hidden rounded-[2.5rem] border animate-in zoom-in-95 duration-300 ${
        type === 'win' 
          ? 'bg-green-950/20 border-green-500/30' 
          : 'bg-red-950/20 border-red-500/30'
      }`}>
        {/* Decorative Background Elements */}
        <div className={`absolute top-0 left-0 w-full h-32 opacity-20 bg-gradient-to-b ${
          type === 'win' ? 'from-green-500' : 'from-red-500'
        } to-transparent`} />
        
        <div className="relative p-8 text-center">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-all"
          >
            <X size={20} />
          </button>

          <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-2xl ${
            type === 'win' 
              ? 'bg-green-500 text-white shadow-green-500/20' 
              : 'bg-red-500 text-white shadow-red-500/20'
          }`}>
            {type === 'win' ? <Trophy size={40} /> : <Frown size={40} />}
          </div>

          <h2 className={`text-2xl font-black italic tracking-tighter mb-2 ${
            type === 'win' ? 'text-green-500' : 'text-red-500'
          }`}>
            {type === 'win' ? 'JACKPOT! YOU WON' : 'BETTER LUCK NEXT TIME'}
          </h2>
          
          <p className="text-gray-400 text-sm mb-8 font-medium">
            {type === 'win' 
              ? 'Your prediction was spot on. The market moved in your favor!' 
              : 'The market took a different turn this time. Ready for the next one?'}
          </p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Payout</p>
            <div className="flex items-center justify-center gap-2">
               <span className={`text-3xl font-mono font-black ${type === 'win' ? 'text-white' : 'text-gray-500'}`}>
                 {type === 'win' ? `+${amount}` : '0.00'}
               </span>
               <span className="text-orange-500 font-bold text-sm">sBTC</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] ${
              type === 'win' 
                ? 'bg-green-500 text-white shadow-green-500/20' 
                : 'bg-gray-800 text-white shadow-black/20'
            }`}
          >
            {type === 'win' ? (
              <>
                <TrendingUp size={18} />
                TRADE AGAIN
              </>
            ) : 'BACK TO CHART'}
          </button>
        </div>
      </div>
    </div>
  );
}
