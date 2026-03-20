"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Shield, TrendingUp, Globe, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#060709] text-white selection:bg-orange-500/30 overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-orange-600/10 blur-[150px] rounded-full" />
        <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full" />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#060709]/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <img 
              src="/bitoracle-logo.png" 
              alt="BitOracle Logo" 
              className="h-10 w-auto group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/10 rounded-xl"
            />
            <h1 className="text-xl font-black tracking-tighter text-white">BITORACLE</h1>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-400">
            <Link href="#" className="hover:text-white transition-colors">Technology</Link>
            <Link href="#" className="hover:text-white transition-colors">Security</Link>
            <Link href="#" className="hover:text-white transition-colors">Community</Link>
          </div>

          <Link 
            href="/trading" 
            className="bg-white text-black px-6 py-2.5 rounded-xl font-black text-xs shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            LAUNCH APP
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-60 md:pb-40 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900/50 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            V1.0 NOW LIVE ON TESTNET
          </div>

          <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter mb-8 leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 max-w-4xl mx-auto">
            PREDICT THE FUTURE OF <span className="text-orange-500">BITCOIN.</span>
          </h2>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            BitOracle brings institutional-grade binary trading to Stacks. Trade BTC price action with lightning settlement, powered by Pyth and sBTC.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              href="/trading" 
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-400 text-white px-10 py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-orange-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
            >
              START TRADING <ArrowRight size={20} />
            </Link>
            <button className="w-full sm:w-auto bg-gray-900 border border-white/5 hover:border-white/10 text-white px-10 py-5 rounded-[2rem] font-black text-lg transition-all flex items-center justify-center gap-3">
              VIEW DOCS <Globe size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="mt-24 relative max-w-5xl mx-auto rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl shadow-black">
             <div className="absolute inset-0 bg-gradient-to-t from-[#060709] via-transparent to-transparent z-10" />
             <img 
               src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop" 
               alt="BitOracle Interface" 
               className="w-full h-auto opacity-50 contrast-125 saturate-50"
             />
             <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-orange-500/10 backdrop-blur-md border border-orange-500/30 p-8 rounded-[2.5rem] flex flex-col items-center">
                   <div className="flex items-center gap-4 mb-2">
                      <span className="text-6xl font-black font-mono tracking-tighter">$72,401.50</span>
                      <div className="p-2 bg-green-500/20 text-green-500 rounded-xl">
                         <TrendingUp size={24} />
                      </div>
                   </div>
                   <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">Real-time BTC Oracle Feed</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900/30 border border-white/5 p-10 rounded-[2.5rem] hover:border-orange-500/30 transition-all group">
              <div className="w-14 h-14 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Zap size={28} />
              </div>
              <h3 className="text-2xl font-black italic tracking-tighter mb-4">Instant Settlement</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Binary positions settle the microsecond the timeframe expires. High frequency trading, perfected for Bitcoin.
              </p>
            </div>

            <div className="bg-gray-900/30 border border-white/5 p-10 rounded-[2.5rem] hover:border-blue-500/30 transition-all group">
              <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Shield size={28} />
              </div>
              <h3 className="text-2xl font-black italic tracking-tighter mb-4">Secured by sBTC</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                BitOracle runs natively on Stacks, utilizing the security and programmability of Bitcoin's premier layer.
              </p>
            </div>

            <div className="bg-gray-900/30 border border-white/5 p-10 rounded-[2.5rem] hover:border-green-500/30 transition-all group">
              <div className="w-14 h-14 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Globe size={28} />
              </div>
              <h3 className="text-2xl font-black italic tracking-tighter mb-4">Pyth Network Oracles</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Institutional price feeds ensure every trade is fair, accurate, and resistant to market manipulation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter leading-tight mb-8">
              "BitOracle combines the reliability of Bitcoin with the speed of decentralized binary options."
            </h2>
            <div className="flex items-center justify-center gap-3">
               <div className="w-8 h-8 rounded-full bg-orange-500" />
               <span className="font-bold text-sm tracking-widest uppercase">The Genesis Team</span>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/bitoracle-logo.png" alt="Logo" className="h-8 w-auto rounded-lg group-hover:scale-110 transition-transform" />
            <h1 className="text-sm font-black tracking-tighter text-white uppercase">BITORACLE</h1>
          </Link>
          <div className="flex gap-8 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            <Link href="#" className="hover:text-white transition-colors">Term of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Github</Link>
          </div>
          <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">© 2026 BitOracle Binary Protocol</p>
        </div>
      </footer>
    </div>
  );
}
