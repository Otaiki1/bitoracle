# 🚀 BitOracle Quick Start Guide

Follow these steps to get the entire BitOracle system running on your local machine.

## Prerequisites
- [Clarinet](https://github.com/hirosystems/clarinet) installed.
- Node.js (v18+) and npm installed.
- A Stacks wallet (like Leather) for frontend interaction.

> [!TIP]
> **Ready for Testnet?** See the [🌐 Testnet Deployment Guide](file:///Users/0t41k1/Documents/bitoracle/TESTNET_GUIDE.md) for instructions on going live.

---

## Step 1: Blockchain Setup
First, start the local Stacks environment.

```bash
cd bitoracle
# Start the local Devnet manually or use integrate
clarinet integrate
```

### 💡 Seed the Liquidity Vault
**Crucial Step:** The system requires "House" funds to operate. Without a balance in the vault, trades will be rejected.
1. Open the Clarinet Console: `clarinet console`
2. Run the following to seed **1,000,000 sBTC** (in sats) into the vault:
   ```clarity
   (contract-call? .liquidity-vault seed-vault u1000000)
   ```
3. Type `::quit` to exit.

---

## Step 2: Keeper Bot Setup
The keeper bot automates the settlement of trades by scanning the chain and submitting Pyth price data.

1. Navigate to the keeper directory:
   ```bash
   cd keeper
   ```
2. Configure your `.env` file:
   - `CONTRACT_ADDRESS`: Set this to the project address (usually `ST1KA46BB5FK702F47BFKJ13BBVTKPV8SV0YC4QR7`).
   - `KEEPER_PRIVATE_KEY`: Your mnemonic (from `clarinet integrate` logs).
3. Start the bot:
   ```bash
   npm install
   npm run start
   ```

---

## Step 3: Frontend Setup
The premium user interface with real-time charting and execution.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Configure `.env.local`:
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`: Same as the blockchain address.
   - `NEXT_PUBLIC_NETWORK`: `testnet` (Devnet uses testnet protocols).
3. Start the development server:
   ```bash
   npm install
   npm run dev
   ```

---

## 🎮 How to Play
1. Open `http://localhost:3000` in your browser.
2. **Connect Wallet:** Click "CONNECT" and ensure your wallet is set to **Local Devnet** (API URL: `http://localhost:3999`).
3. **Live Chart:** You should see the BTC/USD chart start moving within 5-10 seconds as it fetches real-time data from Pyth.
4. **Execution:**
   - Select an expiry (30s, 1m, 5m, 15m).
   - Enter your stake (e.g., `0.001` sBTC).
   - Click **BUY / UP** if you think the price will rise, or **SELL / DOWN** if it will fall.
5. **Settlement:** Once the trade expires, the Keeper Bot will detect it on-chain and settle it. Your winnings (payout rate up to 90%) will be automatically sent to your wallet.

---

## 🛠 Troubleshooting
- **Vault Insufficiency**: If the `Execution` button says "UNAVAILABLE", the vault may be low on funds. Seed it again via console.
- **Chart is Flat**: Ensure you have internet access. The chart relies on the Pyth Hermes API for real-time prices.
- **Transaction Pending**: Local Devnet blocks take ~10-30 seconds. Be patient for the "Active Trade" to appear in your list.
- **Wallet Not Connecting**: Double-check that your wallet is explicitly pointing to `http://localhost:3999` and not the public testnet.
