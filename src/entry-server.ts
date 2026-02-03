import { createServer } from 'http'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Import the TanStack Start server handler
import('./dist/server/server.js').then(async (module) => {
  const server = module.default

  // Create HTTP server that wraps the fetch handler
  const httpServer = createServer(async (req, res) => {
    try {
      // Construct full URL from request
      const protocol = req.headers['x-forwarded-proto'] || 'http'
      const host = req.headers.host || 'localhost'
      const url = new URL(`${protocol}://${host}${req.url}`)

      // Convert Node request to Web Request
      const requestInit = {
        method: req.method,
        headers: req.headers,
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : req,
      }

      // Call the fetch handler
      const response = await server.fetch(new Request(url, requestInit))

      // Send response
      res.writeHead(response.status, Object.fromEntries(response.headers))
      if (response.body) {
        const reader = response.body.getReader()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          res.write(Buffer.from(value))
        }
      }
      res.end()
    } catch (err) {
      console.error('Error handling request:', err)
      res.writeHead(500)
      res.end('Internal Server Error')
    }
  })

  const port = parseInt(process.env.PORT || '3000', 10)
  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`✓ Server listening on http://0.0.0.0:${port}`)
  })
}).catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
