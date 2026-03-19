import { 
  fetchCallReadOnlyFunction, 
  uintCV, 
  cvToValue
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { generateWallet, getStxAddress, deriveAccount } from '@stacks/wallet-sdk';

const API_URL = process.env.HIRO_API_URL || 'https://api.testnet.hiro.so';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || 'ST1KA46BB5FK702F47BFKJ13BBVTKPV8SV0YC4QR7';
const NETWORK = { ...STACKS_TESTNET, client: { baseUrl: API_URL } };

export async function getPrivateKeyFromMnemonic(mnemonic: string): Promise<string> {
  // If it's already a hex string (starts with 0x or is 64/66 chars), return it
  if (mnemonic.length === 64 || mnemonic.length === 66) return mnemonic;
  
  const wallet = await generateWallet({
    secretKey: mnemonic,
    password: '',
  });
  return wallet.accounts[0]?.stxPrivateKey || '';
}

export async function getLatestBlock(): Promise<number> {
  const res = await fetch(`${API_URL}/v2/info`);
  const data: any = await res.json();
  return data.stacks_tip_height;
}

export async function getTradeCounter(): Promise<number> {
  try {
    const res = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: 'bo-engine-v5',
      functionName: 'get-trade-counter',
      functionArgs: [],
      senderAddress: CONTRACT_ADDRESS,
      network: NETWORK,
    });
    return Number(cvToValue(res));
  } catch (e) {
    console.error('Error fetching trade counter:', e);
    return 0;
  }
}

export async function getTrade(tradeId: number): Promise<any> {
  try {
    const res = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: 'bo-engine-v5',
      functionName: 'get-trade',
      functionArgs: [uintCV(tradeId)],
      senderAddress: CONTRACT_ADDRESS,
      network: NETWORK,
    });
    const trade = cvToValue(res);
    if (!trade || !trade.value) return null;
    
    return {
      id: tradeId,
      trader: trade.value.trader,
      direction: trade.value.direction,
      stake: Number(trade.value.stake),
      entryPrice: Number(trade.value['entry-price']),
      expiryBlock: Number(trade.value['expiry-block']),
      status: Number(trade.value.status),
    };
  } catch (e) {
    console.error(`Error fetching trade ${tradeId}:`, e);
    return null;
  }
}
