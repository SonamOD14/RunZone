import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  // Wait until auth check is done
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="text-green-400 text-xl animate-pulse">Loading...</div>
      </div>
    )
  }

  // If not logged in redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute