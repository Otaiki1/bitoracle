;; oracle-adapter.clar
;; BitOracle - Oracle Price Adapter
;; Wraps Pyth price feed or Mock for demo

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u400))

;; For demo/hackathon, we'll allow the owner to set the price manually via a keeper
(define-data-var latest-price uint u0)
(define-data-var latest-timestamp uint u0)

;; Fetch latest BTC/USD price
(define-read-only (get-btc-price)
  (ok {
    price: (var-get latest-price),
    timestamp: (var-get latest-timestamp)
  })
)

;; Admin function to update price (called by keeper)
(define-public (update-price (new-price uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set latest-price new-price)
    (var-set latest-timestamp burn-block-height)
    (ok true)
  )
)
