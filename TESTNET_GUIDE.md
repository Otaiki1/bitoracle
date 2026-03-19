# 🌐 BitOracle Testnet Deployment Guide

This guide covers how to move from local development to the **Stacks Testnet**.

## 1. Prerequisites
- **Leather or Xverse Wallet**: With some Testnet STX.
- **Testnet STX Faucet**: Get free STX at [explorer.hiro.so/sandbox/faucet](https://explorer.hiro.so/sandbox/faucet).
- **Private Key**: Your deployment account must have STX to pay for contract deployments.

---

## 2. Deploying to Testnet
Clarinet simplifies testnet deployment using a `deployment` plan.

1.  **Generate a Deployment Plan**:
    ```bash
    cd bitoracle
    clarinet deployment generate --testnet
    ```
2.  **Edit the Plan** (Optional): Review `deployments/default.testnet-plan.yaml` to ensure the order is correct:
    - `bitoracle-sbtc.clar`
    - `bo-oracle-adapter.clar`
    - `bo-liquidity-vault.clar`
    - `bo-trade-engine.clar`
3.  **Execute Deployment**:
    ```bash
    # You will need your mnemonic for the account that has STX
    clarinet deployments apply --testnet
    ```
    *Note: Save the contract addresses from the output!*

---

## 3. Funding & Seeding (On Testnet)
Once deployed, you need to seed the house vault with sBTC.

1.  **Mint Mock sBTC**:
    Call the `mint` function on your deployed `bitoracle-sbtc` contract to get tokens into your wallet.
2.  **Seed the Vault**:
    Call `seed-vault` on the `bo-liquidity-vault` contract.
    ```clarity
    (contract-call? .bo-liquidity-vault seed-vault u500000000) ;; Seed 5 sBTC
    ```
    *Use the Explorer Sandbox to make these calls.*

---

## 4. Keeper Bot Testnet Config
Update the keeper to talk to the testnet.

1.  Edit `keeper/.env`:
    ```env
    NETWORK=testnet
    HIRO_API_URL=https://api.testnet.hiro.so
    CONTRACT_ADDRESS=YOUR_TESTNET_ADDRESS
    KEEPER_PRIVATE_KEY=YOUR_TESTNET_MNEMONIC
    ```
2.  Restart the keeper: `npm run start`

---

## 5. Frontend Testnet Config
Update the frontend to point to the testnet contracts.

1.  Edit `frontend/.env.local`:
    ```env
    NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_TESTNET_ADDRESS
    NEXT_PUBLIC_NETWORK=testnet
    ```
2.  Restart the frontend: `npm run dev`

---

## 💡 Pro-Tips for Testnet
- **Block Times**: Testnet blocks follow the Bitcoin testnet (~10 minutes). Expect slower confirmation than local Devnet.
- **Oracle Data**: The keeper will still fetch Pyth prices, but make sure the `oracle-adapter` is correctly updated on-chain.
- **Verification**: Verify your contracts on the [Stacks Explorer](https://explorer.hiro.so) to see the state of `trades` and `vault` balances.
