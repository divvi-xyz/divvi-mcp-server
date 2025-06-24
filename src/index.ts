import { FastMCP } from 'fastmcp'
import { z } from 'zod'

const server = new FastMCP({
  name: 'Divvi MCP Server',
  version: '1.0.0',
})

server.addTool({
  name: 'integrate_divvi_referral_sdk',
  description: `Provides instructions for integrating the @divvi/referral-sdk into JavaScript/TypeScript blockchain applications.

Works with any JS/TS framework including React, Next.js, Vue, Angular, vanilla JavaScript, Node.js backends, and more.

This tool returns instructions that guide the AI agent to read the latest documentation and implement the integration according to the official patterns and examples.`,

  parameters: z.object({
    consumerAddress: z
      .string()
      .describe('Your Divvi dapp wallet address (used to register on Divvi)'),
    providers: z
      .array(z.string())
      .describe('Array of campaign addresses you signed up for'),
  }),

  execute: async (args) => {
    const instructions = `# Divvi Referral SDK Integration Task

You need to integrate the @divvi/referral-sdk into a React/Next.js project to enable referral tracking.

## Your Integration Parameters:
- **Consumer Address**: \`${args.consumerAddress}\`
- **Provider Campaigns**: ${JSON.stringify(args.providers, null, 2)}

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
- Package manager (npm/yarn)
- JavaScript framework being used
- Blockchain libraries present (viem, ethers, wagmi, etc.)
- Existing transaction patterns in the codebase
- How user accounts/addresses are managed

## Step 3: Follow the Documentation
Implement the integration exactly as described in the official documentation, using:
- Your consumer address: \`${args.consumerAddress}\`
- Your providers: ${JSON.stringify(args.providers)}
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
✅ Integration uses the provided consumer and provider addresses
✅ Code follows project conventions and patterns

**Remember**: The official documentation is the source of truth. Follow its patterns, examples, and recommendations exactly. Use the provided addresses in the integration as specified in the docs.`

    return instructions
  },
})

server.start({
  transportType: 'stdio',
})
