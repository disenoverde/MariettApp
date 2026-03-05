// EmailJS — https://www.emailjs.com
// Variables de entorno necesarias en .env:
//   VITE_EMAILJS_SERVICE_ID
//   VITE_EMAILJS_PUBLIC_KEY
//   VITE_EMAILJS_TEMPLATE_INVITACION
//   VITE_EMAILJS_TEMPLATE_CONTRATO
//   VITE_EMAILJS_TEMPLATE_CONTRATO_FIRMADO
//   VITE_APP_URL  (ej: https://mariettapp.netlify.app)

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin

const sendEmail = async (templateId, templateParams) => {
  if (!SERVICE_ID || !PUBLIC_KEY) {
    console.warn('EmailJS no configurado. Variables de entorno faltantes.')
    return { ok: false, reason: 'not_configured' }
  }

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: SERVICE_ID,
      template_id: templateId,
      user_id: PUBLIC_KEY,
      template_params: templateParams,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`EmailJS error: ${text}`)
  }

  return { ok: true }
}

// Email 1: Invitación al portal del cliente
export const enviarInvitacion = async ({ emailCliente, nombreCliente, codigo }) => {
  const linkRegistro = `${APP_URL}/registro?codigo=${codigo}`
  return sendEmail(import.meta.env.VITE_EMAILJS_TEMPLATE_INVITACION, {
    to_email: emailCliente,
    to_name: nombreCliente,
    codigo,
    link_registro: linkRegistro,
    coach_nombre: 'Mariett Alcayaga',
  })
}

// Email 2: Notificación al cliente de contrato pendiente de firma
export const enviarNotificacionContrato = async ({ emailCliente, nombreCliente, contratoId }) => {
  const linkFirma = `${APP_URL}/contrato/${contratoId}/firmar`
  return sendEmail(import.meta.env.VITE_EMAILJS_TEMPLATE_CONTRATO, {
    to_email: emailCliente,
    to_name: nombreCliente,
    link_firma: linkFirma,
    coach_nombre: 'Mariett Alcayaga',
  })
}

// Email 3: Confirmación de contrato firmado (a coach y cliente)
export const enviarConfirmacionFirma = async ({ emailCliente, nombreCliente, emailCoach, fechaFirma }) => {
  // Enviar al cliente
  await sendEmail(import.meta.env.VITE_EMAILJS_TEMPLATE_CONTRATO_FIRMADO, {
    to_email: emailCliente,
    to_name: nombreCliente,
    fecha_firma: fechaFirma,
    coach_nombre: 'Mariett Alcayaga',
  })
  // Enviar copia al coach
  await sendEmail(import.meta.env.VITE_EMAILJS_TEMPLATE_CONTRATO_FIRMADO, {
    to_email: emailCoach || 'mariett@example.com',
    to_name: 'Mariett Alcayaga',
    fecha_firma: fechaFirma,
    coach_nombre: nombreCliente,
  })
}
