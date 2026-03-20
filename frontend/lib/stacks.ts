import { 
  Cl,
  Pc,
  fetchCallReadOnlyFunction,
  AnchorMode, 
  PostConditionMode, 
  ClarityType
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { NETWORK, CONTRACT_ADDRESS, SBTC_CONTRACT } from './constants';
import { Trade } from '@/types';

const checkConnect = () => {
  if (typeof openContractCall !== 'function') {
    console.error('openContractCall is not a function!', openContractCall);
    return false;
  }
  return true;
};


export async function placeTrade(
  direction: boolean,
  timeframe: number,
  stakeSats: number,
  entryPrice: number,
  userAddress: string
): Promise<void> {
  const postConditions = [
    Pc.principal(userAddress).willSendEq(BigInt(stakeSats)).ft(`${SBTC_CONTRACT.address}.${SBTC_CONTRACT.name}` as `${string}.${string}`, 'sbtc')
  ];

  if (!checkConnect()) return;

  await openContractCall({
    network: NETWORK,
    contractAddress: CONTRACT_ADDRESS,
    contractName: 'bo-engine-v5',
    functionName: 'place-trade',
    functionArgs: [
      Cl.bool(direction),
      Cl.uint(timeframe),
      Cl.uint(stakeSats),
      Cl.uint(entryPrice),
    ],
    postConditions,
    postConditionMode: PostConditionMode.Deny,
    anchorMode: AnchorMode.Any,
    onFinish: (data) => {
      console.log('Trade broadcasted:', data.txId);
    },
  });
}

export async function mintSBTC(amount: number, recipient: string) {
  const transaction = {
    contractAddress: SBTC_CONTRACT.address,
    contractName: SBTC_CONTRACT.name,
    functionName: 'mint',
    functionArgs: [
      Cl.uint(amount),
      Cl.principal(recipient)
    ],
    network: NETWORK,
    onFinish: (data: any) => {
      console.log('STUB: Mint finished', data);
    },
  };

  await openContractCall(transaction);
}

export async function getSBTCBalance(address: string): Promise<number> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: SBTC_CONTRACT.address,
      contractName: SBTC_CONTRACT.name,
      functionName: 'get-balance',
      functionArgs: [Cl.principal(address)],
      network: NETWORK,
      senderAddress: address,
    });

    // SIP-010 get-balance returns (ok uint)
    if (result.type === ClarityType.ResponseOk) {
      const inner = result.value;
      if (inner.type === ClarityType.UInt) {
        return Number(inner.value);
      }
    }
    
    // Fallback for direct uint (though less likely)
    if (result.type === ClarityType.UInt) {
      return Number(result.value);
    }
    
    return 0;
  } catch (e) {
    console.error('Error fetching sBTC balance', e);
    return 0;
  }
}

export async function getTraderTrades(address: string): Promise<Trade[]> {
  try {
    // 1. Get total trade count for this trader
    const countResult = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: 'bo-engine-v5',
      functionName: 'get-trader-trade-count',
      functionArgs: [Cl.principal(address)],
      network: NETWORK,
      senderAddress: address,
    });

    let count = 0;
    if (countResult.type === ClarityType.ResponseOk && (countResult as any).value.type === ClarityType.Tuple) {
      count = Number((countResult as any).value.data.count.value);
    }
    
    if (count === 0) return [];

    // 2. Fetch the last 10 trades for performance
    const trades: Trade[] = [];
    const startIndex = Math.max(0, count - 10);
    
    for (let i = count - 1; i >= startIndex; i--) {
      // Get trade-id at index
      const idResult = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: 'bo-engine-v5',
        functionName: 'get-trader-trade-at-index',
        functionArgs: [Cl.principal(address), Cl.uint(i)],
        network: NETWORK,
        senderAddress: address,
      });

      if (idResult.type === ClarityType.OptionalSome && (idResult as any).value.type === ClarityType.Tuple) {
        const tradeId = (idResult as any).value.data['trade-id'].value;
        
        // Get full trade data
        const tradeResult = await fetchCallReadOnlyFunction({
          contractAddress: CONTRACT_ADDRESS,
          contractName: 'bo-engine-v5',
          functionName: 'get-trade',
          functionArgs: [Cl.uint(tradeId)],
          network: NETWORK,
          senderAddress: address,
        });

        if (tradeResult.type === ClarityType.OptionalSome && (tradeResult as any).value.type === ClarityType.Tuple) {
          const t = (tradeResult as any).value.data;
          trades.push({
            id: Number(tradeId),
            trader: t.trader.value || '',
            direction: t.direction.type === ClarityType.BoolTrue,
            stake: BigInt(t.stake.value),
            entryPrice: BigInt(t['entry-price'].value),
            closePrice: BigInt(t['close-price'].value),
            entryBlock: Number(t['entry-block'].value),
            expiryBlock: Number(t['expiry-block'].value),
            timeframe: Number(t.timeframe.value),
            payoutRate: Number(t['payout-rate'].value),
            status: Number(t.status.value),
            payoutAmount: BigInt(t['payout-amount'].value),
            claimed: t.claimed.type === ClarityType.BoolTrue,
            // Approximations for UI based on block height if needed, 
            // but for history we primarily care about final status
          });
        }
      }
    }
    return trades;
  } catch (e) {
    console.error('Error fetching trade history', e);
    return [];
  }
}

export async function getBTCPrice(): Promise<number> {
  try {
    const response = await fetch('https://hermes.pyth.network/v2/updates/price/latest?ids[]=0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43&parsed=true');
    const data = await response.json();
    const priceData = data.parsed[0].price;
    const price = Number(priceData.price) * Math.pow(10, priceData.expo + 8);
    return Math.round(price);
  } catch (e) {
    console.error('Error fetching price:', e);
    return 0;
  }
}
