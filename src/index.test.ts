import { exec } from 'shelljs'

describe('MCP Server Integration', () => {
  it('should start the server and confirm it is ready', async () => {
    const command = 'yarn dev'

    let child: ReturnType<typeof exec> | undefined

    const serverStartupPromise = new Promise<void>((resolve, reject) => {
      let serverReady = false
      let toolDetected = false
      let receivedOutput = ''

      // Start the server
      child = exec(command, { async: true, silent: true })

      // Fallback timeout - reject if server doesn't start properly
      const timeoutId = setTimeout(() => {
        reject(
          new Error(
            `Server did not start properly within timeout. Expected both server ready and tool detected. Server ready: ${serverReady}, Tool detected: ${toolDetected}. Received output: ${receivedOutput}`,
          ),
        )
      }, 10000)

      // Listen for stdout data
      child.stdout!.on('data', (data: Buffer) => {
        const output = data.toString()
        receivedOutput += output

        // Check for server startup confirmation - fastmcp dev shows interactive prompt
        if (output.includes('Pick a primitive')) {
          serverReady = true
        }

        // Check for the specific tool name in the output
        if (output.includes('tool(integrate_divvi_referral_sdk)')) {
          toolDetected = true
        }

        // Complete the test when both conditions are met
        if (serverReady && toolDetected) {
          clearTimeout(timeoutId)
          resolve()
        }
      })
    })

    try {
      await expect(serverStartupPromise).resolves.toBeFalsy()
    } finally {
      // Always clean up the child process
      if (child) {
        child.kill('SIGKILL')
      }
    }
  }, 15000) // Increase default timeout since we're starting a server
})
