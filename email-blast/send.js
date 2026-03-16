// Empire Rey — Email blast de carros nuevos
// Ejecutar: node send.js
// Requiere: npm install resend @supabase/supabase-js

import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const RESEND_API_KEY   = 'REDACTED_RESEND_KEY'
const SUPABASE_URL     = 'https://wqblkchdviysetlkjago.supabase.co'
const SUPABASE_KEY     = 'REDACTED_SUPABASE_SERVICE_KEY'
const FROM_EMAIL       = 'Empire Rey <noreply@empireautorey.com>'
const SITE_URL         = 'https://empireautorey.com'

const resend   = new Resend(RESEND_API_KEY)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── Data ─────────────────────────────────────────────────────────────────────

async function getSubscribers() {
  const { data, error } = await supabase
    .from('subscribers')
    .select('name, email')
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Supabase subscribers: ${error.message}`)
  return data || []
}

async function getCars() {
  const { data, error } = await supabase
    .from('cars')
    .select('slug, title, badge, price, mileage, year, transmission, image, payment')
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(6)
  if (error) throw new Error(`Supabase cars: ${error.message}`)
  return data || []
}

// ── Email HTML ───────────────────────────────────────────────────────────────

function buildCarCard(car) {
  const img = car.image || ''
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border:1px solid #222;border-radius:10px;overflow:hidden;background:#111;">
      <tr>
        ${img ? `<td width="160" style="padding:0;vertical-align:top;">
          <img src="${img}" alt="${car.title}" width="160" style="display:block;width:160px;height:130px;object-fit:cover;" />
        </td>` : ''}
        <td style="padding:14px 16px;vertical-align:top;">
          <p style="margin:0 0 3px;font-size:11px;color:#d4af37;text-transform:uppercase;letter-spacing:.08em;">${car.badge || 'Disponible'}</p>
          <p style="margin:0 0 5px;font-size:16px;font-weight:700;color:#fff;">${car.title}</p>
          <p style="margin:0 0 8px;font-size:20px;font-weight:800;color:#d4af37;">${car.price}</p>
          <p style="margin:0 0 10px;font-size:12px;color:#888;">${car.year} &nbsp;·&nbsp; ${car.mileage} &nbsp;·&nbsp; ${car.transmission}</p>
          <a href="${SITE_URL}/autos/detalle/?car=${car.slug}" style="display:inline-block;background:#d4af37;color:#000;font-weight:700;font-size:12px;padding:7px 16px;border-radius:999px;text-decoration:none;">Ver detalles</a>
        </td>
      </tr>
    </table>
  `
}

function buildEmail(cars, name) {
  const greeting = name && name.length > 1 ? `Hola ${name},` : 'Hola,'
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050505;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <tr><td style="background:#111;border-radius:12px 12px 0 0;padding:24px 32px;text-align:center;border-bottom:2px solid #d4af37;">
          <p style="margin:0;font-size:22px;font-weight:800;color:#d4af37;">Empire Rey</p>
          <p style="margin:4px 0 0;font-size:12px;color:#888;">Sales & Mechanic · Louisville, KY</p>
        </td></tr>

        <tr><td style="background:#0a0a0a;padding:28px 32px;">
          <p style="margin:0 0 4px;font-size:14px;color:#ccc;">${greeting}</p>
          <h1 style="margin:0 0 6px;font-size:20px;color:#fff;">Carros nuevos en la tienda</h1>
          <p style="margin:0 0 24px;font-size:13px;color:#888;">Estos son los ultimos carros disponibles. Agendamos tu cita en minutos por WhatsApp.</p>

          ${cars.map(buildCarCard).join('')}

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
            <tr>
              <td align="center" style="padding-bottom:12px;">
                <a href="${SITE_URL}/autos/" style="display:inline-block;background:#d4af37;color:#000;font-weight:800;font-size:14px;padding:12px 32px;border-radius:999px;text-decoration:none;margin-right:8px;">Ver toda la tienda</a>
                <a href="https://wa.me/15025768116" style="display:inline-block;background:#25D366;color:#fff;font-weight:800;font-size:14px;padding:12px 32px;border-radius:999px;text-decoration:none;">WhatsApp</a>
              </td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="background:#111;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;border-top:1px solid #1a1a1a;">
          <p style="margin:0 0 4px;font-size:12px;color:#555;">3510 Dixie Hwy, Louisville, KY 40216</p>
          <p style="margin:0 0 4px;font-size:12px;color:#555;">(502) 576-8116 · (502) 780-1096</p>
          <p style="margin:0;font-size:11px;color:#333;">Recibiste este email porque te suscribiste en empireautorey.com</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Conectando a Supabase...')
  const [subscribers, cars] = await Promise.all([getSubscribers(), getCars()])

  console.log(`Subscribers: ${subscribers.length}`)
  console.log(`Autos disponibles: ${cars.length}`)

  if (!cars.length) { console.log('No hay autos para enviar.'); return }
  if (!subscribers.length) { console.log('No hay subscribers.'); return }

  let sent = 0, failed = 0

  for (const sub of subscribers) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: sub.email,
        subject: '🚗 Carros nuevos en Empire Rey — Louisville KY',
        html: buildEmail(cars, sub.name),
      })
      console.log(`✓ ${sub.email}`)
      sent++
    } catch (err) {
      console.error(`✗ ${sub.email}: ${err.message}`)
      failed++
    }
  }

  console.log(`\nListo. Enviados: ${sent} | Fallidos: ${failed}`)
}

main().catch((err) => { console.error('Error fatal:', err.message); process.exit(1) })
