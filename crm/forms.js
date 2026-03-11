import { createAppointment, createSubscriber } from './api.js'

function getOrCreateMessage(form) {
  let message = form.querySelector('.form-status')
  if (!message) {
    message = document.createElement('p')
    message.className = 'form-status'
    form.appendChild(message)
  }
  return message
}

function setMessage(form, type, text) {
  const message = getOrCreateMessage(form)
  message.textContent = text
  message.className = `form-status form-status--${type}`
}

function shouldFallbackToExternalForm(error) {
  const message = String(error?.message || '').toLowerCase()
  return (
    error instanceof TypeError ||
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('load failed') ||
    message.includes('request failed: 404') ||
    message.includes('request failed: 405') ||
    message.includes('request failed: 500') ||
    message.includes('request failed: 502') ||
    message.includes('request failed: 503')
  )
}

async function submitExternalForm(form) {
  const action = form.getAttribute('action')
  if (!action) throw new Error('No hay canal alterno para enviar este formulario.')

  await fetch(action, {
    method: String(form.getAttribute('method') || 'POST').toUpperCase(),
    body: new FormData(form),
    mode: 'no-cors',
  })
}

export function bindSubscriberForm(form, source) {
  if (!form) return

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const formData = new FormData(form)
    const payload = {
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      source,
    }

    try {
      setMessage(form, 'loading', 'Guardando...')
      await createSubscriber(payload)
      form.reset()
      setMessage(form, 'success', 'Te agregamos a la lista de updates de carros y promociones.')
    } catch (error) {
      if (shouldFallbackToExternalForm(error)) {
        try {
          await submitExternalForm(form)
          form.reset()
          setMessage(form, 'success', 'Guardamos tu contacto por el canal alterno del sitio.')
          return
        } catch (fallbackError) {
          setMessage(form, 'error', fallbackError.message || 'No se pudo guardar tu email.')
          return
        }
      }

      setMessage(form, 'error', error.message || 'No se pudo guardar tu email.')
    }
  })
}

export function bindAppointmentForm(form, source) {
  if (!form) return

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const formData = new FormData(form)
    const carIdValue = String(formData.get('car_id') || '').trim()
    const phone = String(formData.get('phone') || '').trim()
    const email = String(formData.get('email') || '').trim()

    if (!phone && !email) {
      setMessage(form, 'error', 'Deja telefono o email para poder confirmarte la cita.')
      form.querySelector('[name="phone"]')?.focus()
      return
    }

    const payload = {
      name: String(formData.get('name') || ''),
      phone,
      email,
      car_interest: String(formData.get('vehicle') || ''),
      car_id: carIdValue ? Number(carIdValue) : null,
      preferred_date: String(formData.get('date') || ''),
      source,
    }

    try {
      setMessage(form, 'loading', 'Enviando...')
      await createAppointment(payload)
      const preservedVehicle = payload.car_interest
      const preservedCarId = carIdValue
      form.reset()
      const vehicleField = form.querySelector('[name="vehicle"]')
      const carIdField = form.querySelector('[name="car_id"]')
      if (vehicleField) vehicleField.value = preservedVehicle
      if (carIdField) carIdField.value = preservedCarId
      setMessage(form, 'success', 'Tu cita fue enviada. Te contactaremos por llamada o WhatsApp.')
    } catch (error) {
      if (shouldFallbackToExternalForm(error)) {
        try {
          await submitExternalForm(form)
          const preservedVehicle = payload.car_interest
          const preservedCarId = carIdValue
          form.reset()
          const vehicleField = form.querySelector('[name="vehicle"]')
          const carIdField = form.querySelector('[name="car_id"]')
          if (vehicleField) vehicleField.value = preservedVehicle
          if (carIdField) carIdField.value = preservedCarId
          setMessage(form, 'success', 'Tu cita salio por el canal alterno del sitio. Te contactaremos pronto.')
          return
        } catch (fallbackError) {
          setMessage(form, 'error', fallbackError.message || 'No se pudo enviar tu cita.')
          return
        }
      }

      setMessage(form, 'error', error.message || 'No se pudo enviar tu cita.')
    }
  })
}
