import {
  exportSubscribersCsv,
  getDashboardSummary,
  listAppointments,
  listCarsAdmin,
  listLeads,
  listSubscribers,
  updateAppointmentStatus,
  updateCarStatus,
  uploadCarImages,
  upsertCar,
  verifyAdminSession,
} from '../crm/api.js'
import { clearAdminKey, getAdminKey, setAdminKey } from '../crm/admin-auth.js'
import { escapeHtml } from '../crm/sanitize.js'

const page = document.body.dataset.adminPage
const content = document.getElementById('adminContent')
const notice = document.getElementById('adminNotice')
const adminNav = document.querySelector('.admin-nav')

document.querySelectorAll('.admin-nav a').forEach((link) => {
  if (link.dataset.page === page) link.classList.add('is-active')
})

function setNotice(text) {
  if (notice) notice.textContent = text
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function downloadFile(filename, contents, type) {
  const blob = new Blob([contents], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function setPage(html) {
  content.innerHTML = html
}

function renderEmptyState(message) {
  return `<div class="admin-empty">${escapeHtml(message)}</div>`
}

function renderMetricStrip(items) {
  return `
    <section class="admin-metrics">
      ${items
        .map(
          (item) => `
            <article class="admin-metric">
              <strong>${escapeHtml(item.label)}</strong>
              <span>${escapeHtml(item.value)}</span>
            </article>
          `,
        )
        .join('')}
    </section>
  `
}

function normalizePhoneNumber(phone) {
  const digits = String(phone || '').replace(/\D+/g, '')
  if (!digits) return ''
  return digits.length === 10 ? `1${digits}` : digits
}

function renderContactActions(phone, email) {
  const normalizedPhone = normalizePhoneNumber(phone)
  const actions = []

  if (normalizedPhone) {
    actions.push(
      `<a class="admin-btn" href="tel:+${normalizedPhone}">Llamar</a>`,
      `<a class="admin-btn" href="https://wa.me/${normalizedPhone}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`,
    )
  }

  if (email) {
    actions.push(`<a class="admin-btn" href="mailto:${encodeURIComponent(email)}">Email</a>`)
  }

  return actions.length ? `<div class="admin-inline-actions">${actions.join('')}</div>` : '<span class="admin-muted">Sin contacto</span>'
}

function formatStatusLabel(status) {
  const labels = {
    available: 'Disponible',
    hidden: 'Oculto',
    sold: 'Vendido',
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    done: 'Completada',
    cancelled: 'Cancelada',
  }

  return labels[status] || status || '-'
}

function renderImagePreviewList(images) {
  if (!images.length) {
    return '<div class="admin-upload-preview__empty">No hay imagenes cargadas.</div>'
  }

  return images
    .map(
      (image) => `
        <figure class="admin-upload-preview__item">
          <img src="${escapeHtml(image)}" alt="Imagen del carro" />
        </figure>
      `,
    )
    .join('')
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || '')
      resolve(result.includes(',') ? result.split(',')[1] : result)
    }
    reader.onerror = () => reject(new Error(`No se pudo leer ${file.name}.`))
    reader.readAsDataURL(file)
  })
}

function mountLogoutButton() {
  if (!adminNav || document.getElementById('adminLogoutBtn')) return

  const button = document.createElement('button')
  button.id = 'adminLogoutBtn'
  button.type = 'button'
  button.className = 'admin-btn admin-btn--block'
  button.textContent = 'Cerrar panel'
  button.addEventListener('click', () => {
    clearAdminKey()
    setNotice('Sesion cerrada. Vuelve a entrar con tu clave de admin.')
    renderAdminGate()
  })

  adminNav.appendChild(button)
}

