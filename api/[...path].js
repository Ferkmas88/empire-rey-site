import { handleApiRequest } from '../server/api.js'

export default async function handler(request, response) {
  const handled = await handleApiRequest(request, response)

  if (!handled) {
    response.statusCode = 404
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.end(JSON.stringify({ error: 'Ruta no encontrada.' }))
  }
}
