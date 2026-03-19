// lib/constants.ts
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

const IS_MAINNET = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';

export const NETWORK = IS_MAINNET ? STACKS_MAINNET : STACKS_TESTNET;

export const CONTRACT_ADDRESS = IS_MAINNET
  ? process.env.NEXT_PUBLIC_MAINNET_CONTRACT_ADDRESS!
  : process.env.NEXT_PUBLIC_TESTNET_CONTRACT_ADDRESS || 'ST1KA46BB5FK702F47BFKJ13BBVTKPV8SV0YC4QR7';

export const SBTC_CONTRACT = {
  address: IS_MAINNET
    ? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ'  // mainnet sBTC
    : 'ST1KA46BB5FK702F47BFKJ13BBVTKPV8SV0YC4QR7', // updated testnet principal
  name: 'bo-sbtc-v5',
  tokenName: 'sBTC',
};

export const HIRO_API_URL = IS_MAINNET
  ? 'https://api.hiro.so'
  : 'https://api.testnet.hiro.so';

// Duration in blocks per timeframe
export const TIMEFRAME_BLOCKS = {
  1: 6,   // 30s
  2: 12,  // 1m
  3: 60,  // 5m
  4: 180, // 15m
};

// Payout rates in percent (for display)
export const PAYOUT_RATES = {
  1: 70,
  2: 80,
  3: 85,
  4: 90,
};
