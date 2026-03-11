import { Buffer } from 'node:buffer'
import { createClient } from '@supabase/supabase-js'
import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from './env.js'

const appointmentStatuses = new Set(['pending', 'confirmed', 'done', 'cancelled'])
const carStatuses = new Set(['available', 'hidden', 'sold'])
const phonePattern = /^[0-9+()\-.\s]{7,20}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const allowedImageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const storageBucket = 'car-images'

let cachedAdminClient = null

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

function isConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey())
}

function getSupabaseClient() {
  if (!isConfigured()) {
    throw new Error('Supabase no esta configurado.')
  }

  if (!cachedAdminClient) {
    cachedAdminClient = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return cachedAdminClient
}

function getSupabasePublicConfig() {
  return {
    url: getSupabaseUrl(),
    anonKey: getSupabaseAnonKey(),
  }
}

function ensureNoSupabaseError(error, fallbackMessage) {
  if (error) throw new Error(error.message || fallbackMessage)
}

async function ensureStorageBucket() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.storage.getBucket(storageBucket)

  if (!error && data) return

  const { error: createError } = await supabase.storage.createBucket(storageBucket, {
    public: true,
    allowedMimeTypes: Array.from(allowedImageMimeTypes),
    fileSizeLimit: '8MB',
  })

  if (createError && !/already exists/i.test(createError.message || '')) {
    throw new Error(createError.message || 'No se pudo preparar el bucket de imagenes.')
  }
}

function normalizeCarPayload(payload, current, gallery) {
  const title = normalizeText(payload.title || current?.title)
  if (!title) throw new Error('El titulo del carro es obligatorio.')
  if (title.length < 3) throw new Error('El titulo del carro debe tener al menos 3 caracteres.')

  const year = normalizeText(payload.year || current?.year)
  const make = normalizeText(payload.make || current?.make)
  const model = normalizeText(payload.model || current?.model)
  const body = normalizeText(payload.body_type || payload.body || current?.body) || 'Auto'
  const weeklyPayment =
    normalizeText(payload.weekly_payment || payload.payment || current?.weekly_payment || current?.payment) ||
    'Consulta pagos'

  return {
    slug: normalizeText(payload.slug || current?.slug) || slugify(title),
    title,
    badge:
      normalizeText(payload.badge || current?.badge) ||
      (payload.featured || current?.featured ? 'Destacado' : 'Disponible'),
    price: toMoney(payload.price ?? current?.price, current?.price || '$0'),
    payment: weeklyPayment,
    weekly_payment: weeklyPayment,
    mileage: toMileage(payload.mileage ?? current?.mileage, current?.mileage || '0 mi'),
    year,
    make,
    model,
    body,
    transmission: normalizeText(payload.transmission || current?.transmission) || 'Automatica',
    fuel: normalizeText(payload.fuel_type || payload.fuel || current?.fuel) || 'Gasolina',
    color: normalizeText(payload.color || current?.color) || 'No definido',
    drivetrain: normalizeText(payload.drivetrain || current?.drivetrain) || 'No definido',
    vin: normalizeText(payload.vin || current?.vin),
    stock:
      normalizeText(payload.stock || current?.stock) ||
      (payload.status === 'sold' ? 'Vendido' : 'Disponible ahora'),
    summary:
      normalizeText(payload.summary || current?.summary) || summarizeCar(title, body, year),
    description:
      normalizeText(payload.description || current?.description) ||
      summarizeCar(title, body, year),
    image: gallery[0] || current?.image || '/favicon.png',
    status: carStatuses.has(payload.status) ? payload.status : current?.status || 'available',
    featured: Boolean(payload.featured),
    updated_at: new Date().toISOString(),
  }
}

