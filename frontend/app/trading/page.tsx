"use client";

import React from 'react';
import nextDynamic from 'next/dynamic';

export const dynamic = "force-dynamic";

const TradingContent = nextDynamic(
  () => import('@/components/TradingContent').then(mod => mod.TradingContent),
  { ssr: false }
);

export default function Home() {
  return <TradingContent />;
}
