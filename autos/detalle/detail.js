import { loadCars } from '../../crm/api.js'
import { bindAppointmentForm } from '../../crm/forms.js'
import { escapeHtml } from '../../crm/sanitize.js'

const logoFiles = import.meta.glob('../../Logo/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const first = (obj) => Object.values(obj).sort()[0]
const logoSrc = first(logoFiles)
const logoImage = document.getElementById('logoImage')
if (logoSrc && logoImage) logoImage.src = logoSrc

const cars = (await loadCars()).filter((item) => item.status !== 'hidden')
const params = new URLSearchParams(window.location.search)
const activeSlug = params.get('car') || ''
const fallbackCar = cars.find((item) => item.status !== 'sold') || cars[0] || null
const car = cars.find((item) => item.slug === activeSlug) || fallbackCar

const breadcrumb = document.getElementById('detailBreadcrumb')
const carDetail = document.getElementById('carDetail')
const appointmentForm = document.querySelector('#cita form')
const appointmentSection = document.getElementById('cita')
const vehicleInput = document.getElementById('detail-vehicle')
const carIdInput = document.getElementById('detail-car-id')

if (!car) {
  document.title = 'Inventario no disponible | Empire Rey Auto Sales & Mechanic'
  if (breadcrumb) breadcrumb.textContent = 'Sin inventario'
  if (carDetail) {
    carDetail.innerHTML = `
      <article class="admin-empty">
        <h1>No hay carros disponibles</h1>
        <p>En este momento no hay unidades publicadas. Vuelve al inventario o escribenos por WhatsApp.</p>
        <p><a class="btn-gold" href="/autos/">Volver a Autos</a></p>
      </article>
    `
  }
  if (appointmentSection) appointmentSection.hidden = true
} else {
  const gallery = car.gallery?.length ? car.gallery : [car.image || '/favicon.png']
  const isSold = car.status === 'sold'

  document.title = `${car.title} | Empire Rey Auto Sales & Mechanic`
  if (breadcrumb) breadcrumb.textContent = car.title
  if (vehicleInput) vehicleInput.value = car.title
  if (carIdInput) carIdInput.value = car.id || ''

  if (carDetail) {
    carDetail.innerHTML = `
      <div class="detail-gallery">
        <div class="detail-gallery__main">
          <img id="detailMainImage" src="${escapeHtml(gallery[0])}" alt="${escapeHtml(car.title)}" />
        </div>
        <div class="detail-gallery__thumbs" id="detailThumbs"></div>
      </div>
      <aside class="detail-copy">
        <div class="detail-copy__top">
          <div class="detail-copy__title">
            <p class="eyebrow">${escapeHtml(isSold ? 'Vendido' : car.badge)}</p>
            <h1>${escapeHtml(car.title)}</h1>
            <p>${escapeHtml(car.summary)}</p>
          </div>
          <p class="detail-copy__price">${escapeHtml(car.price)}</p>
        </div>
        <div class="detail-copy__meta">
          <article><strong>Millaje</strong><span>${escapeHtml(car.mileage)}</span></article>
          <article><strong>Pago estimado</strong><span>${escapeHtml(car.payment)}</span></article>
          <article><strong>Transmision</strong><span>${escapeHtml(car.transmission)}</span></article>
          <article><strong>Combustible</strong><span>${escapeHtml(car.fuel)}</span></article>
          <article><strong>Color</strong><span>${escapeHtml(car.color)}</span></article>
          <article><strong>Traccion</strong><span>${escapeHtml(car.drivetrain)}</span></article>
        </div>
        <p class="detail-copy__description">${escapeHtml(car.description)}</p>
        <div class="detail-copy__actions">
          ${isSold ? '<a class="btn-gold" href="/autos/">Ver inventario</a>' : '<a class="btn-gold" href="#cita">Agendar Cita</a>'}
          <a
            class="detail-copy__ghost"
            href="https://wa.me/15025768116?text=${encodeURIComponent(`Hola, me interesa ${car.title}. Quiero mas informacion.`)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </div>
      </aside>
    `
  }

  if (!isSold) {
    bindAppointmentForm(appointmentForm, 'detalle')
  } else if (appointmentForm) {
    appointmentForm.innerHTML = `
      <p class="form-status">Esta unidad ya fue vendida. Si quieres algo parecido, te ayudamos a encontrarlo.</p>
      <div class="detail-copy__actions">
        <a class="btn-gold" href="/autos/">Ver inventario</a>
        <a
          class="detail-copy__ghost"
          href="https://wa.me/15025768116?text=${encodeURIComponent(`Hola, vi que ${car.title} ya se vendio. Quiero opciones parecidas.`)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
      </div>
    `
  }

  const detailThumbs = document.getElementById('detailThumbs')
  const detailMainImage = document.getElementById('detailMainImage')

  if (detailThumbs && detailMainImage) {
    gallery.forEach((imageSrc, index) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = `detail-thumb${index === 0 ? ' is-active' : ''}`
      button.innerHTML = `<img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(car.title)} vista ${index + 1}" loading="lazy" />`
      button.addEventListener('click', () => {
        detailMainImage.src = imageSrc
        detailThumbs.querySelectorAll('.detail-thumb').forEach((thumb) => thumb.classList.remove('is-active'))
        button.classList.add('is-active')
      })
      detailThumbs.appendChild(button)
    })
  }
}

const menuToggle = document.getElementById('menuToggle')
const navLinks = document.getElementById('navLinks')
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'))
  navLinks.querySelectorAll('a').forEach((link) =>
    link.addEventListener('click', () => navLinks.classList.remove('open')),
  )
}
