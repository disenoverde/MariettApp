import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

/**
 * Genera un PDF editable con las notas de sesión y acuerdos
 * @param {Object} session - Datos de la sesión
 * @param {Object} client - Datos del cliente
 * @param {string} logoBase64 - Logo en base64
 * @returns {Promise<Uint8Array>} - PDF como array de bytes
 */
export async function generateEditableSessionPDF(session, client, logoBase64 = null) {
  // Crear nuevo documento PDF
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([612, 792]) // Letter size
  const { width, height } = page.getSize()
  
  // Cargar fuentes
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  // Colores de Mariett
  const primaryColor = rgb(0.118, 0.227, 0.373) // #1e3a5f
  const secondaryColor = rgb(0.494, 0.710, 0.839) // #7eb5d6
  const textColor = rgb(0.2, 0.2, 0.2)
  
  let yPosition = height - 60
  
  // Logo (si se proporciona)
  if (logoBase64) {
    try {
      const logoImage = await pdfDoc.embedPng(logoBase64)
      const logoDims = logoImage.scale(0.3)
      page.drawImage(logoImage, {
        x: 50,
        y: yPosition - logoDims.height,
        width: logoDims.width,
        height: logoDims.height,
      })
      yPosition -= logoDims.height + 20
    } catch (error) {
      console.error('Error al cargar logo:', error)
    }
  }
  
  // Título
  page.drawText('Notas de la sesión de coaching', {
    x: 50,
    y: yPosition,
    size: 20,
    font: fontBold,
    color: primaryColor,
  })
  yPosition -= 40
  
  // Información de la sesión
  page.drawText(`Nombre: ${client.nombre}`, {
    x: 50,
    y: yPosition,
    size: 12,
    font: font,
    color: textColor,
  })
  yPosition -= 20
  
  page.drawText(`N° de sesión: ${session.numero_sesion}`, {
    x: 50,
    y: yPosition,
    size: 12,
    font: font,
    color: textColor,
  })
  yPosition -= 20
  
  page.drawText(`Fecha: ${new Date(session.fecha).toLocaleDateString('es-ES')}`, {
    x: 50,
    y: yPosition,
    size: 12,
    font: font,
    color: textColor,
  })
  yPosition -= 40
  
  // Línea separadora
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: width - 50, y: yPosition },
    thickness: 1,
    color: secondaryColor,
  })
  yPosition -= 30
  
  // Acuerdos o Plan de acción
  page.drawText('Acuerdos o Plan de acción', {
    x: 50,
    y: yPosition,
    size: 14,
    font: fontBold,
    color: primaryColor,
  })
  yPosition -= 25
  
  // Crear campos de texto editables para los acuerdos
  const form = pdfDoc.getForm()
  
  for (let i = 1; i <= 3; i++) {
    // Etiqueta del acuerdo
    page.drawText(`${i}.`, {
      x: 50,
      y: yPosition,
      size: 11,
      font: font,
      color: textColor,
    })
    
    // Campo de texto editable
    const textField = form.createTextField(`acuerdo_${i}`)
    textField.setText(session[`acuerdo_${i}`] || '')
    textField.addToPage(page, {
      x: 70,
      y: yPosition - 15,
      width: width - 140,
      height: 40,
      borderWidth: 1,
      borderColor: rgb(0.7, 0.7, 0.7),
    })
    
    yPosition -= 55
  }
  
  yPosition -= 15
  
  // Métodos de Responsabilidad Personal
  page.drawText('Métodos de Responsabilidad Personal', {
    x: 50,
    y: yPosition,
    size: 14,
    font: fontBold,
    color: primaryColor,
  })
  yPosition -= 25
  
  // Crear campos de texto editables para los métodos
  for (let i = 1; i <= 3; i++) {
    page.drawText(`${i}.`, {
      x: 50,
      y: yPosition,
      size: 11,
      font: font,
      color: textColor,
    })
    
    const textField = form.createTextField(`metodo_${i}`)
    textField.setText(session[`metodo_responsabilidad_${i}`] || '')
    textField.addToPage(page, {
      x: 70,
      y: yPosition - 15,
      width: width - 140,
      height: 40,
      borderWidth: 1,
      borderColor: rgb(0.7, 0.7, 0.7),
    })
    
    yPosition -= 55
  }
  
  // Footer con información del coach
  page.drawText('Mariett Alcayaga - Health Coach', {
    x: 50,
    y: 40,
    size: 9,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  })
  
  // Guardar el PDF
  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}

/**
 * Descarga el PDF generado
 */
export function downloadPDF(pdfBytes, filename) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
