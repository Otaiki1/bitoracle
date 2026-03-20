"use client";

import React from 'react';
import { WalletProvider } from '@/components/WalletProvider';
import { TradingDashboard } from '@/components/TradingDashboard';

export function TradingContent() {
  return (
    <WalletProvider>
      <TradingDashboard />
    </WalletProvider>
  );
}
