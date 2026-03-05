import { useState, useEffect } from 'react'
import { db } from '../lib/firebase'
import {
  collection, query, where, getDocs, doc, setDoc,
  serverTimestamp, Timestamp, updateDoc
} from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import { enviarNotificacionContrato } from '../lib/emailService'
import { FileText, Send, CheckCircle, Clock, Download } from 'lucide-react'
import ContratoVisor from './ContratoVisor'

export default function ContratoTab({ clienteId, cliente }) {
  const { user } = useAuth()
  const [contrato, setContrato] = useState(null)
  const [loading, setLoading] = useState(true)
  const [creando, setCreando] = useState(false)
  const [enviando, setEnviando] = useState(false)

  // Campos del formulario
  const [numeroSesiones, setNumeroSesiones] = useState('8')
  const [monto, setMonto] = useState('')
  const [fechaAcuerdo, setFechaAcuerdo] = useState(
    new Date().toISOString().split('T')[0]
  )

  useEffect(() => {
    cargarContrato()
  }, [clienteId])

  const cargarContrato = async () => {
    const q = query(collection(db, 'contratos'), where('cliente_id', '==', clienteId))
    const snap = await getDocs(q)
    if (!snap.empty) {
      setContrato({ id: snap.docs[0].id, ...snap.docs[0].data() })
    }
    setLoading(false)
  }

  const handleCrear = async () => {
    if (!numeroSesiones || !monto || !fechaAcuerdo) {
      alert('Completa todos los campos antes de crear el contrato.')
      return
    }
    setCreando(true)
    try {
      const expires = new Date()
      expires.setDate(expires.getDate() + 30)
      const contratoRef = doc(collection(db, 'contratos'))
      const nuevoContrato = {
        cliente_id: clienteId,
        coach_id: user.uid,
        nombre_cliente: cliente.nombre,
        email_cliente: cliente.email,
        numero_sesiones: parseInt(numeroSesiones),
        monto,
        fecha_acuerdo: fechaAcuerdo,
        estado: 'pendiente_firma',
        created_at: serverTimestamp(),
        expires_at: Timestamp.fromDate(expires),
      }
      await setDoc(contratoRef, nuevoContrato)
      setContrato({ id: contratoRef.id, ...nuevoContrato })
    } catch (e) {
      alert('Error al crear el contrato: ' + e.message)
    }
    setCreando(false)
  }

  const handleEnviar = async () => {
    if (!contrato) return
    setEnviando(true)
    try {
      await enviarNotificacionContrato({
        emailCliente: cliente.email,
        nombreCliente: cliente.nombre,
        contratoId: contrato.id,
      })
      await updateDoc(doc(db, 'contratos', contrato.id), {
        email_enviado_at: serverTimestamp(),
      })
      alert(`✅ Email enviado a ${cliente.email}`)
    } catch (e) {
      alert('Error al enviar email. Verifica la configuración de EmailJS.\n' + e.message)
    }
    setEnviando(false)
  }

  if (loading) return <div className="p-8 text-center text-neutral-500">Cargando...</div>

  // Ya existe contrato firmado
  if (contrato?.estado === 'firmado') {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
          <div>
            <p className="font-medium text-green-800">Contrato firmado</p>
            <p className="text-sm text-green-600">
              Firmado por {contrato.firmado_por} el{' '}
              {contrato.fecha_firma?.toDate?.()?.toLocaleDateString('es-CL') || '—'}
            </p>
          </div>
        </div>
        <ContratoVisor contrato={contrato} cliente={cliente} />
      </div>
    )
  }

  // Contrato pendiente de firma
  if (contrato?.estado === 'pendiente_firma') {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <Clock className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="font-medium text-yellow-800">Pendiente de firma del cliente</p>
            <p className="text-sm text-yellow-700 mt-1">
              {contrato.numero_sesiones} sesiones · {contrato.monto} · Fecha: {contrato.fecha_acuerdo}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-neutral-600 mb-3">
            Comparte el enlace de firma con {cliente.nombre}:
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={`${window.location.origin}/contrato/${contrato.id}/firmar`}
              className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm font-mono"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/contrato/${contrato.id}/firmar`)
                alert('¡Enlace copiado!')
              }}
              className="bg-neutral-100 hover:bg-neutral-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Copiar
            </button>
          </div>

          <button
            onClick={handleEnviar}
            disabled={enviando}
            className="mt-4 flex items-center gap-2 bg-[#1e3a5f] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#2e5c8a] transition-colors disabled:opacity-50"
          >
            <Send size={16} />
            {enviando ? 'Enviando...' : 'Enviar email al cliente'}
          </button>
        </div>

        <ContratoVisor contrato={contrato} cliente={cliente} />
      </div>
    )
  }

  // Sin contrato: formulario de creación
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="text-[#1e3a5f]" size={24} />
        <div>
          <h3 className="font-semibold text-[#1e3a5f]">Crear Contrato</h3>
          <p className="text-sm text-neutral-500">Completa los datos para generar el acuerdo de coaching</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Número de sesiones
          </label>
          <input
            type="number"
            value={numeroSesiones}
            onChange={(e) => setNumeroSesiones(e.target.value)}
            min="1"
            className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Monto total del programa
          </label>
          <input
            type="text"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="Ej: $300.000"
            className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Fecha del acuerdo
          </label>
          <input
            type="date"
            value={fechaAcuerdo}
            onChange={(e) => setFechaAcuerdo(e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
          />
        </div>

        <button
          onClick={handleCrear}
          disabled={creando}
          className="w-full bg-[#1e3a5f] text-white py-3 rounded-lg font-medium hover:bg-[#2e5c8a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <FileText size={18} />
          {creando ? 'Creando...' : 'Crear y preparar contrato'}
        </button>
      </div>
    </div>
  )
}
