import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { validarCodigo, usarInvitacion } from '../lib/invitaciones'
import { db } from '../lib/firebase'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { doc, updateDoc } from 'firebase/firestore'

export default function RegistroCliente() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { registerCliente } = useAuth()

  const [paso, setPaso] = useState(1) // 1: ingresar código, 2: crear cuenta
  const [codigo, setCodigo] = useState(searchParams.get('codigo') || '')
  const [invitacion, setInvitacion] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Si viene con código en URL, validar automáticamente
  useEffect(() => {
    if (searchParams.get('codigo')) {
      handleValidarCodigo(searchParams.get('codigo'))
    }
  }, [])

  const handleValidarCodigo = async (codigoAValidar = codigo) => {
    setError('')
    setLoading(true)
    try {
      const inv = await validarCodigo(codigoAValidar)
      if (!inv) {
        setError('Código inválido o expirado. Revisa el email de invitación.')
        setLoading(false)
        return
      }
      setInvitacion(inv)
      setEmail(inv.email)
      setPaso(2)
    } catch (e) {
      setError('Error al validar el código. Intenta nuevamente.')
    }
    setLoading(false)
  }

  const handleRegistro = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      const cred = await registerCliente(email, password)
      const uid = cred.user.uid

      // Marcar invitación como usada
      await usarInvitacion(invitacion.id, uid)

      // Vincular uid al cliente en Firestore
      await updateDoc(doc(db, 'clientes', invitacion.cliente_id), {
        uid_cliente: uid,
        portal_activo: true,
      })

      // Asignar custom claim role:'cliente' via Cloud Function
      try {
        const functions = getFunctions()
        const asignarRol = httpsCallable(functions, 'asignarRolCliente')
        await asignarRol()
        // Refrescar token para que el claim surta efecto
        await cred.user.getIdToken(true)
      } catch (fnErr) {
        console.warn('Cloud Function no disponible aún:', fnErr.message)
        // El rol se asignará en el próximo login cuando la función esté desplegada
      }

      navigate('/portal')
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        setError('Este email ya tiene una cuenta. Intenta iniciar sesión.')
      } else {
        setError('Error al crear la cuenta: ' + e.message)
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f4ea] to-[#b8d9ed] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1e3a5f] rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-2xl font-bold">MA</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Mariett Alcayaga</h1>
          <p className="text-neutral-500 text-sm mt-1">Health Coach</p>
        </div>

        {paso === 1 && (
          <>
            <h2 className="text-xl font-semibold text-[#1e3a5f] mb-2 text-center">
              Activa tu cuenta
            </h2>
            <p className="text-neutral-600 text-sm text-center mb-6">
              Ingresa el código de invitación que recibiste por email de Mariett.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Código de invitación
              </label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="Ej: ABC123"
                maxLength={6}
                className="w-full border border-neutral-300 rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
              />
            </div>

            <button
              onClick={() => handleValidarCodigo()}
              disabled={loading || codigo.length < 6}
              className="w-full bg-[#1e3a5f] text-white py-3 rounded-lg font-medium hover:bg-[#2e5c8a] transition-colors disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Verificar código'}
            </button>

            <p className="text-center text-sm text-neutral-500 mt-4">
              ¿Ya tienes cuenta?{' '}
              <a href="/login-cliente" className="text-[#1e3a5f] font-medium hover:underline">
                Inicia sesión
              </a>
            </p>
          </>
        )}

        {paso === 2 && invitacion && (
          <>
            <div className="bg-[#e8f4ea] rounded-lg p-3 mb-6 text-center">
              <p className="text-[#1e3a5f] font-medium">¡Hola, {invitacion.nombre_cliente}!</p>
              <p className="text-sm text-neutral-600">Crea tu contraseña para acceder a tu portal.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleRegistro} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1e3a5f] text-white py-3 rounded-lg font-medium hover:bg-[#2e5c8a] transition-colors disabled:opacity-50"
              >
                {loading ? 'Creando cuenta...' : 'Crear mi cuenta'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
