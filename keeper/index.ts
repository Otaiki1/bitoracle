// keeper/index.ts
import { StacksTestnet } from '@stacks/network';
import {
  makeContractCall,
  uintCV,
  broadcastTransaction,
  AnchorMode,
} from '@stacks/transactions';
import { getBTCPrice } from './oracle';
import { getMockBTCPrice } from './mockOracle';
import { getLatestBlock } from './stacks';
import * as dotenv from 'dotenv';

dotenv.config();

const KEEPER_PRIVATE_KEY = process.env.KEEPER_PRIVATE_KEY!;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
const NETWORK = new StacksTestnet();

async function keeperLoop() {
  console.log('BitOracle keeper bot started...');

  while (true) {
    try {
      await checkAndSettle();
    } catch (err: any) {
      console.error('Keeper error:', err.message);
    }

    await sleep(10_000);
  }
}

async function checkAndSettle() {
  const currentBlock = await getLatestBlock();
  console.log(`Current Block: ${currentBlock}`);
  
  // Logic to fetch and check rounds...
  // For demo purposes, this would iterate through rounds and call settleRound(id)
}

async function settleRound(roundId: number) {
  let price: bigint;
  try {
    const pyth = await getBTCPrice();
    price = pyth.price;
  } catch (e) {
    console.warn('Pyth failed, using mock oracle...');
    price = await getMockBTCPrice();
  }

  console.log(`Settling round ${roundId} with price: ${price}`);

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: 'settlement-engine',
    functionName: 'settle-round',
    functionArgs: [
      uintCV(roundId),
      uintCV(price),
    ],
    senderKey: KEEPER_PRIVATE_KEY,
    network: NETWORK,
    anchorMode: AnchorMode.Any,
    fee: 5000,
  };

  const tx = await makeContractCall(txOptions);
  const result = await broadcastTransaction(tx, NETWORK);

  if (result.error) {
    throw new Error(`Settlement failed: ${result.error}`);
  }

  console.log(`Round ${roundId} settled! txid: ${result.txid}`);
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

keeperLoop();
