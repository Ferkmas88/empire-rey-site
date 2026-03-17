import { cars as localCars } from '../autos/cars.js'
import { getAdminHeaders } from './admin-auth.js'

const API_BASE = import.meta.env.VITE_API_BASE || ''

async function requestJson(path, options = {}, fallback) {
  const { requiresAdmin = false, headers: customHeaders = {}, ...requestOptions } = options

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 2000)
    const response = await fetch(API_BASE + path, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(requiresAdmin ? getAdminHeaders() : {}),
        ...customHeaders,
      },
      ...requestOptions,
    })
    clearTimeout(timer)

    const contentType = response.headers.get('content-type') || ''
    const payload = contentType.includes('application/json') ? await response.json() : null

    if (!response.ok) {
      throw new Error(payload?.error || `Request failed: ${response.status}`)
    }

    return payload
  } catch (error) {
    if (fallback !== undefined) return fallback
    throw error
  }
}

export async function loadCars() {
  const data = await requestJson('/api/cars', {}, null)
  return Array.isArray(data) && data.length ? data : localCars
}

export async function createSubscriber(payload) {
  return requestJson('/api/subscribe', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function createAppointment(payload) {
  return requestJson('/api/appointment', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function listLeads() {
  return requestJson('/api/leads', { requiresAdmin: true }, [])
}

export async function listAppointments() {
  return requestJson('/api/appointments', { requiresAdmin: true }, [])
}

export async function listSubscribers() {
  return requestJson('/api/subscribers', { requiresAdmin: true }, [])
}

export async function listCarsAdmin() {
  return loadCars()
}

export async function upsertCar(payload) {
  return requestJson('/api/cars', {
    method: 'POST',
    requiresAdmin: true,
    body: JSON.stringify(payload),
  })
}

export async function uploadCarImages(files) {
  return requestJson('/api/uploads/cars', {
    method: 'POST',
    requiresAdmin: true,
    body: JSON.stringify({
      files,
    }),
  })
}

export async function updateCarStatus(id, status) {
  return requestJson(`/api/cars/${id}/status`, {
    method: 'PATCH',
    requiresAdmin: true,
    body: JSON.stringify({ status }),
  })
}

export async function deleteCar(id) {
  return requestJson(`/api/cars/${id}`, {
    method: 'DELETE',
    requiresAdmin: true,
  })
}

export async function updateAppointmentStatus(id, status) {
  return requestJson(`/api/appointments/${id}/status`, {
    method: 'PATCH',
    requiresAdmin: true,
    body: JSON.stringify({ status }),
  })
}

export async function verifyAdminSession() {
  return requestJson('/api/admin/session', { requiresAdmin: true })
}

export async function getDashboardSummary() {
  const [leads, appointments, subscribers, cars] = await Promise.all([
    listLeads(),
    listAppointments(),
    listSubscribers(),
    listCarsAdmin(),
  ])

  return {
    leads: leads.length,
    appointmentsPending: appointments.filter((item) => item.status === 'pending').length,
    subscribers: subscribers.length,
    carsActive: cars.filter((item) => item.status !== 'sold' && item.status !== 'hidden').length,
  }
}

export function exportSubscribersCsv(rows) {
  const header = ['name', 'email', 'source', 'created_at']
  const lines = rows.map((row) =>
    [row.name, row.email, row.source || '', row.created_at || '']
      .map((value) => `"${String(value || '').replaceAll('"', '""')}"`)
      .join(','),
  )

  return [header.join(','), ...lines].join('\n')
}
