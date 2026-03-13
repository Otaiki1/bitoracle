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
