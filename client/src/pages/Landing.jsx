import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Landing() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user])

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#080808' }}>

      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(#CCFF00 1px, transparent 1px), linear-gradient(90deg, #CCFF00 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }}/>

      {/* Top bar */}
      <div className="relative z-10 flex justify-between items-center px-6 pt-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 border-2 flex items-center justify-center" style={{ borderColor: '#CCFF00' }}>
            <span className="text-sm font-black" style={{ color: '#CCFF00' }}>Z</span>
          </div>
          <span className="font-black text-white text-lg tracking-wider">RUNZONE</span>
        </div>
        <Link to="/login" className="text-sm font-bold" style={{ color: '#CCFF00' }}>
          SIGN IN
        </Link>
      </div>

      {/* Hero */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-12">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-6 self-start">
          <div className="w-2 h-2 rounded-full live-pulse" style={{ background: '#CCFF00' }}/>
          <span className="label-upper" style={{ color: '#CCFF00' }}>GPS Territory Game</span>
        </div>

        {/* Main headline */}
        <h1 className="text-6xl font-black leading-none mb-4 uppercase tracking-tight">
          <span className="text-white">CAPTURE</span><br />
          <span className="text-white">YOUR</span><br />
          <span className="lime-text-glow" style={{ color: '#CCFF00' }}>CITY.</span>
        </h1>

        <p className="text-sm mb-10 max-w-xs leading-relaxed" style={{ color: '#666' }}>
          The GPS-based territory game that turns every run into a land grab. Own your streets. Defend your zone.
        </p>

        {/* Stats preview */}
        <div className="flex gap-4 mb-10">
          <div className="flex-1 card text-center">
            <div className="text-2xl font-black stat-number">2.4K</div>
            <div className="label-upper mt-1">Operatives</div>
          </div>
          <div className="flex-1 card text-center">
            <div className="text-2xl font-black stat-number">18K</div>
            <div className="label-upper mt-1">Zones Claimed</div>
          </div>
          <div className="flex-1 card text-center">
            <div className="text-2xl font-black stat-number">94K</div>
            <div className="label-upper mt-1">KM Run</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3">
          <Link to="/signup" className="btn-lime text-center block">
            GET STARTED ⚡
          </Link>
          <Link to="/login" className="btn-ghost text-center block">
            SIGN IN
          </Link>
        </div>

        {/* Fine print */}
        <p className="text-center text-xs mt-6" style={{ color: '#444' }}>
          By continuing, you agree to dominate your local leaderboards.
        </p>

      </div>

      {/* Bottom glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl opacity-20" style={{ background: '#CCFF00' }}/>

    </div>
  )
}

export default Landing