function mapCarRow(row, imageRows) {
  const gallery = imageRows.length
    ? imageRows.map((item) => item.image_url).filter(Boolean)
    : [row.image || '/favicon.png']
  const payment = row.weekly_payment || row.payment || 'Consulta pagos'

  return {
    id: row.id,
    slug: row.slug || slugify(row.title),
    title: row.title,
    badge: row.badge || (row.featured ? 'Destacado' : 'Disponible'),
    price: row.price || '$0',
    payment,
    weekly_payment: payment,
    mileage: row.mileage || '0 mi',
    year: row.year || '',
    make: row.make || '',
    model: row.model || '',
    body: row.body || 'Auto',
    transmission: row.transmission || 'Automatica',
    fuel: row.fuel || 'Gasolina',
    color: row.color || 'No definido',
    drivetrain: row.drivetrain || 'No definido',
    vin: row.vin || '',
    stock: row.stock || (row.status === 'sold' ? 'Vendido' : 'Disponible ahora'),
    summary: row.summary || summarizeCar(row.title, row.body || 'Auto', row.year),
    description: row.description || summarizeCar(row.title, row.body || 'Auto', row.year),
    image: row.image || gallery[0] || '/favicon.png',
    gallery,
    status: row.status || 'available',
    featured: Boolean(row.featured),
    created_at: row.created_at,
    updated_at: row.updated_at || row.created_at,
  }
}

async function getCarImagesByCarIds(carIds) {
  if (!carIds.length) return new Map()

  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('car_images')
    .select('id, car_id, image_url, sort_order')
    .in('car_id', carIds)
    .order('sort_order', { ascending: true })

  ensureNoSupabaseError(error, 'No se pudieron cargar las imagenes de carros.')

  return data.reduce((map, image) => {
    const current = map.get(image.car_id) || []
    current.push(image)
    map.set(image.car_id, current)
    return map
  }, new Map())
}

async function getSupabaseCarById(id) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  ensureNoSupabaseError(error, 'No se pudo cargar el carro.')
  if (!data) return null

  const imagesByCar = await getCarImagesByCarIds([data.id])
  return mapCarRow(data, imagesByCar.get(data.id) || [])
}

async function replaceCarImages(carId, images) {
  const supabase = getSupabaseClient()
  const { error: deleteError } = await supabase.from('car_images').delete().eq('car_id', carId)
  ensureNoSupabaseError(deleteError, 'No se pudieron reemplazar las imagenes del carro.')

  if (!images.length) return

  const rows = images.map((imageUrl, index) => ({
    car_id: carId,
    image_url: imageUrl,
    sort_order: index,
  }))

  const { error: insertError } = await supabase.from('car_images').insert(rows)
  ensureNoSupabaseError(insertError, 'No se pudieron guardar las imagenes del carro.')
}

export function isSupabaseEnabled() {
  return isConfigured()
}

export async function getSupabaseHealth() {
  const supabase = getSupabaseClient()

  const [cars, leads, appointments, subscribers] = await Promise.all([
    supabase.from('cars').select('id', { count: 'exact' }).limit(1),
    supabase.from('leads').select('id', { count: 'exact' }).limit(1),
    supabase.from('appointments').select('id', { count: 'exact' }).limit(1),
    supabase.from('subscribers').select('id', { count: 'exact' }).limit(1),
  ])

  const errors = [cars.error, leads.error, appointments.error, subscribers.error].filter(Boolean)
  if (errors.length) {
    throw new Error(errors[0].message || 'Supabase respondio con error.')
  }

  return {
    ok: true,
    service: 'empire-rey-supabase-crm',
    storage: 'supabase',
    counts: {
      cars: cars.count || 0,
      leads: leads.count || 0,
      appointments: appointments.count || 0,
      subscribers: subscribers.count || 0,
    },
    projectUrl: getSupabasePublicConfig().url,
    timestamp: new Date().toISOString(),
  }
}

export async function listCarsSupabase() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .order('created_at', { ascending: false })

  ensureNoSupabaseError(error, 'No se pudieron cargar los carros.')

  const imagesByCar = await getCarImagesByCarIds((data || []).map((car) => car.id))
  return (data || []).map((row) => mapCarRow(row, imagesByCar.get(row.id) || []))
}

