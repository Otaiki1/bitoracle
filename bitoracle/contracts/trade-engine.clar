;; trade-engine.clar
;; BitOracle -- Per-User Trade Engine
;; Users place independent trades. No round creation needed.

;; ============================================================
;; CONSTANTS
;; ============================================================

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u100))
(define-constant ERR-INVALID-DIRECTION (err u101))
(define-constant ERR-ZERO-AMOUNT (err u102))
(define-constant ERR-INVALID-TIMEFRAME (err u103))
(define-constant ERR-TRADE-NOT-FOUND (err u104))
(define-constant ERR-TRADE-NOT-EXPIRED (err u105))
(define-constant ERR-ALREADY-SETTLED (err u106))
(define-constant ERR-VAULT-INSUFFICIENT (err u107))
(define-constant ERR-ALREADY-CLAIMED (err u108))

;; Payout rates by timeframe (in basis points, 10000 = 100%)
;; These are what the USER receives on top of their stake
(define-constant PAYOUT-30S  u7000)   ;; 70%
(define-constant PAYOUT-1M   u8000)   ;; 80%
(define-constant PAYOUT-5M   u8500)   ;; 85%
(define-constant PAYOUT-15M  u9000)   ;; 90%
(define-constant BPS-DENOM   u10000)

;; Minimum stake: 1000 sats = ~$0.60
(define-constant MIN-STAKE u1000)

;; Duration in blocks per timeframe
;; Stacks Nakamoto: ~5 second blocks -> ~12 blocks per minute
(define-constant BLOCKS-30S  u6)
(define-constant BLOCKS-1M   u12)
(define-constant BLOCKS-5M   u60)
(define-constant BLOCKS-15M  u180)

;; ============================================================
;; DATA STRUCTURES
;; ============================================================

;; Each individual user trade
(define-map trades
  { trade-id: uint }
  {
    trader: principal,
    direction: bool,          ;; true = UP, false = DOWN
    stake: uint,              ;; sBTC in satoshis
    entry-price: uint,        ;; BTC price at trade open (8 decimals)
    close-price: uint,        ;; BTC price at settlement (0 until settled)
    entry-block: uint,        ;; block when trade was placed
    expiry-block: uint,       ;; block when trade can be settled
    timeframe: uint,          ;; 1=30s, 2=1m, 3=5m, 4=15m
    payout-rate: uint,        ;; BPS payout for this trade
    status: uint,             ;; 0=open, 1=won, 2=lost, 3=draw
    payout-amount: uint,      ;; Set at settlement -- 0 until settled
    claimed: bool
  }
)

;; Index: trader -> list of their trade IDs
;; We use a counter per trader for pagination
(define-map trader-trade-count
  { trader: principal }
  { count: uint }
)

;; Mapping from trader + index -> trade-id for lookups
(define-map trader-trades
  { trader: principal, index: uint }
  { trade-id: uint }
)

;; Global trade counter
(define-data-var trade-counter uint u0)

;; ============================================================
;; PLACE TRADE -- The main user-facing function
;; No admin needed. User calls this directly.
;; ============================================================

;; direction: true = UP, false = DOWN
;; timeframe: 1=30s, 2=1m, 3=5m, 4=15m
;; stake: sBTC amount in satoshis
;; entry-price: current BTC price from oracle (user fetches and passes in)
(define-public (place-trade
  (direction bool)
  (timeframe uint)
  (stake uint)
  (entry-price uint))

  (let (
    (trade-id (+ (var-get trade-counter) u1))
    (expiry-blocks (get-expiry-blocks timeframe))
    (payout-rate (get-payout-rate timeframe))
    (expiry-block (+ burn-block-height (unwrap! expiry-blocks ERR-INVALID-TIMEFRAME)))
    (max-payout (/ (* stake (unwrap! payout-rate ERR-INVALID-TIMEFRAME)) BPS-DENOM))
    (trader-count (default-to { count: u0 }
                    (map-get? trader-trade-count { trader: tx-sender })))
  )
    ;; Validate stake minimum
    (asserts! (>= stake MIN-STAKE) ERR-ZERO-AMOUNT)

    ;; Validate timeframe
    (asserts!
      (or (is-eq timeframe u1) (is-eq timeframe u2)
          (is-eq timeframe u3) (is-eq timeframe u4))
      ERR-INVALID-TIMEFRAME
    )

    ;; Validate vault has enough to cover potential payout
    ;; Vault must hold at least: stake + max-payout
    (let ((vault-balance (unwrap! (contract-call? .bo-vault-v5 get-vault-balance)
                                  ERR-VAULT-INSUFFICIENT)))
      (asserts! (>= vault-balance (+ stake max-payout)) ERR-VAULT-INSUFFICIENT)
    )

    ;; Transfer stake from user into the vault (locked until settlement)
    (try! (contract-call? .bo-sbtc-v5 transfer
      stake
      tx-sender
      (as-contract .bo-vault-v5)
      none
    ))

    ;; Record the trade
    (map-set trades
      { trade-id: trade-id }
      {
        trader: tx-sender,
        direction: direction,
        stake: stake,
        entry-price: entry-price,
        close-price: u0,
        entry-block: burn-block-height,
        expiry-block: expiry-block,
        timeframe: timeframe,
        payout-rate: (unwrap! payout-rate ERR-INVALID-TIMEFRAME),
        status: u0,               ;; open
        payout-amount: u0,
        claimed: false
      }
    )

    ;; Update trader index
    (map-set trader-trades
      { trader: tx-sender, index: (get count trader-count) }
      { trade-id: trade-id }
    )
    (map-set trader-trade-count
      { trader: tx-sender }
      { count: (+ (get count trader-count) u1) }
    )

    ;; Increment global counter
    (var-set trade-counter trade-id)

    (ok trade-id)
  )
)

