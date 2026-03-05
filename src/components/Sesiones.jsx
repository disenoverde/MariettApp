import { useState, useEffect } from 'react'
import { db } from '../lib/firebase'
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs, serverTimestamp } from 'firebase/firestore'
import { generateEditableSessionPDF, downloadPDF } from '../lib/pdfGenerator'
import { Plus, FileText, Download, Calendar, Edit, Trash2, Save } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function Sesiones({ clienteId, cliente }) {
  const [sesiones, setSesiones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSession, setEditingSession] = useState(null)

  useEffect(() => {
    if (!clienteId) return

    // Real-time listener para sesiones del cliente
    const q = query(
      collection(db, 'sesiones'),
      where('cliente_id', '==', clienteId),
      orderBy('numero_sesion', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const sesionesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setSesiones(sesionesData)
        setLoading(false)
      },
      (error) => {
        console.error('Error cargando sesiones:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [clienteId])

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta sesión?')) return

    try {
      await deleteDoc(doc(db, 'sesiones', id))
    } catch (error) {
      console.error('Error eliminando sesión:', error)
      alert('Error al eliminar la sesión')
    }
  }

  const handleGeneratePDF = async (sesion) => {
    try {
      const pdfBytes = await generateEditableSessionPDF(sesion, cliente)
      const filename = `Sesion_${sesion.numero_sesion}_${cliente.nombre.replace(/\s+/g, '_')}.pdf`
      downloadPDF(pdfBytes, filename)
    } catch (error) {
      console.error('Error generando PDF:', error)
      alert('Error al generar el PDF')
    }
  }

  if (loading) {
    return (
      <div className="card text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2>Sesiones de Coaching</h2>
          <span className="text-neutral-500">({sesiones.length})</span>
        </div>
        <button
          onClick={() => {
            setEditingSession(null)
            setShowForm(true)
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Sesión
        </button>
      </div>

      {showForm ? (
        <FormularioSesion
          clienteId={clienteId}
          sesion={editingSession}
          onCancel={() => {
            setShowForm(false)
            setEditingSession(null)
          }}
          onSave={() => {
            setShowForm(false)
            setEditingSession(null)
          }}
          ultimoNumero={sesiones.length > 0 ? sesiones[0].numero_sesion : 0}
        />
      ) : sesiones.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="mx-auto text-neutral-400 mb-4" size={48} />
          <h3 className="text-xl mb-2">No hay sesiones registradas</h3>
          <p className="text-neutral-600 mb-6">
            Comienza registrando la primera sesión de coaching
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Crear Primera Sesión
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sesiones.map((sesion) => (
            <div key={sesion.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold">
                      {sesion.numero_sesion}
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">
                        Sesión #{sesion.numero_sesion}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Calendar size={14} />
                        {format(new Date(sesion.fecha), "d 'de' MMMM, yyyy", { locale: es })}
                      </div>
                    </div>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    sesion.tipo_nota === 'con_acuerdos'
                      ? 'bg-accent text-primary'
                      : 'bg-neutral-200 text-neutral-700'
                  }`}>
                    {sesion.tipo_nota === 'con_acuerdos' ? 'Con Acuerdos' : 'Nota Simple'}
                  </span>
                </div>

                <div className="flex gap-2">
                  {sesion.tipo_nota === 'con_acuerdos' && (
                    <button
                      onClick={() => handleGeneratePDF(sesion)}
                      className="p-2 text-secondary hover:bg-accent-pale rounded-lg transition-colors"
                      title="Descargar PDF Editable"
                    >
                      <Download size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingSession(sesion)
                      setShowForm(true)
                    }}
                    className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(sesion.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {sesion.tipo_nota === 'simple' ? (
                <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Notas de la sesión
                  </label>
                  <p className="text-neutral-900 whitespace-pre-wrap">
                    {sesion.notas || 'Sin notas'}
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Acuerdos o Plan de Acción
                    </label>
                    <ol className="space-y-2">
                      {[1, 2, 3].map((num) => (
                        sesion[`acuerdo_${num}`] && (
                          <li key={num} className="flex gap-2">
                            <span className="font-semibold text-secondary">{num}.</span>
                            <span className="text-neutral-900">{sesion[`acuerdo_${num}`]}</span>
                          </li>
                        )
                      ))}
                    </ol>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Métodos de Responsabilidad Personal
                    </label>
                    <ol className="space-y-2">
                      {[1, 2, 3].map((num) => (
                        sesion[`metodo_responsabilidad_${num}`] && (
                          <li key={num} className="flex gap-2">
                            <span className="font-semibold text-secondary">{num}.</span>
                            <span className="text-neutral-900">
                              {sesion[`metodo_responsabilidad_${num}`]}
                            </span>
                          </li>
                        )
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FormularioSesion({ clienteId, sesion, onCancel, onSave, ultimoNumero }) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    numero_sesion: sesion?.numero_sesion || ultimoNumero + 1,
    fecha: sesion?.fecha || new Date().toISOString().split('T')[0],
    tipo_nota: sesion?.tipo_nota || 'simple',
    notas: sesion?.notas || '',
    acuerdo_1: sesion?.acuerdo_1 || '',
    acuerdo_2: sesion?.acuerdo_2 || '',
    acuerdo_3: sesion?.acuerdo_3 || '',
    metodo_responsabilidad_1: sesion?.metodo_responsabilidad_1 || '',
    metodo_responsabilidad_2: sesion?.metodo_responsabilidad_2 || '',
    metodo_responsabilidad_3: sesion?.metodo_responsabilidad_3 || '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const dataToSave = {
        ...formData,
        cliente_id: clienteId,
        updated_at: serverTimestamp()
      }

      if (sesion) {
        // Actualizar sesión existente
        await updateDoc(doc(db, 'sesiones', sesion.id), dataToSave)
      } else {
        // Crear nueva sesión
        dataToSave.created_at = serverTimestamp()
        await addDoc(collection(db, 'sesiones'), dataToSave)
      }

      onSave()
    } catch (error) {
      console.error('Error guardando sesión:', error)
      alert('Error al guardar la sesión')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-primary mb-6">
        {sesion ? 'Editar Sesión' : 'Nueva Sesión'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Número de sesión
            </label>
            <input
              type="number"
              name="numero_sesion"
              value={formData.numero_sesion}
              onChange={handleChange}
              className="input-field"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Tipo de nota
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tipo_nota"
                value="simple"
                checked={formData.tipo_nota === 'simple'}
                onChange={handleChange}
                className="text-primary focus:ring-secondary"
              />
              <span>Nota Simple</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tipo_nota"
                value="con_acuerdos"
                checked={formData.tipo_nota === 'con_acuerdos'}
                onChange={handleChange}
                className="text-primary focus:ring-secondary"
              />
              <span>Con Acuerdos (PDF Editable)</span>
            </label>
          </div>
        </div>

        {formData.tipo_nota === 'simple' ? (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Notas de la sesión
            </label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows={8}
              className="textarea-field"
              placeholder="Escribe aquí las notas de la sesión..."
            />
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Acuerdos o Plan de Acción
              </label>
              <div className="space-y-3">
                {[1, 2, 3].map((num) => (
                  <div key={num}>
                    <label className="block text-xs text-neutral-600 mb-1">
                      {num}. Acuerdo
                    </label>
                    <input
                      type="text"
                      name={`acuerdo_${num}`}
                      value={formData[`acuerdo_${num}`]}
                      onChange={handleChange}
                      className="input-field"
                      placeholder={`Ej: Realizar 30 minutos de ejercicio 3 veces por semana`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Métodos de Responsabilidad Personal
              </label>
              <div className="space-y-3">
                {[1, 2, 3].map((num) => (
                  <div key={num}>
                    <label className="block text-xs text-neutral-600 mb-1">
                      {num}. Método
                    </label>
                    <input
                      type="text"
                      name={`metodo_responsabilidad_${num}`}
                      value={formData[`metodo_responsabilidad_${num}`]}
                      onChange={handleChange}
                      className="input-field"
                      placeholder={`Ej: Llevar un diario de actividades físicas`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-accent-pale border border-accent rounded-lg p-4">
              <p className="text-sm text-neutral-700">
                <strong>Nota:</strong> Al guardar una sesión con acuerdos, podrás generar un PDF
                editable que puedes enviar al cliente para que complete y firme.
              </p>
            </div>
          </>
        )}

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn-outline flex-1"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {saving ? (
              'Guardando...'
            ) : (
              <>
                <Save size={20} />
                Guardar Sesión
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