function renderAdminGate(message = '') {
  setNotice('')
  setPage(`
    <section class="admin-auth-card">
      <header class="admin-page-header">
        <div>
          <h1>Admin protegido</h1>
          <p>Ingresa la clave local del panel para ver leads, citas, subscribers y carros.</p>
        </div>
      </header>
      <form id="adminLoginForm" class="admin-form admin-auth-form">
        <label for="adminPassword">Clave de admin</label>
        <input id="adminPassword" name="adminPassword" type="password" autocomplete="current-password" required />
        <button class="admin-link-btn" type="submit">Entrar</button>
        <p class="admin-muted">La clave local vive en <code>.env.local</code> como <code>ADMIN_PASSWORD</code>.</p>
        ${message ? `<p class="form-status form-status--error">${escapeHtml(message)}</p>` : ''}
      </form>
    </section>
  `)

  const form = document.getElementById('adminLoginForm')
  const passwordInput = document.getElementById('adminPassword')
  passwordInput?.focus()

  form?.addEventListener('submit', async (event) => {
    event.preventDefault()
    setAdminKey(passwordInput?.value || '')

    try {
      await verifyAdminSession()
      setNotice('Panel local protegido y listo. Los cambios quedan guardados en esta maquina.')
      mountLogoutButton()
      await pageRunners[page]?.()
    } catch (error) {
      clearAdminKey()
      renderAdminGate(error.message || 'No se pudo validar la clave de admin.')
    }
  })
}

async function ensureAdminAccess() {
  if (!getAdminKey()) {
    renderAdminGate()
    return false
  }

  try {
    await verifyAdminSession()
    mountLogoutButton()
    setNotice('Panel local protegido y listo. Los cambios quedan guardados en esta maquina.')
    return true
  } catch (error) {
    clearAdminKey()
    renderAdminGate(error.message || 'No se pudo validar la clave de admin.')
    return false
  }
}

async function renderDashboardPage() {
  const summary = await getDashboardSummary()

  setPage(`
    <header class="admin-page-header">
      <div>
        <h1>Dashboard</h1>
        <p>Resumen rapido del CRM local de Empire Rey.</p>
      </div>
    </header>
    <section class="admin-stats">
      <article class="admin-stat"><strong>Leads</strong><span>${summary.leads}</span></article>
      <article class="admin-stat"><strong>Citas pendientes</strong><span>${summary.appointmentsPending}</span></article>
      <article class="admin-stat"><strong>Subscribers</strong><span>${summary.subscribers}</span></article>
      <article class="admin-stat"><strong>Carros activos</strong><span>${summary.carsActive}</span></article>
    </section>
  `)
}

async function renderLeadsPage() {
  const leads = await listLeads()
  const leadsWithCar = leads.filter((lead) => lead.car_interest).length
  const leadsWithPhone = leads.filter((lead) => lead.phone).length
  const leadsWithEmail = leads.filter((lead) => lead.email).length

  setPage(`
    <header class="admin-page-header">
      <div>
        <h1>Leads</h1>
        <p>Personas interesadas que dejaron sus datos para ver o apartar un carro.</p>
      </div>
    </header>
    ${renderMetricStrip([
      { label: 'Total', value: String(leads.length) },
      { label: 'Con auto', value: String(leadsWithCar) },
      { label: 'Con telefono', value: String(leadsWithPhone) },
      { label: 'Con email', value: String(leadsWithEmail) },
    ])}
    <section class="admin-card">
      <div class="admin-toolbar">
        <input id="leadSearch" type="search" placeholder="Buscar por nombre, email o auto" />
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Auto de interes</th>
              <th>Fuente</th>
              <th>Acciones</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody id="leadsTableBody"></tbody>
        </table>
      </div>
    </section>
  `)

  const tableBody = document.getElementById('leadsTableBody')
  const searchInput = document.getElementById('leadSearch')

  const paint = (rows) => {
    tableBody.innerHTML = rows.length
      ? rows
          .map(
            (lead) => `
              <tr>
                <td>
                  <strong>${escapeHtml(lead.name || 'Sin nombre')}</strong>
                  <div class="admin-row-meta">${escapeHtml(lead.phone || 'Sin telefono')}</div>
                  <div class="admin-row-meta">${escapeHtml(lead.email || 'Sin email')}</div>
                </td>
                <td>${escapeHtml(lead.car_interest || '-')}</td>
                <td>${escapeHtml(lead.source || '-')}</td>
                <td>${renderContactActions(lead.phone, lead.email)}</td>
                <td><span class="admin-row-date">${escapeHtml(formatDate(lead.created_at))}</span></td>
              </tr>
            `,
          )
          .join('')
      : `<tr><td colspan="5">${renderEmptyState('No hay leads todavia.')}</td></tr>`
  }

  paint(leads)
  searchInput?.addEventListener('input', () => {
    const term = searchInput.value.trim().toLowerCase()
    const filtered = leads.filter((lead) =>
      [lead.name, lead.email, lead.car_interest, lead.phone]
        .some((value) => String(value || '').toLowerCase().includes(term)),
    )
    paint(filtered)
  })
}

