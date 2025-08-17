import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3000'
const AuthContext = createContext(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const boot = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const { data } = await axios.get(`${API_BASE_URL}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUser(data.user) // canonical role from DB
      } catch {
        localStorage.removeItem('token')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    boot()
  }, [])

  const login = async (email, password) => {
    try {
      // 1) login -> token
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password })
      const { token } = res.data
      localStorage.setItem('token', token)

      // 2) verify using token to get canonical user (and role)
      const ver = await axios.get(`${API_BASE_URL}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setUser(ver.data.user)
      toast.success('Login successful!')
      return { ok: true, user: ver.data.user }
    } catch (e) {
      const msg = e?.response?.data?.message || 'Login failed'
      toast.error(msg)
      return { ok: false, message: msg }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isStaff: user?.role === 'staff',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const authHeader = () => {
  const token = localStorage.getItem('token')
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}



