'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppConfig, UserSession, authenticate } from '@stacks/connect';
import { NETWORK } from '@/lib/constants';

interface WalletContextType {
  userSession: UserSession;
  userData: any | null;
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
  address: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const appConfig = new AppConfig(['store_write', 'publish_data']);
    const session = new UserSession({ appConfig });
    setUserSession(session);
    
    if (session.isUserSignedIn()) {
      setUserData(session.loadUserData());
      setConnected(true);
    }
  }, []);

  const connect = () => {
    if (!userSession) return;
    console.log('Attempting to connect wallet...');
    if (typeof authenticate !== 'function') return;
    
    authenticate({
      appDetails: { name: 'BitOracle', icon: '/bitoracle-logo.png' },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
        setConnected(true);
      },
      userSession,
    });
  };

  const disconnect = () => {
    userSession?.signUserOut();
    setUserData(null);
    setConnected(false);
  };

  const address = (connected && userData)
    ? (NETWORK.chainId === 1 ? userData.profile.stxAddress.mainnet : userData.profile.stxAddress.testnet) 
    : null;

  return (
    <WalletContext.Provider value={{ userSession: userSession!, userData, connected, connect, disconnect, address }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