async function renderAppointmentsPage() {
  const appointments = await listAppointments()
  const pendingCount = appointments.filter((item) => item.status === 'pending').length
  const confirmedCount = appointments.filter((item) => item.status === 'confirmed').length
  const doneCount = appointments.filter((item) => item.status === 'done').length

  setPage(`
    <header class="admin-page-header">
      <div>
        <h1>Citas</h1>
        <p>Solicitudes de visita creadas desde inventario, detalle y formularios del sitio.</p>
      </div>
    </header>
    ${renderMetricStrip([
      { label: 'Total', value: String(appointments.length) },
      { label: 'Pendientes', value: String(pendingCount) },
      { label: 'Confirmadas', value: String(confirmedCount) },
      { label: 'Completadas', value: String(doneCount) },
    ])}
    <section class="admin-card">
      <div class="admin-toolbar">
        <input id="appointmentsSearch" type="search" placeholder="Buscar por nombre, telefono, email o carro" />
        <div class="admin-toolbar__actions">
          <select id="appointmentsStatusFilter">
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="confirmed">Confirmadas</option>
            <option value="done">Completadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Cita</th>
              <th>Estado</th>
              <th>Acciones</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody id="appointmentsTableBody"></tbody>
        </table>
      </div>
    </section>
  `)

  const tableBody = document.getElementById('appointmentsTableBody')
  const searchInput = document.getElementById('appointmentsSearch')
  const statusFilter = document.getElementById('appointmentsStatusFilter')

  const paint = (rows) => {
    tableBody.innerHTML = rows.length
      ? rows
          .map((item) => {
            const lead = item.leads || {}
            const carTitle = item.cars?.title || lead.car_interest || '-'
            return `
              <tr>
                <td>
                  <strong>${escapeHtml(lead.name || 'Sin nombre')}</strong>
                  <div class="admin-row-meta">${escapeHtml(lead.phone || 'Sin telefono')}</div>
                  <div class="admin-row-meta">${escapeHtml(lead.email || 'Sin email')}</div>
                </td>
                <td>
                  <strong>${escapeHtml(carTitle)}</strong>
                  <div class="admin-row-meta">Fecha: ${escapeHtml(item.preferred_date || 'Sin definir')}</div>
                </td>
                <td>
                  <select class="admin-status-select" data-appointment-status="${item.id}">
                    ${['pending', 'confirmed', 'done', 'cancelled']
                      .map(
                        (status) =>
                          `<option value="${status}" ${item.status === status ? 'selected' : ''}>${escapeHtml(formatStatusLabel(status))}</option>`,
                      )
                      .join('')}
                  </select>
                </td>
                <td>${renderContactActions(lead.phone, lead.email)}</td>
                <td><span class="admin-row-date">${escapeHtml(formatDate(item.created_at))}</span></td>
              </tr>
            `
          })
          .join('')
      : `<tr><td colspan="5">${renderEmptyState('No hay citas todavia.')}</td></tr>`

    document.querySelectorAll('[data-appointment-status]').forEach((select) => {
      select.addEventListener('change', async () => {
        const previousValue = select.dataset.currentValue || 'pending'
        try {
          await updateAppointmentStatus(select.dataset.appointmentStatus, select.value)
          select.dataset.currentValue = select.value
          setNotice('Estado de cita actualizado.')
        } catch (error) {
          select.value = previousValue
          setNotice(error.message || 'No se pudo actualizar la cita.')
        }
      })
      select.dataset.currentValue = select.value
    })
  }

  const filterAppointments = () => {
    const term = String(searchInput?.value || '').trim().toLowerCase()
    const selectedStatus = String(statusFilter?.value || 'all')

    const filtered = appointments.filter((item) => {
      const lead = item.leads || {}
      const carTitle = item.cars?.title || lead.car_interest || ''
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus
      const matchesTerm =
        !term ||
        [lead.name, lead.phone, lead.email, carTitle]
          .some((value) => String(value || '').toLowerCase().includes(term))

      return matchesStatus && matchesTerm
    })

    paint(filtered)
  }

  filterAppointments()
  searchInput?.addEventListener('input', filterAppointments)
  statusFilter?.addEventListener('change', filterAppointments)
}

