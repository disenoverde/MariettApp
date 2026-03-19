import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { Heart, Target, Circle, FileText, LogOut, User } from 'lucide-react'
import HistoriaSalud from '../components/HistoriaSalud'
import Objetivos from '../components/Objetivos'
import RuedaBienestar from '../components/RuedaBienestar'
import ContratoVisor from '../components/ContratoVisor'

export default function PortalPaciente() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [cliente, setCliente] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('bienvenida')
  const [contrato, setContrato] = useState(null)
  const [ruedaInicialActiva, setRuedaInicialActiva] = useState(false)
  const [ruedaFinalActiva, setRuedaFinalActiva] = useState(false)

  useEffect(() => {
    const cargarCliente = async () => {
      if (!user) return
      try {
        const q = query(collection(db, 'clientes'), where('uid_cliente', '==', user.uid))
        const snap = await getDocs(q)
        if (!snap.empty) {
          const clienteData = { id: snap.docs[0].id, ...snap.docs[0].data() }
          setCliente(clienteData)
          setRuedaInicialActiva(clienteData.rueda_inicial_activa || false)
          setRuedaFinalActiva(clienteData.rueda_final_activa || false)
          const contratoQ = query(
            collection(db, 'contratos'),
            where('cliente_id', '==', snap.docs[0].id)
          )
          const contratoSnap = await getDocs(contratoQ)
          if (!contratoSnap.empty) {
            setContrato({ id: contratoSnap.docs[0].id, ...contratoSnap.docs[0].data() })
          }
        }
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    cargarCliente()
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login-cliente')
  }

  const tabs = [
    { id: 'bienvenida', label: 'Inicio',    icon: User },
    { id: 'historia',   label: 'Mi Salud',  icon: Heart },
    { id: 'objetivos',  label: 'Objetivos', icon: Target },
    ...(ruedaInicialActiva || ruedaFinalActiva
      ? [{ id: 'rueda', label: 'Rueda', icon: Circle }]
      : []),
    ...(contrato
      ? [{ id: 'contrato', label: 'Contrato', icon: FileText }]
      : []),
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]"></div>
          <p className="mt-4 text-neutral-600">Cargando tu portal...</p>
        </div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600 mb-4">No se encontró tu perfil. Contacta a Mariett.</p>
          <button onClick={handleSignOut} className="text-[#1e3a5f] underline">Cerrar sesión</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1e3a5f] rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">MA</span>
            </div>
            <div>
              <p className="font-semibold text-[#1e3a5f]">{cliente.nombre}</p>
              <p className="text-xs text-neutral-500">Portal de cliente · Mariett Alcayaga</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-neutral-600 hover:text-red-600 transition-colors text-sm"
          >
            <LogOut size={16} />
            Salir
          </button>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 border-b border-neutral-200 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition-colors text-sm ${
                    activeTab === tab.id
                      ? 'border-[#1e3a5f] text-[#1e3a5f] font-medium'
                      : 'border-transparent text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {activeTab === 'bienvenida' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#1e3a5f] mb-2">
                Hola, {cliente.nombre.split(' ')[0]} 👋
              </h2>
              <p className="text-neutral-600 text-sm">
                Este es tu espacio personal de coaching. Aquí puedes revisar tu historia de salud,
                tus objetivos y el material que Mariett comparte contigo.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div onClick={() => setActiveTab('historia')} className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100 cursor-pointer hover:shadow-md transition-shadow">
                <Heart className="text-[#7c9885] mb-3" size={28} />
                <h3 className="font-semibold text-[#1e3a5f]">Mi Historia de Salud</h3>
                <p className="text-sm text-neutral-500 mt-1">Tu información de salud y antecedentes</p>
              </div>
              <div onClick={() => setActiveTab('objetivos')} className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100 cursor-pointer hover:shadow-md transition-shadow">
                <Target className="text-[#7c9885] mb-3" size={28} />
                <h3 className="font-semibold text-[#1e3a5f]">Mis Objetivos</h3>
                <p className="text-sm text-neutral-500 mt-1">Tus metas del proceso de coaching</p>
              </div>
              {(ruedaInicialActiva || ruedaFinalActiva) && (
                <div onClick={() => setActiveTab('rueda')} className="bg-white rounded-xl p-6 shadow-sm border border-[#7c9885] cursor-pointer hover:shadow-md transition-shadow">
                  <Circle className="text-[#7c9885] mb-3" size={28} />
                  <h3 className="font-semibold text-[#1e3a5f]">Rueda del Bienestar</h3>
                  <p className="text-sm text-[#7c9885] mt-1 font-medium">¡Tienes una rueda pendiente de completar!</p>
                </div>
              )}
              {contrato && (
                <div onClick={() => setActiveTab('contrato')} className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100 cursor-pointer hover:shadow-md transition-shadow">
                  <FileText className="text-[#7c9885] mb-3" size={28} />
                  <h3 className="font-semibold text-[#1e3a5f]">Mi Contrato</h3>
                  <p className="text-sm text-neutral-500 mt-1">
                    {contrato.estado === 'pendiente_firma' ? '⚠️ Pendiente de firma' : '✅ Firmado'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'historia' && (
          <HistoriaSalud clienteId={cliente.id} readOnly={false} portalMode={true} />
        )}

        {activeTab === 'objetivos' && (
          <Objetivos clienteId={cliente.id} readOnly={true} />
        )}

        {activeTab === 'rueda' && (ruedaInicialActiva || ruedaFinalActiva) && (
          <div className="space-y-6">
            <div className={`grid gap-8 ${ruedaInicialActiva && ruedaFinalActiva ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 max-w-2xl mx-auto'}`}>
              {ruedaInicialActiva && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-[#1e3a5f] px-6 py-3">
                    <p className="text-white text-xs font-semibold uppercase tracking-widest text-center">Rueda Inicial</p>
                  </div>
                  <RuedaBienestar clienteId={cliente.id} tipo="inicial" esCoach={false} portalMode={true} />
                </div>
              )}
              {ruedaFinalActiva && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-[#7c9885] px-6 py-3">
                    <p className="text-white text-xs font-semibold uppercase tracking-widest text-center">Rueda Final</p>
                  </div>
                  <RuedaBienestar clienteId={cliente.id} tipo="final" esCoach={false} portalMode={true} />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'contrato' && contrato && (
          <ContratoVisor contrato={contrato} cliente={cliente} portalMode={true} />
        )}

      </main>
    </div>
  )
}
