import { db } from './firebase'
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'

// Genera un código alfanumérico único de 6 caracteres
const generarCodigo = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sin caracteres ambiguos
  let codigo = ''
  for (let i = 0; i < 6; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return codigo
}

// Crea una invitación en Firestore y retorna el código generado
export const crearInvitacion = async (clienteId, emailCliente, nombreCliente) => {
  // Verificar si ya hay una invitación vigente
  const invRef = collection(db, 'invitaciones')
  const q = query(invRef, where('cliente_id', '==', clienteId), where('usado', '==', false))
  const existing = await getDocs(q)

  // Si ya existe una vigente, retornarla
  if (!existing.empty) {
    const inv = existing.docs[0].data()
    return { codigo: inv.codigo, id: existing.docs[0].id }
  }

  const codigo = generarCodigo()
  const expires = new Date()
  expires.setDate(expires.getDate() + 30) // 30 días

  const invitacionRef = doc(collection(db, 'invitaciones'))
  await setDoc(invitacionRef, {
    codigo,
    cliente_id: clienteId,
    email: emailCliente,
    nombre_cliente: nombreCliente,
    usado: false,
    created_at: serverTimestamp(),
    expires_at: Timestamp.fromDate(expires)
  })

  return { codigo, id: invitacionRef.id }
}

// Valida un código y retorna los datos de la invitación o null
export const validarCodigo = async (codigo) => {
  const invRef = collection(db, 'invitaciones')
  const q = query(invRef, where('codigo', '==', codigo.toUpperCase()), where('usado', '==', false))
  const snapshot = await getDocs(q)

  if (snapshot.empty) return null

  const inv = snapshot.docs[0]
  const data = inv.data()

  // Verificar expiración
  if (data.expires_at && data.expires_at.toDate() < new Date()) return null

  return { id: inv.id, ...data }
}

// Marca la invitación como usada y vincula el uid del cliente
export const usarInvitacion = async (invitacionId, uid) => {
  await updateDoc(doc(db, 'invitaciones', invitacionId), {
    usado: true,
    uid_cliente: uid,
    usado_at: serverTimestamp()
  })
}

// Obtiene la invitación activa de un cliente (para mostrar estado en FichaCliente)
export const getInvitacionCliente = async (clienteId) => {
  const q = query(
    collection(db, 'invitaciones'),
    where('cliente_id', '==', clienteId)
  )
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  // Retorna la más reciente
  const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  docs.sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0))
  return docs[0]
}
