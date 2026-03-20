"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { WalletProvider, useWallet } from '@/components/WalletProvider';
import { TradePanel } from '@/components/TradePanel';
import { TradeList } from '@/components/TradeList';
import { Trade } from '@/types';
import { PriceChart } from '@/components/PriceChart';
import { getBTCPrice, getSBTCBalance, mintSBTC, getTraderTrades } from '@/lib/stacks';
import { ResultModal } from '@/components/ResultModal';
import { ChevronDown, Globe, Zap, TrendingUp, TrendingDown, Plus } from 'lucide-react';

function Dashboard() {
  const { connected, connect, address } = useWallet();
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [view, setView] = useState<'opened' | 'history'>('opened');
  const [chartData, setChartData] = useState<{ time: number; value: number }[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [resultModal, setResultModal] = useState<{ type: 'win' | 'loss', amount: string } | null>(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Price
      const price = await getBTCPrice();
      if (price > 0) {
        const val = price / 1e8;
        setCurrentPrice(price);
        setChartData(prev => {
          const lastPoint = prev[prev.length - 1];
          const now = Math.floor(Date.now() / 1000);
          if (lastPoint && lastPoint.time === now) return prev;
          return [...prev, { time: now, value: val }].slice(-100);
        });
      }

      // Fetch Balance & Trades
      if (address) {
        const [bal, onChainTrades] = await Promise.all([
          getSBTCBalance(address),
          getTraderTrades(address)
        ]);
        
        setBalance(bal);
        
        // Merge on-chain trades with existing ones
        // On-chain trades have real IDs and status.
        // We keep optimistic trades that haven't appeared on-chain yet.
        setActiveTrades(prev => {
          const now = Math.floor(Date.now() / 1000);
          const blockDiff = (b: number) => (b > 0 ? (now - (16440000 - b) * 5) : now); // dummy fallback for testnet time

          const onChainTradesWithTime = onChainTrades.map(t => ({
            ...t,
            // Estimate time based on block height (5s per block approx)
            entryTime: t.entryTime || (now - (300 - (t.entryBlock % 300)) * 5) 
          }));

          const stillOptimistic = prev.filter(t => t.id >= 1000000);
          
          // Deduplicate by direction and timeframe if close in time
          const filteredOptimistic = stillOptimistic.filter(opt => 
            !onChainTrades.some(oc => 
              oc.direction === opt.direction && 
              oc.timeframe === opt.timeframe &&
              Math.abs((oc.entryBlock || 0) - (opt.entryBlock || 0)) < 10
            )
          );

          return [...filteredOptimistic, ...onChainTradesWithTime].sort((a, b) => b.id - a.id);
        });
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [address]);

  const handleFaucet = async () => {
    if (!address) return;
    try {
      await mintSBTC(100000000, address); // Mint 1 sBTC
    } catch (e) {
      console.error(e);
    }
  };

  // Settlement Logic: Check and settle trades locally
  useEffect(() => {
    const settleInterval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      let changed = false;

      const updatedTrades = activeTrades.map(trade => {
        if (trade.status === 0 && trade.expiryTime && now >= trade.expiryTime) {
          changed = true;
          // Determine outcome
          const isWinner = trade.direction 
            ? currentPrice > Number(trade.entryPrice)
            : currentPrice < Number(trade.entryPrice);
          
          const status = isWinner ? 1 : 2;
          const payoutAmount = isWinner ? BigInt(Math.floor(Number(trade.stake) * (1 + 0.8))) : BigInt(0);

          // Trigger Modal
          setResultModal({
            type: isWinner ? 'win' : 'loss',
            amount: (Number(payoutAmount) / 1e8).toFixed(4)
          });
          
          return {
            ...trade,
            status,
            payoutAmount
          };
        }
        return trade;
      });

      if (changed) {
        setActiveTrades(updatedTrades);
      }
    }, 1000);

    return () => clearInterval(settleInterval);
  }, [activeTrades, currentPrice]);

  const handleTradePlaced = (direction: boolean, timeframe: number, stake: number, entryPrice: number) => {
    const lastPoint = chartData[chartData.length - 1];
    const entryTime = lastPoint ? lastPoint.time : Math.floor(Date.now() / 1000);
    const durationSeconds = timeframe === 1 ? 30 : timeframe === 2 ? 60 : timeframe === 3 ? 300 : 900;
    
    const newTrade: Trade = {
      id: Math.floor(Math.random() * 10000), 
      trader: address || '',
      direction,
      stake: BigInt(stake),
      entryPrice: BigInt(entryPrice),
      closePrice: BigInt(0),
      entryBlock: 0,
      expiryBlock: 0,
      timeframe,
      payoutRate: 80,
      status: 0,
      payoutAmount: BigInt(0),
      claimed: false,
      entryTime: entryTime,
      expiryTime: entryTime + durationSeconds,
    };

    setActiveTrades(prev => [newTrade, ...prev]);
  };

  const filteredTrades = activeTrades.filter(t => 
    view === 'opened' ? t.status === 0 : t.status !== 0
  );

  return (
    <main className="min-h-screen bg-[#060709] text-white p-4 md:p-8 selection:bg-orange-500/30 font-sans">
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-orange-600/5 blur-[120px] rounded-full" />
      </div>

      <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer transition-all">
            <img 
              src="/bitoracle-logo.png" 
              alt="BitOracle" 
              className="h-10 w-auto rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/10" 
            />
            <div className="flex flex-col leading-none">
              <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">BITORACLE</h1>
              <span className="text-[10px] text-orange-500 font-bold tracking-[0.3em] ml-1 uppercase">ORACLE PROTOCOL</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 bg-gray-900/50 p-1 rounded-xl border border-gray-800/50">
             <button 
               onClick={() => setView('opened')}
               className={`px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-2 ${view === 'opened' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
             >
               <Zap size={14} className={view === 'opened' ? 'text-orange-500' : 'text-gray-600'} />
               Trading
             </button>
             <button 
               onClick={() => {
                 setView('history');
                 document.getElementById('trades-section')?.scrollIntoView({ behavior: 'smooth' });
               }}
               className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'history' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
             >
               Orders
             </button>
             <button className="px-4 py-2 text-gray-500 hover:text-gray-300 rounded-lg text-xs font-bold transition-all">Finance</button>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-2 flex items-center gap-3">
             <div className="flex flex-col items-end">
                <span className="text-[9px] text-gray-600 font-black uppercase">Balance</span>
                <span className="text-sm font-mono font-bold text-white">{(balance / 1e8).toFixed(4)} <span className="text-orange-500">sBTC</span></span>
             </div>
             <button 
               onClick={handleFaucet}
               className="bg-orange-500 hover:bg-orange-400 p-2 rounded-lg transition-all flex items-center gap-1 group"
               title="Get mock sBTC"
             >
                <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                <span className="text-[10px] font-black hidden lg:block">FAUCET</span>
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
                <PriceChart data={chartData} trades={activeTrades} />
             </div>
          </div>

          <div id="trades-section" className="h-[200px] flex flex-col gap-4">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest">Trades Overview</h2>
              <div className="flex gap-4">
                <button 
                  onClick={() => setView('opened')}
                  className={`text-[10px] font-black uppercase pb-1 transition-all ${view === 'opened' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-600 hover:text-gray-400'}`}
                >
                  Opened
                </button>
                <button 
                  onClick={() => setView('history')}
                  className={`text-[10px] font-black uppercase pb-1 transition-all ${view === 'history' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-600 hover:text-gray-400'}`}
                >
                  History
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <TradeList trades={filteredTrades} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 xl:col-span-3">
          <TradePanel onTradePlaced={handleTradePlaced} />
        </div>
      </section>

      {resultModal && (
        <ResultModal 
          type={resultModal.type}
          amount={resultModal.amount}
          onClose={() => setResultModal(null)}
        />
      )}

      <footer className="mt-12 py-8 border-t border-gray-800/20 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
        <Link href="/" className="flex items-center gap-2 group transition-all">
          <img src="/bitoracle-logo.png" alt="Logo" className="h-8 w-auto rounded-lg group-hover:scale-110 transition-transform" />
          <h1 className="text-sm font-black tracking-tighter text-white uppercase italic">BITORACLE</h1>
        </Link>
        <div className="flex gap-8 text-[10px] font-black text-gray-600 uppercase tracking-widest">
           <Link href="#" className="hover:text-white transition-colors">Documentation</Link>
           <Link href="#" className="hover:text-white transition-colors">Support</Link>
           <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
        </div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">© 2026 BitOracle Binary Protocol</p>
      </footer>

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
