;; liquidity-vault.clar
;; BitOracle -- Liquidity Vault
;; Acts as the counterparty to all user trades.
;; Funded by: initial seed + accumulated user losses

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u200))
(define-constant ERR-INSUFFICIENT-BALANCE (err u201))

;; Only the trade-engine contract can release funds
(define-public (release-funds (recipient principal) (amount uint))
  (begin
    (asserts! (is-eq contract-caller .bo-engine-v5) ERR-UNAUTHORIZED)
    (as-contract (contract-call? .bo-sbtc-v5 transfer
      amount
      tx-sender
      recipient
      none
    ))
  )
)

;; Admin can seed the vault with initial liquidity
(define-public (seed-vault (amount uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (contract-call? .bo-sbtc-v5 transfer
      amount tx-sender (as-contract tx-sender) none
    )
  )
)

;; Admin can withdraw excess vault profits
(define-public (withdraw-profits (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (as-contract (contract-call? .bo-sbtc-v5 transfer
      amount tx-sender recipient none
    ))
  )
)

(define-read-only (get-vault-balance)
  (contract-call? .bo-sbtc-v5 get-balance (as-contract tx-sender))
)
