import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/firebase'
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, getDocs, where } from 'firebase/firestore'
import { Plus, Users, LogOut, Search, User, Trash2 } from 'lucide-react'

export default function Dashboard() {
  const [clientes, setClientes] = useState([])
  const [filteredClientes, setFilteredClientes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const { signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Suscripción en tiempo real a los clientes
    const q = query(collection(db, 'clientes'), orderBy('nombre', 'asc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setClientes(clientesData)
      setFilteredClientes(clientesData)
      setLoading(false)
    }, (error) => {
      console.error('Error cargando clientes:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = clientes.filter(cliente =>
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredClientes(filtered)
    } else {
      setFilteredClientes(clientes)
    }
  }, [searchTerm, clientes])

  const handleDelete = async (clienteId, nombreCliente) => {
    if (!confirm(`¿Estás seguro de eliminar a ${nombreCliente}?\n\nEsto eliminará también su historia de salud, objetivos y todas las sesiones. Esta acción no se puede deshacer.`)) {
      return
    }

    setDeleting(clienteId)

    try {
      // Eliminar historia de salud
      const historiaRef = doc(db, 'historias_salud', clienteId)
      await deleteDoc(historiaRef).catch(() => {}) // Ignorar si no existe

      // Eliminar objetivos
      const objetivosRef = doc(db, 'objetivos', clienteId)
      await deleteDoc(objetivosRef).catch(() => {}) // Ignorar si no existe

      // Eliminar todas las sesiones del cliente
      const sesionesQuery = query(collection(db, 'sesiones'), where('cliente_id', '==', clienteId))
      const sesionesSnapshot = await getDocs(sesionesQuery)
      const deletePromises = sesionesSnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      // Finalmente, eliminar el cliente
      await deleteDoc(doc(db, 'clientes', clienteId))

      // Éxito
      alert(`Cliente ${nombreCliente} eliminado exitosamente`)
    } catch (error) {
      console.error('Error eliminando cliente:', error)
      alert('Hubo un error al eliminar el cliente. Por favor, intenta de nuevo.')
    } finally {
      setDeleting(null)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error cerrando sesión:', error)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">MA</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">Mariett Alcayaga</h1>
              <p className="text-sm text-neutral-600">Gestión de Clientes</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="btn-outline flex items-center gap-2"
          >
            <LogOut size={18} />
            Salir
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Users className="text-primary" size={24} />
            <h2>Mis Clientes</h2>
            <span className="text-neutral-500">({clientes.length})</span>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full sm:w-64"
              />
            </div>
            <button
              onClick={() => navigate('/clientes/nuevo')}
              className="btn-primary flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={20} />
              Nuevo Cliente
            </button>
          </div>
        </div>

        {/* Clients Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-neutral-600">Cargando clientes...</p>
          </div>
        ) : filteredClientes.length === 0 ? (
          <div className="text-center py-12 card">
            <Users className="mx-auto text-neutral-400 mb-4" size={48} />
            <h3 className="text-xl mb-2">
              {searchTerm ? 'No se encontraron clientes' : 'No tienes clientes aún'}
            </h3>
            <p className="text-neutral-600 mb-6">
              {searchTerm
                ? 'Intenta con otro término de búsqueda'
                : 'Comienza agregando tu primer cliente'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/clientes/nuevo')}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Agregar Cliente
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClientes.map((cliente) => (
              <div
                key={cliente.id}
                className="card hover:shadow-lg transition-shadow relative"
              >
                {/* Botón de eliminar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(cliente.id, cliente.nombre)
                  }}
                  disabled={deleting === cliente.id}
                  className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Eliminar cliente"
                >
                  {deleting === cliente.id ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>

                {/* Contenido clickeable */}
                <div
                  onClick={() => navigate(`/clientes/${cliente.id}`)}
                  className="cursor-pointer pr-8"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="text-white" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-primary truncate">
                        {cliente.nombre}
                      </h3>
                      <p className="text-sm text-neutral-600 truncate">
                        {cliente.email}
                      </p>
                      <p className="text-sm text-neutral-500 mt-1">
                        {cliente.celular}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Ocupación:</span>
                      <span className="font-medium text-neutral-800">
                        {cliente.ocupacion || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-neutral-600">Edad:</span>
                      <span className="font-medium text-neutral-800">
                        {cliente.edad || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
