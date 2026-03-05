import { createContext, useContext, useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from '../lib/firebase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult()
        const userRole = tokenResult.claims.role || 'coach'
        setUser(firebaseUser)
        setRole(userRole)
      } else {
        setUser(null)
        setRole(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const tokenResult = await userCredential.user.getIdTokenResult()
    const userRole = tokenResult.claims.role || 'coach'
    setRole(userRole)
    return { ...userCredential, role: userRole }
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setRole(null)
  }

  const registerCliente = async (email, password) => {
    return await createUserWithEmailAndPassword(auth, email, password)
  }

  const isCoach = role === 'coach'
  const isCliente = role === 'cliente'

  const value = {
    user,
    role,
    loading,
    signIn,
    signOut,
    registerCliente,
    isCoach,
    isCliente,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
