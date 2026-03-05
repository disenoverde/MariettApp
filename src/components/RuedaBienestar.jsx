import { useState, useEffect } from 'react'
import { db } from '../lib/firebase'
import {
  doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp
} from 'firebase/firestore'
import { Save, Lock, RotateCcw } from 'lucide-react'

const AREAS = [
  { nombre: 'Relaciones', color: '#d2a3a6' },
  { nombre: 'Vida social', color: '#cbbfb8' },
  { nombre: 'Alegría', color: '#bcbacf' },
  { nombre: 'Espiritualidad', color: '#cac1d1' },
  { nombre: 'Tiempo libre', color: '#cac0c1' },
  { nombre: 'Finanzas', color: '#a8c5b5' },
  { nombre: 'Carrera Profesional', color: '#7eb5d6' },
  { nombre: 'Aprendizaje', color: '#b8d9ed' },
  { nombre: 'Salud', color: '#7c9885' },
  { nombre: 'Actividad física', color: '#1e3a5f' },
  { nombre: 'Cocina consciente', color: '#2e5c8a' },
  { nombre: 'Entorno de vida', color: '#4a7c9a' },
]

const N = AREAS.length
const CX = 200
const CY = 200
const R_MAX = 160
const R_LABELS = 185

// Convierte un índice de área y un valor (1-10) a coordenadas SVG
const toXY = (index, value) => {
  const angle = (index / N) * 2 * Math.PI - Math.PI / 2
  const r = (value / 10) * R_MAX
  return {
    x: CX + r * Math.cos(angle),
    y: CY + r * Math.sin(angle),
  }
}

// Posición de las etiquetas
const labelPos = (index) => {
  const angle = (index / N) * 2 * Math.PI - Math.PI / 2
  return {
    x: CX + R_LABELS * Math.cos(angle),
    y: CY + R_LABELS * Math.sin(angle),
  }
}

// Construye el path del polígono
const buildPath = (valores) => {
  const points = valores.map((v, i) => toXY(i, v))
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z'
}

// Círculos de guía (niveles 2, 4, 6, 8, 10)
const GuideCircles = () =>
  [2, 4, 6, 8, 10].map((v) => (
    <circle
      key={v}
      cx={CX}
      cy={CY}
      r={(v / 10) * R_MAX}
      fill="none"
      stroke="#e5e7eb"
      strokeWidth="0.8"
      strokeDasharray={v < 10 ? '3,3' : ''}
    />
  ))

// Líneas radiales
const RadialLines = () =>
  AREAS.map((_, i) => {
    const end = toXY(i, 10)
    return (
      <line key={i} x1={CX} y1={CY} x2={end.x} y2={end.y} stroke="#e5e7eb" strokeWidth="0.8" />
    )
  })

