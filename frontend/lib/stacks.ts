// lib/stacks.ts
import { 
  makeContractCall, 
  uintCV, 
  stringAsciiCV, 
  AnchorMode, 
  PostConditionMode, 
  makeStandardFungiblePostCondition, 
  FungibleConditionCode, 
  createAssetInfo 
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { NETWORK, CONTRACT_ADDRESS, SBTC_CONTRACT } from './constants';

export async function placePrediction(
  roundId: number,
  direction: 'UP' | 'DOWN',
  amountSats: number
): Promise<void> {

  const sBTCAsset = createAssetInfo(
    SBTC_CONTRACT.address,
    SBTC_CONTRACT.name,
    SBTC_CONTRACT.tokenName
  );

  const postConditions = [
    makeStandardFungiblePostCondition(
      '', // address filled by @stacks/connect
      FungibleConditionCode.Equal,
      BigInt(amountSats),
      sBTCAsset
    )
  ];

  await openContractCall({
    network: NETWORK,
    contractAddress: CONTRACT_ADDRESS,
    contractName: 'prediction-market',
    functionName: 'place-prediction',
    functionArgs: [
      uintCV(roundId),
      stringAsciiCV(direction),
      uintCV(amountSats),
    ],
    postConditions,
    postConditionMode: PostConditionMode.Deny,
    anchorMode: AnchorMode.Any,
    onFinish: (data) => {
      console.log('Transaction broadcasted:', data.txId);
    },
    onCancel: () => {
      console.log('Transaction cancelled');
    },
  });
}

export async function claimWinnings(roundId: number): Promise<void> {
  await openContractCall({
    network: NETWORK,
    contractAddress: CONTRACT_ADDRESS,
    contractName: 'settlement-engine',
    functionName: 'claim-winnings',
    functionArgs: [uintCV(roundId)],
    postConditionMode: PostConditionMode.Deny,
    anchorMode: AnchorMode.Any,
    onFinish: (data) => {
      console.log('Claim transaction broadcasted:', data.txId);
    },
  });
}
