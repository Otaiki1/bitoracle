;; Mock sBTC token (SIP-010) for BitOracle testing

(define-fungible-token sbtc)

(define-constant ERR-UNAUTHORIZED (err u100))

;; SIP-010 functions
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) ERR-UNAUTHORIZED)
    (try! (ft-transfer? sbtc amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)
  )
)

(define-read-only (get-name)
  (ok "sBTC Mock")
)

(define-read-only (get-symbol)
  (ok "sBTC")
)

(define-read-only (get-decimals)
  (ok u8)
)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance sbtc who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply sbtc))
)

(define-read-only (get-token-uri)
  (ok none)
)

;; Mint function for testing
(define-public (mint (amount uint) (recipient principal))
  (ft-mint? sbtc amount recipient)
)