async function renderSubscribersPage() {
  const subscribers = await listSubscribers()
  const fromHome = subscribers.filter((subscriber) => String(subscriber.source || '').includes('home')).length
  const fromAutos = subscribers.filter((subscriber) => String(subscriber.source || '').includes('autos')).length

  setPage(`
    <header class="admin-page-header">
      <div>
        <h1>Subscribers</h1>
        <p>Personas que pidieron novedades, promociones o llegada de carros nuevos.</p>
      </div>
    </header>
    ${renderMetricStrip([
      { label: 'Total', value: String(subscribers.length) },
      { label: 'Desde home', value: String(fromHome) },
      { label: 'Desde autos', value: String(fromAutos) },
      { label: 'Emails unicos', value: String(new Set(subscribers.map((item) => item.email)).size) },
    ])}
    <section class="admin-card">
      <div class="admin-toolbar">
        <input id="subscribersSearch" type="search" placeholder="Buscar por nombre, email o fuente" />
        <div class="admin-toolbar__actions">
          <button id="exportSubscribers" class="admin-link-btn" type="button">Exportar CSV</button>
        </div>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Fuente</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody id="subscribersTableBody"></tbody>
        </table>
      </div>
    </section>
  `)

  const tableBody = document.getElementById('subscribersTableBody')
  const searchInput = document.getElementById('subscribersSearch')
  const paint = (rows) => {
    tableBody.innerHTML = rows.length
      ? rows
          .map(
            (subscriber) => `
              <tr>
                <td>${escapeHtml(subscriber.name || '-')}</td>
                <td>${escapeHtml(subscriber.email || '-')}</td>
                <td>${escapeHtml(subscriber.source || '-')}</td>
                <td><span class="admin-row-date">${escapeHtml(formatDate(subscriber.created_at))}</span></td>
              </tr>
            `,
          )
          .join('')
      : `<tr><td colspan="4">${renderEmptyState('No hay subscribers todavia.')}</td></tr>`
  }

  const filterSubscribers = () => {
    const term = String(searchInput?.value || '').trim().toLowerCase()
    const filtered = subscribers.filter((subscriber) =>
      !term ||
      [subscriber.name, subscriber.email, subscriber.source]
        .some((value) => String(value || '').toLowerCase().includes(term)),
    )
    paint(filtered)
  }

  filterSubscribers()
  searchInput?.addEventListener('input', filterSubscribers)

  document.getElementById('exportSubscribers')?.addEventListener('click', () => {
    const csv = exportSubscribersCsv(subscribers)
    downloadFile('subscribers.csv', csv, 'text/csv;charset=utf-8')
  })
}

function parseTitleFields(title) {
  const normalized = String(title || '').trim().replace(/\s+/g, ' ')
  if (!normalized) return { make: '', model: '', year: '' }

  const yearMatch = normalized.match(/\b(19|20)\d{2}\b/)
  const year = yearMatch ? yearMatch[0] : ''
  const withoutYear = normalized.replace(year, '').trim()
  const parts = withoutYear.split(' ').filter(Boolean)

  return {
    make: parts[0] || '',
    model: parts.slice(1).join(' '),
    year,
  }
}

