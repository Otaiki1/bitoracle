// keeper/stacks.ts
import { HIRO_API_URL } from '../frontend/lib/constants'; // Reusing constants if possible, or define locally

const API_URL = process.env.HIRO_API_URL || 'https://api.testnet.hiro.so';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

export async function getLatestBlock(): Promise<number> {
  const res = await fetch(`${API_URL}/extended/v1/block`);
  const data: any = await res.json();
  return data.total_count;
}

export async function getAllActiveRounds(): Promise<any[]> {
  // In a real implementation, we'd query the contract map or an indexer.
  // For the MVP/Demo, we could fetch recent 'create-round' transactions 
  // or poll specific round IDs starting from the latest.
  
  const currentRoundIdRes = await fetch(`${API_URL}/extended/v1/address/${CONTRACT_ADDRESS}.prediction-market/read-only`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: CONTRACT_ADDRESS,
      arguments: []
    })
  });
  // This is a simplified placeholder. In practice, use @stacks/transactions to decode.
  // For now, let's assume we fetch IDs from 1 to latest.
  return []; 
}
