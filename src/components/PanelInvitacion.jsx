import { useState, useEffect } from 'react'
import { crearInvitacion, getInvitacionCliente } from '../lib/invitaciones'
import { enviarInvitacion } from '../lib/emailService'
import { db } from '../lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { Mail, Copy, CheckCircle, UserPlus, Circle } from 'lucide-react'

export default function PanelInvitacion({ cliente }) {
  const [invitacion, setInvitacion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generando, setGenerando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [ruedaInicialActiva, setRuedaInicialActiva] = useState(
    cliente?.rueda_inicial_activa || false
  )
  const [ruedaFinalActiva, setRuedaFinalActiva] = useState(
    cliente?.rueda_final_activa || false
  )

  useEffect(() => {
    cargarInvitacion()
  }, [cliente.id])

  const cargarInvitacion = async () => {
    const inv = await getInvitacionCliente(cliente.id)
    setInvitacion(inv)
    setLoading(false)
  }

  const handleGenerarInvitacion = async () => {
    setGenerando(true)
    try {
      const inv = await crearInvitacion(cliente.id, cliente.email, cliente.nombre)
      await cargarInvitacion()
    } catch (e) {
      alert('Error al generar invitación: ' + e.message)
    }
    setGenerando(false)
  }

  const handleEnviarEmail = async () => {
    if (!invitacion) return
    setEnviando(true)
    try {
      await enviarInvitacion({
        emailCliente: cliente.email,
        nombreCliente: cliente.nombre,
        codigo: invitacion.codigo,
      })
      alert(`✅ Invitación enviada a ${cliente.email}`)
    } catch (e) {
      alert('Error al enviar email. Verifica la configuración de EmailJS.\n' + e.message)
    }
    setEnviando(false)
  }

  const handleCopiarCodigo = () => {
    navigator.clipboard.writeText(invitacion.codigo)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const handleToggleRueda = async (tipo, valor) => {
    try {
      await updateDoc(doc(db, 'clientes', cliente.id), {
        [`rueda_${tipo}_activa`]: valor,
      })
      if (tipo === 'inicial') setRuedaInicialActiva(valor)
      if (tipo === 'final') setRuedaFinalActiva(valor)
    } catch (e) {
      alert('Error: ' + e.message)
    }
  }

  const linkRegistro = invitacion
    ? `${window.location.origin}/registro?codigo=${invitacion.codigo}`
    : ''

  return (
    <div className="space-y-4">
      {/* Estado del portal */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
          <UserPlus size={18} />
          Portal del cliente
        </h3>

        {cliente.portal_activo ? (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg p-3">
            <CheckCircle size={18} />
            <span className="text-sm font-medium">Portal activado · {cliente.email}</span>
          </div>
        ) : loading ? (
          <p className="text-sm text-neutral-500">Cargando...</p>
        ) : !invitacion ? (
          <div>
            <p className="text-sm text-neutral-600 mb-3">
              Genera un código de invitación para que <strong>{cliente.nombre}</strong> pueda
              crear su cuenta en el portal.
            </p>
            <button
              onClick={handleGenerarInvitacion}
              disabled={generando}
              className="bg-[#1e3a5f] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#2e5c8a] transition-colors disabled:opacity-50"
            >
              {generando ? 'Generando...' : 'Generar código de invitación'}
            </button>
          </div>
        ) : invitacion.usado ? (
          <div className="flex items-center gap-2 text-blue-700 bg-blue-50 rounded-lg p-3">
            <CheckCircle size={18} />
            <span className="text-sm font-medium">Código utilizado · Cuenta creada</span>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-neutral-600">
              Código generado. Envíalo a {cliente.nombre}:
            </p>
            {/* Código grande */}
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-[#f0f4f8] rounded-lg px-4 py-3 text-center">
                <span className="text-3xl font-mono font-bold tracking-widest text-[#1e3a5f]">
                  {invitacion.codigo}
                </span>
              </div>
              <button
                onClick={handleCopiarCodigo}
                className="bg-neutral-100 hover:bg-neutral-200 px-4 py-3 rounded-lg transition-colors"
                title="Copiar código"
              >
                {copiado ? <CheckCircle size={18} className="text-green-600" /> : <Copy size={18} />}
              </button>
            </div>
            {/* Link directo */}
            <div>
              <p className="text-xs text-neutral-500 mb-1">O comparte el enlace directo:</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={linkRegistro}
                  className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-xs font-mono"
                />
                <button
                  onClick={() => { navigator.clipboard.writeText(linkRegistro); alert('¡Enlace copiado!') }}
                  className="bg-neutral-100 hover:bg-neutral-200 px-3 py-2 rounded-lg text-xs transition-colors"
                >
                  Copiar
                </button>
              </div>
            </div>
            {/* Botón enviar email */}
            <button
              onClick={handleEnviarEmail}
              disabled={enviando}
              className="flex items-center gap-2 bg-[#7c9885] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#5a7a63] transition-colors disabled:opacity-50"
            >
              <Mail size={16} />
              {enviando ? 'Enviando...' : `Enviar invitación por email`}
            </button>
          </div>
        )}
      </div>

      {/* Control de Ruedas del Bienestar */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
          <Circle size={18} />
          Rueda del Bienestar
        </h3>
        <div className="space-y-3">
          <ToggleRueda
            label="Rueda Inicial"
            descripcion="El cliente podrá completarla en su portal"
            activa={ruedaInicialActiva}
            onChange={(v) => handleToggleRueda('inicial', v)}
          />
          <ToggleRueda
            label="Rueda Final"
            descripcion="Activa al final del proceso para comparar progreso"
            activa={ruedaFinalActiva}
            onChange={(v) => handleToggleRueda('final', v)}
          />
        </div>
        {!cliente.portal_activo && (
          <p className="text-xs text-neutral-400 mt-3">
            ⚠️ El cliente debe tener portal activo para ver las ruedas.
          </p>
        )}
      </div>
    </div>
  )
}

function ToggleRueda({ label, descripcion, activa, onChange }) {
  return (
    <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
      <div>
        <p className="text-sm font-medium text-neutral-800">{label}</p>
        <p className="text-xs text-neutral-500">{descripcion}</p>
      </div>
      <button
        onClick={() => onChange(!activa)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          activa ? 'bg-[#7c9885]' : 'bg-neutral-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            activa ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}
