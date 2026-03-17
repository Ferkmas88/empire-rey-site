import { Buffer } from 'node:buffer'
import { existsSync } from 'node:fs'
import { copyFile, mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getAdminPassword, getSupabaseUrl } from './env.js'
import {
  createAppointmentSupabase,
  createSubscriberSupabase,
  getSupabaseHealth,
  isSupabaseEnabled,
  listAppointmentsSupabase,
  listCarsSupabase,
  listLeadsSupabase,
  listSubscribersSupabase,
  updateAppointmentStatusSupabase,
  updateCarStatusSupabase,
  uploadCarImagesSupabase,
  upsertCarSupabase,
} from './supabase-store.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(__dirname, 'data')
const backupDir = resolve(dataDir, 'backups')
const publicDir = resolve(__dirname, '..', 'public')
const uploadsDir = resolve(publicDir, 'uploads', 'cars')
const seedFile = resolve(dataDir, 'seed.json')
const dbFile = resolve(dataDir, 'db.json')
const appointmentStatuses = new Set(['pending', 'confirmed', 'done', 'cancelled'])
const carStatuses = new Set(['available', 'hidden', 'sold'])
const phonePattern = /^[0-9+()\-.\s]{7,20}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const maxBackups = 15
const allowedImageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

let writeQueue = Promise.resolve()

export async function ensureDatabase() {
  await mkdir(dataDir, { recursive: true })
  await mkdir(backupDir, { recursive: true })
  await mkdir(uploadsDir, { recursive: true })
  if (!existsSync(dbFile)) {
    await copyFile(seedFile, dbFile)
  }
}

async function readDatabase() {
  await ensureDatabase()
  const contents = await readFile(dbFile, 'utf8')
  return JSON.parse(contents)
}

async function writeDatabase(data) {
  await ensureDatabase()
  writeQueue = writeQueue.then(async () => {
    const payload = `${JSON.stringify(data, null, 2)}\n`
    await writeFile(dbFile, payload, 'utf8')
    await writeBackupSnapshot(payload)
  })
  return writeQueue
}

async function writeBackupSnapshot(payload) {
  const timestamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')
  const fileName = `db-${timestamp}.json`

  await writeFile(resolve(backupDir, fileName), payload, 'utf8')

  const backups = (await readdir(backupDir))
    .filter((file) => file.startsWith('db-') && file.endsWith('.json'))
    .sort()

  const overflow = backups.slice(0, Math.max(0, backups.length - maxBackups))
  await Promise.all(overflow.map((file) => unlink(resolve(backupDir, file))))
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(payload))
}

function sendNoContent(response) {
  response.statusCode = 204
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
  response.end()
}

function getAdminHeader(request) {
  const value = request.headers['x-admin-key']
  return Array.isArray(value) ? String(value[0] || '').trim() : String(value || '').trim()
}

function requireAdmin(request, response) {
  const adminPassword = getAdminPassword()

  if (!adminPassword) {
    sendJson(response, 503, {
      error: 'Admin no configurado. Define ADMIN_PASSWORD en .env.local para habilitar el panel.',
    })
    return false
  }

  if (getAdminHeader(request) !== adminPassword) {
    sendJson(response, 401, { error: 'Acceso de admin no autorizado.' })
    return false
  }

  return true
}

async function readBody(request) {
  const chunks = []
  for await (const chunk of request) {
    chunks.push(chunk)
  }

  if (!chunks.length) return {}

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new Error('JSON invalido.')
  }
}

function normalizeText(value) {
  return String(value || '').trim()
}

function isValidEmail(value) {
  return emailPattern.test(normalizeText(value))
}

function isValidPhone(value) {
  return phonePattern.test(normalizeText(value))
}