export default function RuedaBienestar({ clienteId, cliente, portalMode = false }) {
  const [ruedaInicial, setRuedaInicial] = useState(null)
  const [ruedaFinal, setRuedaFinal] = useState(null)
  const [valores, setValores] = useState(Array(N).fill(5))
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [tipo, setTipo] = useState(null) // 'inicial' | 'final'
  const [vistaComparacion, setVistaComparacion] = useState('superpuesta')
  const [mostrarInstrucciones, setMostrarInstrucciones] = useState(false)

  useEffect(() => {
    cargarRuedas()
  }, [clienteId])

  const cargarRuedas = async () => {
    const q = query(collection(db, 'ruedas_bienestar'), where('cliente_id', '==', clienteId))
    const snap = await getDocs(q)
    snap.forEach((d) => {
      const data = { id: d.id, ...d.data() }
      if (data.tipo === 'inicial') setRuedaInicial(data)
      if (data.tipo === 'final') setRuedaFinal(data)
    })

    // Determinar qué tipo completar
    const tieneInicial = snap.docs.some(d => d.data().tipo === 'inicial')
    const tieneFinal = snap.docs.some(d => d.data().tipo === 'final')

    if (portalMode) {
      if (cliente?.rueda_inicial_activa && !tieneInicial) setTipo('inicial')
      else if (cliente?.rueda_final_activa && !tieneFinal) setTipo('final')
    }
  }

  const handleSlider = (index, value) => {
    if (guardado) return
    const nuevos = [...valores]
    nuevos[index] = parseInt(value)
    setValores(nuevos)
  }

  const handleGuardar = async () => {
    if (!window.confirm('Una vez guardada, tu rueda quedará bloqueada y no podrás editarla. ¿Continuar?')) return
    setGuardando(true)
    try {
      const ruedaRef = doc(collection(db, 'ruedas_bienestar'))
      await setDoc(ruedaRef, {
        cliente_id: clienteId,
        tipo,
        bloqueada: true,
        areas: AREAS.map((a, i) => ({ nombre: a.nombre, valor: valores[i] })),
        created_at: serverTimestamp(),
      })
      setGuardado(true)
      await cargarRuedas()
    } catch (e) {
      alert('Error al guardar la rueda. Intenta nuevamente.')
    }
    setGuardando(false)
  }

  // ── Vista del coach (sin portalMode): muestra ruedas guardadas y comparación ──
  if (!portalMode) {
    return <RuedaCoach ruedaInicial={ruedaInicial} ruedaFinal={ruedaFinal} cliente={cliente} />
  }

  // ── Vista del portal: completar rueda ──

  // Si ya completó ambas o no hay ninguna activa
  if (!tipo) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        {ruedaInicial || ruedaFinal ? (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-[#1e3a5f] mb-2">Tu rueda está guardada</h3>
            <p className="text-neutral-500">Mariett revisará los resultados en tu próxima sesión.</p>
            {ruedaInicial && (
              <div className="mt-6">
                <p className="text-sm text-neutral-600 mb-3 font-medium">Tu Rueda del Bienestar</p>
                <RuedaSVG valores={ruedaInicial.areas.map(a => a.valor)} color="#1e3a5f" />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-4xl mb-4">⏳</div>
            <h3 className="text-xl font-semibold text-[#1e3a5f] mb-2">Aún no hay rueda disponible</h3>
            <p className="text-neutral-500">Mariett te notificará cuando sea el momento de completarla.</p>
          </>
        )}
      </div>
    )
  }

  // Rueda completada en esta sesión
  if (guardado) {
    const ruedaGuardada = tipo === 'inicial' ? ruedaInicial : ruedaFinal
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h3 className="text-xl font-semibold text-[#1e3a5f] mb-2">¡Rueda guardada con éxito!</h3>
        <p className="text-neutral-500 mb-6">Mariett revisará tu rueda en la próxima sesión.</p>
        <RuedaSVG valores={valores} color="#1e3a5f" />
      </div>
    )
  }

  // Completar rueda
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1e3a5f]">
              Rueda del Bienestar {tipo === 'inicial' ? '· Inicial' : '· Final'}
            </h2>
            <p className="text-neutral-500 text-sm mt-1">
              Evalúa cada área de tu vida del 1 (muy insatisfecha) al 10 (muy satisfecha).
            </p>
          </div>
          <button
            onClick={() => setMostrarInstrucciones(!mostrarInstrucciones)}
            className="text-[#7c9885] text-sm underline"
          >
            {mostrarInstrucciones ? 'Ocultar' : 'Ver instrucciones'}
          </button>
        </div>

        {mostrarInstrucciones && (
          <div className="mb-6 bg-[#e8f4ea] rounded-lg p-4">
            <img src="/rueda-instrucciones.svg" alt="Instrucciones Rueda del Bienestar" className="max-w-full mx-auto" />
          </div>
        )}

        {/* Sliders */}
        <div className="space-y-4 mb-8">
          {AREAS.map((area, i) => (
            <div key={area.nombre} className="flex items-center gap-4">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: area.color }}
              />
              <span className="w-44 text-sm text-neutral-700 flex-shrink-0">{area.nombre}</span>
              <input
                type="range"
                min="1"
                max="10"
                value={valores[i]}
                onChange={(e) => handleSlider(i, e.target.value)}
                className="flex-1 accent-[#1e3a5f]"
              />
              <span className="w-8 text-center font-bold text-[#1e3a5f]">{valores[i]}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="w-full bg-[#1e3a5f] text-white py-3 rounded-lg font-medium hover:bg-[#2e5c8a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save size={18} />
          {guardando ? 'Guardando...' : 'Guardar mi Rueda del Bienestar'}
        </button>
        <p className="text-center text-xs text-neutral-400 mt-2">
          Una vez guardada, la rueda quedará bloqueada.
        </p>
      </div>

      {/* Preview del polígono en tiempo real */}
      <div className="bg-white rounded-xl p-6 shadow-sm text-center">
        <p className="text-sm text-neutral-500 mb-4">Vista previa de tu rueda</p>
        <div className="flex justify-center">
          <RuedaSVG valores={valores} color="#1e3a5f" opacity={0.6} />
        </div>
        <p className="text-xs text-neutral-400 mt-3 flex items-center justify-center gap-1">
          <Lock size={12} /> La imagen final se revelará al guardar
        </p>
      </div>
    </div>
  )
}

