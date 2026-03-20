# BitOracle: Decentralized Binary Options on Stacks (sBTC) 🦾💎

BitOracle is a high-performance, non-custodial binary options protocol built on the **Stacks blockchain**. It allows users to trade BTC/USD price movements using **sBTC** (Stacks Bitcoin) with instant on-chain settlement and a seamless, high-frequency trading experience.

![BitOracle Banner](/public/bitoracle-logo.png)

## 🚀 Vision
Our mission is to bring professional-grade binary options to the Bitcoin ecosystem. By leveraging Stacks' unique properties and sBTC, BitOracle offers the security of Bitcoin with the speed and programmability of a modern smart contract platform.

---

## 🛠 Project Architecture

The BitOracle ecosystem consists of three main components:

### 1. Smart Contracts (Clarity)
Located in the `/bitoracle` directory.
- **Trade Engine (`bo-engine-v5`)**: Handles all trade placement, validation, and settlement logic.
- **Liquidity Vault (`bo-vault-v5`)**: Acts as the counterparty and stores the sBTC collateral.
- **sBTC Token (`bo-sbtc-v5`)**: A SIP-010 compliant mock sBTC token for testnet demonstration.
- **Oracle Adapter (`bo-oracle-v5`)**: Stores recent BTC/USD prices from the off-chain oracle.

### 2. Keeper Node (TypeScript)
Located in the `/keeper` directory.
- A high-frequency backend node that listens to **Pyth Network** price feeds.
- Automatically updates the on-chain Oracle Adapter every few blocks.
- Triggers automated trade settlement once timeframe durations expire.

### 3. Trading Dashboard (Next.js)
Located in the `/frontend` directory.
- A premium, "wow-factor" UI built with **Next.js 15+** and **Tailwind CSS**.
- **Real-time Price Engine**: Visualized using `lightweight-charts` with sub-second price updates.
- **Stacks.js v7 Integration**: Seamless wallet connection (Hiro/Xverse) and contract interactions.
- **Optimistic UI & On-Chain Sync**: Trades appear instantly and reconcile with blockchain data automatically.

---

## 📍 Deployed Addresses (Stacks Testnet)

All core components are deployed on the Stacks Testnet at the following principal:
`ST1KA46BB5FK702F47BFKJ13BBVTKPV8SV0YC4QR7`

| Contract | Purpose |
| :--- | :--- |
| `bo-engine-v5` | Core Trading Logic |
| `bo-vault-v5` | Counterparty Liquidity |
| `bo-sbtc-v5` | Mock sBTC (Testnet) |
| `bo-oracle-v5` | BTC Price Oracle |

---

## 🛣 Roadmap

### 📦 Stage 1: Testnet MVP (Current)
- [x] High-fidelity Trading UI.
- [x] Automated Keeper & Settlement logic.
- [x] Mock sBTC Faucet & Balance integration.
- [x] Real-time Charting with entry markers.

### 🏗 Stage 2: sBTC Integration (Next)
- [ ] Integration with the official **sBTC bridge**.
- [ ] Support for native BTC deposits to mint sBTC.
- [ ] Enhanced vault management for LPs.

### 🚀 Stage 3: Mainnet Launch
- [ ] Security audits for all Clarity contracts.
- [ ] Mainnet deployment with real sBTC liquidity.
- [ ] Community governance and DAO launch.

---

## 🔧 Getting Started

### 1. Prerequisites
- **Node.js v20+**
- **Hiro Wallet** or **Xverse** browser extension.
- Stacks Testnet STX (for gas).

### 2. Installation (Frontend)
```bash
cd frontend
npm install
npm run dev
```

### 3. Running the Keeper
```bash
cd keeper
npm install
npm run start
```

### 4. Demo Walkthrough
1. Access the **Landing Page** and click **Launch App**.
2. Connect your **Stacks Wallet**.
3. Use the **FAUCET** button in the header to mint 1.0 mock sBTC.
4. Select a timeframe (30s, 1m, 5m, 15m).
5. Predict **UP** or **DOWN** and place your trade!

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built with ❤️ for the Stacks ecosystem & Bitcoin DeFi.*
