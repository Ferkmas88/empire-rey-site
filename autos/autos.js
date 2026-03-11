import { bindAppointmentForm, bindSubscriberForm } from '../crm/forms.js'
import { loadCars } from '../crm/api.js'
import { escapeHtml } from '../crm/sanitize.js'

const logoFiles = import.meta.glob('../Logo/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const first = (obj) => Object.values(obj).sort()[0]
const logoSrc = first(logoFiles)

if (logoSrc) {
  const logoImage = document.getElementById('logoImage')
  if (logoImage) logoImage.src = logoSrc
}

const autosGrid = document.getElementById('autosGrid')
const searchInput = document.getElementById('inventory-search')
const bodyFilterInput = document.getElementById('inventory-body-filter')
const sortInput = document.getElementById('inventory-sort')
const appointmentVehicleInput = document.getElementById('appointment-vehicle')
const appointmentCarIdInput = document.getElementById('appointment-car-id')
const appointmentNameInput = document.getElementById('appointment-name')
const appointmentSection = document.getElementById('cita')
const updatesForm = document.querySelector('#updates form')
const appointmentForm = document.querySelector('#cita form')

bindSubscriberForm(updatesForm, 'autos')
bindAppointmentForm(appointmentForm, 'autos')

function resolveCar(cars, value) {
  return cars.find((car) => String(car.slug) === String(value) || String(car.id) === String(value))
}

function parseCurrency(value) {
  return Number(String(value || '').replace(/[^0-9.-]/g, '')) || 0
}

function parseMileage(value) {
  return Number(String(value || '').replace(/[^0-9.-]/g, '')) || 0
}

function compareCars(sortValue, firstCar, secondCar) {
  switch (sortValue) {
    case 'price-asc':
      return parseCurrency(firstCar.price) - parseCurrency(secondCar.price)
    case 'price-desc':
      return parseCurrency(secondCar.price) - parseCurrency(firstCar.price)
    case 'mileage-asc':
      return parseMileage(firstCar.mileage) - parseMileage(secondCar.mileage)
    case 'newest':
    default:
      return Number(secondCar.year || 0) - Number(firstCar.year || 0)
  }
}

function renderCars(cars) {
  if (!autosGrid) return

  autosGrid.innerHTML = ''

  if (!cars.length) {
    autosGrid.innerHTML = `
      <article class="inventory-card inventory-card--empty">
        <div class="inventory-card__body">
          <h3>No hay carros para este filtro</h3>
          <p>Ajusta la busqueda o vuelve pronto para ver unidades nuevas.</p>
        </div>
      </article>
    `
    return
  }

  cars.forEach((car) => {
    const article = document.createElement('article')
    article.className = 'inventory-card'
    article.innerHTML = `
      <div class="inventory-card__media">
        <img src="${escapeHtml(car.image)}" alt="${escapeHtml(car.title)}" loading="lazy" />
        <span class="inventory-card__badge">${escapeHtml(car.badge)}</span>
      </div>
      <div class="inventory-card__body">
        <div class="inventory-card__header">
          <div>
            <p class="inventory-card__eyebrow">${escapeHtml(car.stock)}</p>
            <h3>${escapeHtml(car.title)}</h3>
          </div>
          <div class="inventory-card__pricing">
            <p class="inventory-card__price">${escapeHtml(car.price)}</p>
            <p class="inventory-card__payment">Desde ${escapeHtml(car.payment)}</p>
          </div>
        </div>
        <p class="inventory-card__summary">${escapeHtml(car.summary)}</p>
        <div class="inventory-card__meta">
          <span>${escapeHtml(car.year)}</span>
          <span>${escapeHtml(car.mileage)}</span>
          <span>${escapeHtml(car.body)}</span>
        </div>
        <div class="inventory-card__actions">
          <a class="btn-gold" href="/autos/detalle/?car=${encodeURIComponent(car.slug)}">Ver Detalles</a>
          <a class="inventory-card__ghost auto-card__book" href="#cita" data-vehicle="${escapeHtml(car.slug)}">Agendar Cita</a>
        </div>
      </div>
    `
    autosGrid.appendChild(article)
  })

  document.querySelectorAll('.auto-card__book').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault()
      goToAppointment(cars, button.dataset.vehicle || '')
    })
  })
}

function filterAndSortCars(allCars) {
  const searchTerm = String(searchInput?.value || '').trim().toLowerCase()
  const bodyFilter = String(bodyFilterInput?.value || 'all').toLowerCase()
  const sortValue = String(sortInput?.value || 'newest')

  return [...allCars]
    .filter((car) => {
      const matchesSearch =
        !searchTerm ||
        [car.title, car.make, car.model, car.year, car.body]
          .some((value) => String(value || '').toLowerCase().includes(searchTerm))

      const matchesBody = bodyFilter === 'all' || String(car.body || '').toLowerCase() === bodyFilter

      return matchesSearch && matchesBody
    })
    .sort((firstCar, secondCar) => compareCars(sortValue, firstCar, secondCar))
}

function goToAppointment(cars, vehicle) {
  const car = resolveCar(cars, vehicle)
  const vehicleLabel = car?.title || vehicle

  if (appointmentVehicleInput && vehicleLabel) {
    appointmentVehicleInput.value = vehicleLabel
  }

  if (appointmentCarIdInput) {
    appointmentCarIdInput.value = car?.id || ''
  }

  appointmentSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  window.setTimeout(() => {
    appointmentNameInput?.focus()
  }, 220)
}

const cars = (await loadCars()).filter((car) => car.status !== 'hidden' && car.status !== 'sold')
renderCars(filterAndSortCars(cars))

;[searchInput, bodyFilterInput, sortInput].forEach((control) => {
  control?.addEventListener('input', () => {
    renderCars(filterAndSortCars(cars))
  })

  control?.addEventListener('change', () => {
    renderCars(filterAndSortCars(cars))
  })
})

const urlParams = new URLSearchParams(window.location.search)
const vehicleFromUrl = urlParams.get('vehicle') || urlParams.get('car')
if (vehicleFromUrl) {
  goToAppointment(cars, vehicleFromUrl)
}

const menuToggle = document.getElementById('menuToggle')
const navLinks = document.getElementById('navLinks')
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'))
  navLinks.querySelectorAll('a').forEach((link) =>
    link.addEventListener('click', () => navLinks.classList.remove('open')),
  )
}
