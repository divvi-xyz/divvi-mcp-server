import { FastMCP } from 'fastmcp'
import { z } from 'zod'
import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

const server = new FastMCP({
  name: 'Divvi MCP Server',
  version: '1.0.0',
})

server.addTool({
  name: 'integrate_divvi_sdk',
  description: `Automatically integrate the @divvi/referral-sdk into a React/Next.js project with existing blockchain transactions.

## What this tool does:
1. Analyzes your project structure and identifies existing viem transaction patterns
2. Installs @divvi/referral-sdk dependency
3. Modifies existing writeContract/sendTransaction calls to include Divvi referral tracking
4. Adds proper imports and referral submission logic

## Integration Pattern:
The tool identifies patterns like:
\`\`\`typescript
// BEFORE
const txHash = await walletClient.writeContract({
  address: contractAddress,
  abi: contractABI,
  functionName: 'transfer',
  args: [recipient, amount],
})
\`\`\`

And transforms them to:
\`\`\`typescript
// AFTER  
import { getReferralTag, submitReferral } from '@divvi/referral-sdk'

const txHash = await walletClient.writeContract({
  address: contractAddress,
  abi: contractABI,
  functionName: 'transfer',
  args: [recipient, amount],
  dataSuffix: \`0x\${getReferralTag({
    user: account,
    consumer: '0x...', // Your Divvi dapp address
    providers: ['0x...'], // Campaign addresses
  })}\`,
})

const chainId = await walletClient.getChainId()
await submitReferral({ txHash, chainId })
\`\`\`

## Parameters:
- consumer: Your Divvi dapp wallet address (the address you used to register on Divvi)
- providers: Array of campaign addresses you've signed up for
- project_path: Path to your React/Next.js project root (optional, defaults to current directory)

## SDK Documentation:
Full docs at: https://www.npmjs.com/package/@divvi/referral-sdk

The SDK provides:
- getReferralTag(params): Generates hex string for transaction calldata
- submitReferral(params): Reports transaction to Divvi's attribution API

Supports viem's writeContract, sendTransaction, and custom transaction patterns.`,

  parameters: z.object({
    consumer_address: z
      .string()
      .describe('Your Divvi dapp wallet address (used to register on Divvi)'),
    providers: z
      .array(z.string())
      .describe('Array of campaign addresses you signed up for'),
    project_path: z
      .string()
      .optional()
      .describe('Path to project root (defaults to current directory)'),
  }),

  execute: async (args) => {
    const projectPath = args.project_path || process.cwd()
    const results = {
      analysis: {} as any,
      dependencies: {} as any,
      modifications: [] as any[],
      summary: '',
    }

    try {
      // 1. Analyze Project Structure
      results.analysis = analyzeProject(projectPath)

      // 2. Install Dependencies
      if (!results.analysis.hasDivviSDK) {
        results.dependencies = installDivviSDK(
          projectPath,
          results.analysis.packageManager,
        )
      }

      // 3. Find and Modify Transaction Patterns
      results.modifications = await modifyTransactionFiles(
        projectPath,
        args.consumer_address,
        args.providers,
        results.analysis,
      )

      // 4. Generate Summary
      results.summary = generateSummary(results)

      return JSON.stringify(results, null, 2)
    } catch (error) {
      return JSON.stringify(
        {
          error: `Integration failed: ${error instanceof Error ? error.message : String(error)}`,
          partial_results: results,
        },
        null,
        2,
      )
    }
  },
})

function analyzeProject(projectPath: string) {
  const packageJsonPath = path.join(projectPath, 'package.json')

  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(
      'No package.json found. This tool works with npm/yarn projects.',
    )
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

  // Detect package manager
  const hasYarnLock = fs.existsSync(path.join(projectPath, 'yarn.lock'))
  const hasNpmLock = fs.existsSync(path.join(projectPath, 'package-lock.json'))
  const packageManager = hasYarnLock ? 'yarn' : hasNpmLock ? 'npm' : 'npm'

  // Check for existing dependencies
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  }
  const hasViem = 'viem' in allDeps
  const hasWagmi = 'wagmi' in allDeps
  const hasEthers = 'ethers' in allDeps
  const hasDivviSDK = '@divvi/referral-sdk' in allDeps

  // Detect framework
  const isNextJS = 'next' in allDeps
  const isReact = 'react' in allDeps

  // Find source files
  const srcDir = fs.existsSync(path.join(projectPath, 'src')) ? 'src' : '.'
  const sourceFiles = findSourceFiles(path.join(projectPath, srcDir))

  return {
    packageManager,
    hasViem,
    hasWagmi,
    hasEthers,
    hasDivviSDK,
    isNextJS,
    isReact,
    sourceFiles,
    srcDir,
  }
}

function findSourceFiles(dirPath: string): string[] {
  const files: string[] = []

  if (!fs.existsSync(dirPath)) return files

  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)

    if (
      entry.isDirectory() &&
      !entry.name.startsWith('.') &&
      entry.name !== 'node_modules'
    ) {
      files.push(...findSourceFiles(fullPath))
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(fullPath)
    }
  }

  return files
}

