# Stacks Contract Deployment

This skill provides a guided workflow for deploying Clarity smart contracts to the Stacks blockchain.

## Getting Started

Before deploying, ensure you have:
1.  **Clarinet installed**: `clarinet --version`
2.  **A valid project**: Check your `Clarinet.toml` and project structure.
3.  **Deployment plans**: Ensure `deployments/*.yaml` exists for your target network.

## Deployment Workflow

1.  **Pre-flight Checks**:
    *   Validate the project: `clarinet check`
    *   Confirm contract logic and costs.
2.  **Network Selection**:
    *   **Testnet**: For testing with real network dynamics.
    *   **Mainnet**: For final production deployment.
3.  **Execution**:
    *   Default Testnet: `clarinet deployment apply -p deployments/default.testnet-plan.yaml`
    *   Mainnet: Use your specific mainnet deployment plan.

## Integration Tips

*   Always simulate deployments locally or on testnet before mainnet.
*   Monitor transaction results on a Stacks explorer.
*   Check for potential post-condition failures.
