// lib/constants.ts
import { StacksTestnet, StacksMainnet } from '@stacks/network';

const IS_MAINNET = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';

export const NETWORK = IS_MAINNET ? new StacksMainnet() : new StacksTestnet();

export const CONTRACT_ADDRESS = IS_MAINNET
  ? process.env.NEXT_PUBLIC_MAINNET_CONTRACT_ADDRESS!
  : process.env.NEXT_PUBLIC_TESTNET_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

export const SBTC_CONTRACT = {
  address: IS_MAINNET
    ? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ'  // mainnet sBTC
    : 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // testnet mock
  name: 'sbtc-token',
  tokenName: 'sBTC',
};

export const HIRO_API_URL = IS_MAINNET
  ? 'https://api.hiro.so'
  : 'https://api.testnet.hiro.so';

// Duration of each round in Stacks blocks
export const ROUND_DURATIONS = {
  '30s':  1,
  '1m':   1,
  '5m':   1,
  '15m':  2,
  '1h':   6,
};
