# Stacks Test-Driven Development

This skill guides you through implementing and verifying Clarity smart contracts using a TDD approach.

## Testing Overview

*   **Unit Tests**: Focused on individual functions and contract logic using Clarinet SDK + Vitest.
*   **Integration Tests**: Verifying interactions between multiple contracts.
*   **Property-Based Testing**: Finding edge cases with Rendezvous.

## Common Commands

*   Run all tests: `clarinet test`
*   Run Vitest directly: `npm run test`
*   Check coverage: `npm run test:coverage`

## Debugging Tips

*   **Analyze Errors**: Look for `(err ...)` codes in Clarity output.
*   **Check Post-conditions**: Ensure your tests account for asset transfers.
*   **Use Logs**: Add `(print ...)` in your Clarity code for runtime visibility.