// ── Subcomponente: SVG de la rueda ──
export function RuedaSVG({ valores, color = '#1e3a5f', opacity = 0.7, label = null }) {
  const path = buildPath(valores)
  return (
    <svg viewBox="0 0 400 400" width="300" height="300" className="mx-auto">
      {/* Fondo */}
      <circle cx={CX} cy={CY} r={R_MAX} fill="#f9fafb" />
      <GuideCircles />
      <RadialLines />
      {/* Números de escala */}
      {[2, 4, 6, 8, 10].map((v) => (
        <text key={v} x={CX + 4} y={CY - (v / 10) * R_MAX + 4} fontSize="8" fill="#9ca3af">
          {v}
        </text>
      ))}
      {/* Polígono */}
      <path d={path} fill={color} fillOpacity={opacity} stroke={color} strokeWidth="2" />
      {/* Etiquetas */}
      {AREAS.map((area, i) => {
        const pos = labelPos(i)
        return (
          <text
            key={area.nombre}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="7.5"
            fill="#374151"
            fontWeight="500"
          >
            {area.nombre}
          </text>
        )
      })}
      {label && (
        <text x={CX} y={390} textAnchor="middle" fontSize="11" fill={color} fontWeight="600">
          {label}
        </text>
      )}
    </svg>
  )
}

// ── Subcomponente: Vista del coach con comparación ──
function RuedaCoach({ ruedaInicial, ruedaFinal, cliente }) {
  const [vista, setVista] = useState('superpuesta')

  if (!ruedaInicial && !ruedaFinal) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">⭕</div>
        <h3 className="text-lg font-semibold text-[#1e3a5f] mb-2">Sin ruedas todavía</h3>
        <p className="text-neutral-500 text-sm">
          Activa la rueda inicial desde la pestaña de información del cliente para que pueda completarla en su portal.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {ruedaInicial && !ruedaFinal && (
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <p className="text-sm text-neutral-500 mb-2 font-medium">Rueda Inicial</p>
          <RuedaSVG valores={ruedaInicial.areas.map(a => a.valor)} color="#1e3a5f" label="Inicial" />
        </div>
      )}

      {ruedaInicial && ruedaFinal && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1e3a5f]">Comparación de Ruedas</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setVista('superpuesta')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  vista === 'superpuesta'
                    ? 'bg-[#1e3a5f] text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Superpuesta
              </button>
              <button
                onClick={() => setVista('separada')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  vista === 'separada'
                    ? 'bg-[#1e3a5f] text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Separadas
              </button>
            </div>
          </div>

          {vista === 'superpuesta' ? (
            <div className="text-center">
              <svg viewBox="0 0 400 400" width="320" height="320" className="mx-auto">
                <circle cx={CX} cy={CY} r={R_MAX} fill="#f9fafb" />
                <GuideCircles />
                <RadialLines />
                {/* Inicial en rojo */}
                <path
                  d={buildPath(ruedaInicial.areas.map(a => a.valor))}
                  fill="#ef4444"
                  fillOpacity={0.3}
                  stroke="#ef4444"
                  strokeWidth="2"
                />
                {/* Final en verde */}
                <path
                  d={buildPath(ruedaFinal.areas.map(a => a.valor))}
                  fill="#22c55e"
                  fillOpacity={0.3}
                  stroke="#22c55e"
                  strokeWidth="2"
                />
                {AREAS.map((area, i) => {
                  const pos = labelPos(i)
                  return (
                    <text key={area.nombre} x={pos.x} y={pos.y} textAnchor="middle"
                      dominantBaseline="middle" fontSize="7.5" fill="#374151" fontWeight="500">
                      {area.nombre}
                    </text>
                  )
                })}
              </svg>
              <div className="flex justify-center gap-6 mt-2 text-sm">
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> Inicial</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-400 inline-block" /> Final</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              <div className="text-center">
                <p className="text-sm text-red-500 font-medium mb-2">Rueda Inicial</p>
                <RuedaSVG valores={ruedaInicial.areas.map(a => a.valor)} color="#ef4444" />
              </div>
              <div className="text-center">
                <p className="text-sm text-green-600 font-medium mb-2">Rueda Final</p>
                <RuedaSVG valores={ruedaFinal.areas.map(a => a.valor)} color="#22c55e" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
