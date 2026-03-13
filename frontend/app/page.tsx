'use client';

import { WalletProvider, useWallet } from '@/components/WalletProvider';
import { MarketCard } from '@/components/MarketCard';
import { useState } from 'react';
import { Round } from '@/types';

function Dashboard() {
  const { connected, connect, address } = useWallet();
  const [rounds] = useState<Round[]>([
    {
      id: 1,
      asset: 'BTC/USD',
      openPrice: 6500000000000n,
      closePrice: 0n,
      startBlock: 100,
      endBlock: 105,
      totalUp: 1000000n,
      totalDown: 500000n,
      status: 'open',
      winningDirection: ''
    }
  ]);

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-orange-500">BITORACLE</h1>
          <p className="text-gray-400">Bitcoin-Native Prediction Markets</p>
        </div>
        
        {connected ? (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500 font-bold uppercase">Connected Wallet</p>
              <p className="text-sm font-mono">{address?.slice(0,6)}...{address?.slice(-4)}</p>
            </div>
            <button className="bg-gray-900 border border-gray-800 px-6 py-2 rounded-xl font-bold hover:bg-gray-800 transition-all">
              0.0000 sBTC
            </button>
          </div>
        ) : (
          <button 
            onClick={connect}
            className="bg-orange-500 hover:bg-orange-400 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all"
          >
            Connect Wallet
          </button>
        )}
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-4">
          <h2 className="text-2xl font-bold">Active Markets</h2>
        </div>
        {rounds.map(round => (
          <MarketCard key={round.id} round={round} onSelect={(id) => console.log('Selected', id)} />
        ))}
      </section>
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