export async function uploadCarImagesSupabase(files) {
  const supabase = getSupabaseClient()
  await ensureStorageBucket()

  const savedFiles = []
  for (const file of files) {
    const mimeType = normalizeText(file.type).toLowerCase()
    if (!allowedImageMimeTypes.has(mimeType)) {
      throw new Error('Tipo de imagen no soportado. Usa JPG, PNG, WEBP o GIF.')
    }

    const base64Data = String(file.data || '')
    const fileBuffer = Buffer.from(base64Data, 'base64')

    if (!fileBuffer.length) throw new Error('Una de las imagenes esta vacia.')
    if (fileBuffer.length > 8 * 1024 * 1024) {
      throw new Error('Cada imagen debe pesar menos de 8 MB.')
    }

    const originalName = normalizeText(file.name)
    const extension = extensionFromMimeType(mimeType)
    const safeStem = sanitizeFileStem(originalName.replace(/\.[^.]+$/, ''))
    const filePath = `cars/${safeStem}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`

    const { error } = await supabase.storage.from(storageBucket).upload(filePath, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    })

    ensureNoSupabaseError(error, 'No se pudo subir una de las imagenes.')

    const { data } = supabase.storage.from(storageBucket).getPublicUrl(filePath)
    savedFiles.push(data.publicUrl)
  }

  return { files: savedFiles }
}

