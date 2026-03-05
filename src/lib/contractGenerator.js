import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

/**
 * Genera un PDF editable del Acuerdo de Coaching
 * Basado en el documento oficial de Mariett Alcayaga
 */
export async function generateContractPDF(contractData, cliente, logoBase64 = null) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([612, 792]) // Letter size
  const { width, height } = page.getSize()
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  const primaryColor = rgb(0.118, 0.227, 0.373) // #1e3a5f
  const textColor = rgb(0.2, 0.2, 0.2)
  
  let yPosition = height - 60
  
  // Logo
  if (logoBase64) {
    try {
      const logoImage = await pdfDoc.embedPng(logoBase64)
      const logoDims = logoImage.scale(0.25)
      page.drawImage(logoImage, {
        x: width - logoDims.width - 50,
        y: yPosition - logoDims.height,
        width: logoDims.width,
        height: logoDims.height,
      })
    } catch (error) {
      console.error('Error al cargar logo:', error)
    }
  }
  
  // Título
  page.drawText('Acuerdo del Programa de Coaching', {
    x: 50,
    y: yPosition,
    size: 18,
    font: fontBold,
    color: primaryColor,
  })
  yPosition -= 50
  
  // Introducción
  const intro = `Entre Mariett Alcayaga, en adelante "la Coach", y ${cliente.nombre || '___________________'}, en\nadelante "el Cliente", se celebra el presente acuerdo con el propósito de establecer\nlos términos y condiciones del Proceso de Coaching.`
  
  const introLines = intro.split('\n')
  introLines.forEach(line => {
    page.drawText(line, {
      x: 50,
      y: yPosition,
      size: 11,
      font: font,
      color: textColor,
    })
    yPosition -= 16
  })
  yPosition -= 10
  
  // Crear formulario para campos editables
  const form = pdfDoc.getForm()
  
  // Sección 1: Propósito del proceso
  page.drawText('1. Propósito del proceso', {
    x: 50,
    y: yPosition,
    size: 12,
    font: fontBold,
    color: primaryColor,
  })
  yPosition -= 18
  
  const proposito = 'El presente proceso tiene como finalidad acompañar al Cliente en su desarrollo\npersonal y bienestar integral, promoviendo la toma de conciencia, la creación de\nhábitos saludables y el equilibrio en las distintas áreas de su vida.'
  proposito.split('\n').forEach(line => {
    page.drawText(line, { x: 50, y: yPosition, size: 10, font: font, color: textColor })
    yPosition -= 14
  })
  yPosition -= 10
  
  // Sección 2: Naturaleza del coaching
  page.drawText('2. Naturaleza del coaching', {
    x: 50,
    y: yPosition,
    size: 12,
    font: fontBold,
    color: primaryColor,
  })
  yPosition -= 18
  
  const naturaleza = 'El coaching es un proceso de acompañamiento basado en la conversación\nconsciente, la reflexión y la acción. No constituye terapia psicológica, tratamiento\nmédico, diagnóstico ni asesoramiento profesional de otro tipo. En caso de\nrequerirse atención especializada, la Coach podrá sugerir la derivación a un\nprofesional pertinente.'
  naturaleza.split('\n').forEach(line => {
    page.drawText(line, { x: 50, y: yPosition, size: 10, font: font, color: textColor })
    yPosition -= 14
  })
  yPosition -= 10
  
  // Sección 3: Confidencialidad
  page.drawText('3. Confidencialidad', {
    x: 50,
    y: yPosition,
    size: 12,
    font: fontBold,
    color: primaryColor,
  })
  yPosition -= 18
  
  const confidencialidad = 'La Coach mantendrá la privacidad de la información del Cliente y no compartirá su\ninformación con ningún tercero sin el consentimiento por escrito del Cliente.\nLa Coach no divulgará el nombre del Cliente ni hará referencia o uso del mismo en\nningún material de marketing sin el consentimiento por escrito del Cliente.'
  confidencialidad.split('\n').forEach(line => {
    page.drawText(line, { x: 50, y: yPosition, size: 10, font: font, color: textColor })
    yPosition -= 14
  })
  yPosition -= 10
  
  // Sección 4: Duración y modalidad (con campo editable)
  page.drawText('4. Duración y modalidad', {
    x: 50,
    y: yPosition,
    size: 12,
    font: fontBold,
    color: primaryColor,
  })
  yPosition -= 18
  
  page.drawText('El proceso constará de', { x: 50, y: yPosition, size: 10, font: font, color: textColor })
  
  // Campo editable: número de sesiones
  const sesionesField = form.createTextField('numero_sesiones')
  sesionesField.setText(contractData.numero_sesiones || '')
  sesionesField.addToPage(page, {
    x: 155,
    y: yPosition - 12,
    width: 60,
    height: 18,
    borderWidth: 1,
    borderColor: rgb(0.5, 0.5, 0.5),
  })
  
  page.drawText('sesiones de 60 minutos, realizadas de', { x: 220, y: yPosition, size: 10, font: font, color: textColor })
  yPosition -= 14
  
  page.drawText('forma presencial. Las fechas y horarios serán acordados previamente entre ambas', { x: 50, y: yPosition, size: 10, font: font, color: textColor })
  yPosition -= 14
  page.drawText('partes.', { x: 50, y: yPosition, size: 10, font: font, color: textColor })
  yPosition -= 14
  page.drawText('El Cliente podrá contactar al Coach via WhatsApp durante todo el programa de', { x: 50, y: yPosition, size: 10, font: font, color: textColor })
  yPosition -= 14
  page.drawText('coaching.', { x: 50, y: yPosition, size: 10, font: font, color: textColor })
  yPosition -= 20
  
  // Nueva página para el resto del contrato
  const page2 = pdfDoc.addPage([612, 792])
  yPosition = height - 60
  
  // Sección 5: Compromiso de ambas partes
  page2.drawText('5. Compromiso de ambas partes', {
    x: 50,
    y: yPosition,
    size: 12,
    font: fontBold,
    color: primaryColor,
  })
  yPosition -= 18
  
  const compromiso = 'La Coach se compromete a ofrecer un espacio seguro, respetuoso y libre de juicios,\nacompañando al Cliente desde la escucha activa y el compromiso profesional.\nEl Cliente se compromete a asistir puntualmente a las sesiones, participar\nactivamente y asumir la responsabilidad de su propio proceso de cambio y\nbienestar.'
  compromiso.split('\n').forEach(line => {
    page2.drawText(line, { x: 50, y: yPosition, size: 10, font: font, color: textColor })
    yPosition -= 14
  })
  yPosition -= 10
  
  // Sección 6: Reprogramaciones
  page2.drawText('6. Reprogramaciones y cancelaciones', {
    x: 50,
    y: yPosition,
    size: 12,
    font: fontBold,
    color: primaryColor,
  })
  yPosition -= 18
  
  const reprogramacion = 'Las sesiones podrán ser reprogramadas con un aviso mínimo de 24 horas. La\ncancelación fuera de ese plazo o la inasistencia sin aviso será considerada como\nsesión realizada.'
  reprogramacion.split('\n').forEach(line => {
    page2.drawText(line, { x: 50, y: yPosition, size: 10, font: font, color: textColor })
    yPosition -= 14
  })
  yPosition -= 10
  
  // Sección 7: Honorarios (con campo editable)
  page2.drawText('7. Honorarios y forma de pago', {
    x: 50,
    y: yPosition,
    size: 12,
    font: fontBold,
    color: primaryColor,
  })
  yPosition -= 18
  
  page2.drawText('El valor total del programa de coaching es de', { x: 50, y: yPosition, size: 10, font: font, color: textColor })
  
  // Campo editable: monto
  const montoField = form.createTextField('monto')
  montoField.setText(contractData.monto || '')
  montoField.addToPage(page2, {
    x: 305,
    y: yPosition - 12,
    width: 100,
    height: 18,
    borderWidth: 1,
    borderColor: rgb(0.5, 0.5, 0.5),
  })
  
  page2.drawText('monto que', { x: 410, y: yPosition, size: 10, font: font, color: textColor })
  yPosition -= 14
  
  page2.drawText('deberá ser pagado en su totalidad al inicio del programa mediante transferencia', { x: 50, y: yPosition, size: 10, font: font, color: textColor })
  yPosition -= 14
  page2.drawText('electrónica.', { x: 50, y: yPosition, size: 10, font: font, color: textColor })
  yPosition -= 20
  
  // Sección 8: Consentimiento
  page2.drawText('8. Consentimiento informado', {
    x: 50,
    y: yPosition,
    size: 12,
    font: fontBold,
    color: primaryColor,
  })
  yPosition -= 18
  
  const consentimiento = 'El Cliente declara haber leído y comprendido los términos de este acuerdo, y\nacepta voluntariamente iniciar el Proceso de Coaching bajo las condiciones aquí\nestablecidas.'
  consentimiento.split('\n').forEach(line => {
    page2.drawText(line, { x: 50, y: yPosition, size: 10, font: font, color: textColor })
    yPosition -= 14
  })
  yPosition -= 30
  
  // Campos de firma
  page2.drawText('Firma de la Coach:', { x: 50, y: yPosition, size: 10, font: font, color: textColor })
  page2.drawLine({ start: { x: 160, y: yPosition - 5 }, end: { x: 350, y: yPosition - 5 }, thickness: 1, color: rgb(0.5, 0.5, 0.5) })
  yPosition -= 20
  
  page2.drawText('Nombre:', { x: 50, y: yPosition, size: 10, font: font, color: textColor })
  page2.drawLine({ start: { x: 110, y: yPosition - 5 }, end: { x: 350, y: yPosition - 5 }, thickness: 1, color: rgb(0.5, 0.5, 0.5) })
  yPosition -= 30
  
  page2.drawText('Firma del Cliente:', { x: 50, y: yPosition, size: 10, font: font, color: textColor })
  page2.drawLine({ start: { x: 160, y: yPosition - 5 }, end: { x: 350, y: yPosition - 5 }, thickness: 1, color: rgb(0.5, 0.5, 0.5) })
  yPosition -= 20
  
  page2.drawText('Nombre:', { x: 50, y: yPosition, size: 10, font: font, color: textColor })
  page2.drawLine({ start: { x: 110, y: yPosition - 5 }, end: { x: 350, y: yPosition - 5 }, thickness: 1, color: rgb(0.5, 0.5, 0.5) })
  yPosition -= 30
  
  page2.drawText('Fecha de acuerdo:', { x: 50, y: yPosition, size: 10, font: font, color: textColor })
  
  // Campo editable: fecha
  const fechaField = form.createTextField('fecha_acuerdo')
  fechaField.setText(contractData.fecha_acuerdo || '')
  fechaField.addToPage(page2, {
    x: 170,
    y: yPosition - 12,
    width: 180,
    height: 18,
    borderWidth: 1,
    borderColor: rgb(0.5, 0.5, 0.5),
  })
  
  // Footer
  page2.drawText('Mariett Alcayaga - Health Coach', {
    x: width / 2 - 80,
    y: 40,
    size: 9,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  })
  
  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}

/**
 * Descarga el PDF del contrato
 */
export function downloadContractPDF(pdfBytes, clienteNombre) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Contrato_Coaching_${clienteNombre.replace(/\s+/g, '_')}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}
