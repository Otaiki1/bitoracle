;; prediction-market.clar
;; BitOracle - Core Prediction Market Contract
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

;; sBTC contract reference 
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

;; Settlement contract authorized to update rounds
(define-data-var settlement-contract principal .settlement-engine)

;; Round ID counter
(define-data-var current-round-id uint u0)

;; ============================================================
;; ADMIN: ROUND CREATION
;; ============================================================

;; Set the authorized settlement contract
(define-public (set-settlement-contract (new-settlement principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set settlement-contract new-settlement)
    (ok true)
  )
)

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
        start-block: burn-block-height,
        end-block: (+ burn-block-height duration-in-blocks),
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
    (asserts! (<= burn-block-height (get end-block round)) ERR-ROUND-EXPIRED)

    ;; Validate user hasn't already bet in this round
    (asserts! (is-none existing-prediction) ERR-ALREADY-PREDICTED)

    ;; Transfer sBTC from user to this contract (escrow)
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
;; Only callable by authorized settlement contract
;; ============================================================

;; Updates a round's settlement data (called by settlement contract)
(define-public (update-round-settled
  (round-id uint)
  (close-price uint)
  (winning-direction (string-ascii 4)))

  (let (
    (round (unwrap! (map-get? rounds { round-id: round-id }) ERR-ROUND-NOT-FOUND))
  )
    ;; Only authorized settlement contract can call this
    (asserts! (is-eq contract-caller (var-get settlement-contract)) ERR-UNAUTHORIZED)

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
    (asserts! (is-eq contract-caller (var-get settlement-contract)) ERR-UNAUTHORIZED)
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
