// Texto completo del contrato en HTML con campos dinámicos
export default function ContratoVisor({ contrato, cliente, portalMode = false }) {
  const nombre = contrato?.nombre_cliente || cliente?.nombre || '___________________'
  const sesiones = contrato?.numero_sesiones || '________'
  const monto = contrato?.monto || '__________________'
  const fecha = contrato?.fecha_acuerdo
    ? new Date(contrato.fecha_acuerdo + 'T12:00:00').toLocaleDateString('es-CL', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
    : '______________________'
  const firmadoPor = contrato?.firmado_por || null
  const fechaFirma = contrato?.fecha_firma?.toDate?.()?.toLocaleDateString('es-CL', {
    day: 'numeric', month: 'long', year: 'numeric'
  }) || null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
      <div className="bg-[#f0f4f8] px-6 py-3 border-b border-neutral-200 flex items-center justify-between">
        <span className="text-sm font-medium text-[#1e3a5f]">Acuerdo del Programa de Coaching</span>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          contrato?.estado === 'firmado'
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {contrato?.estado === 'firmado' ? '✅ Firmado' : '⏳ Pendiente de firma'}
        </span>
      </div>

      <div className="p-8 max-w-2xl mx-auto font-['Georgia',serif] text-[15px] leading-relaxed text-neutral-800">
        <h1 className="text-2xl font-bold text-[#1e3a5f] mb-6 text-center">
          Acuerdo del Programa de Coaching
        </h1>

        <p className="mb-6">
          Entre Mariett Alcayaga, en adelante "la Coach", y{' '}
          <strong>{nombre}</strong>, en adelante "el Cliente", se celebra el presente acuerdo con
          el propósito de establecer los términos y condiciones del Proceso de Coaching.
        </p>

        <Section title="1. Propósito del proceso">
          El presente proceso tiene como finalidad acompañar al Cliente en su desarrollo personal
          y bienestar integral, promoviendo la toma de conciencia, la creación de hábitos
          saludables y el equilibrio en las distintas áreas de su vida.
        </Section>

        <Section title="2. Naturaleza del coaching">
          El coaching es un proceso de acompañamiento basado en la conversación consciente, la
          reflexión y la acción. No constituye terapia psicológica, tratamiento médico, diagnóstico
          ni asesoramiento profesional de otro tipo. En caso de requerirse atención especializada,
          la Coach podrá sugerir la derivación a un profesional pertinente.
        </Section>

        <Section title="3. Confidencialidad">
          La Coach mantendrá la privacidad de la información del Cliente y no compartirá su
          información con ningún tercero sin el consentimiento por escrito del Cliente.
          <br /><br />
          La Coach no divulgará el nombre del Cliente ni hará referencia o uso del mismo en
          ningún material de marketing sin el consentimiento por escrito del Cliente.
        </Section>

        <Section title="4. Duración y modalidad">
          El proceso constará de <strong>{sesiones} sesiones</strong> de 60 minutos, realizadas
          de forma online. Las fechas y horarios serán acordados previamente entre ambas partes.
          <br /><br />
          El Cliente podrá contactar al Coach vía WhatsApp durante todo el programa de coaching.
        </Section>

        <Section title="5. Compromiso de ambas partes">
          La Coach se compromete a ofrecer un espacio seguro, respetuoso y libre de juicios,
          acompañando al Cliente desde la escucha activa y el compromiso profesional.
          <br /><br />
          El Cliente se compromete a asistir puntualmente a las sesiones, participar activamente
          y asumir la responsabilidad de su propio proceso de cambio y bienestar.
        </Section>

        <Section title="6. Reprogramaciones y cancelaciones">
          Las sesiones podrán ser reprogramadas con un aviso mínimo de 24 horas. La cancelación
          fuera de ese plazo o la inasistencia sin aviso será considerada como sesión realizada.
        </Section>

        <Section title="7. Honorarios y forma de pago">
          El valor total del programa de coaching es de <strong>{monto}</strong>, monto que deberá
          ser pagado en su totalidad al inicio del programa mediante transferencia electrónica.
        </Section>

        <Section title="8. Consentimiento informado">
          El Cliente declara haber leído y comprendido los términos de este acuerdo, y acepta
          voluntariamente iniciar el Proceso de Coaching bajo las condiciones aquí establecidas.
        </Section>

        {/* Firmas */}
        <div className="mt-10 pt-6 border-t border-neutral-200">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-neutral-500 mb-1">Firma de la Coach:</p>
              <div className="border-b border-neutral-400 h-10 flex items-end pb-1">
                <span className="text-[#1e3a5f] italic font-medium">Mariett Alcayaga</span>
              </div>
              <p className="text-sm text-neutral-500 mt-2">Nombre: Mariett Alcayaga</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-1">Firma del Cliente:</p>
              <div className="border-b border-neutral-400 h-10 flex items-end pb-1">
                {firmadoPor ? (
                  <span className="text-[#1e3a5f] italic font-medium">{firmadoPor}</span>
                ) : (
                  <span className="text-neutral-300 italic text-sm">Pendiente</span>
                )}
              </div>
              <p className="text-sm text-neutral-500 mt-2">Nombre: {firmadoPor || nombre}</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-neutral-500">Fecha de acuerdo: <strong>{fecha}</strong></p>
            {firmadoPor && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                ✅ Firmado digitalmente por <strong>{firmadoPor}</strong> el {fechaFirma}
                {contrato?.ip_firma && (
                  <span className="text-green-600"> · IP: {contrato.ip_firma}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Logo */}
        <div className="mt-8 text-center">
          <p className="text-[#1e3a5f] font-semibold italic text-lg">Mariett Alcayaga</p>
          <p className="text-neutral-500 text-sm">Health Coach</p>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <p className="font-bold text-neutral-900 mb-1">{title}</p>
      <p className="text-neutral-700 leading-relaxed">{children}</p>
    </div>
  )
}
