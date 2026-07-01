import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('medsched_token')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const data = await api.me()
      setUser(data.user)
      setDoctor(data.doctor || null)
    } catch {
      localStorage.removeItem('medsched_token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUser() }, [loadUser])

  const login = async (email, password) => {
    const data = await api.login({ email, password })
    localStorage.setItem('medsched_token', data.token)
    setUser(data.user)
    await loadUser()
    return data.user
  }

  const register = async (form) => {
    const data = await api.register(form)
    localStorage.setItem('medsched_token', data.token)
    setUser(data.user)
    await loadUser()
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('medsched_token')
    setUser(null)
    setDoctor(null)
  }

  return (
    <AuthContext.Provider value={{ user, doctor, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
