import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NuevoCliente from './pages/NuevoCliente'
import FichaCliente from './pages/FichaCliente'
import LoginCliente from './pages/LoginCliente'
import RegistroCliente from './pages/RegistroCliente'
import PortalPaciente from './pages/PortalPaciente'
import ContratoFirmar from './pages/ContratoFirmar'

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-neutral-600">Cargando...</p>
      </div>
    </div>
  )
}

function CoachRoute({ children }) {
  const { user, role, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" />
  if (role === 'cliente') return <Navigate to="/portal" />
  return children
}

function ClienteRoute({ children }) {
  const { user, role, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login-cliente" />
  if (role === 'coach') return <Navigate to="/dashboard" />
  return children
}

function PublicRoute({ children }) {
  const { user, role, loading } = useAuth()
  if (loading) return <Spinner />
  if (user && role === 'coach') return <Navigate to="/dashboard" />
  if (user && role === 'cliente') return <Navigate to="/portal" />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas del coach */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/dashboard" element={<CoachRoute><Dashboard /></CoachRoute>} />
          <Route path="/clientes/nuevo" element={<CoachRoute><NuevoCliente /></CoachRoute>} />
          <Route path="/clientes/:id" element={<CoachRoute><FichaCliente /></CoachRoute>} />

          {/* Rutas del cliente */}
          <Route path="/login-cliente" element={<PublicRoute><LoginCliente /></PublicRoute>} />
          <Route path="/registro" element={<RegistroCliente />} />
          <Route path="/portal" element={<ClienteRoute><PortalPaciente /></ClienteRoute>} />

          {/* Rutas públicas */}
          <Route path="/contrato/:contratoId/firmar" element={<ContratoFirmar />} />

          {/* Redirecciones */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
