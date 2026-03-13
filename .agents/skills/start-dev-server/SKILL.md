# Stacks Local Development Server

This skill helps you set up and manage a local development environment for Stacks projects.

## Components

1.  **Clarinet Devnet**: A local blockchain for testing contracts and transactions.
2.  **Frontend Server**: Usually Vite or Next.js for your web application.
3.  **Chrome DevTools MCP**: Provides Claude visibility into your browser console.

## Setup Steps

1.  **Start Devnet**:
    *   `clarinet devnet start` (Requires Docker).
2.  **Start Frontend**:
    *   Detect project type (Vite, Next.js, etc.).
    *   `npm run dev` or equivalent.
3.  **Enable Debugging**:
    *   Select the Chrome DevTools MCP server in Claude.

## Best Practices

*   Keep Devnet logs open for transaction monitoring.
*   Test wallet interactions with Stacks.js.
*   Watch for contract changes; Clarinet hot-reloads contracts automatically.
