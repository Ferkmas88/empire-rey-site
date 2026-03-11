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

const cars = [
  {
    slug: 'sedan-premium-2019',
    title: 'Toyota Camry SE 2019',
    badge: 'Nuevo esta semana',
    price: '$13,900',
    mileage: '62,000 mi',
    payment: '$85/semana',
    year: '2019',
    make: 'Toyota',
    model: 'Camry SE',
    body: 'Sedan',
    transmission: 'Automatica',
    fuel: 'Gasolina',
    color: 'Gris metalico',
    drivetrain: 'FWD',
    stock: 'Disponible ahora',
    summary: 'Sedan limpio, comodo y listo para quien busca pagos manejables.',
    description:
      'Toyota Camry SE 2019 con manejo suave, buen espacio interior y una presencia elegante para uso diario. Buena opcion para trabajo, familia o primer carro con financiamiento flexible.',
    image: sedanMain || nightMain,
    gallery: [sedanMain || nightMain, nightMain || sedanMain, '/rey/WhatsApp Image 2026-02-27 at 9.12.30 PM.jpeg'],
  },
  {
    slug: 'suv-familiar-2020',
    title: 'Nissan Rogue SV 2020',
    badge: 'Familiar',
    price: '$18,900',
    mileage: '54,300 mi',
    payment: '$109/semana',
    year: '2020',
    make: 'Nissan',
    model: 'Rogue SV',
    body: 'SUV',
    transmission: 'Automatica',
    fuel: 'Gasolina',
    color: 'Negro',
    drivetrain: 'AWD',
    stock: 'Lista para prueba',
    summary: 'SUV moderna con espacio, posicion alta y manejo seguro para familia.',
    description:
      'Nissan Rogue SV 2020 pensada para clientes que necesitan espacio, comodidad y una posicion de manejo mas alta. Ideal para familia, viajes y uso mixto entre ciudad y carretera.',
    image: suvMain || cityMain,
    gallery: [suvMain || cityMain, cityMain || suvMain, '/rey/1ge 2026-02-27 at 9.12.30 PM.jpeg'],
  },
  {
    slug: 'pickup-trabajo-2018',
    title: 'Ford F-150 XLT 2018',
    badge: 'Trabajo',
    price: '$21,500',
    mileage: '78,100 mi',
    payment: '$126/semana',
    year: '2018',
    make: 'Ford',
    model: 'F-150 XLT',
    body: 'Pickup',
    transmission: 'Automatica',
    fuel: 'Gasolina',
    color: 'Blanco',
    drivetrain: '4x4',
    stock: 'Consulta disponibilidad',
    summary: 'Pickup fuerte para trabajo, herramientas y clientes que necesitan utilidad real.',
    description:
      'Ford F-150 XLT 2018 con capacidad para trabajo duro, buena presencia y cabina comoda. Opcion fuerte para negocio, herramientas, remolque ligero y uso diario.',
    image: pickupMain || nightMain,
    gallery: [pickupMain || nightMain, nightMain || pickupMain, '/rey/WhatsApp Image 2026-02-27 at 9.12.30 PM.jpeg'],
  },
  {
    slug: 'compacto-economico-2017',
    title: 'Honda Civic LX 2017',
    badge: 'Economico',
    price: '$10,900',
    mileage: '69,800 mi',
    payment: '$72/semana',
    year: '2017',
    make: 'Honda',
    model: 'Civic LX',
    body: 'Compacto',
    transmission: 'Automatica',
    fuel: 'Gasolina',
    color: 'Azul oscuro',
    drivetrain: 'FWD',
    stock: 'Ideal primer carro',
    summary: 'Compacto confiable y economico para commuting diario y primer carro.',
    description:
      'Honda Civic LX 2017 con buena reputacion, economia de combustible y mantenimiento accesible. Perfecto para clientes que quieren algo practico, comodo y facil de pagar.',
    image: compactMain || cityMain,
    gallery: [compactMain || cityMain, cityMain || compactMain, '/rey/1ge 2026-02-27 at 9.12.30 PM.jpeg'],
  },
  {
    slug: 'suv-compacta-2021',
    title: 'Chevrolet Equinox LS 2021',
    badge: 'Reciente',
    price: '$19,750',
    mileage: '48,900 mi',
    payment: '$114/semana',
    year: '2021',
    make: 'Chevrolet',
    model: 'Equinox LS',
    body: 'SUV',
    transmission: 'Automatica',
    fuel: 'Gasolina',
    color: 'Rojo vino',
    drivetrain: 'FWD',
    stock: 'Lista para mostrar',
    summary: 'SUV compacta con look moderno, buena altura y espacio versatil.',
    description:
      'Chevrolet Equinox LS 2021 con estilo moderno, cabina comoda y espacio util para familia o trabajo ligero. Excelente opcion para quien quiere una SUV reciente con pagos semanales accesibles.',
    image: cityMain || nightMain,
    gallery: [cityMain || nightMain, nightMain || cityMain, '/rey/WhatsApp Image 2026-02-27 at 9.12.30 PM.jpeg'],
  },
]

export { cars }

export function getCarBySlug(slug) {
  return cars.find((car) => car.slug === slug)
}

export const featuredCars = cars.slice(0, 3)
