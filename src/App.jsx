import { useEffect, useState } from 'react'
import './App.css'

const promoMessages = [
  'Madre soltera? Tenemos planes especiales para ti desde $85/semana.',
  'Tienes un carro viejo? Lo recibimos como parte de pago.',
]

function App() {
  const [activePromo, setActivePromo] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const rotateInterval = setInterval(() => {
      setActivePromo((current) => (current + 1) % promoMessages.length)
    }, 15000)

    return () => {
      clearInterval(rotateInterval)
    }
  }, [])

  useEffect(() => {
    const showTimeout = setTimeout(() => {
      setIsVisible(true)
    }, 80)

    const hideTimeout = setTimeout(() => {
      setIsVisible(false)
    }, 6000)

    return () => {
      clearTimeout(showTimeout)
      clearTimeout(hideTimeout)
    }
  }, [activePromo])

  return (
    <div className="promo-stack" aria-live="polite">
      <div className={`promo-toast ${isVisible ? 'promo-toast--visible' : ''}`}>
        {promoMessages[activePromo]}
      </div>
    </div>
  )
}

export default App
