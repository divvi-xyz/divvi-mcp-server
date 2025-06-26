# Divvi MCP Server

A Model Context Protocol (MCP) server that provides AI assistants with tools for working with the Divvi ecosystem. Currently focuses on automatic integration of the [@divvi/referral-sdk](https://github.com/divvi-xyz/divvi-referral-sdk) into JavaScript/TypeScript blockchain applications, with more Divvi-related functionality planned for future releases.

## Overview

Integrating referral tracking into blockchain applications typically requires understanding SDK documentation, modifying transaction flows, and maintaining integration code as protocols evolve. This MCP server eliminates that complexity by turning any AI assistant into a Divvi integration expert that can automatically implement referral tracking following current best practices.

**Compatible with any JavaScript/TypeScript blockchain application**, including:

- **Frontend frameworks**: React, Next.js, Vue, Angular, Svelte, vanilla JavaScript
- **Backend applications**: Node.js, Express, Fastify, serverless functions
- **Full-stack frameworks**: Next.js, Nuxt, SvelteKit, Remix
- **Desktop/mobile**: Electron, React Native, Ionic
- **Any JS/TS app** that makes blockchain transactions

The server currently provides an MCP tool (`integrate_divvi_referral_sdk`) that:

1. **📖 Guides AI agents** to read the latest official Divvi SDK documentation
2. **🔍 Instructs project analysis** to understand the target application structure
3. **🔧 Provides integration parameters** (consumer address and provider campaigns)
4. **✅ Ensures proper implementation** following official patterns and best practices

## Usage

> **⚠️ Prerequisites**: Before using this tool, you need to install and configure the MCP server. See the [Installation](#installation) section below.

### Simple Integration

The easiest way to use this is to simply ask your AI assistant:

```
"Integrate this dapp with Divvi"
```

Your AI assistant will guide you through providing the necessary configuration (your Divvi dapp address and campaign addresses) and handle the entire integration process.

### Detailed Integration

For more specific control, you can provide the exact parameters:

```
"Integrate my dapp with Divvi using consumer address 0x1234..."
```

The AI assistant will:

1. Read the latest Divvi SDK documentation
2. Analyze your project structure
3. Install the SDK if needed
4. Modify your blockchain transactions to include referral tracking
5. Add referral submission after transactions

### Required Information

To complete the integration, you'll need:

- **Consumer Address**: Your Divvi dapp wallet address (used to register as a builder on Divvi)

### Example Tool Call

```typescript
// The AI assistant will call this internally
integrate_divvi_referral_sdk({
  consumerAddress: '0x1234567890123456789012345678901234567890',
})
```

## Key Features

- **Always up-to-date**: Instructs AI agents to read documentation directly from the official repository
- **Universal compatibility**: Works with React, Vue, Angular, Node.js, vanilla JS, and any JavaScript/TypeScript framework
- **Blockchain library agnostic**: Supports viem, ethers, wagmi, and other Web3 libraries
- **Non-prescriptive**: Provides guidance while letting AI agents use their own capabilities intelligently
- **Future-proof**: Instructions adapt as the Divvi SDK evolves
- **Extensible**: Designed to support additional Divvi ecosystem tools and functionality

> **Technical Note**: This integration is implemented as an MCP "tool" rather than a "prompt" type. While the MCP specification includes a prompt type that would be more semantically appropriate for this use case, we chose the tool implementation for broader compatibility, as Cursor doesn't currently support MCP prompts.

## Installation

### Prerequisites

- Node.js 22+
- An MCP-compatible AI assistant (Claude Desktop, Cursor, Copilot, etc.)

### Quick Setup (Recommended)

The easiest way to use the Divvi MCP server is via npm:

#### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "divvi-mcp": {
      "command": "npx",
      "args": ["-y", "@divvi/mcp-server"],
      "env": {}
    }
  }
}
```

#### Cursor

Cursor supports MCP servers through its settings. Add the server configuration:

1. Open Cursor Settings (Cmd/Ctrl + ,)
2. Navigate to "Features" → "Model Context Protocol"
3. Add a new MCP server with:
   - **Name**: `divvi-mcp`
   - **Command**: `npx`
   - **Args**: `["-y", "@divvi/mcp-server"]`

Alternatively, if Cursor uses a configuration file, add:

```json
{
  "mcpServers": {
    "divvi-mcp": {
      "command": "npx",
      "args": ["-y", "@divvi/mcp-server"]
    }
  }
}
```

#### Other MCP Clients

Configure according to your MCP client's documentation, using:

- **Command**: `npx`
- **Args**: `["-y", "@divvi/mcp-server"]`

### Local Development Setup

For development or if you prefer building from source:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/divvi-xyz/divvi-mcp.git
   cd divvi-mcp
   ```

