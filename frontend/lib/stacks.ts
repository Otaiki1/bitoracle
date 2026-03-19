// lib/stacks.ts
import { 
  makeContractCall, 
  uintCV, 
  boolCV,
  AnchorMode, 
  PostConditionMode, 
  FungibleConditionCode, 
  createAsset,
  Pc
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

  const sBTCAsset = 'ST1KA46BB5FK702F47BFKJ13BBVTKPV8SV0YC4QR7.bo-sbtc-v5' as `${string}.${string}`;
  console.log('STUB: sBTCAsset:', sBTCAsset);
  console.log('STUB: tokenName:', SBTC_CONTRACT.tokenName);
  console.log('STUB: amountSats:', stakeSats);

  const postConditions = [
    Pc.principal(userAddress).willSendEq(BigInt(stakeSats)).ft('ST1KA46BB5FK702F47BFKJ13BBVTKPV8SV0YC4QR7.bo-sbtc-v5', 'sbtc')
  ];

  if (!checkConnect()) return;

  await openContractCall({
    network: NETWORK,
    contractAddress: CONTRACT_ADDRESS,
    contractName: 'bo-engine-v5',
    functionName: 'place-trade',
    functionArgs: [
      boolCV(direction),
      uintCV(timeframe),
      uintCV(stakeSats),
      uintCV(entryPrice),
    ],
    postConditions,
    postConditionMode: PostConditionMode.Deny,
    anchorMode: AnchorMode.Any,
    onFinish: (data) => {
      console.log('Trade broadcasted:', data.txId);
    },
    onCancel: () => {
      console.log('Trade cancelled');
    },
  });
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
