import { useState, useEffect } from 'react'
import { db } from '../lib/firebase'
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { Save, Edit, Target } from 'lucide-react'

export default function Objetivos({ clienteId }) {
  const [objetivos, setObjetivos] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    objetivo_1: '',
    objetivo_2: '',
    objetivo_3: '',
    por_que_importantes: '',
    que_interfiere: '',
  })

  useEffect(() => {
    if (!clienteId) return

    // Real-time listener
    const unsubscribe = onSnapshot(
      doc(db, 'objetivos', clienteId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() }
          setObjetivos(data)
          setFormData(data)
        } else {
          setEditing(true)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error:', error)
        setEditing(true)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [clienteId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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

      if (!objetivos) {
        dataToSave.created_at = serverTimestamp()
      }

      await setDoc(doc(db, 'objetivos', clienteId), dataToSave, { merge: true })

      setEditing(false)
    } catch (error) {
      console.error('Error guardando objetivos:', error)
      alert('Hubo un error al guardar. Por favor, intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="card text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!editing && objetivos) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2>Objetivos de Salud y Bienestar</h2>
          <button
            onClick={() => setEditing(true)}
            className="btn-outline flex items-center gap-2"
          >
            <Edit size={18} />
            Editar
          </button>
        </div>

        <div className="card">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Target size={20} />
                Tres objetivos principales
              </h3>
              <div className="space-y-4">
                <ObjectiveCard number={1} text={objetivos.objetivo_1} />
                <ObjectiveCard number={2} text={objetivos.objetivo_2} />
                <ObjectiveCard number={3} text={objetivos.objetivo_3} />
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                ¿Por qué estos objetivos son importantes para ti?
              </label>
              <p className="text-neutral-900 whitespace-pre-wrap">
                {objetivos.por_que_importantes || 'No especificado'}
              </p>
            </div>

            <div className="border-t border-neutral-200 pt-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                ¿Qué interfiere en tu camino para lograr estos objetivos?
              </label>
              <p className="text-neutral-900 whitespace-pre-wrap">
                {objetivos.que_interfiere || 'No especificado'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="mb-6">
        {objetivos ? 'Editar Objetivos' : 'Definir Objetivos'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <Target size={20} />
            ¿Cuáles son los tres objetivos principales que quieres lograr?
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                1. Primer objetivo
              </label>
              <input
                type="text"
                name="objetivo_1"
                value={formData.objetivo_1}
                onChange={handleChange}
                className="input-field"
                placeholder="Ej: Mejorar mi alimentación y adoptar hábitos más saludables"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                2. Segundo objetivo
              </label>
              <input
                type="text"
                name="objetivo_2"
                value={formData.objetivo_2}
                onChange={handleChange}
                className="input-field"
                placeholder="Ej: Aumentar mi nivel de energía y reducir el cansancio"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                3. Tercer objetivo
              </label>
              <input
                type="text"
                name="objetivo_3"
                value={formData.objetivo_3}
                onChange={handleChange}
                className="input-field"
                placeholder="Ej: Encontrar un mejor equilibrio entre trabajo y vida personal"
                required
              />
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-200 pt-6">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            ¿Por qué estos objetivos son importantes para ti?
          </label>
          <textarea
            name="por_que_importantes"
            value={formData.por_que_importantes}
            onChange={handleChange}
            rows={4}
            className="textarea-field"
            placeholder="Explica la importancia y motivación detrás de estos objetivos..."
            required
          />
        </div>

        <div className="border-t border-neutral-200 pt-6">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            ¿Qué interfiere en tu camino para lograr estos objetivos?
          </label>
          <textarea
            name="que_interfiere"
            value={formData.que_interfiere}
            onChange={handleChange}
            rows={4}
            className="textarea-field"
            placeholder="Identifica los obstáculos, desafíos o barreras que enfrentas..."
            required
          />
        </div>

        <div className="flex gap-4 pt-4">
          {objetivos && (
            <button
              type="button"
              onClick={() => {
                setFormData(objetivos)
                setEditing(false)
              }}
              className="btn-outline flex-1"
            >
              Cancelar
            </button>
          )}
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
                Guardar Objetivos
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

function ObjectiveCard({ number, text }) {
  return (
    <div className="flex gap-3 p-4 bg-accent-pale rounded-lg border border-accent">
      <div className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white font-bold">
        {number}
      </div>
      <p className="text-neutral-900 flex-1">
        {text || 'No especificado'}
      </p>
    </div>
  )
}
