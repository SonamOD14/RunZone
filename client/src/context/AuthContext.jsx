import { createContext, useContext, useState, useEffect } from 'react'
import { getMe } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in when app loads
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      getMe()
        .then((res) => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('token')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  // Save token and user after login/signup
  function login(token, userData) {
    localStorage.setItem('token', token)
    setUser(userData)
  }

  // Clear token and user on logout
  function logout() {
    localStorage.removeItem('token')
    setUser(null)
  }
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
// Custom hook - any component can call useAuth() to get user data
export function useAuth() {
  return useContext(AuthContext)
}