;; ============================================================
;; SETTLE TRADE -- Called by keeper bot after expiry
;; ============================================================

(define-public (settle-trade (trade-id uint) (close-price uint))
  (let (
    (trade (unwrap! (map-get? trades { trade-id: trade-id }) ERR-TRADE-NOT-FOUND))
  )
    ;; Only contract owner (keeper) can settle
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    ;; Must not already be settled
    (asserts! (is-eq (get status trade) u0) ERR-ALREADY-SETTLED)

    ;; Must have reached expiry block
    (asserts! (>= burn-block-height (get expiry-block trade)) ERR-TRADE-NOT-EXPIRED)

    ;; Determine outcome
    (let (
      (entry-price (get entry-price trade))
      (stake (get stake trade))
      (payout-rate (get payout-rate trade))
      (profit (/ (* stake payout-rate) BPS-DENOM))
      (total-payout (+ stake profit))       ;; stake returned + profit
      (won-up (and (get direction trade) (> close-price entry-price)))
      (won-down (and (not (get direction trade)) (< close-price entry-price)))
      (is-draw (is-eq close-price entry-price))
      (user-won (or won-up won-down))
    )
      ;; Update trade with settlement data
      (map-set trades
        { trade-id: trade-id }
        (merge trade {
          close-price: close-price,
          status: (if is-draw u3 (if user-won u1 u2)),
          payout-amount: (if is-draw stake (if user-won total-payout u0))
        })
      )

      ;; If user won or draw: release funds from vault to user
      (if (or user-won is-draw)
        (try! (contract-call? .bo-vault-v5 release-funds
          (get trader trade)
          (if is-draw stake total-payout)
        ))
        ;; If user lost: vault keeps stake. No transfer needed.
        true
      )

      (ok {
        trade-id: trade-id,
        outcome: (if is-draw "DRAW" (if user-won "WIN" "LOSS")),
        payout: (if is-draw stake (if user-won total-payout u0))
      })
    )
  )
)

;; ============================================================
;; READ-ONLY FUNCTIONS
;; ============================================================

(define-read-only (get-trade (trade-id uint))
  (map-get? trades { trade-id: trade-id })
)

(define-read-only (get-trader-trade-count (trader principal))
  (default-to { count: u0 } (map-get? trader-trade-count { trader: trader }))
)

(define-read-only (get-trader-trade-at-index (trader principal) (index uint))
  (map-get? trader-trades { trader: trader, index: index })
)

(define-read-only (get-trade-counter)
  (var-get trade-counter)
)

;; ============================================================
;; PRIVATE HELPERS
;; ============================================================

(define-private (get-expiry-blocks (timeframe uint))
  (if (is-eq timeframe u1) (some BLOCKS-30S)
    (if (is-eq timeframe u2) (some BLOCKS-1M)
      (if (is-eq timeframe u3) (some BLOCKS-5M)
        (if (is-eq timeframe u4) (some BLOCKS-15M)
          none
        )
      )
    )
  )
)

(define-private (get-payout-rate (timeframe uint))
  (if (is-eq timeframe u1) (some PAYOUT-30S)
    (if (is-eq timeframe u2) (some PAYOUT-1M)
      (if (is-eq timeframe u3) (some PAYOUT-5M)
        (if (is-eq timeframe u4) (some PAYOUT-15M)
          none
        )
      )
    )
  )
)
