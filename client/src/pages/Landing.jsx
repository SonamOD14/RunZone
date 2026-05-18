import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Landing() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // If already logged in go to dashboard
  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user])

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col">

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 text-center">

        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-6xl font-black text-gray-900 leading-none tracking-tight">
            Run<span className="text-[#AAEE00]">Zone</span>
          </h1>
          <p className="text-gray-500 mt-2 text-lg font-medium">Own your city. One run at a time.</p>
        </div>

        {/* Animated stats preview */}
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-lg mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 text-sm font-medium">Your Territory</span>
            <span className="text-xs bg-[#AAEE00] text-black px-2 py-1 rounded-full font-bold">LIVE</span>
          </div>
          <div className="text-5xl font-black text-gray-900 mb-1">247</div>
          <div className="text-gray-400 text-sm mb-4">tiles owned</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#f5f5f0] rounded-2xl p-3">
              <div className="text-2xl font-bold text-gray-900">42.5</div>
              <div className="text-gray-400 text-xs">km total</div>
            </div>
            <div className="bg-[#f5f5f0] rounded-2xl p-3">
              <div className="text-2xl font-bold text-gray-900">#3</div>
              <div className="text-gray-400 text-xs">city rank</div>
            </div>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex gap-2 flex-wrap justify-center mb-10">
          {['GPS Tracking', 'Capture Territory', 'Beat Rivals', 'Leaderboard'].map(tag => (
            <span key={tag} className="bg-white border border-gray-200 text-gray-600 text-sm px-3 py-1 rounded-full font-medium">
              {tag}
            </span>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="w-full max-w-sm flex flex-col gap-3">
          <Link
            to="/signup"
            className="w-full bg-[#AAEE00] text-black font-bold py-4 rounded-2xl text-center text-lg hover:bg-[#99dd00] transition-colors"
          >
            Join Us
          </Link>
          <Link
            to="/login"
            className="w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-4 rounded-2xl text-center text-lg hover:border-gray-300 transition-colors"
          >
            Log In
          </Link>
        </div>

      </div>

      {/* Bottom text */}
      <div className="text-center pb-8 text-gray-400 text-sm">
        Turn your runs into digital territory
      </div>

    </div>
  )
}

export default Landing