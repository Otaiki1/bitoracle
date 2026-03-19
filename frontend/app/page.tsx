"use client";

import React, { useState, useEffect } from 'react';
import { WalletProvider, useWallet } from '@/components/WalletProvider';
import { TradePanel } from '@/components/TradePanel';
import { TradeList } from '@/components/TradeList';
import { Trade } from '@/types';
import { PriceChart } from '@/components/PriceChart';
import { getBTCPrice } from '@/lib/stacks';
import { ChevronDown, Globe, Zap, TrendingUp, TrendingDown } from 'lucide-react';

function Dashboard() {
  const { connected, connect, address } = useWallet();
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [chartData, setChartData] = useState<{ time: number; value: number }[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);

  useEffect(() => {
    const fetchPrice = async () => {
      const price = await getBTCPrice();
      if (price > 0) {
        const val = price / 1e8;
        setCurrentPrice(price);
        setChartData(prev => {
          const newPoint = { time: Math.floor(Date.now() / 1000), value: val };
          const newData = [...prev, newPoint].slice(-100);
          return newData;
        });
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#060709] text-white p-4 md:p-8 selection:bg-orange-500/30 font-sans">
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-orange-600/5 blur-[120px] rounded-full" />
      </div>

      <header className="flex justify-between items-center mb-8 relative z-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-black text-xl italic shadow-lg shadow-orange-500/20">B</div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white leading-none">BITORACLE</h1>
              <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-1">Binary Protocol</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 bg-gray-900/50 p-1 rounded-xl border border-gray-800/50">
             <button className="px-4 py-2 bg-gray-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-2">
               <Zap size={14} className="text-orange-500" />
               Trading
             </button>
             <button className="px-4 py-2 text-gray-500 hover:text-gray-300 rounded-lg text-xs font-bold transition-all">Orders</button>
             <button className="px-4 py-2 text-gray-500 hover:text-gray-300 rounded-lg text-xs font-bold transition-all">Finance</button>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-2 flex items-center gap-3">
             <div className="flex flex-col items-end">
                <span className="text-[9px] text-gray-600 font-black uppercase">Balance</span>
                <span className="text-sm font-mono font-bold text-white">0.0000 <span className="text-orange-500">sBTC</span></span>
             </div>
             <button className="bg-orange-500 hover:bg-orange-400 p-2 rounded-lg transition-all">
                <Globe size={16} />
             </button>
          </div>

          {connected ? (
            <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-2">
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-gray-500 font-black uppercase">Account</span>
                <span className="text-xs font-mono font-bold">{address?.slice(0,6)}...{address?.slice(-4)}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-700" />
            </div>
          ) : (
            <button 
              onClick={connect}
              className="bg-white text-black px-6 py-2.5 rounded-xl font-black text-xs shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              CONNECT
            </button>
          )}
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 h-[calc(100vh-140px)]">
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
          <div className="bg-gray-900/30 border border-gray-800/50 rounded-[2rem] flex-1 relative group overflow-hidden flex flex-col">
             {/* Dynamic Toolbar */}
             <div className="p-4 border-b border-gray-800/50 flex justify-between items-center bg-gray-900/20">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 px-4 py-2 rounded-xl transition-all">
                    <div className="p-1.5 bg-orange-500/20 text-orange-500 rounded-lg">
                      <Zap size={14} />
                    </div>
                    <span className="text-sm font-bold">BTC / USD</span>
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>
                  <div className="h-6 w-px bg-gray-800" />
                  <div className="flex items-center gap-4">
                     <span className="text-xs font-mono font-bold text-green-500">${(currentPrice / 1e8).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                     <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Live Feed (Pyth)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-500 hover:text-white transition-all"><Globe size={18} /></button>
                </div>
             </div>

             <div className="flex-1 p-2 relative">
                <PriceChart data={chartData} />
             </div>
          </div>

          <div className="h-[200px] flex flex-col gap-4">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest">Trades Overview</h2>
              <div className="flex gap-4">
                <button className="text-[10px] font-black text-orange-500 uppercase pb-1 border-b-2 border-orange-500">Opened</button>
                <button className="text-[10px] font-black text-gray-600 uppercase pb-1 hover:text-gray-400 transition-all">History</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <TradeList trades={activeTrades} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 xl:col-span-3">
          <TradePanel />
        </div>
      </section>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1f2937;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #374151;
        }
      `}</style>
    </main>
  );
}

export default function Home() {
  return (
    <WalletProvider>
      <Dashboard />
    </WalletProvider>
  );
}
