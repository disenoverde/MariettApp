import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db } from '../lib/firebase'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { enviarConfirmacionFirma } from '../lib/emailService'
import ContratoVisor from '../components/ContratoVisor'
import { CheckCircle } from 'lucide-react'

export default function ContratoFirmar() {
  const { contratoId } = useParams()
  const navigate = useNavigate()
  const [contrato, setContrato] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [aceptoTerminos, setAceptoTerminos] = useState(false)
  const [nombreFirma, setNombreFirma] = useState('')
  const [firmando, setFirmando] = useState(false)
  const [firmado, setFirmado] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      try {
        const snap = await getDoc(doc(db, 'contratos', contratoId))
        if (!snap.exists()) {
          setError('Contrato no encontrado.')
          setLoading(false)
          return
        }
        const data = snap.data()
        if (data.estado === 'firmado') {
          setFirmado(true)
        }
        if (data.expires_at && data.expires_at.toDate() < new Date()) {
          setError('Este enlace de firma ha expirado.')
          setLoading(false)
          return
        }
        setContrato({ id: snap.id, ...data })
      } catch (e) {
        setError('Error al cargar el contrato.')
      }
      setLoading(false)
    }
    cargar()
  }, [contratoId])

  const handleFirmar = async () => {
    if (!aceptoTerminos) {
      alert('Debes aceptar los términos para firmar.')
      return
    }
    if (!nombreFirma.trim() || nombreFirma.trim().length < 3) {
      alert('Ingresa tu nombre completo para firmar.')
      return
    }

    setFirmando(true)
    try {
      const fechaFirma = new Date().toLocaleDateString('es-CL', {
        day: 'numeric', month: 'long', year: 'numeric'
      })

      await updateDoc(doc(db, 'contratos', contratoId), {
        estado: 'firmado',
        firmado_por: nombreFirma.trim(),
        fecha_firma: serverTimestamp(),
        acepto_terminos: true,
        ip_firma: 'Registrada', // En producción usar un endpoint para capturar la IP real
      })

      // Enviar emails de confirmación
      try {
        await enviarConfirmacionFirma({
          emailCliente: contrato.email_cliente,
          nombreCliente: nombreFirma.trim(),
          emailCoach: null,
          fechaFirma,
        })
      } catch (emailErr) {
        console.warn('Email de confirmación no enviado:', emailErr)
      }

      setFirmado(true)
    } catch (e) {
      alert('Error al firmar el contrato: ' + e.message)
    }
    setFirmando(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e3a5f]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 text-center max-w-md shadow">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-neutral-700">{error}</p>
        </div>
      </div>
    )
  }

  if (firmado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e8f4ea] to-[#b8d9ed] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-10 text-center max-w-md shadow-xl">
          <CheckCircle className="text-green-500 mx-auto mb-4" size={56} />
          <h2 className="text-2xl font-bold text-[#1e3a5f] mb-3">¡Contrato firmado!</h2>
          <p className="text-neutral-600 mb-2">
            Has firmado exitosamente el Acuerdo del Programa de Coaching con Mariett Alcayaga.
          </p>
          <p className="text-sm text-neutral-500">
            Recibirás una copia por email. ¡Bienvenida al proceso! 🌿
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#1e3a5f] rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl font-bold">MA</span>
          </div>
          <h1 className="text-xl font-bold text-[#1e3a5f]">Mariett Alcayaga · Health Coach</h1>
          <p className="text-neutral-500 text-sm mt-1">Acuerdo del Programa de Coaching</p>
        </div>

        {/* Contrato */}
        <ContratoVisor contrato={contrato} cliente={{ nombre: contrato?.nombre_cliente }} />

        {/* Formulario de firma */}
        <div className="bg-white rounded-xl p-6 mt-4 shadow-sm border border-neutral-100">
          <h3 className="font-semibold text-[#1e3a5f] mb-4">Firma el contrato</h3>

          <label className="flex items-start gap-3 cursor-pointer mb-5">
            <input
              type="checkbox"
              checked={aceptoTerminos}
              onChange={(e) => setAceptoTerminos(e.target.checked)}
              className="mt-1 w-4 h-4 accent-[#1e3a5f]"
            />
            <span className="text-sm text-neutral-700">
              He leído y acepto íntegramente los términos y condiciones del Acuerdo del Programa
              de Coaching descrito anteriormente.
            </span>
          </label>

          <div className="mb-5">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Escribe tu nombre completo para firmar
            </label>
            <input
              type="text"
              value={nombreFirma}
              onChange={(e) => setNombreFirma(e.target.value)}
              placeholder="Nombre completo"
              className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            />
          </div>

          <button
            onClick={handleFirmar}
            disabled={firmando || !aceptoTerminos || !nombreFirma.trim()}
            className="w-full bg-[#1e3a5f] text-white py-3 rounded-lg font-medium hover:bg-[#2e5c8a] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} />
            {firmando ? 'Firmando...' : 'Firmar Contrato'}
          </button>

          <p className="text-center text-xs text-neutral-400 mt-3">
            Tu firma digital tiene validez legal. Se registrará la fecha y hora del proceso.
          </p>
        </div>
      </div>
    </div>
  )
}
