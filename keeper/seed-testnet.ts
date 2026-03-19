import {
  makeContractCall,
  uintCV,
  principalCV,
  broadcastTransaction,
  PostConditionMode,
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { getPrivateKeyFromMnemonic } from './stacks.ts';
import * as dotenv from 'dotenv';

dotenv.config();

const MNEMONIC = process.env.KEEPER_PRIVATE_KEY!;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
const NETWORK = STACKS_TESTNET;

async function seedTestnet() {
  console.log('🚀 Starting Testnet Seeding Script...');
  
  const privateKey = await getPrivateKeyFromMnemonic(MNEMONIC);

  // 1. Mint 50 sBTC to the deployer
  console.log('--- Step 1: Minting 50 sBTC to deployer ---');
  const mintTx = await makeContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: 'bo-sbtc-v5',
    functionName: 'mint',
    functionArgs: [
      uintCV(5_000_000_000), // 50 sBTC in sats
      principalCV(CONTRACT_ADDRESS),
    ],
    senderKey: privateKey,
    network: NETWORK,
  });
  
  const mintResult = await broadcastTransaction({ transaction: mintTx, network: NETWORK });
  console.log('Mint TX broadcasted:', mintResult.txid);

  // 2. Seed 10 sBTC into the Vault
  console.log('--- Step 2: Seeding 10 sBTC into the Vault ---');
  const seedTx = await makeContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: 'bo-vault-v5',
    functionName: 'seed-vault',
    functionArgs: [
      uintCV(1_000_000_000), // 10 sBTC in sats
    ],
    senderKey: privateKey,
    network: NETWORK,
    postConditionMode: PostConditionMode.Allow,
  });
  
  const seedResult = await broadcastTransaction({ transaction: seedTx, network: NETWORK });
  console.log('Seed TX broadcasted:', seedResult.txid);

  console.log('\n✅ Seeding transactions sent! Wait a few minutes for confirmation on the explorer.');
}

seedTestnet().catch(console.error);
