'use client';

import React, { useState, useEffect } from 'react';

interface CountdownProps {
  expiryTime: number; // unix timestamp
  onExpiry?: () => void;
}

export function Countdown({ expiryTime, onExpiry }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const update = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, expiryTime - now);
      setTimeLeft(remaining);
      
      if (remaining === 0 && onExpiry) {
        onExpiry();
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiryTime, onExpiry]);

  const percentage = Math.max(0, Math.min(100, (timeLeft / 60) * 100)); // Normalized to 1m for visuals, or dynamic

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between items-center text-[10px] font-mono">
        <span className="text-gray-500 uppercase tracking-tighter">Time to Expiry</span>
        <span className={timeLeft < 10 ? 'text-red-500 animate-pulse font-bold' : 'text-orange-500 font-bold'}>
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </span>
      </div>
      <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${timeLeft < 10 ? 'bg-red-500' : 'bg-orange-500'}`}
          style={{ width: `${(timeLeft / 60) * 100}%` }} // Simplified percentage
        />
      </div>
    </div>
  );
}
