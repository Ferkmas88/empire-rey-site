const soldFiles = import.meta.glob('../Casos de autos vendidos/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const portadaFiles = import.meta.glob('../Portada/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const getByName = (files, name) =>
  Object.entries(files).find(([filePath]) => filePath.split('/').pop() === name)?.[1] || ''

const sedanMain = getByName(soldFiles, '612427142_874332448909630_889268608058161214_n.jpg')
const suvMain = getByName(soldFiles, '618219692_881587674850774_581404140251442906_n.jpg')
const pickupMain = getByName(soldFiles, '610624059_871157672560441_546700141234205049_n.jpg')
const compactMain = getByName(soldFiles, '605127263_868224342853774_1597893891073389201_n.jpg')
const cityMain = getByName(portadaFiles, '588721866_839012729108269_4655180508387803109_n.jpg')
const nightMain = getByName(portadaFiles, 'WhatsApp Image 2026-02-27 at 9.34.29 PM.jpeg')

const cars = []

export { cars }

export function getCarBySlug(slug) {
  return cars.find((car) => car.slug === slug)
}

export const featuredCars = cars.slice(0, 3)
