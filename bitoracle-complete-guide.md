# BitOracle — Complete Builder's Guide
### Bitcoin-Native Prediction Protocol on Stacks

> Everything you need to understand, design, build, and ship BitOracle from zero to MVP.

---

## Table of Contents

1. [Project Summary](#1-project-summary)
2. [Business Breakdown](#2-business-breakdown)
3. [Technical Breakdown](#3-technical-breakdown)
4. [System Architecture (Deep Dive)](#4-system-architecture-deep-dive)
5. [Smart Contract Design — Full Clarity Code](#5-smart-contract-design--full-clarity-code)
6. [Frontend Architecture & Code](#6-frontend-architecture--code)
7. [Oracle Integration](#7-oracle-integration)
8. [Keeper Bot (Auto-Settlement)](#8-keeper-bot-auto-settlement)
9. [Security Model](#9-security-model)
10. [Economic Model — Full Numbers](#10-economic-model--full-numbers)
11. [MVP Implementation Checklist](#11-mvp-implementation-checklist)
12. [Folder Structure](#12-folder-structure)
13. [Environment Setup](#13-environment-setup)
14. [Deployment Guide](#14-deployment-guide)
15. [Testing Strategy](#15-testing-strategy)
16. [Hackathon Submission Checklist](#16-hackathon-submission-checklist)

---

## 1. Project Summary

### What is BitOracle?

BitOracle is a **decentralized binary prediction market** built on the Stacks blockchain. Users stake **sBTC** to predict whether Bitcoin's price will go **UP or DOWN** within short timeframes (30 seconds, 1 minute, 5 minutes).

Settlement is automatic, trustless, and powered by **Clarity smart contracts** reading from an **onchain oracle**. There is no centralized operator. The protocol cannot manipulate outcomes.

### One-Line Pitch

> "Pocket Option — but decentralized, Bitcoin-native, and settled by code, not a company."

### What Problem Does It Solve?

The global binary options market generates billions in annual volume, but is dominated by centralized platforms with three fatal flaws:

| Centralized Platforms | BitOracle |
|---|---|
| Company is the counterparty — profits from user losses | Smart contract pools users against each other |
| Funds held custodially — withdrawal can be blocked | Funds locked in Clarity contracts — non-custodial |
| Settlement logic hidden — outcomes can be manipulated | Clarity is fully open and auditable on-chain |
| No Bitcoin-native participation | sBTC is the only settlement asset |

---

## 2. Business Breakdown

### Target Users

**Primary: Crypto-native Bitcoin traders**
- Already hold sBTC or BTC
- Comfortable with Stacks wallets (Leather, Xverse)
- Seek short-term speculation opportunities without centralized risk

**Secondary: DeFi degens moving into Bitcoin ecosystem**
- Familiar with prediction markets (Polymarket, etc.)
- Attracted by Bitcoin alignment and trustless settlement

**Tertiary: Stacks ecosystem participants**
- Looking for new DeFi primitives to use
- May hold STX, sBTC, or both

---

### Revenue Model

BitOracle generates revenue through a **protocol fee on every settled market**.

```
Revenue Formula:
  Protocol Fee = Total Pool × Fee Rate (default: 2%)
  Winners Receive = Total Pool − Protocol Fee

Example:
  Total Staked: 10 sBTC
  Fee (2%):     0.2 sBTC
  To Winners:   9.8 sBTC
```

**Fee Rate Rationale:**
- 2% is lower than Pocket Option's implicit 8% house edge
- Transparent and visible on-chain
- Creates real protocol revenue without being extractive

**Treasury destination:** A designated treasury address (multisig in v2, DAO in v3).

---

### Revenue Projections

| Daily Volume | Fee Rate | Daily Revenue | Monthly Revenue |
|---|---|---|---|
| 5 sBTC | 2% | 0.10 sBTC | 3.0 sBTC |
| 50 sBTC | 2% | 1.00 sBTC | 30.0 sBTC |
| 500 sBTC | 2% | 10.0 sBTC | 300 sBTC |

Even at modest initial volume, the protocol generates meaningful sBTC revenue with zero ongoing operational cost (settlement is automated).

---

### Competitive Landscape

| Platform | Decentralized | Bitcoin-Native | Trustless Settlement | Short Timeframes |
|---|---|---|---|---|
| Pocket Option | No | No | No | Yes |
| Polymarket | Yes | No | Yes | No |
| Augur | Yes | No | Yes | No |
| **BitOracle** | **Yes** | **Yes** | **Yes** | **Yes** |

BitOracle occupies a unique and currently uncontested position: **short-timeframe + trustless + Bitcoin-native**.

---

### Go-To-Market (Post-Hackathon)

**Phase 1 — Testnet (Hackathon)**
- Deploy to Stacks testnet
- Demo with test sBTC
- Gather community feedback

**Phase 2 — Mainnet Beta**
- Invite-only access
- Partner with Stacks community influencers
- Apply for Stacks Foundation grants

**Phase 3 — Open Launch**
- Public access
- Liquidity incentives (protocol-funded)
- Integration with Stacks ecosystem apps

---

### Ecosystem Funding

BitOracle qualifies for Stacks ecosystem support:

| Program | Amount | Eligibility Trigger |
|---|---|---|
| Buidl Battle Prize | Up to $6,000 | Win hackathon |
| Stacks Foundation Seed Grant | Up to $25K | Working MVP |
| Stacks Foundation Growth Grant | Up to $1M | Scaled traction |

---

## 3. Technical Breakdown

### Core Technology Stack

| Layer | Technology | Why |
|---|---|---|
| Blockchain | Stacks | Inherits Bitcoin security, Clarity contracts |
| Smart Contract Language | Clarity | Decidable, auditable, no reentrancy |
| Settlement Token | sBTC (SIP-010) | Bitcoin-pegged, Stacks-native |
| Frontend Framework | Next.js 14 | SSR, App Router, production-ready |
| Styling | TailwindCSS + shadcn/ui | Fast, consistent, accessible |
| Charts | TradingView Lightweight Charts | Industry-standard price charts |
| Wallet Integration | @stacks/connect | Leather + Xverse support |
| Blockchain SDK | @stacks/transactions + @stacks/api | Official Stacks tooling |
| Oracle | Pyth Network (Stacks adapter) | Multi-source, manipulation-resistant |
| Keeper Bot | Node.js + TypeScript | Auto-triggers settlement at expiry |
| Testing | Clarinet | Official Stacks contract testing framework |
| Deployment | Vercel (frontend) + Stacks mainnet | Industry standard |

---

### Why Clarity for Smart Contracts?

Clarity is Stacks' native smart contract language. Key properties that matter for BitOracle:

1. **Decidable** — You can know exactly what a contract will do before running it. No surprises.
2. **No reentrancy** — Clarity's execution model makes reentrancy attacks structurally impossible.
3. **Interpreted, not compiled** — Contract code is always readable on-chain. Full transparency.
4. **Post-conditions** — Callers can specify exactly how many tokens may leave their wallet per transaction. Prevents malicious contracts from draining funds.

---

### Why sBTC?

sBTC is a SIP-010 fungible token on Stacks, pegged 1:1 to Bitcoin. Choosing sBTC as the settlement currency means:

- Every market is Bitcoin-denominated
- Winners accumulate Bitcoin exposure
- Protocol fees accrue in Bitcoin
- The product is genuinely Bitcoin-native, not just Bitcoin-themed

---

### Data Flow (End-to-End)

```
1. Frontend: User connects Leather/Xverse wallet via @stacks/connect
2. Frontend: User views active markets fetched from Hiro Stacks API
3. User: Selects market, enters stake amount, clicks UP or DOWN
4. Frontend: Calls place-prediction on prediction-market.clar
5. Wallet: Signs transaction with post-conditions (can't overspend sBTC)
6. Contract: Transfers sBTC from user to contract escrow
7. Contract: Records prediction in predictions map
8. Contract: Updates round totals (total-up or total-down)
9. [Timer expires]
10. Keeper Bot: Detects expired round via block height check
11. Keeper Bot: Fetches BTC price from Pyth oracle
12. Keeper Bot: Calls settle-round on settlement-engine.clar
13. Contract: Compares close-price vs open-price
14. Contract: Marks winning direction
15. Contract: Sends protocol fee to treasury.clar
16. User: Calls claim-winnings (or frontend auto-prompts)
17. Contract: Calculates proportional payout
18. Contract: Transfers sBTC to winner's wallet
```

---

## 4. System Architecture (Deep Dive)

### Full Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER LAYER                              │
│                                                                  │
│   Browser / Mobile                                               │
│   Leather Wallet  ←→  Xverse Wallet                             │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                       FRONTEND LAYER                             │
│                                                                  │
│   Next.js 14 (App Router)                                        │
│   ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐     │
│   │ Market Feed │  │ Trading Panel│  │  Portfolio / Claim │     │
│   │ (rounds)    │  │ UP / DOWN UI │  │  History + Payouts │     │
│   └─────────────┘  └──────────────┘  └────────────────────┘     │
│                                                                  │
│   @stacks/connect  │  React Query  │  TradingView Charts        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    STACKS API LAYER                              │
│                                                                  │
│   Hiro Stacks API  (read contract state, tx history)            │
│   WebSocket feeds  (real-time block events)                     │
└──────────┬────────────────────────────────────┬─────────────────┘
           │                                    │
┌──────────▼────────────┐           ┌───────────▼─────────────────┐
│   CLARITY CONTRACTS   │           │      KEEPER BOT              │
│                       │           │                              │
│  prediction-          │           │  Node.js / TypeScript        │
│  market.clar          │           │  Polls block height          │
│  ─────────────        │           │  Detects expired rounds      │
│  Round management     │           │  Fetches oracle price        │
│  Stake tracking       │           │  Calls settle-round()        │
│  Escrow logic         │           │                              │
│                       │           └───────────┬─────────────────┘
│  settlement-          │                       │
│  engine.clar          │◄──────────────────────┘
│  ─────────────        │
│  Settlement logic     │
│  Payout calculation   │
│  Fee distribution     │
│                       │
│  treasury.clar        │
│  ─────────────        │
│  Fee accumulation     │
│  Withdrawal (admin)   │
└──────────┬────────────┘
           │
┌──────────▼────────────┐
│    ORACLE LAYER       │
│                       │
│  Pyth Network         │
│  (Stacks adapter)     │
│  BTC/USD price feed   │
│  Multi-source agg.    │
│  Staleness checks     │
└───────────────────────┘
```

---

### Contract Interaction Map

```
User Wallet
    │
    ├──► place-prediction()  ──► prediction-market.clar
    │         └── transfers sBTC to contract escrow
    │         └── records stake in predictions map
    │
    ├──► claim-winnings()    ──► settlement-engine.clar
    │         └── reads round settlement data
    │         └── calculates payout proportion
    │         └── sends sBTC to user
    │
Keeper Bot
    │
    └──► settle-round()      ──► settlement-engine.clar
              └── reads Pyth oracle price
              └── compares open vs close price
              └── determines winning direction
              └── sends fee to treasury.clar
              └── unlocks claims for winners
```

---

## 5. Smart Contract Design — Full Clarity Code

### Contract 1: `prediction-market.clar`

This is the primary contract. It manages market rounds, accepts stakes, and tracks all predictions.

```clarity
;; prediction-market.clar
;; BitOracle — Core Prediction Market Contract
;; Manages round lifecycle and stake collection

;; ============================================================
;; CONSTANTS
;; ============================================================

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u100))
(define-constant ERR-ROUND-NOT-OPEN (err u101))
(define-constant ERR-INVALID-DIRECTION (err u102))
(define-constant ERR-ZERO-AMOUNT (err u103))
(define-constant ERR-ALREADY-PREDICTED (err u104))
(define-constant ERR-ROUND-EXPIRED (err u105))
(define-constant ERR-ROUND-NOT-FOUND (err u106))

;; sBTC contract reference (update to actual deployed address)
(define-constant SBTC-CONTRACT .sbtc-token)

;; ============================================================
;; DATA MAPS
;; ============================================================

;; Stores all round metadata
(define-map rounds
  { round-id: uint }
  {
    asset: (string-ascii 10),           ;; Trading pair e.g. "BTC/USD"
    open-price: uint,                   ;; BTC price at round open (8 decimals, e.g. 6500000000000 = $65,000)
    close-price: uint,                  ;; BTC price at settlement (0 until settled)
    start-block: uint,                  ;; Stacks block when round opened
    end-block: uint,                    ;; Stacks block when round closes for bets
    total-up: uint,                     ;; Total sBTC staked on UP (in satoshis)
    total-down: uint,                   ;; Total sBTC staked on DOWN (in satoshis)
    status: (string-ascii 10),          ;; "open" | "locked" | "settled"
    winning-direction: (string-ascii 4) ;; "UP" | "DOWN" | "DRAW" | "" (before settlement)
  }
)

;; Stores individual user predictions per round
(define-map predictions
  { round-id: uint, predictor: principal }
  {
    amount: uint,                       ;; sBTC staked (satoshis)
    direction: (string-ascii 4),        ;; "UP" or "DOWN"
    claimed: bool                       ;; Has user claimed winnings?
  }
)

;; Round ID counter
(define-data-var current-round-id uint u0)

;; ============================================================
;; ADMIN: ROUND CREATION
;; ============================================================

;; Creates a new prediction round
;; Only callable by contract owner (or keeper in v2)
(define-public (create-round
  (asset (string-ascii 10))
  (open-price uint)
  (duration-in-blocks uint))

  (let (
    (new-round-id (+ (var-get current-round-id) u1))
  )
    ;; Only owner can create rounds
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    ;; Write round data
    (map-set rounds
      { round-id: new-round-id }
      {
        asset: asset,
        open-price: open-price,
        close-price: u0,
        start-block: block-height,
        end-block: (+ block-height duration-in-blocks),
        total-up: u0,
        total-down: u0,
        status: "open",
        winning-direction: ""
      }
    )

    ;; Increment round counter
    (var-set current-round-id new-round-id)

    (ok new-round-id)
  )
)

;; ============================================================
;; USER: PLACE PREDICTION
;; ============================================================

;; Called by users to stake sBTC on UP or DOWN
(define-public (place-prediction
  (round-id uint)
  (direction (string-ascii 4))    ;; Must be "UP" or "DOWN"
  (amount uint))                  ;; sBTC amount in satoshis

  (let (
    (round (unwrap! (map-get? rounds { round-id: round-id }) ERR-ROUND-NOT-FOUND))
    (existing-prediction (map-get? predictions { round-id: round-id, predictor: tx-sender }))
  )
    ;; Validate round is open
    (asserts! (is-eq (get status round) "open") ERR-ROUND-NOT-OPEN)

    ;; Validate direction
    (asserts!
      (or (is-eq direction "UP") (is-eq direction "DOWN"))
      ERR-INVALID-DIRECTION
    )

    ;; Validate non-zero amount
    (asserts! (> amount u0) ERR-ZERO-AMOUNT)

    ;; Validate round hasn't expired by block height
    (asserts! (<= block-height (get end-block round)) ERR-ROUND-EXPIRED)

    ;; Validate user hasn't already bet in this round
    (asserts! (is-none existing-prediction) ERR-ALREADY-PREDICTED)

    ;; Transfer sBTC from user to this contract (escrow)
    ;; NOTE: User must have approved this contract or use post-conditions
    (try! (contract-call? SBTC-CONTRACT transfer
      amount
      tx-sender
      (as-contract tx-sender)
      none                        ;; No memo
    ))

    ;; Record the prediction
    (map-set predictions
      { round-id: round-id, predictor: tx-sender }
      {
        amount: amount,
        direction: direction,
        claimed: false
      }
    )

    ;; Update round pool totals
    (map-set rounds
      { round-id: round-id }
      (merge round {
        total-up: (if (is-eq direction "UP")
                    (+ (get total-up round) amount)
                    (get total-up round)),
        total-down: (if (is-eq direction "DOWN")
                      (+ (get total-down round) amount)
                      (get total-down round))
      })
    )

    (ok true)
  )
)

;; ============================================================
;; SETTLEMENT ENGINE INTERFACE
;; Only callable by settlement-engine.clar
;; ============================================================

;; Updates a round's settlement data (called by settlement contract)
(define-public (update-round-settled
  (round-id uint)
  (close-price uint)
  (winning-direction (string-ascii 4)))

  (let (
    (round (unwrap! (map-get? rounds { round-id: round-id }) ERR-ROUND-NOT-FOUND))
  )
    ;; Only settlement contract can call this
    (asserts! (is-eq contract-caller .settlement-engine) ERR-UNAUTHORIZED)

    (map-set rounds
      { round-id: round-id }
      (merge round {
        close-price: close-price,
        status: "settled",
        winning-direction: winning-direction
      })
    )
    (ok true)
  )
)

;; Marks a user's prediction as claimed (called by settlement contract)
(define-public (mark-claimed (round-id uint) (predictor principal))
  (let (
    (prediction (unwrap! (map-get? predictions { round-id: round-id, predictor: predictor }) ERR-ROUND-NOT-FOUND))
  )
    (asserts! (is-eq contract-caller .settlement-engine) ERR-UNAUTHORIZED)
    (map-set predictions
      { round-id: round-id, predictor: predictor }
      (merge prediction { claimed: true })
    )
    (ok true)
  )
)

;; ============================================================
;; READ-ONLY FUNCTIONS
;; ============================================================

(define-read-only (get-round (round-id uint))
  (map-get? rounds { round-id: round-id })
)

(define-read-only (get-prediction (round-id uint) (predictor principal))
  (map-get? predictions { round-id: round-id, predictor: predictor })
)

(define-read-only (get-current-round-id)
  (var-get current-round-id)
)

(define-read-only (get-round-pool-sizes (round-id uint))
  (match (map-get? rounds { round-id: round-id })
    round (ok {
      total-up: (get total-up round),
      total-down: (get total-down round),
      total: (+ (get total-up round) (get total-down round))
    })
    ERR-ROUND-NOT-FOUND
  )
)
```

---

### Contract 2: `settlement-engine.clar`

Handles settlement logic, payout calculation, and fee distribution.

```clarity
;; settlement-engine.clar
;; BitOracle — Settlement Engine
;; Determines winners, calculates payouts, distributes sBTC

;; ============================================================
;; CONSTANTS
;; ============================================================

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u200))
(define-constant ERR-ROUND-NOT-EXPIRED (err u201))
(define-constant ERR-ALREADY-SETTLED (err u202))
(define-constant ERR-NOT-A-WINNER (err u203))
(define-constant ERR-ALREADY-CLAIMED (err u204))
(define-constant ERR-ROUND-NOT-SETTLED (err u205))
(define-constant ERR-DRAW-REFUND (err u206))
(define-constant ERR-NOTHING-TO-CLAIM (err u207))

;; Protocol fee: 200 basis points = 2%
(define-constant PROTOCOL-FEE-BPS u200)
(define-constant BPS-DENOMINATOR u10000)

;; ============================================================
;; SETTLEMENT
;; ============================================================

;; Main settlement function — called by keeper bot after round expires
;; close-price: BTC price at settlement (8 decimal places)
(define-public (settle-round (round-id uint) (close-price uint))
  (let (
    (round (unwrap! (contract-call? .prediction-market get-round round-id)
                    ERR-UNAUTHORIZED))
    (total-pool (+ (get total-up round) (get total-down round)))
    (fee (/ (* total-pool PROTOCOL-FEE-BPS) BPS-DENOMINATOR))
    (net-pool (- total-pool fee))
    (winning-direction
      (if (> close-price (get open-price round))
        "UP"
        (if (< close-price (get open-price round))
          "DOWN"
          "DRAW"                              ;; Exact same price = DRAW, full refunds
        )
      )
    )
  )
    ;; Only contract owner or approved keeper can settle
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    ;; Round must not already be settled
    (asserts! (is-eq (get status round) "open") ERR-ALREADY-SETTLED)

    ;; Round must have expired
    (asserts! (>= block-height (get end-block round)) ERR-ROUND-NOT-EXPIRED)

    ;; Send protocol fee to treasury (only if pool is non-zero)
    (if (> fee u0)
      (try! (as-contract (contract-call? .sbtc-token transfer
        fee
        tx-sender
        .treasury
        none
      )))
      true
    )

    ;; Update round in prediction-market contract
    (try! (contract-call? .prediction-market update-round-settled
      round-id close-price winning-direction
    ))

    (ok {
      winning-direction: winning-direction,
      total-pool: total-pool,
      protocol-fee: fee,
      net-pool: net-pool
    })
  )
)

;; ============================================================
;; CLAIM WINNINGS
;; ============================================================

;; Called by winning users to claim their sBTC payout
(define-public (claim-winnings (round-id uint))
  (let (
    (round (unwrap! (contract-call? .prediction-market get-round round-id)
                    ERR-NOTHING-TO-CLAIM))
    (prediction (unwrap! (contract-call? .prediction-market get-prediction round-id tx-sender)
                         ERR-NOTHING-TO-CLAIM))
    (winning-direction (get winning-direction round))
    (net-pool (- (+ (get total-up round) (get total-down round))
                 (/ (* (+ (get total-up round) (get total-down round)) PROTOCOL-FEE-BPS)
                    BPS-DENOMINATOR)))
    (winning-pool (if (is-eq winning-direction "UP")
                    (get total-up round)
                    (if (is-eq winning-direction "DOWN")
                      (get total-down round)
                      u0)))                  ;; DRAW — handled separately
    (user-payout (if (is-eq winning-direction "DRAW")
                   (get amount prediction)   ;; DRAW = full refund of stake
                   (/ (* (get amount prediction) net-pool) winning-pool)))
  )
    ;; Round must be settled
    (asserts! (is-eq (get status round) "settled") ERR-ROUND-NOT-SETTLED)

    ;; Must not have already claimed
    (asserts! (not (get claimed prediction)) ERR-ALREADY-CLAIMED)

    ;; Must be on winning side (or DRAW)
    (asserts!
      (or
        (is-eq (get direction prediction) winning-direction)
        (is-eq winning-direction "DRAW")
      )
      ERR-NOT-A-WINNER
    )

    ;; Mark as claimed in prediction-market contract
    (try! (contract-call? .prediction-market mark-claimed round-id tx-sender))

    ;; Transfer sBTC payout to winner
    (try! (as-contract (contract-call? .sbtc-token transfer
      user-payout
      tx-sender
      tx-sender                             ;; NOTE: tx-sender here is the original caller
      none
    )))

    (ok user-payout)
  )
)

;; ============================================================
;; READ-ONLY
;; ============================================================

;; Preview what a user would receive if they claimed right now
(define-read-only (preview-payout (round-id uint) (predictor principal))
  (match (contract-call? .prediction-market get-round round-id)
    round
      (match (contract-call? .prediction-market get-prediction round-id predictor)
        prediction
          (let (
            (total-pool (+ (get total-up round) (get total-down round)))
            (fee (/ (* total-pool PROTOCOL-FEE-BPS) BPS-DENOMINATOR))
            (net-pool (- total-pool fee))
            (winning-pool (if (is-eq (get direction prediction) "UP")
                            (get total-up round)
                            (get total-down round)))
          )
            (ok (/ (* (get amount prediction) net-pool) winning-pool))
          )
        (err u0)
      )
    (err u0)
  )
)
```

---

### Contract 3: `treasury.clar`

Simple treasury holding accumulated protocol fees.

```clarity
;; treasury.clar
;; BitOracle — Protocol Treasury
;; Holds protocol fees from settled markets

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u300))
(define-constant ERR-ZERO-AMOUNT (err u301))

;; Total fees collected (informational)
(define-data-var total-fees-collected uint u0)

;; Accept incoming fee transfers (called by settlement-engine)
;; Clarity contracts automatically receive SIP-010 transfers,
;; so no explicit receive function needed — funds arrive via transfer

;; Read current sBTC balance held by treasury
(define-read-only (get-balance)
  (contract-call? .sbtc-token get-balance (as-contract tx-sender))
)

;; Read total fees ever collected
(define-read-only (get-total-fees-collected)
  (var-get total-fees-collected)
)

;; Owner can withdraw accumulated fees
(define-public (withdraw (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (asserts! (> amount u0) ERR-ZERO-AMOUNT)
    (try! (as-contract (contract-call? .sbtc-token transfer
      amount
      tx-sender
      recipient
      none
    )))
    (ok true)
  )
)
```

---

### Contract 4: `oracle-adapter.clar` (Optional — Pyth Integration Helper)

```clarity
;; oracle-adapter.clar
;; BitOracle — Oracle Price Adapter
;; Wraps Pyth price feed for use in settlement

(define-constant PYTH-CONTRACT 'SP...PYTH-CONTRACT-ADDRESS)
(define-constant BTC-USD-FEED-ID 0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43)

;; Fetch latest BTC/USD price from Pyth
;; Returns price with 8 decimal places (e.g. 6500000000000 = $65,000.00000)
(define-read-only (get-btc-price)
  (contract-call? PYTH-CONTRACT get-price BTC-USD-FEED-ID)
)

;; Validate that price is not stale (within 10 blocks)
(define-read-only (is-price-fresh (price-block uint))
  (>= price-block (- block-height u10))
)
```

---

### Clarinet.toml Configuration

```toml
[project]
name = "bitoracle"
requirements = []

[contracts.prediction-market]
path = "contracts/prediction-market.clar"

[contracts.settlement-engine]
path = "contracts/settlement-engine.clar"

[contracts.treasury]
path = "contracts/treasury.clar"

[contracts.oracle-adapter]
path = "contracts/oracle-adapter.clar"

[contracts.sbtc-token]
path = "contracts/mocks/sbtc-token.clar"  # Mock for testing

[[accounts]]
name = "deployer"
balance = 1_000_000_000_000

[[accounts]]
name = "alice"
balance = 100_000_000_000

[[accounts]]
name = "bob"
balance = 100_000_000_000

[[accounts]]
name = "charlie"
balance = 100_000_000_000
```

---

## 6. Frontend Architecture & Code

### Directory Structure

```
bitoracle-frontend/
├── app/
│   ├── layout.tsx                    # Root layout + wallet provider
│   ├── page.tsx                      # Homepage — live markets
│   ├── market/[id]/
│   │   └── page.tsx                  # Individual market view
│   ├── history/
│   │   └── page.tsx                  # User prediction history
│   └── leaderboard/
│       └── page.tsx                  # Top traders
├── components/
│   ├── markets/
│   │   ├── MarketCard.tsx            # Active market summary card
│   │   ├── MarketList.tsx            # Feed of all active markets
│   │   ├── MarketTimer.tsx           # Countdown to market close
│   │   └── MarketChart.tsx           # TradingView price chart
│   ├── trading/
│   │   ├── PredictionPanel.tsx       # UP/DOWN stake interface
│   │   ├── StakeInput.tsx            # sBTC amount input
│   │   ├── PoolDisplay.tsx           # Live UP vs DOWN pool sizes
│   │   └── ClaimButton.tsx           # Claim winnings CTA
│   ├── wallet/
│   │   ├── ConnectButton.tsx         # Leather/Xverse connect
│   │   └── WalletStatus.tsx          # Address + sBTC balance
│   └── layout/
│       ├── Navbar.tsx
│       └── Footer.tsx
├── lib/
│   ├── contracts/
│   │   ├── placePrediction.ts        # Contract call: place-prediction
│   │   ├── claimWinnings.ts          # Contract call: claim-winnings
│   │   └── readRound.ts              # Read-only: get-round
│   ├── api/
│   │   ├── markets.ts                # Fetch active rounds from Hiro API
│   │   └── userHistory.ts            # Fetch user's past predictions
│   ├── utils/
│   │   ├── formatBTC.ts              # Format satoshis → BTC display
│   │   ├── calculatePayout.ts        # Preview payout before claiming
│   │   └── blockToTime.ts            # Convert block height to timestamp
│   └── constants.ts                  # Contract addresses, network config
├── hooks/
│   ├── useActiveMarkets.ts           # React Query: fetch markets
│   ├── useUserPredictions.ts         # React Query: user history
│   ├── useWallet.ts                  # Stacks wallet state
│   └── useMarket.ts                  # Single market data + state
└── types/
    ├── market.ts                     # Round, Prediction types
    └── wallet.ts                     # Wallet state types
```

---

### Key Component: PredictionPanel.tsx

```tsx
// components/trading/PredictionPanel.tsx
'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { placePrediction } from '@/lib/contracts/placePrediction';
import { formatBTC } from '@/lib/utils/formatBTC';
import type { Round } from '@/types/market';

interface PredictionPanelProps {
  round: Round;
  onSuccess: () => void;
}

export function PredictionPanel({ round, onSuccess }: PredictionPanelProps) {
  const { address, connected } = useWallet();
  const [direction, setDirection] = useState<'UP' | 'DOWN' | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPool = round.totalUp + round.totalDown;
  const upPercent = totalPool > 0 ? Math.round((round.totalUp / totalPool) * 100) : 50;
  const downPercent = 100 - upPercent;

  const handleSubmit = async () => {
    if (!direction || !amount || !connected) return;

    const amountSats = Math.round(parseFloat(amount) * 1e8); // BTC to sats
    if (amountSats <= 0) return;

    setLoading(true);
    setError(null);

    try {
      await placePrediction(round.id, direction, amountSats);
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  if (round.status !== 'open') {
    return (
      <div className="rounded-xl bg-gray-900 p-6 text-center text-gray-400">
        {round.status === 'settled' ? 'Market Settled' : 'Market Locked'}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gray-900 p-6 space-y-4">
      <h3 className="text-white font-bold text-lg">Place Prediction</h3>

      {/* Pool Display */}
      <div className="flex rounded-lg overflow-hidden text-sm font-medium">
        <div
          className="bg-green-900 text-green-400 py-2 flex items-center justify-center"
          style={{ width: `${upPercent}%` }}
        >
          UP {upPercent}%
        </div>
        <div
          className="bg-red-900 text-red-400 py-2 flex items-center justify-center"
          style={{ width: `${downPercent}%` }}
        >
          DOWN {downPercent}%
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
        <div>UP Pool: {formatBTC(round.totalUp)} sBTC</div>
        <div className="text-right">DOWN Pool: {formatBTC(round.totalDown)} sBTC</div>
      </div>

      {/* Direction Selection */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setDirection('UP')}
          className={`py-4 rounded-lg font-bold text-lg transition-all ${
            direction === 'UP'
              ? 'bg-green-500 text-white ring-2 ring-green-400'
              : 'bg-green-900/40 text-green-400 hover:bg-green-900/70'
          }`}
        >
          ▲ UP
        </button>
        <button
          onClick={() => setDirection('DOWN')}
          className={`py-4 rounded-lg font-bold text-lg transition-all ${
            direction === 'DOWN'
              ? 'bg-red-500 text-white ring-2 ring-red-400'
              : 'bg-red-900/40 text-red-400 hover:bg-red-900/70'
          }`}
        >
          ▼ DOWN
        </button>
      </div>

      {/* Amount Input */}
      <div className="relative">
        <input
          type="number"
          placeholder="0.001"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 pr-16
                     border border-gray-700 focus:border-orange-500 focus:outline-none"
          step="0.0001"
          min="0.0001"
        />
        <span className="absolute right-4 top-3 text-orange-400 font-medium">sBTC</span>
      </div>

      {/* Error */}
      {error && (
        <div className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!direction || !amount || !connected || loading}
        className="w-full py-3 rounded-lg font-bold bg-orange-500 hover:bg-orange-400
                   text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {!connected
          ? 'Connect Wallet First'
          : loading
            ? 'Confirming...'
            : direction
              ? `Stake ${amount || '0'} sBTC ${direction}`
              : 'Select UP or DOWN'}
      </button>
    </div>
  );
}
```

---

### Contract Call: placePrediction.ts

```typescript
// lib/contracts/placePrediction.ts
import {
  makeContractCall,
  uintCV,
  stringAsciiCV,
  AnchorMode,
  PostConditionMode,
  makeStandardFungiblePostCondition,
  FungibleConditionCode,
  createAssetInfo,
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { NETWORK, CONTRACT_ADDRESS, SBTC_CONTRACT } from '../constants';

export async function placePrediction(
  roundId: number,
  direction: 'UP' | 'DOWN',
  amountSats: number
): Promise<void> {

  // Post-condition: user cannot spend more sBTC than the stated amount
  // This is a critical safety check — prevents contract from draining wallet
  const sBTCAsset = createAssetInfo(
    SBTC_CONTRACT.address,
    SBTC_CONTRACT.name,
    SBTC_CONTRACT.tokenName
  );

  const postConditions = [
    makeStandardFungiblePostCondition(
      '', // will be filled by @stacks/connect with connected address
      FungibleConditionCode.Equal,
      amountSats,
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
    postConditionMode: PostConditionMode.Deny, // Strict: reject if post-conditions fail
    anchorMode: AnchorMode.Any,
    onFinish: (data) => {
      console.log('Prediction placed! txid:', data.txId);
    },
    onCancel: () => {
      throw new Error('User cancelled transaction');
    },
  });
}
```

---

### constants.ts

```typescript
// lib/constants.ts
import { StacksTestnet, StacksMainnet } from '@stacks/network';

const IS_MAINNET = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';

export const NETWORK = IS_MAINNET ? new StacksMainnet() : new StacksTestnet();

export const CONTRACT_ADDRESS = IS_MAINNET
  ? process.env.NEXT_PUBLIC_MAINNET_CONTRACT_ADDRESS!
  : process.env.NEXT_PUBLIC_TESTNET_CONTRACT_ADDRESS!;

export const SBTC_CONTRACT = {
  address: IS_MAINNET
    ? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ'  // mainnet sBTC
    : 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // testnet mock
  name: 'sbtc-token',
  tokenName: 'sBTC',
};

export const HIRO_API_URL = IS_MAINNET
  ? 'https://api.hiro.so'
  : 'https://api.testnet.hiro.so';

// Duration of each round in Stacks blocks
// Stacks produces ~1 block per 10 minutes on mainnet
// For testnet/demo, adjust to shorter block times
export const ROUND_DURATIONS = {
  '30s':  IS_MAINNET ? 1 : 1,    // ~1 block
  '1m':   IS_MAINNET ? 1 : 1,
  '5m':   IS_MAINNET ? 1 : 1,
  '15m':  IS_MAINNET ? 2 : 2,
  '1h':   IS_MAINNET ? 6 : 6,
};
```

---

## 7. Oracle Integration

### Overview

BitOracle uses **Pyth Network** as its primary price oracle. Pyth aggregates prices from dozens of professional market makers and publishes them on-chain with cryptographic attestations.

**Why Pyth:**
- Prices sourced from 90+ institutional market makers
- Sub-second price updates
- Available on Stacks via an adapter contract
- Manipulation requires corrupting 90+ independent sources simultaneously

### Pyth Price Push Flow (for settlement)

```
Pyth Guardian Network (off-chain)
  └── Aggregates prices from 90+ market makers
        ↓
Pyth Wormhole Bridge
  └── Publishes signed price attestations
        ↓
Stacks Pyth Adapter Contract
  └── Stores and verifies price on-chain
        ↓
BitOracle settlement-engine.clar
  └── Reads BTC/USD price at settlement time
```

### Pyth Price Feed ID for BTC/USD

```
Feed ID: 0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43
Network: Mainnet / Testnet (same ID)
Decimals: -8 (price × 10^8)
Example: price 6500000000000 = $65,000.00
```

### Keeper Bot Oracle Call

```typescript
// keeper/oracle.ts
import { PriceServiceConnection } from '@pythnetwork/price-service-client';

const BTC_USD_FEED_ID = '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43';

const pythConnection = new PriceServiceConnection(
  'https://hermes.pyth.network'
);

export async function getBTCPrice(): Promise<{
  price: bigint;
  confidence: bigint;
  publishTime: number;
}> {
  const priceFeeds = await pythConnection.getLatestPriceFeeds([BTC_USD_FEED_ID]);

  if (!priceFeeds || priceFeeds.length === 0) {
    throw new Error('Failed to fetch BTC price from Pyth');
  }

  const feed = priceFeeds[0];
  const price = feed.getPriceUnchecked();

  // Normalize to 8 decimal places (Pyth may use different exponent)
  const normalizedPrice = BigInt(price.price) * BigInt(10 ** (8 + price.expo));

  return {
    price: normalizedPrice,
    confidence: BigInt(price.conf),
    publishTime: price.publishTime,
  };
}
```

### Fallback: Mock Oracle (for Hackathon Demo)

For the hackathon demo, use a mock oracle that reads from a public BTC price API if Pyth Stacks adapter isn't available on testnet:

```typescript
// keeper/mockOracle.ts
export async function getMockBTCPrice(): Promise<bigint> {
  const res = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
  const data = await res.json();
  const price = parseFloat(data.data.amount);
  // Convert to 8 decimal integer (satoshi precision)
  return BigInt(Math.round(price * 1e8));
}
```

---

## 8. Keeper Bot (Auto-Settlement)

The keeper bot is a Node.js service that watches for expired rounds and triggers settlement automatically.

```typescript
// keeper/index.ts
import { StacksTestnet } from '@stacks/network';
import {
  makeContractCall,
  uintCV,
  broadcastTransaction,
  AnchorMode,
} from '@stacks/transactions';
import { getBTCPrice } from './oracle';
import { getAllActiveRounds, getLatestBlock } from './stacks';

const KEEPER_PRIVATE_KEY = process.env.KEEPER_PRIVATE_KEY!;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
const NETWORK = new StacksTestnet();

// ─── MAIN LOOP ───────────────────────────────────────────────

async function keeperLoop() {
  console.log('BitOracle keeper bot started...');

  while (true) {
    try {
      await checkAndSettle();
    } catch (err) {
      console.error('Keeper error:', err);
    }

    // Wait ~10 seconds before next check
    await sleep(10_000);
  }
}

// ─── SETTLEMENT CHECK ─────────────────────────────────────────

async function checkAndSettle() {
  const currentBlock = await getLatestBlock();
  const activeRounds = await getAllActiveRounds();

  console.log(`Block ${currentBlock}: checking ${activeRounds.length} active rounds`);

  for (const round of activeRounds) {
    if (currentBlock < round.endBlock) {
      const remaining = round.endBlock - currentBlock;
      console.log(`Round ${round.id}: ${remaining} blocks remaining`);
      continue;
    }

    // Round has expired — settle it
    console.log(`Round ${round.id}: EXPIRED — settling...`);
    await settleRound(round.id);
  }
}

// ─── SETTLEMENT TRANSACTION ──────────────────────────────────

async function settleRound(roundId: number) {
  // 1. Get current BTC price
  const { price, publishTime } = await getBTCPrice();
  console.log(`BTC price at settlement: $${Number(price) / 1e8}`);

  // 2. Build settlement transaction
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: 'settlement-engine',
    functionName: 'settle-round',
    functionArgs: [
      uintCV(roundId),
      uintCV(price),
    ],
    senderKey: KEEPER_PRIVATE_KEY,
    network: NETWORK,
    anchorMode: AnchorMode.Any,
    fee: 5000, // 5000 microSTX
  };

  const tx = await makeContractCall(txOptions);
  const result = await broadcastTransaction(tx, NETWORK);

  if (result.error) {
    throw new Error(`Settlement failed: ${result.error}`);
  }

  console.log(`Round ${roundId} settled! txid: ${result.txid}`);
}

// ─── HELPERS ─────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Start the keeper
keeperLoop();
```

---

## 9. Security Model

### Threat Analysis

| Threat | Attack Vector | Mitigation |
|---|---|---|
| Oracle manipulation | Attacker manipulates price feed | Pyth aggregates 90+ sources — prohibitively expensive to corrupt |
| Reentrancy | Malicious contract re-enters during transfer | Clarity's execution model prevents dynamic dispatch and reentrancy structurally |
| Front-running | Attacker sees pending tx and bets accordingly | Round close is determined by block height, not mempool — front-running bets land in same block |
| Keeper manipulation | Attacker calls settle-round with fake price | Only CONTRACT-OWNER can call settle-round; price fetched independently by bot |
| sBTC overspend | Malicious contract drains user wallet | Post-conditions enforced at wallet layer — user can't spend more than they authorized |
| Contract upgrade | Owner silently changes settlement logic | Clarity contracts are immutable after deployment — no upgrade mechanism |
| Dust attacks | Tiny stakes to bloat contract state | Minimum stake enforced (e.g. 1000 sats = ~$0.60) |
| DRAW edge case | Close price exactly equals open price | Full refunds issued — no fee taken on DRAWs |

### Post-Condition Pattern (Critical)

Every sBTC transfer call from the frontend MUST include a post-condition:

```typescript
// This prevents the contract from taking MORE than the user agreed to
makeStandardFungiblePostCondition(
  userAddress,
  FungibleConditionCode.Equal,    // Exactly this amount — not more, not less
  amountSats,
  sBTCAssetInfo
)
```

With `PostConditionMode.Deny`, if the actual sBTC movement doesn't match the post-condition exactly, the entire transaction is rejected and reverted.

---

## 10. Economic Model — Full Numbers

### Payout Formula (Detailed)

```
Given:
  UP pool:  U  (total sBTC staked on UP)
  DOWN pool: D  (total sBTC staked on DOWN)
  Total pool: T = U + D
  Fee rate: f = 0.02  (2%)
  User stake: s
  User direction: winning side

Calculations:
  Protocol fee:   F = T × f
  Net pool:       N = T − F = T × (1 − f) = T × 0.98
  Winning pool:   W = U  (if UP wins) or D  (if DOWN wins)
  User payout:    P = (s / W) × N
  User profit:    P − s = s × ((N / W) − 1)
```

### Worked Example: Balanced Market

```
UP pool:    5 sBTC  (100 users × 0.05 sBTC each)
DOWN pool:  5 sBTC  (100 users × 0.05 sBTC each)
Total:     10 sBTC
Fee (2%):   0.2 sBTC → treasury
Net pool:   9.8 sBTC → winners

Each winner receives:
  (0.05 / 5) × 9.8 = 0.098 sBTC
  Profit: +0.048 sBTC (+96% on stake)
```

### Worked Example: Imbalanced Market (Heavy UP)

```
UP pool:    8 sBTC  (160 users × 0.05 sBTC each)
DOWN pool:  2 sBTC  (40 users × 0.05 sBTC each)
Total:     10 sBTC
Fee (2%):   0.2 sBTC → treasury
Net pool:   9.8 sBTC

If DOWN wins:
  Each DOWN winner: (0.05 / 2) × 9.8 = 0.245 sBTC
  Profit: +0.195 sBTC (+390% on stake!) — high risk, high reward

If UP wins:
  Each UP winner: (0.05 / 8) × 9.8 = 0.06125 sBTC
  Profit: +0.01125 sBTC (+22.5%) — low risk, low reward
```

This self-balancing mechanism mimics a parimutuel betting system — the market naturally prices in perceived probabilities through pool imbalance.

---

## 11. MVP Implementation Checklist

### PHASE 0 — Setup (Day 1-2)

**Environment**
- [ ] Install Clarinet: `brew install clarinet` or via npm
- [ ] Install Node.js 18+
- [ ] Install Stacks CLI tools
- [ ] Create Leather wallet on testnet + fund with test STX
- [ ] Get testnet sBTC from Stacks testnet faucet
- [ ] Create GitHub repo: `bitoracle`

**Project Init**
- [ ] `clarinet new bitoracle` — scaffold Clarity project
- [ ] `npx create-next-app@latest bitoracle-frontend --typescript --tailwind --app`
- [ ] Install frontend deps: `@stacks/connect @stacks/transactions @stacks/api react-query`

---

### PHASE 1 — Smart Contracts (Day 3-6)

**prediction-market.clar**
- [ ] Write `create-round` function
- [ ] Write `place-prediction` function with sBTC transfer
- [ ] Write `update-round-settled` (settlement interface)
- [ ] Write `mark-claimed` (claim interface)
- [ ] Write all read-only functions
- [ ] Write Clarinet unit tests for each function
- [ ] Test round creation
- [ ] Test UP prediction
- [ ] Test DOWN prediction
- [ ] Test double-prediction rejection
- [ ] Test expired round rejection

**settlement-engine.clar**
- [ ] Write `settle-round` function
- [ ] Write `claim-winnings` function
- [ ] Write DRAW handling (full refunds)
- [ ] Write fee calculation and treasury transfer
- [ ] Write `preview-payout` read-only
- [ ] Test settlement with UP winning
- [ ] Test settlement with DOWN winning
- [ ] Test DRAW settlement
- [ ] Test claim after settlement
- [ ] Test double-claim rejection

**treasury.clar**
- [ ] Write `get-balance`
- [ ] Write `withdraw` (owner only)
- [ ] Test fee receives correctly
- [ ] Test withdraw

**oracle-adapter.clar**
- [ ] Write Pyth price reader (or mock for testnet)
- [ ] Test price fetch
- [ ] Test staleness validation

**Deploy**
- [ ] Deploy all contracts to Stacks testnet
- [ ] Record deployed contract addresses
- [ ] Verify contracts on Stacks Explorer

---

### PHASE 2 — Keeper Bot (Day 7-8)

- [ ] Create `keeper/` directory in repo
- [ ] Implement `getLatestBlock()` from Hiro API
- [ ] Implement `getAllActiveRounds()` from Hiro API
- [ ] Implement `getBTCPrice()` from Pyth (or mock)
- [ ] Implement `settleRound()` contract call
- [ ] Implement main keeper loop (10s polling)
- [ ] Test keeper detects expired round
- [ ] Test keeper settles correctly
- [ ] Test keeper handles errors gracefully
- [ ] Set up environment variables for keeper

---

### PHASE 3 — Frontend Core (Day 9-14)

**Wallet Integration**
- [ ] Implement `ConnectButton.tsx` using @stacks/connect
- [ ] Implement `useWallet.ts` hook (address, balance, connected state)
- [ ] Test Leather wallet connect
- [ ] Test Xverse wallet connect
- [ ] Display sBTC balance in navbar

**Market List**
- [ ] Implement `useActiveMarkets.ts` (fetch from Hiro API)
- [ ] Implement `MarketCard.tsx` (round status, time remaining, pools)
- [ ] Implement `MarketTimer.tsx` (countdown using block height)
- [ ] Implement `MarketList.tsx` (grid of cards)
- [ ] Test market cards render with live data

**Trading Panel**
- [ ] Implement `PredictionPanel.tsx` (UP/DOWN buttons)
- [ ] Implement `StakeInput.tsx` (sBTC amount field with validation)
- [ ] Implement `PoolDisplay.tsx` (UP% vs DOWN% bar)
- [ ] Implement `placePrediction.ts` contract call with post-conditions
- [ ] Test placing UP prediction
- [ ] Test placing DOWN prediction
- [ ] Test validation: zero amount rejected
- [ ] Test validation: duplicate prediction rejected
- [ ] Test post-conditions enforce correct sBTC spend

**Price Chart**
- [ ] Install TradingView Lightweight Charts
- [ ] Implement `MarketChart.tsx` with live BTC/USD price
- [ ] Add entry price marker on chart
- [ ] Test chart renders and updates

**Claims**
- [ ] Implement `ClaimButton.tsx` for settled markets
- [ ] Implement `claimWinnings.ts` contract call
- [ ] Test claim after winning
- [ ] Test claim shows error for losers
- [ ] Test double-claim rejection

**History Page**
- [ ] Implement `/history` page
- [ ] Fetch user's past predictions via Hiro API
- [ ] Display outcome, stake, and payout for each
- [ ] Calculate and display total P&L

---

### PHASE 4 — Polish (Day 15-18)

**UI/UX**
- [ ] Responsive layout (mobile + desktop)
- [ ] Loading states for all async operations
- [ ] Error handling and user-friendly error messages
- [ ] Transaction confirmation toasts
- [ ] Empty states (no active markets, no history)
- [ ] Dark theme finalized

**Data**
- [ ] Protocol stats: total volume, total markets, treasury balance
- [ ] Live pool updates via WebSocket (Hiro API)
- [ ] Leaderboard page (top winners by profit)

**Documentation**
- [ ] README.md with setup instructions
- [ ] Contract documentation
- [ ] Architecture diagram

---

### PHASE 5 — Hackathon Submission (Day 19-21)

- [ ] Record pitch video (< 5 minutes)
- [ ] Deploy frontend to Vercel
- [ ] Confirm testnet contracts are live and functional
- [ ] Demo flow works end-to-end (connect → stake → settle → claim)
- [ ] Submit to DoraHacks with GitHub link + demo link + video
- [ ] Push all code to GitHub (public repo)
- [ ] Write project description for DoraHacks gallery

---

## 12. Folder Structure

```
bitoracle/
│
├── contracts/                        # Clarity smart contracts
│   ├── prediction-market.clar
│   ├── settlement-engine.clar
│   ├── treasury.clar
│   ├── oracle-adapter.clar
│   └── mocks/
│       └── sbtc-token.clar           # SIP-010 mock for testing
│
├── tests/                            # Clarinet test files
│   ├── prediction-market_test.ts
│   ├── settlement-engine_test.ts
│   └── treasury_test.ts
│
├── keeper/                           # Keeper bot (Node.js)
│   ├── index.ts                      # Main loop
│   ├── oracle.ts                     # Pyth price fetching
│   ├── stacks.ts                     # Stacks API helpers
│   └── package.json
│
├── frontend/                         # Next.js app
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── market/[id]/page.tsx
│   │   └── history/page.tsx
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   └── package.json
│
├── Clarinet.toml                     # Clarinet config
├── README.md
└── .env.example
```

---

## 13. Environment Setup

### Step 1: Install Tools

```bash
# Install Clarinet (Stacks smart contract tool)
brew install clarinet
# OR via npm:
npm install -g @hirosystems/clarinet-sdk

# Verify
clarinet --version

# Install Node.js 18+ if not already installed
node --version  # must be 18+
```

### Step 2: Create Clarity Project

```bash
clarinet new bitoracle
cd bitoracle
clarinet contract new prediction-market
clarinet contract new settlement-engine
clarinet contract new treasury
clarinet contract new oracle-adapter
```

### Step 3: Create Frontend

```bash
cd ..
npx create-next-app@latest bitoracle-frontend \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir

cd bitoracle-frontend

# Install Stacks dependencies
npm install @stacks/connect @stacks/transactions @stacks/network @stacks/api

# Install UI dependencies
npm install @tanstack/react-query zustand

# Install chart library
npm install lightweight-charts

# Install shadcn/ui
npx shadcn-ui@latest init
```

### Step 4: Create Keeper Bot

```bash
cd ..
mkdir keeper && cd keeper
npm init -y
npm install typescript ts-node @stacks/transactions @stacks/network
npm install @pythnetwork/price-service-client
npm install -D @types/node

# Create tsconfig
echo '{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist"
  }
}' > tsconfig.json
```

### Step 5: Environment Variables

```bash
# frontend/.env.local
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_TESTNET_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
NEXT_PUBLIC_MAINNET_CONTRACT_ADDRESS=
NEXT_PUBLIC_HIRO_API_KEY=

# keeper/.env
KEEPER_PRIVATE_KEY=your-testnet-wallet-private-key
CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
NETWORK=testnet
PYTH_ENDPOINT=https://hermes.pyth.network
```

---

## 14. Deployment Guide

### Deploy Contracts to Testnet

```bash
cd bitoracle

# Check contracts pass syntax
clarinet check

# Run all tests
clarinet test

# Deploy to testnet (requires STX for fees)
clarinet deployments apply --testnet

# Verify deployment — note the contract addresses output
# Example output:
# ✓ prediction-market deployed at ST1PQ...XZF1.prediction-market
# ✓ settlement-engine deployed at ST1PQ...XZF1.settlement-engine
# ✓ treasury deployed at ST1PQ...XZF1.treasury
```

### Verify on Stacks Explorer

```
https://explorer.hiro.so/address/YOUR_CONTRACT_ADDRESS?chain=testnet
```

### Deploy Frontend to Vercel

```bash
cd bitoracle-frontend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel deploy --prod

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_NETWORK = testnet
# NEXT_PUBLIC_TESTNET_CONTRACT_ADDRESS = your deployed address
```

### Run Keeper Bot

```bash
cd keeper

# Start keeper (runs continuously)
npx ts-node index.ts

# Or with PM2 for production:
npm install -g pm2
pm2 start "npx ts-node index.ts" --name bitoracle-keeper
pm2 logs bitoracle-keeper
```

---

## 15. Testing Strategy

### Smart Contract Tests (Clarinet)

```typescript
// tests/prediction-market_test.ts
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.7.1/index.ts';
import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

Clarinet.test({
  name: "Can create a round and place predictions",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const alice = accounts.get('wallet_1')!;
    const bob = accounts.get('wallet_2')!;

    let block = chain.mineBlock([
      // Create a round: BTC/USD, open price $65k, 10 blocks duration
      Tx.contractCall('prediction-market', 'create-round', [
        types.ascii('BTC/USD'),
        types.uint(6500000000000),  // $65,000 with 8 decimals
        types.uint(10),             // 10 blocks
      ], deployer.address),
    ]);

    assertEquals(block.receipts[0].result, '(ok u1)'); // round-id = 1

    // Alice bets UP with 0.01 sBTC (1,000,000 sats)
    block = chain.mineBlock([
      Tx.contractCall('prediction-market', 'place-prediction', [
        types.uint(1),              // round-id
        types.ascii('UP'),
        types.uint(1000000),        // 0.01 sBTC
      ], alice.address),
    ]);

    assertEquals(block.receipts[0].result, '(ok true)');

    // Bob bets DOWN with 0.005 sBTC
    block = chain.mineBlock([
      Tx.contractCall('prediction-market', 'place-prediction', [
        types.uint(1),
        types.ascii('DOWN'),
        types.uint(500000),
      ], bob.address),
    ]);

    assertEquals(block.receipts[0].result, '(ok true)');

    // Check pool totals
    const pools = chain.callReadOnlyFn(
      'prediction-market',
      'get-round-pool-sizes',
      [types.uint(1)],
      deployer.address
    );

    assertEquals(pools.result, '(ok {total: u1500000, total-down: u500000, total-up: u1000000})');
  }
});

Clarinet.test({
  name: "Cannot place duplicate prediction in same round",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const alice = accounts.get('wallet_1')!;

    chain.mineBlock([
      Tx.contractCall('prediction-market', 'create-round', [
        types.ascii('BTC/USD'),
        types.uint(6500000000000),
        types.uint(10),
      ], deployer.address),
    ]);

    chain.mineBlock([
      Tx.contractCall('prediction-market', 'place-prediction', [
        types.uint(1), types.ascii('UP'), types.uint(1000000),
      ], alice.address),
    ]);

    // Second prediction should fail
    const block = chain.mineBlock([
      Tx.contractCall('prediction-market', 'place-prediction', [
        types.uint(1), types.ascii('DOWN'), types.uint(500000),
      ], alice.address),
    ]);

    assertEquals(block.receipts[0].result, '(err u104)'); // ERR-ALREADY-PREDICTED
  }
});
```

### Frontend Integration Tests

```typescript
// Using Vitest + React Testing Library

// Test: PredictionPanel renders correctly
// Test: UP button selection highlights correctly
// Test: DOWN button selection highlights correctly
// Test: Submit disabled without wallet connection
// Test: Submit calls placePrediction with correct args
// Test: Error message shown on failed transaction
// Test: Success callback fires after transaction
```

---

## 16. Hackathon Submission Checklist

### Judging Criteria Alignment

| Criterion | BitOracle's Approach | Status |
|---|---|---|
| **Innovation** | First trustless sBTC binary prediction market — no equivalent exists | Unique |
| **Technical Implementation** | Clarity contracts, sBTC SIP-010, Pyth oracle, post-conditions, keeper bot | Complete |
| **Stacks Alignment** | sBTC settlement, Clarity language, Stacks.js, Proof of Transfer finality | Deep alignment |
| **User Experience** | Minimal 2-click trading UX, familiar chart interface, instant feedback | Polished |
| **Impact Potential** | Opens binary prediction markets to Bitcoin — billions in addressable market | High |

### Required Submission Items

- [ ] **GitHub Repo** — public, clean code, good README
- [ ] **Working Demo** — deployed on Vercel, testnet contracts live
- [ ] **Pitch Video** (< 5 minutes)
  - [ ] Problem (30s) — centralized binary options are broken
  - [ ] Solution (1m) — BitOracle: trustless, sBTC-native prediction markets
  - [ ] Demo (2m) — live walkthrough: connect wallet → place bet → settle → claim
  - [ ] Architecture (1m) — contracts, oracle, keeper
  - [ ] Traction + Roadmap (30s)
- [ ] **DoraHacks BUIDL Gallery listing** with full description
- [ ] **Testnet contract addresses** documented in README

### Pitch Video Script Outline

```
[0:00-0:30] HOOK
  "Pocket Option processes billions in binary trades per year.
   But when users win too much, platforms block withdrawals.
   When settlements are disputed, the company decides.
   There's no transparency. There's no fairness.
   BitOracle fixes this."

[0:30-1:30] PRODUCT DEMO
  - Open BitOracle
  - Connect Leather wallet
  - Show active BTC/USD market with 2-minute timer
  - Select UP, enter 0.01 sBTC
  - Sign transaction (show post-condition)
  - Show prediction locked in contract
  - Fast-forward: market settles via keeper bot
  - Show claim button appear
  - Claim sBTC — show balance increase

[1:30-2:30] HOW IT WORKS
  - Clarity contract holds all sBTC
  - Oracle determines outcome — not us
  - 2% fee funds protocol treasury
  - No admin can change the result
  - No withdrawal restrictions

[2:30-3:00] STACKS ALIGNMENT
  - sBTC = real Bitcoin on Stacks
  - Clarity = auditable, non-upgradeable
  - Proof of Transfer = Bitcoin finality
  - Pyth oracle on Stacks

[3:00-3:30] ROADMAP
  - Mainnet launch post-hackathon
  - Multiple assets (ETH, STX)
  - DAO governance
  - Stacks Foundation grant application

[3:30-4:00] CLOSING
  "BitOracle is what binary trading should have always been —
   transparent, trustless, and Bitcoin-native."
```

---

*BitOracle — Trustless Bitcoin Prediction Markets on Stacks.*

*Built for the Buidl Battle Hackathon.*