2. **Install dependencies:**

   ```bash
   yarn install
   ```

3. **Build the server:**

   ```bash
   yarn build
   ```

4. **Configure your AI assistant** to point to the local build:

   Use `node` as the command and `["/path/to/divvi-mcp/dist/index.js"]` as the args in your MCP client configuration.

## How It Works

### 1. Documentation-Driven Integration

The tool instructs AI agents to read the official SDK documentation from:
`https://raw.githubusercontent.com/divvi-xyz/divvi-referral-sdk/refs/heads/main/README.md`

This ensures the integration always follows the latest patterns and examples.

### 2. Project Analysis

AI agents analyze the target project to understand:

- Package manager (npm/yarn)
- JavaScript/TypeScript framework being used
- Blockchain libraries (viem, ethers, wagmi)
- Existing transaction patterns
- Account management approach

### 3. SDK Integration

Following the official documentation, AI agents implement:

- SDK installation
- Import statements
- Transaction modifications (adding referral tags)
- Referral submission after transactions
- Proper error handling

### 4. Validation

The integration ensures:

- All blockchain transactions include referral tracking
- Referral failures don't break existing transaction flows
- Code follows project conventions
- Integration uses the provided addresses correctly

## Development

### Local Development

```bash
# Start in development mode
yarn dev

# Run tests
yarn test

# Type checking
yarn typecheck

# Linting
yarn lint

# Format code
yarn format
```

### Project Structure

```
src/
├── index.ts          # Main MCP server implementation
├── index.test.ts     # Unit tests
└── ...

scripts/              # Build and utility scripts
dist/                 # Compiled output
```

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes following the existing code style
4. Add tests for new functionality
5. Run the test suite: `yarn test`
6. Submit a pull request

## API Reference

### Current Tools

#### Tool: `integrate_divvi_referral_sdk`

Provides instructions for integrating the @divvi/referral-sdk into a project.

#### Parameters

| Parameter         | Type   | Required | Description                                           |
| ----------------- | ------ | -------- | ----------------------------------------------------- |
| `consumerAddress` | string | Yes      | Your Divvi dapp wallet address (builder registration) |

#### Returns

Comprehensive integration instructions that guide AI agents through:

- Reading official documentation
- Analyzing project structure
- Implementing the integration
- Validating the result

### Future Tools

Additional tools for the Divvi ecosystem are planned for future releases. These may include:

- **Data integration**: Helpers for tracking referral performance and metrics
- **Protocol interaction**: Direct interaction with Divvi protocol contracts
- **Campaign management**: Tools for creating and managing referral campaigns

> Stay tuned for updates as we expand the server's capabilities!

## Related Projects

- **[@divvi/referral-sdk](https://github.com/divvi-xyz/divvi-referral-sdk)**: The core TypeScript SDK for Divvi integration
- **[Divvi Protocol](https://github.com/divvi-xyz)**: The main Divvi ecosystem repositories

## Support

- **Documentation**: [Divvi SDK Docs](https://www.npmjs.com/package/@divvi/referral-sdk)
- **Issues**: [GitHub Issues](https://github.com/divvi-xyz/divvi-mcp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/divvi-xyz/divvi-mcp/discussions)

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the Divvi ecosystem**