function isValidDate(value) {
  if (!value) return true
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00`)
  return !Number.isNaN(parsed.getTime())
}

function slugify(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function sanitizeFileStem(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'car-image'
}

function extensionFromMimeType(mimeType) {
  if (mimeType === 'image/png') return '.png'
  if (mimeType === 'image/webp') return '.webp'
  if (mimeType === 'image/gif') return '.gif'
  return '.jpg'
}

function toMoney(value, fallback = '$0') {
  if (typeof value === 'string' && value.trim().startsWith('$')) return value.trim()
  const number = Number(String(value || '').replace(/[^0-9.-]/g, ''))
  if (Number.isNaN(number) || number <= 0) return fallback
  return number.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function toMileage(value, fallback = '0 mi') {
  if (typeof value === 'string' && /mi/i.test(value)) return value.trim()
  const number = Number(String(value || '').replace(/[^0-9.-]/g, ''))
  if (Number.isNaN(number) || number < 0) return fallback
  return `${number.toLocaleString('en-US')} mi`
}

function summarizeCar(title, body, year) {
  const parts = [year, body, title].filter(Boolean)
  return `Pregunta por esta opcion: ${parts.join(' ')}.`
}

function normalizeCarPayload(payload, current, meta) {
  const title = normalizeText(payload.title || current?.title)
  if (!title) {
    throw new Error('El titulo del carro es obligatorio.')
  }

  if (title.length < 3) {
    throw new Error('El titulo del carro debe tener al menos 3 caracteres.')
  }

  const gallery = Array.isArray(payload.images)
    ? payload.images.map(normalizeText).filter(Boolean)
    : current?.gallery || []

  const price = toMoney(payload.price ?? current?.price, current?.price || '$0')
  const mileage = toMileage(payload.mileage ?? current?.mileage, current?.mileage || '0 mi')
  const body = normalizeText(payload.body_type || payload.body || current?.body)
  const year = normalizeText(payload.year || current?.year)
  const make = normalizeText(payload.make || current?.make)
  const model = normalizeText(payload.model || current?.model)
  const weeklyPayment = normalizeText(payload.weekly_payment || payload.payment || current?.weekly_payment || current?.payment) || 'Consulta pagos'

  return {
    id: current?.id || meta.nextCarId++,
    slug: normalizeText(payload.slug || current?.slug) || slugify(title),
    title,
    badge: normalizeText(payload.badge || current?.badge) || (payload.featured ? 'Destacado' : 'Disponible'),
    price,
    mileage,
    payment: weeklyPayment,
    weekly_payment: weeklyPayment,
    year,
    make,
    model,
    body,
    transmission: normalizeText(payload.transmission || current?.transmission),
    fuel: normalizeText(payload.fuel_type || payload.fuel || current?.fuel),
    color: normalizeText(payload.color || current?.color),
    drivetrain: normalizeText(payload.drivetrain || current?.drivetrain),
    vin: normalizeText(payload.vin || current?.vin),
    stock: normalizeText(payload.stock || current?.stock) || 'Disponible ahora',
    summary: normalizeText(payload.summary || current?.summary) || summarizeCar(title, body, year),
    description: normalizeText(payload.description || current?.description),
    image: gallery[0] || current?.image || '/favicon.png',
    gallery: gallery.length ? gallery : current?.gallery || [current?.image || '/favicon.png'],
    status: carStatuses.has(payload.status) ? payload.status : current?.status || 'available',
    featured: Boolean(payload.featured),
    created_at: current?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

function sortByCreatedDesc(items) {
  return [...items].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
}

function withAppointmentRelations(db) {
  const leadsById = new Map(db.leads.map((lead) => [lead.id, lead]))
  const carsById = new Map(db.cars.map((car) => [car.id, car]))

  return sortByCreatedDesc(db.appointments).map((appointment) => ({
    ...appointment,
    leads: leadsById.get(appointment.lead_id) || null,
    cars: appointment.car_id ? carsById.get(appointment.car_id) || null : null,
  }))
}

async function handleGetCars(response) {
  if (isSupabaseEnabled()) {
    const cars = await listCarsSupabase()
    sendJson(response, 200, cars)
    return
  }

  const db = await readDatabase()
  sendJson(response, 200, sortByCreatedDesc(db.cars))
}

async function handleUploadCarImages(request, response) {
  const payload = await readBody(request)
  const files = Array.isArray(payload.files) ? payload.files : []

  if (!files.length) {
    sendJson(response, 400, { error: 'Debes enviar al menos una imagen.' })
    return
  }

  if (isSupabaseEnabled()) {
    const result = await uploadCarImagesSupabase(files)
    sendJson(response, 201, result)
    return
  }

  const savedFiles = []

  for (const file of files) {
    const mimeType = normalizeText(file.type).toLowerCase()
    if (!allowedImageMimeTypes.has(mimeType)) {
      sendJson(response, 400, { error: 'Tipo de imagen no soportado. Usa JPG, PNG, WEBP o GIF.' })
      return
    }

    const base64Data = String(file.data || '')
    const fileBuffer = Buffer.from(base64Data, 'base64')

    if (!fileBuffer.length) {
      sendJson(response, 400, { error: 'Una de las imagenes esta vacia.' })
      return
    }

    if (fileBuffer.length > 8 * 1024 * 1024) {
      sendJson(response, 400, { error: 'Cada imagen debe pesar menos de 8 MB.' })
      return
    }

    const originalName = normalizeText(file.name)
    const parsedExtension = extname(originalName).toLowerCase()
    const safeExtension = parsedExtension || extensionFromMimeType(mimeType)
    const safeStem = sanitizeFileStem(originalName.replace(parsedExtension, ''))
    const fileName = `${safeStem}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${safeExtension}`
    const targetPath = resolve(uploadsDir, fileName)

    await writeFile(targetPath, fileBuffer)
    savedFiles.push(`/uploads/cars/${fileName}`)
  }

  sendJson(response, 201, { files: savedFiles })
}

async function handleUpsertCar(request, response) {
  const payload = await readBody(request)

  if (isSupabaseEnabled()) {
    const result = await upsertCarSupabase(payload)
    sendJson(response, payload.id ? 200 : 201, result)
    return
  }

  const db = await readDatabase()
  const current = db.cars.find((car) => car.id === Number(payload.id)) || null
  const normalized = normalizeCarPayload(payload, current, db.meta)

  if (current) {
    db.cars = db.cars.map((car) => (car.id === current.id ? { ...current, ...normalized } : car))
  } else {
    db.cars.unshift(normalized)
  }

  await writeDatabase(db)
  sendJson(response, current ? 200 : 201, normalized)
}

async function handleDeleteCar(response, id) {
  if (isSupabaseEnabled()) {
    sendJson(response, 501, { error: 'Eliminar carro no soportado en modo Supabase.' })
    return
  }

  const db = await readDatabase()
  const index = db.cars.findIndex((car) => car.id === id)

  if (index === -1) {
    sendJson(response, 404, { error: 'Carro no encontrado.' })
    return
  }

  db.cars.splice(index, 1)
  await writeDatabase(db)
  sendJson(response, 200, { success: true })
}

async function handleCarStatus(request, response, id) {
  const payload = await readBody(request)

  if (isSupabaseEnabled()) {
    const result = await updateCarStatusSupabase(id, payload.status)
    sendJson(response, 200, result)
    return
  }

  if (!carStatuses.has(payload.status)) {
    sendJson(response, 400, { error: 'Estado de carro invalido.' })
    return
  }

  const db = await readDatabase()
  const current = db.cars.find((car) => car.id === id)

  if (!current) {
    sendJson(response, 404, { error: 'Carro no encontrado.' })
    return
  }

  current.status = payload.status
  current.updated_at = new Date().toISOString()
  await writeDatabase(db)
  sendJson(response, 200, current)
}

async function handleGetLeads(response) {
  if (isSupabaseEnabled()) {
    const leads = await listLeadsSupabase()
    sendJson(response, 200, leads)
    return
  }

  const db = await readDatabase()
  sendJson(response, 200, sortByCreatedDesc(db.leads))
}

async function handleCreateAppointment(request, response) {
  const payload = await readBody(request)

  if (isSupabaseEnabled()) {
    const result = await createAppointmentSupabase(payload)
    sendJson(response, 201, result)
    return
  }

  const name = normalizeText(payload.name)
  const phone = normalizeText(payload.phone)
  const email = normalizeText(payload.email)
  const source = normalizeText(payload.source) || 'autos'
  const preferredDate = normalizeText(payload.preferred_date)

  if (!name) {
    sendJson(response, 400, { error: 'El nombre es obligatorio.' })
    return
  }

  if (!phone && !email) {
    sendJson(response, 400, { error: 'Necesitas telefono o email.' })
    return
  }

  if (phone && !isValidPhone(phone)) {
    sendJson(response, 400, { error: 'Telefono invalido.' })
    return
  }

  if (email && !isValidEmail(email)) {
    sendJson(response, 400, { error: 'Email invalido.' })
    return
  }

  if (!isValidDate(preferredDate)) {
    sendJson(response, 400, { error: 'Fecha aproximada invalida.' })
    return
  }

  const db = await readDatabase()
  const carId = Number(payload.car_id)
  const relatedCar = Number.isNaN(carId) ? null : db.cars.find((car) => car.id === carId) || null
  const lead = {
    id: db.meta.nextLeadId++,
    name,
    phone,
    email,
    car_interest: normalizeText(payload.car_interest) || relatedCar?.title || '',
    car_id: relatedCar?.id || null,
    source,
    created_at: new Date().toISOString(),
  }
  const appointment = {
    id: db.meta.nextAppointmentId++,
    lead_id: lead.id,
    car_id: relatedCar?.id || null,
    preferred_date: preferredDate || null,
    source,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  db.leads.unshift(lead)
  db.appointments.unshift(appointment)
  await writeDatabase(db)

  sendJson(response, 201, {
    success: true,
    lead,
    appointment: {
      ...appointment,
      leads: lead,
      cars: relatedCar ? { id: relatedCar.id, title: relatedCar.title } : null,
    },
  })
}

async function handleGetAppointments(response) {
  if (isSupabaseEnabled()) {
    const appointments = await listAppointmentsSupabase()
    sendJson(response, 200, appointments)
    return
  }

  const db = await readDatabase()
  sendJson(response, 200, withAppointmentRelations(db))
}

async function handleAppointmentStatus(request, response, id) {
  const payload = await readBody(request)

  if (isSupabaseEnabled()) {
    const result = await updateAppointmentStatusSupabase(id, payload.status)
    sendJson(response, 200, result)
    return
  }

  if (!appointmentStatuses.has(payload.status)) {
    sendJson(response, 400, { error: 'Estado de cita invalido.' })
    return
  }

  const db = await readDatabase()
  const appointment = db.appointments.find((item) => item.id === id)

  if (!appointment) {
    sendJson(response, 404, { error: 'Cita no encontrada.' })
    return
  }

  appointment.status = payload.status
  appointment.updated_at = new Date().toISOString()
  await writeDatabase(db)
  sendJson(response, 200, appointment)
}

async function handleGetSubscribers(response) {
  if (isSupabaseEnabled()) {
    const subscribers = await listSubscribersSupabase()
    sendJson(response, 200, subscribers)
    return
  }

  const db = await readDatabase()
  sendJson(response, 200, sortByCreatedDesc(db.subscribers))
}

async function handleCreateSubscriber(request, response) {
  const payload = await readBody(request)

  if (isSupabaseEnabled()) {
    const result = await createSubscriberSupabase(payload)
    sendJson(response, result.duplicate ? 200 : 201, result)
    return
  }

  const name = normalizeText(payload.name)
  const email = normalizeText(payload.email).toLowerCase()
  const source = normalizeText(payload.source) || 'site'

  if (!name) {
    sendJson(response, 400, { error: 'El nombre es obligatorio.' })
    return
  }

  if (!email) {
    sendJson(response, 400, { error: 'El email es obligatorio.' })
    return
  }

  if (!isValidEmail(email)) {
    sendJson(response, 400, { error: 'El email no es valido.' })
    return
  }

  const db = await readDatabase()
  const existing = db.subscribers.find((item) => normalizeText(item.email).toLowerCase() === email)

  if (existing) {
    existing.name = name || existing.name
    existing.source = source || existing.source
    await writeDatabase(db)
    sendJson(response, 200, { success: true, subscriber: existing, duplicate: true })
    return
  }

  const subscriber = {
    id: db.meta.nextSubscriberId++,
    name,
    email,
    source,
    created_at: new Date().toISOString(),
  }

  db.subscribers.unshift(subscriber)
  await writeDatabase(db)
  sendJson(response, 201, { success: true, subscriber })
}

export async function handleApiRequest(request, response) {
  try {
    if (request.method === 'OPTIONS') {
      sendNoContent(response)
      return true
    }

    const url = new URL(request.url || '/', `http://${request.headers.host || '127.0.0.1'}`)
    const pathname = url.pathname

    if (request.method === 'GET' && pathname === '/api/health') {
      if (isSupabaseEnabled()) {
        const payload = await getSupabaseHealth()
        sendJson(response, 200, payload)
        return true
      }

      const db = await readDatabase()
      sendJson(response, 200, {
        ok: true,
        service: 'empire-rey-local-crm',
        storage: getSupabaseUrl() ? 'supabase-configured-pending-connection' : 'local-json',
        counts: {
          cars: db.cars.length,
          leads: db.leads.length,
          appointments: db.appointments.length,
          subscribers: db.subscribers.length,
        },
        timestamp: new Date().toISOString(),
      })
      return true
    }

    if (request.method === 'GET' && pathname === '/api/admin/session') {
      if (!requireAdmin(request, response)) return true
      sendJson(response, 200, { authenticated: true })
      return true
    }

    if (request.method === 'GET' && pathname === '/api/cars') {
      await handleGetCars(response)
      return true
    }

    if (request.method === 'POST' && pathname === '/api/uploads/cars') {
      if (!requireAdmin(request, response)) return true
      await handleUploadCarImages(request, response)
      return true
    }

    if (request.method === 'POST' && pathname === '/api/cars') {
      if (!requireAdmin(request, response)) return true
      await handleUpsertCar(request, response)
      return true
    }

    const carStatusMatch = pathname.match(/^\/api\/cars\/(\d+)\/status$/)
    if (request.method === 'PATCH' && carStatusMatch) {
      if (!requireAdmin(request, response)) return true
      await handleCarStatus(request, response, Number(carStatusMatch[1]))
      return true
    }

    const carDeleteMatch = pathname.match(/^\/api\/cars\/(\d+)$/)
    if (request.method === 'DELETE' && carDeleteMatch) {
      if (!requireAdmin(request, response)) return true
      await handleDeleteCar(response, Number(carDeleteMatch[1]))
      return true
    }

    if (request.method === 'GET' && pathname === '/api/leads') {
      if (!requireAdmin(request, response)) return true
      await handleGetLeads(response)
      return true
    }

    if (request.method === 'POST' && pathname === '/api/appointment') {
      await handleCreateAppointment(request, response)
      return true
    }

    if (request.method === 'GET' && pathname === '/api/appointments') {
      if (!requireAdmin(request, response)) return true
      await handleGetAppointments(response)
      return true
    }

    const appointmentStatusMatch = pathname.match(/^\/api\/appointments\/(\d+)\/status$/)
    if (request.method === 'PATCH' && appointmentStatusMatch) {
      if (!requireAdmin(request, response)) return true
      await handleAppointmentStatus(request, response, Number(appointmentStatusMatch[1]))
      return true
    }

    if (request.method === 'POST' && pathname === '/api/subscribe') {
      await handleCreateSubscriber(request, response)
      return true
    }

    if (request.method === 'GET' && pathname === '/api/subscribers') {
      if (!requireAdmin(request, response)) return true
      await handleGetSubscribers(response)
      return true
    }

    return false
  } catch (error) {
    sendJson(response, 500, { error: error.message || 'Error interno del servidor.' })
    return true
  }
}
