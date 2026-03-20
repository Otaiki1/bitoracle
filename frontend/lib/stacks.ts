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
