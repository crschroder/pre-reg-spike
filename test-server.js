import { createServer } from 'http'

const server = createServer((req, res) => {
  console.log('Request received!')
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Hello World')
})

const port = 8080
server.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`)
})