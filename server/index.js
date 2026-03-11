import { createServer } from 'node:http'
import process from 'node:process'
import { ensureDatabase, handleApiRequest } from './api.js'

const port = Number(process.env.PORT || 8787)
const server = createServer(async (request, response) => {
  const handled = await handleApiRequest(request, response)
  if (!handled) {
    response.statusCode = 404
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.end(JSON.stringify({ error: 'Ruta no encontrada.' }))
  }
})

async function startServer() {
  await ensureDatabase()

  server.listen(port, () => {
    console.log(`Local CRM server listening on http://127.0.0.1:${port}`)
  })
}

startServer().catch((error) => {
  console.error(error)
  process.exit(1)
})
