import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMe } from '../api/auth'

function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error || !token) {
      navigate('/login', { replace: true })
      return
    }

    login(token, null)

    getMe()
      .then((res) => {
        login(token, res.data.user)
        navigate('/dashboard', { replace: true })
      })
      .catch(() => {
        navigate('/login', { replace: true })
      })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
      <div className="text-center">
        <div className="text-4xl mb-4 animate-pulse" style={{ color: '#CCFF00' }}>⟳</div>
        <p className="text-sm" style={{ color: '#666' }}>Authenticating...</p>
      </div>
    </div>
  )
}

export default AuthCallback
