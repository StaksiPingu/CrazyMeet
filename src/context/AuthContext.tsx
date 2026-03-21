import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/services/firebase'
import type { User } from '@/types'

interface AuthContextValue {
  firebaseUser: FirebaseUser | null
  user: User | null
  loading: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null, user: null, loading: true, isAdmin: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, fbUser => {
      setFirebaseUser(fbUser)
      if (!fbUser) {
        setUser(null)
        setLoading(false)
      }
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!firebaseUser) return
    const unsub = onSnapshot(doc(db, 'users', firebaseUser.uid), snap => {
      setUser(snap.exists() ? { uid: snap.id, ...snap.data() } as User : null)
      setLoading(false)
    })
    return unsub
  }, [firebaseUser])

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
