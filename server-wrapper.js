import { createServer } from 'http'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Import the TanStack Start server handler
import(`file://${__dirname}/dist/server/server.js`).then(async (module) => {
  const { default: server } = module

  if (!server || !server.fetch) {
    throw new Error('Server does not have a fetch method')
  }

  // Create HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      // Construct URL
      const protocol = req.headers['x-forwarded-proto'] || 'http'
      const host = req.headers['host'] || 'localhost'
      const url = `${protocol}://${host}${req.url}`

      // Build request headers (remove host to avoid conflicts)
      const headers = { ...req.headers }
      delete headers['host']

      // Build fetch request
      let body = null
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        const chunks = []
        for await (const chunk of req) {
          chunks.push(chunk)
        }
        body = Buffer.concat(chunks).toString()
      }

      const fetchRequest = new Request(url, {
        method: req.method,
        headers,
        body,
      })

      console.log(`${req.method} ${req.url}`)

      // Call the server handler
      const response = await server.fetch(fetchRequest)

      // Write response
      res.writeHead(response.status, Object.fromEntries(response.headers.entries()))

      // Send body
      if (response.body) {
        res.write(await response.text())
      }

      res.end()
    } catch (error) {
      console.error('Request error:', error)
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end(`Error: ${error.message}`)
    }
  })

  const port = parseInt(process.env.PORT || '3000', 10)
  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`✓ Server listening on http://0.0.0.0:${port}`)
  })

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received')
    httpServer.close(() => {
      process.exit(0)
    })
  })
}).catch((error) => {
  console.error('Failed to import server:', error)
  process.exit(1)
})