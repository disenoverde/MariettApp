// functions/index.js
// Firebase Cloud Function para asignar custom claim role:'cliente'
// cuando un cliente se registra con un código de invitación válido.
//
// SETUP:
//   npm install -g firebase-tools
//   firebase init functions
//   Copia este archivo a functions/index.js
//   firebase deploy --only functions

const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()

/**
 * Se llama desde el frontend después de que el cliente crea su cuenta.
 * Valida que el uid esté vinculado a una invitación usada y asigna el claim.
 */
exports.asignarRolCliente = functions.https.onCall(async (data, context) => {
  // Debe estar autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'No autenticado')
  }

  const uid = context.auth.uid

  // Verificar que existe una invitación usada con este uid
  const db = admin.firestore()
  const invSnap = await db
    .collection('invitaciones')
    .where('uid_cliente', '==', uid)
    .where('usado', '==', true)
    .limit(1)
    .get()

  if (invSnap.empty) {
    throw new functions.https.HttpsError(
      'not-found',
      'No se encontró invitación válida para este usuario'
    )
  }

  // Asignar custom claim
  await admin.auth().setCustomUserClaims(uid, { role: 'cliente' })

  return { success: true, role: 'cliente' }
})

/**
 * (Opcional) Asignar rol coach manualmente desde la consola o admin panel.
 * Solo ejecutar desde Firebase Admin SDK, nunca exponer al cliente.
 */
exports.asignarRolCoach = functions.https.onCall(async (data, context) => {
  // Solo puede ser llamado por otro coach existente
  if (!context.auth || context.auth.token.role !== 'coach') {
    throw new functions.https.HttpsError('permission-denied', 'Solo coaches pueden asignar este rol')
  }
  const { uid } = data
  await admin.auth().setCustomUserClaims(uid, { role: 'coach' })
  return { success: true }
})
