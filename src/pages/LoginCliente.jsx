import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginCliente() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signIn(email, password)
      if (result.role === 'coach') {
        navigate('/dashboard')
      } else {
        navigate('/portal')
      }
    } catch (e) {
      setError('Email o contraseña incorrectos.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f4ea] to-[#b8d9ed] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1e3a5f] rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-2xl font-bold">MA</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Portal de Clientes</h1>
          <p className="text-neutral-500 text-sm mt-1">Mariett Alcayaga · Health Coach</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium text-neutral-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1e3a5f] text-white py-3 rounded-lg font-medium hover:bg-[#2e5c8a] transition-colors disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar a mi portal'}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-4">
          ¿Tienes un código de invitación?{' '}
          <a href="/registro" className="text-[#1e3a5f] font-medium hover:underline">
            Activa tu cuenta
          </a>
        </p>
      </div>
    </div>
  )
}
