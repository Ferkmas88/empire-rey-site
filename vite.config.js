import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { handleApiRequest } from './server/api.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function localCrmApiPlugin() {
  return {
    name: 'local-crm-api',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const pathOnly = (request.url || '').split('?')[0]
        const redirects = new Map([
          ['/autos', '/autos/'],
          ['/autos/detalle', '/autos/detalle/'],
          ['/admin', '/admin/index.html'],
          ['/admin/', '/admin/index.html'],
          ['/admin/cars', '/admin/cars/index.html'],
          ['/admin/cars/', '/admin/cars/index.html'],
          ['/admin/leads', '/admin/leads/index.html'],
          ['/admin/leads/', '/admin/leads/index.html'],
          ['/admin/appointments', '/admin/appointments/index.html'],
          ['/admin/appointments/', '/admin/appointments/index.html'],
          ['/admin/subscribers', '/admin/subscribers/index.html'],
          ['/admin/subscribers/', '/admin/subscribers/index.html'],
        ])

        if (redirects.has(pathOnly)) {
          response.statusCode = 302
          response.setHeader('Location', redirects.get(pathOnly))
          response.end()
          return
        }

        if (!request.url?.startsWith('/api')) {
          next()
          return
        }

        const handled = await handleApiRequest(request, response)
        if (!handled) next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localCrmApiPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        autos: resolve(__dirname, 'autos/index.html'),
        autosDetalle: resolve(__dirname, 'autos/detalle/index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        adminCars: resolve(__dirname, 'admin/cars/index.html'),
        adminLeads: resolve(__dirname, 'admin/leads/index.html'),
        adminAppointments: resolve(__dirname, 'admin/appointments/index.html'),
        adminSubscribers: resolve(__dirname, 'admin/subscribers/index.html'),
      },
    },
  },
})
