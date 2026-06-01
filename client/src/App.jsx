import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import LiveRun from './pages/LiveRun'
import TerritoryView from './pages/TerritoryView'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'


function App() {
  const { loading } = useAuth()

  // Don't render anything until we know if user is logged in
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="text-green-400 text-xl animate-pulse">Loading RunZone...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/leaderboard" element={<Leaderboard />} />

        {/* Protected routes - must be logged in */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/run" element={
          <ProtectedRoute><LiveRun /></ProtectedRoute>
        } />
        <Route path="/territory" element={
          <ProtectedRoute><TerritoryView /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />

      </Routes>
    </div>
  )
}

export default App