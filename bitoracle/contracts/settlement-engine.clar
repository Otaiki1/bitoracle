;; settlement-engine.clar
;; BitOracle - Settlement Engine
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

;; Main settlement function - called by keeper bot after round expires
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
    (asserts! (>= burn-block-height (get end-block round)) ERR-ROUND-NOT-EXPIRED)

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
    (total-pool (+ (get total-up round) (get total-down round)))
    (net-pool (- total-pool (/ (* total-pool PROTOCOL-FEE-BPS) BPS-DENOMINATOR)))
    (winning-pool (if (is-eq winning-direction "UP")
                    (get total-up round)
                    (if (is-eq winning-direction "DOWN")
                      (get total-down round)
                      u0)))                  ;; DRAW - handled separately
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
