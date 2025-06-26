#!/usr/bin/env node

import { FastMCP } from 'fastmcp'
import { z } from 'zod'
import packageJson from '../package.json'

const server = new FastMCP({
  name: 'Divvi MCP Server',
  version: packageJson.version as `${number}.${number}.${number}`,
})

server.addTool({
  name: 'integrate_divvi_referral_sdk',
  description: `Provides instructions for integrating the @divvi/referral-sdk into JavaScript/TypeScript blockchain applications.

Works with any JS/TS framework including React, Next.js, Vue, Angular, vanilla JavaScript, Node.js backends, and more.

This tool returns instructions that guide the AI agent to read the latest documentation and implement the integration according to the official patterns and examples.`,

  parameters: z.object({
    consumerAddress: z
      .string()
      .describe(
        'Your Divvi dapp wallet address (used to register as a builder on Divvi)',
      ),
  }),

  execute: async (args) => {
    const instructions = `# Divvi Referral SDK Integration Task

You need to integrate the @divvi/referral-sdk into this JavaScript/TypeScript blockchain application to enable referral tracking.

## Your Integration Parameters:
- **Consumer Address**: \`${args.consumerAddress}\`

## Step 1: Read the Official Documentation
**IMPORTANT**: First, read the complete documentation to understand the current integration patterns:

**Documentation URL**: https://raw.githubusercontent.com/divvi-xyz/divvi-referral-sdk/refs/heads/main/README.md

Focus on:
- Installation requirements
- Integration patterns and examples
- Function signatures and parameters
- Best practices and recommendations
- Any framework-specific guidance

## Step 2: Analyze the Target Project
Examine the project structure to understand:
- Package manager (npm/yarn/pnpm/bun)
- JavaScript framework being used
- Blockchain libraries present (viem, ethers, wagmi, etc.)
- Existing transaction patterns in the codebase
- How user accounts/addresses are managed

## Step 3: Follow the Documentation
Implement the integration exactly as described in the official documentation, using:
- Your consumer address: \`${args.consumerAddress}\`
- The project's existing patterns and conventions

## Step 4: Apply Integration Standards
Ensure the implementation follows these principles:
- Use the project's existing code patterns and style
- Maintain compatibility with existing transaction flows
- Include proper error handling
- Don't break existing functionality
- Follow the SDK's recommended practices from the documentation

## Success Criteria:
✅ SDK installed according to documentation
✅ Integration implemented following official examples
✅ All blockchain transactions include referral tracking
✅ Referral submission happens after transactions
✅ Error handling prevents integration from breaking main flows
✅ Integration uses the provided consumer address
✅ Code follows project conventions and patterns

**Remember**: The official documentation is the source of truth. Follow its patterns, examples, and recommendations exactly. Use the provided consumer address in the integration as specified in the docs.`

    return instructions
  },
})

server
  .start({
    transportType: 'stdio',
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exitCode = 1
  })
