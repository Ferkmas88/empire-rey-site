import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')
const envFiles = ['.env.local', '.env']

let cachedValues = null

function parseEnv(contents) {
  return contents.split(/\r?\n/).reduce((values, line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return values

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex < 0) return values

    const key = trimmed.slice(0, separatorIndex).trim()
    let value = trimmed.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (key) values[key] = value
    return values
  }, {})
}

function loadLocalEnv() {
  if (cachedValues) return cachedValues

  cachedValues = {}
  envFiles.forEach((fileName) => {
    const filePath = resolve(projectRoot, fileName)
    if (!existsSync(filePath)) return

    Object.assign(cachedValues, parseEnv(readFileSync(filePath, 'utf8')))
  })

  return cachedValues
}

export function getEnvValue(name) {
  return String(process.env[name] || loadLocalEnv()[name] || '')
}

export function getAdminPassword() {
  return getEnvValue('ADMIN_PASSWORD').trim()
}

export function getSupabaseUrl() {
  return getEnvValue('SUPABASE_URL').trim()
}

export function getSupabaseAnonKey() {
  return getEnvValue('SUPABASE_ANON_KEY').trim()
}

export function getSupabaseServiceRoleKey() {
  return getEnvValue('SUPABASE_SERVICE_ROLE_KEY').trim()
}
