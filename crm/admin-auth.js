const ADMIN_STORAGE_KEY = 'empire-rey-admin-key'

export function getAdminKey() {
  return String(window.sessionStorage.getItem(ADMIN_STORAGE_KEY) || '')
}

export function setAdminKey(value) {
  const normalized = String(value || '').trim()
  if (!normalized) return
  window.sessionStorage.setItem(ADMIN_STORAGE_KEY, normalized)
}

export function clearAdminKey() {
  window.sessionStorage.removeItem(ADMIN_STORAGE_KEY)
}

export function getAdminHeaders() {
  const adminKey = getAdminKey()
  return adminKey ? { 'x-admin-key': adminKey } : {}
}
