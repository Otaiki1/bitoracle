// types/index.ts
export type RoundStatus = 'open' | 'locked' | 'settled';
export type Direction = 'UP' | 'DOWN';

export interface Round {
  id: number;
  asset: string;
  openPrice: bigint;
  closePrice: bigint;
  startBlock: number;
  endBlock: number;
  totalUp: bigint;
  totalDown: bigint;
  status: RoundStatus;
  winningDirection: string;
}

export interface Prediction {
  roundId: number;
  predictor: string;
  amount: bigint;
  direction: Direction;
  claimed: boolean;
}
export interface Trade {
  id: number;
  trader: string;
  direction: boolean;
  stake: bigint;
  entryPrice: bigint;
  closePrice: bigint;
  entryBlock: number;
  expiryBlock: number;
  timeframe: number;
  payoutRate: number;
  status: number; // 0=open, 1=won, 2=lost, 3=draw
  payoutAmount: bigint;
  claimed: boolean;
  entryTime?: number; // unix timestamp for chart mapping
  expiryTime?: number; // unix timestamp for countdown
}
