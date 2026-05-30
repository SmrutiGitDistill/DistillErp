import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      // Guard against corrupted values (e.g. the string "undefined")
      if (stored && stored !== 'undefined' && token && token !== 'undefined') {
        setUser(JSON.parse(stored))
      } else {
        // Clear any bad state
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    } catch {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })

    // Validate we actually got an API response, not an HTML page
    if (!res.data?.access_token || !res.data?.user) {
      throw new Error(
        'Unexpected response from server. ' +
        'Make sure VITE_API_URL is set to the Render backend URL in Vercel settings.'
      )
    }

    localStorage.setItem('token', res.data.access_token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const isSuperAdmin = user?.role === 'superadmin'
  const isOwner = user?.role === 'owner'
  const isAdmin = user?.role === 'admin'
  const canManageUsers = isSuperAdmin

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loading,
      isSuperAdmin,
      isOwner,
      isAdmin,
      canManageUsers,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
