import { createServer } from 'http'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Import the TanStack Start server handler
import(`file://${__dirname}/dist/server/server.js`).then(async (module) => {
  const serverHandler = module.default

  // Create HTTP server that wraps the fetch handler
  const httpServer = createServer(async (req, res) => {
    try {
      // Construct full URL from request
      const protocol = req.headers['x-forwarded-proto'] || 'http'
      const host = req.headers.host || 'localhost'
      const url = new URL(`${protocol}://${host}${req.url}`)

      // Convert Node request to Web Request
      let body = undefined
      if (!['GET', 'HEAD'].includes(req.method)) {
        const chunks = []
        for await (const chunk of req) {
          chunks.push(chunk)
        }
        body = Buffer.concat(chunks)
      }

      const requestInit = {
        method: req.method,
        headers: Object.fromEntries(
          Object.entries(req.headers).filter(([key]) => key !== 'host')
        ),
        body,
      }

      // Call the fetch handler
      const response = await serverHandler.fetch(new Request(url, requestInit))

      // Send response headers
      const headers = Object.fromEntries(response.headers)
      res.writeHead(response.status, headers)

      // Send response body
      if (response.body) {
        const reader = response.body.getReader()
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            res.write(new Uint8Array(value))
          }
        } finally {
          reader.releaseLock()
        }
      }
      res.end()
    } catch (err) {
      console.error('Error handling request:', err)
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' })
      }
      res.end('Internal Server Error')
    }
  })

  const port = parseInt(process.env.PORT || '3000', 10)
  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`✓ Server listening on http://0.0.0.0:${port}`)
  })

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...')
    httpServer.close(() => {
      process.exit(0)
    })
  })
}).catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})