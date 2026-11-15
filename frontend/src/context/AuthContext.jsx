import { useEffect, useMemo, useState } from 'react'
import * as authService from '../services/authService.js'
import { AuthContext } from './authContext.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => authService.hasSession())

  useEffect(() => {
    if (!authService.hasSession()) return
    authService.getCurrentUser().then(setUser).catch(() => localStorage.removeItem('cubeflow_token')).finally(() => setLoading(false))
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    signIn: async (credentials) => { const nextUser = await authService.login(credentials); setUser(nextUser); return nextUser },
    signUp: async (details) => { const nextUser = await authService.register(details); setUser(nextUser); return nextUser },
    signOut: async () => { await authService.logout(); setUser(null) },
  }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