function installDivviSDK(projectPath: string, packageManager: string) {
  try {
    const command =
      packageManager === 'yarn'
        ? 'yarn add @divvi/referral-sdk'
        : 'npm install @divvi/referral-sdk'

    execSync(command, { cwd: projectPath, stdio: 'pipe' })

    return {
      success: true,
      command,
      message: 'Successfully installed @divvi/referral-sdk',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Failed to install @divvi/referral-sdk',
    }
  }
}

async function modifyTransactionFiles(
  projectPath: string,
  consumerAddress: string,
  providers: string[],
  analysis: any,
) {
  const modifications = []

  for (const filePath of analysis.sourceFiles) {
    const content = fs.readFileSync(filePath, 'utf8')

    // Look for transaction patterns
    const patterns = [
      /writeContract\s*\(/g,
      /sendTransaction\s*\(/g,
      /walletClient\.(writeContract|sendTransaction)/g,
    ]

    let hasTransactions = false
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        hasTransactions = true
        break
      }
    }

    if (hasTransactions) {
      const modifiedContent = addDivviIntegration(
        content,
        consumerAddress,
        providers,
      )

      if (modifiedContent !== content) {
        // Backup original file
        fs.writeFileSync(`${filePath}.backup`, content)

        // Write modified content
        fs.writeFileSync(filePath, modifiedContent)

        modifications.push({
          file: path.relative(projectPath, filePath),
          changes: 'Added Divvi referral integration',
          backup: `${path.relative(projectPath, filePath)}.backup`,
        })
      }
    }
  }

  return modifications
}

function addDivviIntegration(
  content: string,
  consumerAddress: string,
  providers: string[],
): string {
  let modified = content

  // Add imports if not present
  if (!modified.includes('@divvi/referral-sdk')) {
    const importLine =
      "import { getReferralTag, submitReferral } from '@divvi/referral-sdk'"

    // Find where to insert import
    if (modified.includes('import')) {
      const lines = modified.split('\n')
      let insertIndex = 0

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import')) {
          insertIndex = i + 1
        }
      }

      lines.splice(insertIndex, 0, importLine)
      modified = lines.join('\n')
    } else {
      modified = importLine + '\n\n' + modified
    }
  }

  // Transform writeContract calls
  modified = modified.replace(
    /(await\s+\w*[wW]alletClient\.writeContract\s*\(\s*\{[^}]*)\}/g,
    (match, beforeClosing) => {
      if (match.includes('dataSuffix')) return match // Already has dataSuffix

      return `${beforeClosing},
  dataSuffix: \`0x\${getReferralTag({
    user: account, // Make sure 'account' variable is available
    consumer: '${consumerAddress}',
    providers: ${JSON.stringify(providers)},
  })}\`,
})`
    },
  )

  // Add submitReferral after transaction calls
  modified = modified.replace(
    /(const\s+(\w+)\s*=\s*await\s+\w*[wW]alletClient\.(?:writeContract|sendTransaction)\s*\([^)]*\))/g,
    (match, fullMatch, txHashVar) => {
      return `${fullMatch}

// Submit referral to Divvi
const chainId = await walletClient.getChainId()
await submitReferral({ txHash: ${txHashVar}, chainId })`
    },
  )

  return modified
}

function generateSummary(results: any): string {
  const { analysis, dependencies, modifications } = results

  let summary = '## Divvi SDK Integration Complete!\n\n'

  summary += `### Project Analysis:\n`
  summary += `- Framework: ${analysis.isNextJS ? 'Next.js' : analysis.isReact ? 'React' : 'JavaScript'}\n`
  summary += `- Package Manager: ${analysis.packageManager}\n`
  summary += `- Blockchain Library: ${analysis.hasViem ? 'viem' : analysis.hasEthers ? 'ethers' : 'none detected'}\n`
  summary += `- Source Files Scanned: ${analysis.sourceFiles.length}\n\n`

  if (dependencies.success) {
    summary += `### Dependencies:\n✅ Installed @divvi/referral-sdk\n\n`
  } else if (dependencies.success === false) {
    summary += `### Dependencies:\n❌ Failed to install @divvi/referral-sdk: ${dependencies.error}\n\n`
  } else {
    summary += `### Dependencies:\n✅ @divvi/referral-sdk already installed\n\n`
  }

  summary += `### Code Modifications:\n`
  if (modifications.length > 0) {
    summary += `Modified ${modifications.length} file(s):\n`
    modifications.forEach((mod: any) => {
      summary += `- ${mod.file}: ${mod.changes}\n`
      summary += `  Backup saved as: ${mod.backup}\n`
    })
  } else {
    summary += `No transaction patterns found to modify.\n`
  }

  summary += `\n### Next Steps:\n`
  summary += `1. Review the modified files\n`
  summary += `2. Ensure 'account' variable is available in transaction contexts\n`
  summary += `3. Test your referral integration\n`
  summary += `4. Check backup files if you need to revert changes\n`

  return summary
}

server.start({
  transportType: 'stdio',
})
