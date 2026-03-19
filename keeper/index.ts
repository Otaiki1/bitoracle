// keeper/index.ts
import { STACKS_TESTNET } from '@stacks/network';
import {
  makeContractCall,
  uintCV,
  broadcastTransaction,
  AnchorMode,
} from '@stacks/transactions';
import { getBTCPrice } from './oracle.ts';
import { getMockBTCPrice } from './mockOracle.ts';
import { getLatestBlock, getTradeCounter, getTrade, getPrivateKeyFromMnemonic } from './stacks.ts';

import * as dotenv from 'dotenv';

dotenv.config();

const RAW_KEY = process.env.KEEPER_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const NETWORK = STACKS_TESTNET;

if (!RAW_KEY || !CONTRACT_ADDRESS) {
  console.error('❌ Error: KEEPER_PRIVATE_KEY or CONTRACT_ADDRESS missing in .env');
  process.exit(1);
}

console.log(`Configured for Contract: ${CONTRACT_ADDRESS}`);
console.log(`Network: ${NETWORK.client.baseUrl}`);

let resolvedPrivateKey: string;

async function keeperLoop() {
  console.log('BitOracle keeper bot started — monitoring individual trades...');
  try {
    resolvedPrivateKey = await getPrivateKeyFromMnemonic(RAW_KEY!);
    console.log('✅ Private key resolved successfully.');
  } catch (e: any) {
    console.error('❌ Failed to resolve private key:', e);
    process.exit(1);
  }

  while (true) {
    try {
      await settleExpiredTrades();
    } catch (err: any) {
      console.error('⚠️ Keeper Loop Warning:', err.message || err);
    }

    await sleep(10_000);
  }
}

async function settleExpiredTrades() {
  const currentBlock = await getLatestBlock();
  const totalTrades = await getTradeCounter();

  console.log(`Block ${currentBlock}: scanning last trades... (Total: ${totalTrades})`);

  // Scan last 50 trades for demo purposes
  const SCAN_WINDOW = 50;
  const startId = Math.max(1, totalTrades - SCAN_WINDOW + 1);

  for (let tradeId = startId; tradeId <= totalTrades; tradeId++) {
    const trade = await getTrade(tradeId);

    if (!trade) continue;
    if (trade.status !== 0) continue; // skip already settled
    
    if (currentBlock < trade.expiryBlock) {
      // Not yet expired
      continue;
    }

    // Trade has expired — settle it
    console.log(`Trade ${tradeId}: EXPIRED (at block ${trade.expiryBlock}) — settling...`);
    await settleTrade(tradeId);
  }
}

async function settleTrade(tradeId: number) {
  let price: bigint;
  try {
    const pyth = await getBTCPrice();
    price = pyth.price;
  } catch (e) {
    console.warn('Pyth failed, using mock oracle...');
    price = await getMockBTCPrice();
  }

  console.log(`Settling trade ${tradeId} with price: ${price}`);

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS as string,
    contractName: 'bo-engine-v5',
    functionName: 'settle-trade',
    functionArgs: [
      uintCV(tradeId),
      uintCV(price),
    ],
    senderKey: resolvedPrivateKey,
    network: NETWORK,
    anchorMode: AnchorMode.Any,
    fee: 5000,
  };

  const tx = await makeContractCall(txOptions);
  const result = await broadcastTransaction({ transaction: tx, network: NETWORK });

  if ('error' in result) {
    throw new Error(`Settlement failed: ${result.error} (reason: ${result.reason})`);
  }

  console.log(`Trade ${tradeId} settled! txid: ${result.txid}`);
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

keeperLoop();
