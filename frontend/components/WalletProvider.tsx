'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
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
  const appConfig = new AppConfig(['store_write', 'publish_data']);
  const userSession = new UserSession({ appConfig });
  const [userData, setUserData] = useState<any | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
      setConnected(true);
    }
  }, []);

  const connect = () => {
    showConnect({
      appDetails: {
        name: 'BitOracle',
        icon: '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
        setConnected(true);
      },
      userSession,
    });
  };

  const disconnect = () => {
    userSession.signUserOut();
    setUserData(null);
    setConnected(false);
  };

  const address = connected ? (NETWORK.isMainnet() ? userData.profile.stxAddress.mainnet : userData.profile.stxAddress.testnet) : null;

  return (
    <WalletContext.Provider value={{ userSession, userData, connected, connect, disconnect, address }}>
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
