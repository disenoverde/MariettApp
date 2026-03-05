import { useState, useEffect } from 'react'
import { db } from '../lib/firebase'
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { Save, Edit } from 'lucide-react'

export default function HistoriaSalud({ clienteId }) {
  const [historia, setHistoria] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    objetivos_salud: '',
    historia_salud_importante: '',
    suplementos_medicamentos: '',
    diagnosticos_medicos: '',
    aspectos_infancia: '',
    info_familiar_relevante: '',
    peso: '',
    estatura: '',
    horas_sueno: '',
    calidad_sueno: '',
    nivel_energia: '',
    dolor_rigidez: '',
    relacion_comida_pasado: '',
    relacion_comida_actual: '',
    consume_alcohol: false,
    consume_tabaco: false,
    enfoque_alimentacion: '',
    desayuno: '',
    almuerzo: '',
    colaciones: '',
    cena_onces: '',
    cambios_alimentacion: '',
    salud_mental_emocional: '',
    manejo_estres: '',
    rol_espiritualidad: '',
    con_quien_vive: '',
    relaciones_importantes: '',
    vida_social: '',
    horas_trabajo: '',
    tiempo_libre: '',
    actividad_fisica: '',
    comentarios_adicionales: '',
  })

  useEffect(() => {
    if (!clienteId) return

    // Real-time listener
    const unsubscribe = onSnapshot(
      doc(db, 'historias_salud', clienteId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() }
          setHistoria(data)
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
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

      if (!historia) {
        dataToSave.created_at = serverTimestamp()
      }

      await setDoc(doc(db, 'historias_salud', clienteId), dataToSave, { merge: true })
      
      setEditing(false)
    } catch (error) {
      console.error('Error guardando historia:', error)
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

  if (!editing && historia) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2>Historia de Salud</h2>
          <button
            onClick={() => setEditing(true)}
            className="btn-outline flex items-center gap-2"
          >
            <Edit size={18} />
            Editar
          </button>
        </div>

        <div className="card">
          <Section title="Objetivo de salud y bienestar">
            <Field label="¿Cuáles son tus objetivos de salud y bienestar?" value={historia.objetivos_salud} />
          </Section>

          <Section title="Salud Personal e historia familiar">
            <Field label="Historia de salud importante" value={historia.historia_salud_importante} />
            <Field label="Suplementos o medicamentos" value={historia.suplementos_medicamentos} />
            <Field label="Diagnósticos médicos" value={historia.diagnosticos_medicos} />
            <Field label="Aspectos de infancia relevantes" value={historia.aspectos_infancia} />
            <Field label="Información familiar relevante" value={historia.info_familiar_relevante} />
          </Section>

          <Section title="Información sobre Salud Física">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Peso" value={historia.peso} />
              <Field label="Estatura" value={historia.estatura} />
              <Field label="Horas de sueño" value={historia.horas_sueno} />
              <Field label="Calidad del sueño" value={historia.calidad_sueno} />
            </div>
            <Field label="Nivel de energía" value={historia.nivel_energia} />
            <Field label="Dolor, rigidez o hinchazón" value={historia.dolor_rigidez} />
          </Section>

          <Section title="Información Nutricional">
            <Field label="Relación con la comida (pasado)" value={historia.relacion_comida_pasado} />
            <Field label="Relación con la comida (actual)" value={historia.relacion_comida_actual} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Consume alcohol" value={historia.consume_alcohol ? 'Sí' : 'No'} />
              <Field label="Consume tabaco" value={historia.consume_tabaco ? 'Sí' : 'No'} />
            </div>
            <Field label="Enfoque de alimentación" value={historia.enfoque_alimentacion} />
            <Field label="Desayuno" value={historia.desayuno} />
            <Field label="Almuerzo" value={historia.almuerzo} />
            <Field label="Colaciones" value={historia.colaciones} />
            <Field label="Cena/Onces" value={historia.cena_onces} />
            <Field label="Cambios deseados en alimentación" value={historia.cambios_alimentacion} />
          </Section>

          <Section title="Salud Mental y Emocional">
            <Field label="Salud mental y emocional" value={historia.salud_mental_emocional} />
            <Field label="Manejo del estrés" value={historia.manejo_estres} />
          </Section>

          <Section title="Salud Espiritual">
            <Field label="Rol de la espiritualidad" value={historia.rol_espiritualidad} />
          </Section>

          <Section title="Estilo de Vida">
            <Field label="¿Con quién vives?" value={historia.con_quien_vive} />
            <Field label="Relaciones importantes" value={historia.relaciones_importantes} />
            <Field label="Vida social" value={historia.vida_social} />
            <Field label="Horas de trabajo semanales" value={historia.horas_trabajo} />
            <Field label="Tiempo libre" value={historia.tiempo_libre} />
            <Field label="Actividad física" value={historia.actividad_fisica} />
          </Section>

          <Section title="Comentarios Adicionales">
            <Field value={historia.comentarios_adicionales} />
          </Section>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="mb-6">
        {historia ? 'Editar Historia de Salud' : 'Completar Historia de Salud'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        <FormSection title="Objetivo de salud y bienestar">
          <TextAreaField
            label="¿Cuáles son tus objetivos de salud y bienestar? ¿Por qué son importantes para ti?"
            name="objetivos_salud"
            value={formData.objetivos_salud}
            onChange={handleChange}
            rows={4}
          />
        </FormSection>

        <FormSection title="Salud Personal e historia familiar">
          <TextAreaField
            label="¿Qué es lo más importante que te gustaría compartir sobre tu historia de salud?"
            name="historia_salud_importante"
            value={formData.historia_salud_importante}
            onChange={handleChange}
          />
          <TextAreaField
            label="Enumera los suplementos o medicamentos que tomas"
            name="suplementos_medicamentos"
            value={formData.suplementos_medicamentos}
            onChange={handleChange}
          />
          <TextAreaField
            label="Diagnósticos médicos o enfermedades de base"
            name="diagnosticos_medicos"
            value={formData.diagnosticos_medicos}
            onChange={handleChange}
          />
          <TextAreaField
            label="¿Te gustaría compartir algún aspecto de tu infancia relevante?"
            name="aspectos_infancia"
            value={formData.aspectos_infancia}
            onChange={handleChange}
          />
          <TextAreaField
            label="¿Alguna otra información sobre tu salud personal o familiar relevante?"
            name="info_familiar_relevante"
            value={formData.info_familiar_relevante}
            onChange={handleChange}
          />
        </FormSection>

        <FormSection title="Información sobre Salud Física">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Peso"
              name="peso"
              value={formData.peso}
              onChange={handleChange}
              placeholder="Ej: 65 kg"
            />
            <InputField
              label="Estatura"
              name="estatura"
              value={formData.estatura}
              onChange={handleChange}
              placeholder="Ej: 1.65 m"
            />
            <InputField
              label="¿Cuántas horas promedio duermes por noche?"
              name="horas_sueno"
              value={formData.horas_sueno}
              onChange={handleChange}
              placeholder="Ej: 7 horas"
            />
            <InputField
              label="¿Cómo describirías la calidad de tu sueño?"
              name="calidad_sueno"
              value={formData.calidad_sueno}
              onChange={handleChange}
              placeholder="Ej: Buena, Regular, Mala"
            />
          </div>
          <TextAreaField
            label="¿Cómo valorarías tu nivel de energía? ¿Por qué?"
            name="nivel_energia"
            value={formData.nivel_energia}
            onChange={handleChange}
          />
          <TextAreaField
            label="¿Experimentas dolor, rigidez o hinchazón regularmente?"
            name="dolor_rigidez"
            value={formData.dolor_rigidez}
            onChange={handleChange}
          />
        </FormSection>

        <FormSection title="Información Nutricional">
          <TextAreaField
            label="¿Cómo describirías tu relación o tu historia con la comida en el pasado?"
            name="relacion_comida_pasado"
            value={formData.relacion_comida_pasado}
            onChange={handleChange}
          />
          <TextAreaField
            label="Describe tu relación actual con la comida"
            name="relacion_comida_actual"
            value={formData.relacion_comida_actual}
            onChange={handleChange}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CheckboxField
              label="Consume alcohol"
              name="consume_alcohol"
              checked={formData.consume_alcohol}
              onChange={handleChange}
            />
            <CheckboxField
              label="Consume tabaco"
              name="consume_tabaco"
              checked={formData.consume_tabaco}
              onChange={handleChange}
            />
          </div>

          <TextAreaField
            label="¿Sigues algún enfoque de alimentación específico? (vegano, vegetariano, cetogénico, etc.)"
            name="enfoque_alimentacion"
            value={formData.enfoque_alimentacion}
            onChange={handleChange}
          />
          
          <TextAreaField
            label="Desayuno (tipos de bebidas y comidas que regularmente consumes)"
            name="desayuno"
            value={formData.desayuno}
            onChange={handleChange}
          />
          <TextAreaField
            label="Almuerzo"
            name="almuerzo"
            value={formData.almuerzo}
            onChange={handleChange}
          />
          <TextAreaField
            label="Colaciones"
            name="colaciones"
            value={formData.colaciones}
            onChange={handleChange}
          />
          <TextAreaField
            label="Cena/Onces"
            name="cena_onces"
            value={formData.cena_onces}
            onChange={handleChange}
          />
          <TextAreaField
            label="¿Hay algo que te gustaría cambiar en tu forma de alimentarte?"
            name="cambios_alimentacion"
            value={formData.cambios_alimentacion}
            onChange={handleChange}
          />
        </FormSection>

        <FormSection title="Salud Mental y Emocional">
          <TextAreaField
            label="¿Cómo describirías tu salud mental y emocional en general? ¿Cómo te cuidas actualmente?"
            name="salud_mental_emocional"
            value={formData.salud_mental_emocional}
            onChange={handleChange}
          />
          <TextAreaField
            label="¿Cómo manejas el estrés?"
            name="manejo_estres"
            value={formData.manejo_estres}
            onChange={handleChange}
          />
        </FormSection>

        <FormSection title="Salud Espiritual">
          <TextAreaField
            label="¿Qué rol juega la espiritualidad en tu vida?"
            name="rol_espiritualidad"
            value={formData.rol_espiritualidad}
            onChange={handleChange}
          />
        </FormSection>

        <FormSection title="Estilo de Vida">
          <InputField
            label="¿Con quién vives?"
            name="con_quien_vive"
            value={formData.con_quien_vive}
            onChange={handleChange}
          />
          <TextAreaField
            label="¿Cuáles son las relaciones más importantes en tu vida?"
            name="relaciones_importantes"
            value={formData.relaciones_importantes}
            onChange={handleChange}
          />
          <TextAreaField
            label="¿Hay algo que te gustaría compartir acerca de tu vida social?"
            name="vida_social"
            value={formData.vida_social}
            onChange={handleChange}
          />
          <InputField
            label="¿Cuántas horas a la semana trabajas normalmente?"
            name="horas_trabajo"
            value={formData.horas_trabajo}
            onChange={handleChange}
            placeholder="Ej: 40 horas"
          />
          <TextAreaField
            label="¿Qué te gusta hacer en tu tiempo libre?"
            name="tiempo_libre"
            value={formData.tiempo_libre}
            onChange={handleChange}
          />
          <TextAreaField
            label="¿Qué papel juega en tu vida el movimiento y la actividad física?"
            name="actividad_fisica"
            value={formData.actividad_fisica}
            onChange={handleChange}
          />
        </FormSection>

        <FormSection title="Comentarios Adicionales">
          <TextAreaField
            label="¿Te gustaría comentar algo más?"
            name="comentarios_adicionales"
            value={formData.comentarios_adicionales}
            onChange={handleChange}
            rows={4}
          />
        </FormSection>

        <div className="flex gap-4 pt-4">
          {historia && (
            <button
              type="button"
              onClick={() => {
                setFormData(historia)
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
                Guardar Historia
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="border-b border-neutral-200 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
      <h3 className="text-lg font-semibold text-primary mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>}
      <p className="text-neutral-900 whitespace-pre-wrap">{value || 'No especificado'}</p>
    </div>
  )
}

function FormSection({ title, children }) {
  return (
    <div className="border-b border-neutral-200 pb-6">
      <h3 className="text-lg font-semibold text-primary mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function InputField({ label, name, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-field"
      />
    </div>
  )
}

function TextAreaField({ label, name, value, onChange, rows = 3 }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-2">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        className="textarea-field"
      />
    </div>
  )
}

function CheckboxField({ label, name, checked, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-secondary"
      />
      <label className="text-sm font-medium text-neutral-700">{label}</label>
    </div>
  )
}
