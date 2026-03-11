import { loadCars } from './crm/api.js'
import { bindSubscriberForm } from './crm/forms.js'
import { escapeHtml } from './crm/sanitize.js'

const logoFiles = import.meta.glob('./Logo/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const heroFiles = import.meta.glob('./Portada/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const heroVideoFiles = import.meta.glob('./Portada/*.{mp4,webm,mov,m4v}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const soldFiles = import.meta.glob('./Casos de autos vendidos/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const hiddenHeroPhotos = new Set(['588721866_839012729108269_4655180508387803109_n.jpg'])
const hiddenSoldPhotos = new Set([
  '595074674_846841291658746_1476586188343971499_n.jpg',
  '605127263_868224342853774_1597893891073389201_n.jpg',
])

const first = (obj) => Object.values(obj).sort()[0]
const byFileName = (files, name) =>
  Object.entries(files).find(([filePath]) => filePath.split('/').pop() === name)?.[1]

const logoSrc = first(logoFiles)
const heroSrc = Object.entries(heroFiles)
  .filter(([filePath]) => !hiddenHeroPhotos.has(filePath.split('/').pop()))
  .map(([, src]) => src)
  .sort()[0]

const heroSideVideoSrc =
  byFileName(heroVideoFiles, 'WhatsApp Video 2026-02-27 at 9.35.07 PM.mp4') || first(heroVideoFiles)

const soldSrcs = Object.entries(soldFiles)
  .filter(([filePath]) => !hiddenSoldPhotos.has(filePath.split('/').pop()))
  .map(([, src]) => src)
  .sort()

const logoImage = document.getElementById('logoImage')
const heroElement = document.querySelector('.hero')
const heroSideVideo = document.getElementById('heroSideVideo')
const offerCarImage = document.getElementById('offerCarImage')

if (logoSrc && logoImage) logoImage.src = logoSrc
if (heroSrc && heroElement) heroElement.style.backgroundImage = `url(${heroSrc})`
if (heroSideVideoSrc && heroSideVideo) heroSideVideo.src = heroSideVideoSrc
if (offerCarImage) offerCarImage.src = soldSrcs[0] || heroSrc || ''

const soldGallery = document.getElementById('soldGallery')
if (soldGallery) {
  soldSrcs.forEach((src, index) => {
    const card = document.createElement('article')
    card.className = 'sold-card'
    const img = document.createElement('img')
    img.src = src
    img.alt = `Auto vendido ${index + 1}`
    card.appendChild(img)
    soldGallery.appendChild(card)
  })
}

const arrivalsTrack = document.getElementById('homeArrivalsTrack')
if (arrivalsTrack) {
  const homeUpdatesForm = document.querySelector('#home-updates form')
  bindSubscriberForm(homeUpdatesForm, 'home')

  const cars = (await loadCars()).filter((car) => car.status !== 'hidden' && car.status !== 'sold').slice(0, 3)

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
          <p class="inventory-card__price">${escapeHtml(car.price)}</p>
        </div>
        <p class="inventory-card__summary">${escapeHtml(car.summary)}</p>
        <div class="inventory-card__meta">
          <span>${escapeHtml(car.year)}</span>
          <span>${escapeHtml(car.mileage)}</span>
          <span>${escapeHtml(car.transmission)}</span>
        </div>
        <div class="inventory-card__actions">
          <a class="btn-gold" href="/autos/detalle/?car=${encodeURIComponent(car.slug)}">Ver Detalles</a>
          <a class="inventory-card__ghost" href="/autos/detalle/?car=${encodeURIComponent(car.slug)}#cita">Agendar Cita</a>
        </div>
      </div>
    `
    arrivalsTrack.appendChild(article)
  })
}

const arrivalsPrev = document.getElementById('homeArrivalsPrev')
const arrivalsNext = document.getElementById('homeArrivalsNext')
const scrollArrivals = (direction) => {
  if (!arrivalsTrack) return
  arrivalsTrack.scrollBy({ left: direction * Math.min(arrivalsTrack.clientWidth * 0.88, 360), behavior: 'smooth' })
}

arrivalsPrev?.addEventListener('click', () => scrollArrivals(-1))
arrivalsNext?.addEventListener('click', () => scrollArrivals(1))

const sections = document.querySelectorAll('.reveal')
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible')
    })
  },
  { threshold: 0.18 },
)
sections.forEach((section) => observer.observe(section))

const menuToggle = document.getElementById('menuToggle')
const navLinks = document.getElementById('navLinks')
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'))
  navLinks.querySelectorAll('a').forEach((link) =>
    link.addEventListener('click', () => navLinks.classList.remove('open')),
  )
}

const reyStorySection = document.querySelector('.rey-story')
if (reyStorySection) {
  const syncScrollProgress = () => {
    const rect = reyStorySection.getBoundingClientRect()
    const viewportHeight = window.innerHeight || 1
    const progress = Math.min(Math.max((viewportHeight - rect.top) / (viewportHeight + rect.height), 0), 1)
    reyStorySection.style.setProperty('--story-scroll-progress', progress.toFixed(3))
  }
  syncScrollProgress()
  window.addEventListener('scroll', syncScrollProgress, { passive: true })
  window.addEventListener('resize', syncScrollProgress)
}

const offerPopup = document.getElementById('offerPopup')
const offerBackdrop = document.getElementById('offerBackdrop')
const offerClose = document.getElementById('offerClose')
const closeOfferPopup = () => {
  offerPopup?.classList.remove('active')
  offerPopup?.setAttribute('aria-hidden', 'true')
}
const showOfferPopup = () => {
  if (!offerPopup) return
  offerPopup.classList.add('active')
  offerPopup.setAttribute('aria-hidden', 'false')
}

if (offerPopup) {
  window.setTimeout(showOfferPopup, 1200)
  window.setInterval(showOfferPopup, 60000)
}

offerBackdrop?.addEventListener('click', closeOfferPopup)
offerClose?.addEventListener('click', closeOfferPopup)
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && offerPopup?.classList.contains('active')) closeOfferPopup()
})

const offerAnnouncement = document.getElementById('offerAnnouncement')
const showOfferAnnouncement = () => {
  if (!offerAnnouncement) return
  offerAnnouncement.classList.add('is-visible')
  offerAnnouncement.setAttribute('aria-hidden', 'false')
  window.setTimeout(() => {
    offerAnnouncement.classList.remove('is-visible')
    offerAnnouncement.setAttribute('aria-hidden', 'true')
  }, 9000)
}

if (offerAnnouncement) {
  window.setTimeout(showOfferAnnouncement, 3000)
  window.setInterval(showOfferAnnouncement, 30000)
}

const raffleSideAd = document.getElementById('raffleSideAd')
const raffleSideAdClose = document.getElementById('raffleSideAdClose')
const showRaffleSideAd = () => {
  if (!raffleSideAd) return
  raffleSideAd.classList.add('is-visible')
  raffleSideAd.setAttribute('aria-hidden', 'false')
  window.setTimeout(() => {
    raffleSideAd.classList.remove('is-visible')
    raffleSideAd.setAttribute('aria-hidden', 'true')
  }, 12000)
}

if (raffleSideAd) {
  window.setTimeout(showRaffleSideAd, 10000)
  window.setInterval(showRaffleSideAd, 30000)
}

raffleSideAdClose?.addEventListener('click', () => {
  raffleSideAd?.classList.remove('is-visible')
  raffleSideAd?.setAttribute('aria-hidden', 'true')
})
