import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db } from '../lib/firebase'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { ArrowLeft, User, Heart, Target, FileText, Circle, UserPlus, Edit, Save, X } from 'lucide-react'
import HistoriaSalud from '../components/HistoriaSalud'
import Objetivos from '../components/Objetivos'
import Sesiones from '../components/Sesiones'
import RuedaBienestar from '../components/RuedaBienestar'
import ContratoTab from '../components/ContratoTab'
import PanelInvitacion from '../components/PanelInvitacion'

export default function FichaCliente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cliente, setCliente] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')
  const [editando, setEditando] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [guardando, setGuardando] = useState(false)

  const handleEditar = () => {
    setEditForm({
      nombre: cliente.nombre || '',
      email: cliente.email || '',
      celular: cliente.celular || '',
      fecha_nacimiento: cliente.fecha_nacimiento || '',
      edad: cliente.edad || '',
      ocupacion: cliente.ocupacion || '',
    })
    setEditando(true)
  }

  const handleGuardar = async () => {
    setGuardando(true)
    try {
      await updateDoc(doc(db, 'clientes', id), editForm)
      setEditando(false)
    } catch (e) {
      alert('Error al guardar: ' + e.message)
    }
    setGuardando(false)
  }

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'clientes', id),
      (snap) => {
        if (snap.exists()) {
          setCliente({ id: snap.id, ...snap.data() })
        } else {
          setCliente(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error cargando cliente:', error)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [id])

  const tabs = [
    { id: 'info', label: 'Información', icon: User },
    { id: 'historia', label: 'Historia de Salud', icon: Heart },
    { id: 'objetivos', label: 'Objetivos', icon: Target },
    { id: 'sesiones', label: 'Sesiones', icon: FileText },
    { id: 'rueda', label: 'Rueda del Bienestar', icon: Circle },
    { id: 'contrato', label: 'Contrato', icon: FileText },
    { id: 'portal', label: 'Portal', icon: UserPlus },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-neutral-600">Cargando cliente...</p>
        </div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-neutral-600 mb-4">Cliente no encontrado</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-neutral-600 hover:text-primary transition-colors mb-3"
          >
            <ArrowLeft size={20} />
            Volver al Dashboard
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center">
              <User className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">{cliente.nombre}</h1>
              <p className="text-neutral-600">{cliente.email}</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 border-b border-neutral-200 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition-colors text-sm ${
                    activeTab === tab.id
                      ? 'border-primary text-primary font-medium'
                      : 'border-transparent text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {activeTab === 'info' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2>Información Personal</h2>
              {!editando ? (
                <button
                  onClick={handleEditar}
                  className="flex items-center gap-2 text-sm bg-neutral-100 hover:bg-neutral-200 px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  <Edit size={16} />
                  Editar
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditando(false)}
                    className="flex items-center gap-2 text-sm bg-neutral-100 hover:bg-neutral-200 px-4 py-2 rounded-lg transition-colors"
                  >
                    <X size={16} />
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardar}
                    disabled={guardando}
                    className="flex items-center gap-2 text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <Save size={16} />
                    {guardando ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              )}
            </div>

            {!editando ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre completo</label>
                  <p className="text-neutral-900">{cliente.nombre}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                  <p className="text-neutral-900">{cliente.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Celular</label>
                  <p className="text-neutral-900">{cliente.celular || 'No especificado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Fecha de nacimiento</label>
                  <p className="text-neutral-900">
                    {cliente.fecha_nacimiento
                      ? new Date(cliente.fecha_nacimiento).toLocaleDateString('es-ES')
                      : 'No especificada'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Edad</label>
                  <p className="text-neutral-900">{cliente.edad || 'No especificada'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Ocupación</label>
                  <p className="text-neutral-900">{cliente.ocupacion || 'No especificada'}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre completo</label>
                  <input
                    type="text"
                    value={editForm.nombre}
                    onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Celular</label>
                  <input
                    type="text"
                    value={editForm.celular}
                    onChange={(e) => setEditForm({ ...editForm, celular: e.target.value })}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Fecha de nacimiento</label>
                  <input
                    type="date"
                    value={editForm.fecha_nacimiento}
                    onChange={(e) => setEditForm({ ...editForm, fecha_nacimiento: e.target.value })}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Edad</label>
                  <input
                    type="number"
                    value={editForm.edad}
                    onChange={(e) => setEditForm({ ...editForm, edad: e.target.value })}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Ocupación</label>
                  <input
                    type="text"
                    value={editForm.ocupacion}
                    onChange={(e) => setEditForm({ ...editForm, ocupacion: e.target.value })}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'historia' && <HistoriaSalud clienteId={id} />}
        {activeTab === 'objetivos' && <Objetivos clienteId={id} />}
        {activeTab === 'sesiones' && <Sesiones clienteId={id} cliente={cliente} />}
        {activeTab === 'rueda' && <RuedaBienestar clienteId={id} cliente={cliente} />}
        {activeTab === 'contrato' && <ContratoTab clienteId={id} cliente={cliente} />}
        {activeTab === 'portal' && <PanelInvitacion cliente={cliente} />}
      </main>
    </div>
  )
}