async function renderCarsPage() {
  let cars = await listCarsAdmin()
  let currentGallery = []
  const availableCount = cars.filter((car) => car.status === 'available').length
  const soldCount = cars.filter((car) => car.status === 'sold').length
  const featuredCount = cars.filter((car) => car.featured).length

  setPage(`
    <header class="admin-page-header">
      <div>
        <h1>Carros</h1>
        <p>Agrega un carro en menos de 30 segundos con un formulario simple para el dealer.</p>
      </div>
    </header>
    ${renderMetricStrip([
      { label: 'Total', value: String(cars.length) },
      { label: 'Disponibles', value: String(availableCount) },
      { label: 'Vendidos', value: String(soldCount) },
      { label: 'Destacados', value: String(featuredCount) },
    ])}
    <section class="admin-form-shell">
      <article class="admin-form-card">
        <h2>Nuevo carro</h2>
        <form id="carForm" class="admin-form">
          <input name="id" type="hidden" />
          <section class="admin-form-section">
            <div class="admin-form-section__header">
              <h3>Informacion principal</h3>
              <p>Escribe el titulo y el sistema intenta completar marca, modelo y ano.</p>
            </div>
            <div class="admin-form-grid">
              <label class="admin-field admin-field--full">
                <span>Titulo</span>
                <input name="title" type="text" placeholder="Toyota Camry SE 2019" required />
              </label>
              <label class="admin-field">
                <span>Marca</span>
                <input name="make" type="text" placeholder="Toyota" />
              </label>
              <label class="admin-field">
                <span>Modelo</span>
                <input name="model" type="text" placeholder="Camry SE" />
              </label>
              <label class="admin-field">
                <span>Ano</span>
                <input name="year" type="number" placeholder="2019" />
              </label>
            </div>
          </section>

          <section class="admin-form-section">
            <div class="admin-form-section__header">
              <h3>Precio</h3>
            </div>
            <div class="admin-form-grid">
              <label class="admin-field">
                <span>Precio</span>
                <input name="price" type="number" step="0.01" placeholder="13900" />
              </label>
              <label class="admin-field">
                <span>Pago semanal</span>
                <input name="weekly_payment" type="text" placeholder="$85/semana" />
              </label>
            </div>
          </section>

          <section class="admin-form-section">
            <div class="admin-form-section__header">
              <h3>Detalles</h3>
            </div>
            <div class="admin-form-grid">
              <label class="admin-field">
                <span>Millaje</span>
                <input name="mileage" type="number" placeholder="62000" />
              </label>
              <label class="admin-field">
                <span>Transmision</span>
                <input name="transmission" type="text" placeholder="Automatica" />
              </label>
              <label class="admin-field admin-field--full">
                <span>VIN</span>
                <input name="vin" type="text" placeholder="1HGCM82633A123456" />
              </label>
            </div>
          </section>

          <section class="admin-form-section">
            <div class="admin-form-section__header">
              <h3>Estado</h3>
            </div>
            <div class="admin-form-grid">
              <label class="admin-field">
                <span>Disponible</span>
                <select name="status">
                  <option value="available">Disponible</option>
                  <option value="sold">Vendido</option>
                </select>
              </label>
              <label class="admin-field admin-field--toggle">
                <span>Destacado</span>
                <span class="admin-toggle-row">
                  <input name="featured" type="checkbox" />
                  <strong>Mostrar como destacado</strong>
                </span>
              </label>
            </div>
          </section>

          <section class="admin-form-section">
            <div class="admin-form-section__header">
              <h3>Fotos</h3>
            </div>
            <div class="admin-form-grid">
          <div class="admin-upload-field">
            <label for="carImages">Imagenes del carro</label>
            <input id="carImages" name="carImages" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple />
            <p class="admin-muted">Selecciona imagenes desde tu computadora. El sistema las guarda en el proyecto.</p>
            <div id="carImagesPreview" class="admin-upload-preview"></div>
          </div>
            </div>
          </section>
          <div class="admin-actions">
            <button class="admin-link-btn" type="submit">Guardar carro</button>
            <button id="resetCarForm" class="admin-btn" type="button">Limpiar</button>
          </div>
        </form>
      </article>
      <section class="admin-card">
        <div class="admin-toolbar admin-toolbar--stack">
          <input id="carsSearch" type="search" placeholder="Buscar por titulo, marca, modelo o VIN" />
          <div class="admin-toolbar__actions">
            <select id="carsStatusFilter">
              <option value="all">Todos</option>
              <option value="available">Disponibles</option>
              <option value="hidden">Ocultos</option>
              <option value="sold">Vendidos</option>
            </select>
          </div>
        </div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Carro</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="carsTableBody"></tbody>
          </table>
        </div>
      </section>
    </section>
  `)

  const form = document.getElementById('carForm')
  const tableBody = document.getElementById('carsTableBody')
  const searchInput = document.getElementById('carsSearch')
  const statusFilter = document.getElementById('carsStatusFilter')
  const imagesInput = document.getElementById('carImages')
  const imagesPreview = document.getElementById('carImagesPreview')
  const titleInput = form?.elements?.title
  const makeInput = form?.elements?.make
  const modelInput = form?.elements?.model
  const yearInput = form?.elements?.year

  const paintImagePreview = (images) => {
    if (imagesPreview) imagesPreview.innerHTML = renderImagePreviewList(images)
  }

  paintImagePreview(currentGallery)

  titleInput?.addEventListener('blur', () => {
    const parsed = parseTitleFields(titleInput.value)
    if (makeInput && !String(makeInput.value || '').trim()) makeInput.value = parsed.make
    if (modelInput && !String(modelInput.value || '').trim()) modelInput.value = parsed.model
    if (yearInput && !String(yearInput.value || '').trim()) yearInput.value = parsed.year
  })

  imagesInput?.addEventListener('change', () => {
    const files = Array.from(imagesInput.files || [])
    if (!files.length) {
      paintImagePreview(currentGallery)
      return
    }

    const previews = files.map((file) => URL.createObjectURL(file))
    paintImagePreview(previews)
  })

  const paint = (rows) => {
    tableBody.innerHTML = rows.length
      ? rows
          .map(
            (car) => `
              <tr>
                <td><img src="${escapeHtml(car.image || '/favicon.png')}" alt="${escapeHtml(car.title)}" /></td>
                <td>
                  <strong>${escapeHtml(car.title)}</strong>
                  <div class="admin-row-meta">${escapeHtml([car.year, car.make, car.model].filter(Boolean).join(' ')) || '-'}</div>
                  <div class="admin-row-meta">VIN: ${escapeHtml(car.vin || '-')}</div>
                </td>
                <td>
                  <strong>${escapeHtml(car.price || '-')}</strong>
                  <div class="admin-row-meta">${escapeHtml(car.weekly_payment || car.payment || 'Sin pago semanal')}</div>
                </td>
                <td><span class="admin-status-pill">${escapeHtml(formatStatusLabel(car.status || '-'))}</span></td>
                <td>
                  <div class="admin-actions">
                    <button class="admin-btn" type="button" data-edit-car="${car.id}">Editar</button>
                    <a class="admin-btn" href="/autos/detalle/?car=${encodeURIComponent(car.slug || '')}" target="_blank" rel="noopener noreferrer">Ver</a>
                    <button class="admin-btn" type="button" data-status-car="${car.id}" data-status-value="hidden">Ocultar</button>
                    <button class="admin-btn" type="button" data-status-car="${car.id}" data-status-value="available">Publicar</button>
                    <button class="admin-btn" type="button" data-status-car="${car.id}" data-status-value="sold">Vendido</button>
                  </div>
                </td>
              </tr>
            `,
          )
          .join('')
      : `<tr><td colspan="5">${renderEmptyState('No hay carros para este filtro.')}</td></tr>`
  }

  const filterCars = () => {
    const term = String(searchInput?.value || '').trim().toLowerCase()
    const selectedStatus = String(statusFilter?.value || 'all')

    const filtered = cars.filter((car) => {
      const matchesStatus = selectedStatus === 'all' || car.status === selectedStatus
      const matchesTerm =
        !term ||
        [car.title, car.make, car.model, car.vin]
          .some((value) => String(value || '').toLowerCase().includes(term))

      return matchesStatus && matchesTerm
    })

    paint(filtered)
  }

  filterCars()

  form?.addEventListener('submit', async (event) => {
    event.preventDefault()

    const formData = new FormData(form)
    const title = String(formData.get('title') || '').trim()
    const selectedFiles = Array.from(imagesInput?.files || [])
    let uploadedImages = currentGallery

    if (selectedFiles.length) {
      const preparedFiles = await Promise.all(
        selectedFiles.map(async (file) => ({
          name: file.name,
          type: file.type,
          data: await fileToBase64(file),
        })),
      )

      const uploadResult = await uploadCarImages(preparedFiles)
      uploadedImages = uploadResult.files || []
    }

    const payload = {
      id: formData.get('id') ? Number(formData.get('id')) : null,
      title,
      make: String(formData.get('make') || ''),
      model: String(formData.get('model') || ''),
      year: String(formData.get('year') || ''),
      price: String(formData.get('price') || ''),
      weekly_payment: String(formData.get('weekly_payment') || ''),
      mileage: String(formData.get('mileage') || ''),
      transmission: String(formData.get('transmission') || ''),
      vin: String(formData.get('vin') || ''),
      status: String(formData.get('status') || 'available'),
      featured: Boolean(formData.get('featured')),
      images: uploadedImages,
    }

    await upsertCar(payload)
    form.reset()
    form.elements.id.value = ''
    currentGallery = []
    paintImagePreview(currentGallery)
    cars = await listCarsAdmin()
    filterCars()
    setNotice('Carro guardado correctamente.')
  })

  document.getElementById('resetCarForm')?.addEventListener('click', () => {
    form.reset()
    form.elements.id.value = ''
    currentGallery = []
    paintImagePreview(currentGallery)
  })

  searchInput?.addEventListener('input', filterCars)
  statusFilter?.addEventListener('change', filterCars)

  tableBody.addEventListener('click', async (event) => {
    const editButton = event.target.closest('[data-edit-car]')
    const statusButton = event.target.closest('[data-status-car]')

    if (editButton) {
      const car = cars.find((item) => String(item.id) === String(editButton.dataset.editCar))
      if (!car) return

      form.elements.id.value = car.id || ''
      form.elements.title.value = car.title || ''
      form.elements.make.value = car.make || ''
      form.elements.model.value = car.model || ''
      form.elements.year.value = car.year || ''
      form.elements.price.value = car.price?.replace(/[$,]/g, '') || ''
      form.elements.weekly_payment.value = car.weekly_payment || car.payment || ''
      form.elements.mileage.value = car.mileage?.replace(/[^0-9]/g, '') || ''
      form.elements.transmission.value = car.transmission || ''
      form.elements.vin.value = car.vin || ''
      form.elements.status.value = car.status === 'sold' ? 'sold' : 'available'
      form.elements.featured.checked = Boolean(car.featured)
      currentGallery = car.gallery || []
      paintImagePreview(currentGallery)
      form.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setNotice(`Editando: ${car.title}`)
    }

    if (statusButton) {
      await updateCarStatus(Number(statusButton.dataset.statusCar), statusButton.dataset.statusValue)
      cars = await listCarsAdmin()
      filterCars()
      setNotice('Estado del carro actualizado.')
    }
  })
}

const pageRunners = {
  dashboard: renderDashboardPage,
  leads: renderLeadsPage,
  appointments: renderAppointmentsPage,
  subscribers: renderSubscribersPage,
  cars: renderCarsPage,
}

if (await ensureAdminAccess()) {
  await pageRunners[page]?.()
}
