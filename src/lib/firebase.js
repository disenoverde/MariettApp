import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Validar que todas las variables estén presentes
const requiredKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
]

const missingKeys = requiredKeys.filter(key => !firebaseConfig[key])
if (missingKeys.length > 0) {
  throw new Error(`Missing Firebase config: ${missingKeys.join(', ')}`)
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Exportar servicios
export const auth = getAuth(app)
export const db = getFirestore(app)