export async function upsertCarSupabase(payload) {
  const supabase = getSupabaseClient()
  const current = payload.id ? await getSupabaseCarById(Number(payload.id)) : null
  const requestedGallery = Array.isArray(payload.images) ? payload.images.map(normalizeText).filter(Boolean) : []
  const gallery = requestedGallery.length ? requestedGallery : current?.gallery || []
  const normalized = normalizeCarPayload(payload, current, gallery)

  if (current) {
    const { data, error } = await supabase
      .from('cars')
      .update(normalized)
      .eq('id', current.id)
      .select('*')
      .single()

    ensureNoSupabaseError(error, 'No se pudo actualizar el carro.')
    await replaceCarImages(current.id, gallery)
    const imagesByCar = await getCarImagesByCarIds([current.id])
    return mapCarRow(data, imagesByCar.get(current.id) || [])
  }

  const { data, error } = await supabase
    .from('cars')
    .insert({
      ...normalized,
      created_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  ensureNoSupabaseError(error, 'No se pudo crear el carro.')
  await replaceCarImages(data.id, gallery)
  const imagesByCar = await getCarImagesByCarIds([data.id])
  return mapCarRow(data, imagesByCar.get(data.id) || [])
}

export async function updateCarStatusSupabase(id, status) {
  if (!carStatuses.has(status)) {
    throw new Error('Estado de carro invalido.')
  }

  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('cars')
    .update({
      status,
      stock: status === 'sold' ? 'Vendido' : status === 'hidden' ? 'Oculto' : 'Disponible ahora',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .maybeSingle()

  ensureNoSupabaseError(error, 'No se pudo actualizar el estado del carro.')
  if (!data) throw new Error('Carro no encontrado.')
  return data
}

export async function listLeadsSupabase() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  ensureNoSupabaseError(error, 'No se pudieron cargar los leads.')
  return data || []
}

export async function createAppointmentSupabase(payload) {
  const name = normalizeText(payload.name)
  const phone = normalizeText(payload.phone)
  const email = normalizeText(payload.email).toLowerCase()
  const source = normalizeText(payload.source) || 'autos'
  const preferredDate = normalizeText(payload.preferred_date)

  if (!name) throw new Error('El nombre es obligatorio.')
  if (!phone && !email) throw new Error('Necesitas telefono o email.')
  if (phone && !isValidPhone(phone)) throw new Error('Telefono invalido.')
  if (email && !isValidEmail(email)) throw new Error('Email invalido.')
  if (!isValidDate(preferredDate)) throw new Error('Fecha aproximada invalida.')

  const supabase = getSupabaseClient()
  const carId = Number(payload.car_id)
  let relatedCar = null

  if (!Number.isNaN(carId) && carId > 0) {
    const { data, error } = await supabase.from('cars').select('id, title').eq('id', carId).maybeSingle()
    ensureNoSupabaseError(error, 'No se pudo validar el carro relacionado.')
    relatedCar = data || null
  }

  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .insert({
      name,
      phone,
      email,
      car_interest: normalizeText(payload.car_interest) || relatedCar?.title || '',
      car_id: relatedCar?.id || null,
      source,
      created_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  ensureNoSupabaseError(leadError, 'No se pudo crear el lead.')

  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .insert({
      lead_id: lead.id,
      car_id: relatedCar?.id || null,
      preferred_date: preferredDate || null,
      source,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  ensureNoSupabaseError(appointmentError, 'No se pudo crear la cita.')

  return {
    success: true,
    lead,
    appointment: {
      ...appointment,
      leads: lead,
      cars: relatedCar,
    },
  }
}

export async function listAppointmentsSupabase() {
  const supabase = getSupabaseClient()
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('*')
    .order('created_at', { ascending: false })

  ensureNoSupabaseError(error, 'No se pudieron cargar las citas.')

  const leadIds = [...new Set((appointments || []).map((item) => item.lead_id).filter(Boolean))]
  const carIds = [...new Set((appointments || []).map((item) => item.car_id).filter(Boolean))]

  let leadsById = new Map()
  let carsById = new Map()

  if (leadIds.length) {
    const { data, error: leadsError } = await supabase.from('leads').select('*').in('id', leadIds)
    ensureNoSupabaseError(leadsError, 'No se pudieron cargar los leads de citas.')
    leadsById = new Map((data || []).map((item) => [item.id, item]))
  }

  if (carIds.length) {
    const { data, error: carsError } = await supabase.from('cars').select('id, title, slug').in('id', carIds)
    ensureNoSupabaseError(carsError, 'No se pudieron cargar los carros de citas.')
    carsById = new Map((data || []).map((item) => [item.id, item]))
  }

  return (appointments || []).map((appointment) => ({
    ...appointment,
    leads: leadsById.get(appointment.lead_id) || null,
    cars: appointment.car_id ? carsById.get(appointment.car_id) || null : null,
  }))
}

export async function updateAppointmentStatusSupabase(id, status) {
  if (!appointmentStatuses.has(status)) {
    throw new Error('Estado de cita invalido.')
  }

  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('appointments')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .maybeSingle()

  ensureNoSupabaseError(error, 'No se pudo actualizar la cita.')
  if (!data) throw new Error('Cita no encontrada.')
  return data
}

export async function listSubscribersSupabase() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .order('created_at', { ascending: false })

  ensureNoSupabaseError(error, 'No se pudieron cargar los subscribers.')
  return data || []
}

export async function createSubscriberSupabase(payload) {
  const name = normalizeText(payload.name)
  const email = normalizeText(payload.email).toLowerCase()
  const source = normalizeText(payload.source) || 'site'

  if (!name) throw new Error('El nombre es obligatorio.')
  if (!email) throw new Error('El email es obligatorio.')
  if (!isValidEmail(email)) throw new Error('El email no es valido.')

  const supabase = getSupabaseClient()
  const { data: existing, error: existingError } = await supabase
    .from('subscribers')
    .select('*')
    .eq('email', email)
    .maybeSingle()

  ensureNoSupabaseError(existingError, 'No se pudo validar el subscriber.')

  if (existing) {
    const { data: updated, error: updateError } = await supabase
      .from('subscribers')
      .update({
        name: name || existing.name,
        source: source || existing.source,
      })
      .eq('id', existing.id)
      .select('*')
      .single()

    ensureNoSupabaseError(updateError, 'No se pudo actualizar el subscriber existente.')
    return { success: true, subscriber: updated, duplicate: true }
  }

  const { data: subscriber, error } = await supabase
    .from('subscribers')
    .insert({
      name,
      email,
      source,
      created_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  ensureNoSupabaseError(error, 'No se pudo crear el subscriber.')
  return { success: true, subscriber }
}
