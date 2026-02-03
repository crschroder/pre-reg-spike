import { createServer } from 'http'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { writeFileSync, appendFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const logFile = '/tmp/server.log'

function log(msg) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${msg}`)
  try {
    appendFileSync(logFile, `[${timestamp}] ${msg}\n`)
  } catch (e) {
    // ignore
  }
}

log('Starting server initialization...')

// Import the TanStack Start server handler
import(`file://${__dirname}/dist/server/server.js`).then(async (module) => {
  log('Server module loaded')
  
  const { default: server } = module

  if (!server || !server.fetch) {
    throw new Error('Server does not have a fetch method')
  }

  log('Server.fetch is available')

  // Create HTTP server
  const httpServer = createServer(async (req, res) => {
    log(`>>> Incoming ${req.method} ${req.url}`)
    
    try {
      const protocol = req.headers['x-forwarded-proto'] || 'http'
      const host = req.headers['host'] || 'localhost'
      const url = `${protocol}://${host}${req.url}`
      
      log(`URL: ${url}`)

      const headers = { ...req.headers }
      delete headers['host']

      let body = null
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        const chunks = []
        for await (const chunk of req) {
          chunks.push(chunk)
        }
        body = chunks.length > 0 ? Buffer.concat(chunks) : null
      }

      log('Creating fetch request')
      
      const fetchRequest = new Request(url, {
        method: req.method,
        headers,
        body,
      })

      log('Calling server.fetch')

      const response = await server.fetch(fetchRequest)

      log(`Got response with status ${response.status}`)

      const responseHeaders = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })
      
      res.writeHead(response.status, responseHeaders)

      if (response.body) {
        const reader = response.body.getReader()
        try {
          let totalBytes = 0
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            totalBytes += value.length
            res.write(Buffer.from(value))
          }
          log(`Sent ${totalBytes} bytes`)
        } catch (e) {
          log(`Error reading response body: ${e.message}`)
        }
      }

      res.end()
      log('Response ended')
    } catch (error) {
      log(`ERROR: ${error.message}`)
      log(`Stack: ${error.stack}`)
      try {
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end(`Error: ${error.message}`)
      } catch (e) {
        log(`Error sending error response: ${e.message}`)
      }
    }
  })

  const port = parseInt(process.env.PORT || '3000', 10)
  httpServer.listen(port, '0.0.0.0', () => {
    log(`Server listening on http://0.0.0.0:${port}`)
  })

  process.on('SIGTERM', () => {
    log('SIGTERM signal received')
    httpServer.close(() => {
      process.exit(0)
    })
  })
}).catch((error) => {
  log(`FATAL ERROR: ${error.message}`)
  log(`Stack: ${error.stack}`)
  process.exit(1)
})