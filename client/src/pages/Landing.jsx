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
    <div className="min-h-screen relative overflow-hidden bg-black text-white">

      <div className="absolute inset-0 bg-gradient-to-br from-lime-400/10 via-black to-black" />
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-lime-400/20 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-lime-300/10 blur-3xl" />

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
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-between px-6 lg:px-16 py-12 gap-12">

        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6 self-start">
            <div className="w-2 h-2 rounded-full live-pulse" style={{ background: '#CCFF00' }}/>
            <span className="label-upper" style={{ color: '#CCFF00' }}>GPS Territory Game</span>
          </div>

          {/* Main headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-none mb-6 uppercase tracking-tight">
            <span className="text-white">CAPTURE</span><br />
            <span className="text-white">YOUR</span><br />
            <span className="lime-text-glow" style={{ color: '#CCFF00' }}>CITY.</span>
          </h1>

          <p className="text-lg mb-10 max-w-xl leading-relaxed text-gray-300">
            The GPS-based territory game that turns every run into a land grab. Own your streets. Defend your zone.
          </p>

          {/* Stats preview */}
          <div className="grid grid-cols-3 gap-4 mb-10 max-w-xl">
            <div className="flex-1 card text-center">
              <div className="text-3xl font-black stat-number text-lime-400">52,847</div>
              <div className="label-upper mt-1">Operatives</div>
            </div>
            <div className="flex-1 card text-center">
              <div className="text-3xl font-black stat-number text-lime-400">214K</div>
              <div className="label-upper mt-1">Zones Claimed</div>
            </div>
            <div className="flex-1 card text-center">
              <div className="text-3xl font-black stat-number text-lime-400">1.8M</div>
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

        <div className="w-full max-w-md">
          <div className="relative rounded-3xl border border-lime-400/30 bg-white/5 backdrop-blur-xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lime-400 font-bold tracking-widest">LIVE TERRITORY</span>
              <span className="text-xs text-gray-400">RUNZONE</span>
            </div>

            <div className="h-64 rounded-2xl bg-gradient-to-br from-lime-400/20 to-black border border-lime-400/20 flex items-center justify-center mb-6">
              <div className="text-center">
                <div className="text-6xl mb-2">🗺️</div>
                <p className="text-gray-300">Claim streets and dominate zones</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-black/40 p-3 text-center">
                <div className="text-lime-400 font-black text-2xl">2,847</div>
                <div className="text-xs text-gray-400">Blocks</div>
              </div>
              <div className="rounded-xl bg-black/40 p-3 text-center">
                <div className="text-lime-400 font-black text-2xl">#12</div>
                <div className="text-xs text-gray-400">Rank</div>
              </div>
              <div className="rounded-xl bg-black/40 p-3 text-center">
                <div className="text-lime-400 font-black text-2xl">42.7km</div>
                <div className="text-xs text-gray-400">Today</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-48 rounded-full blur-3xl opacity-30" style={{ background: '#CCFF00' }}/>

    </div>
  )
}

export default Landing