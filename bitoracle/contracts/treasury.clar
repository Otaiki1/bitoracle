;; treasury.clar
;; BitOracle - Protocol Treasury
;; Holds protocol fees from settled markets

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u300))
(define-constant ERR-ZERO-AMOUNT (err u301))

;; Total fees collected (informational)
(define-data-var total-fees-collected uint u0)

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
