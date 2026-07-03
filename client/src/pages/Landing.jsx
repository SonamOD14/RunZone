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
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-lime-400/10 via-black to-black" />
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-lime-400/20 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-lime-300/10 blur-3xl" />

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(#CCFF00 1px, transparent 1px), linear-gradient(90deg, #CCFF00 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top bar */}
      <div className="relative z-10 flex justify-between items-center px-6 pt-12 pb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 border-2 flex items-center justify-center"
            style={{ borderColor: '#CCFF00' }}
          >
            <span className="text-sm font-black" style={{ color: '#CCFF00' }}>
              Z
            </span>
          </div>
          <span className="font-black text-white text-lg tracking-wider">RUNZONE</span>
        </div>
        <Link to="/login" className="text-sm font-bold" style={{ color: '#CCFF00' }}>
          SIGN IN
        </Link>
      </div>

      {/* Hero */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-6 lg:px-16 py-8 lg:py-12 gap-12">
        <div className="max-w-2xl w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6 self-start">
            <div className="w-2 h-2 rounded-full live-pulse" style={{ background: '#CCFF00' }} />
            <span className="label-upper" style={{ color: '#CCFF00' }}>
              Real-World Territory Running
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-none mb-6 uppercase tracking-tight">
            <span className="text-white">RUN.</span>
            <br />
            <span className="text-white">CLAIM.</span>
            <br />
            <span className="lime-text-glow" style={{ color: '#CCFF00' }}>
              CONQUER.
            </span>
          </h1>

          <p className="text-base sm:text-lg mb-10 max-w-xl leading-relaxed text-gray-300">
            Transform every run into a strategic battle for territory. Track your routes,
            expand your influence across the city, and compete with runners to dominate the map.
          </p>

          <div className="flex flex-wrap gap-6 mb-10 text-sm uppercase tracking-wider">
            <div>
              <span className="text-lime-400 font-black">10K+</span>
              <p className="text-gray-500 mt-1">Territories Claimed</p>
            </div>
            <div>
              <span className="text-lime-400 font-black">500+</span>
              <p className="text-gray-500 mt-1">Active Runners</p>
            </div>
            <div>
              <span className="text-lime-400 font-black">24/7</span>
              <p className="text-gray-500 mt-1">Live Competition</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/signup" className="btn-lime text-center block sm:max-w-[200px]">
              GET STARTED
            </Link>
            <Link to="/login" className="btn-ghost text-center block sm:max-w-[160px]">
              SIGN IN
            </Link>
          </div>

          <p className="text-center sm:text-left text-xs mt-6" style={{ color: '#444' }}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        {/* Live preview card */}
        <div className="w-full max-w-md">
          <div className="relative rounded-3xl border border-lime-400/30 bg-white/5 backdrop-blur-xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lime-400 font-bold tracking-widest">CITY DOMINATION</span>
              <span className="text-xs text-gray-400">RUNZONE</span>
            </div>

            <div className="h-64 rounded-2xl bg-black border border-lime-400/20 mb-6 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-lime-400/10 via-transparent to-transparent" />
              <div className="absolute top-8 left-8 w-24 h-1 bg-lime-400 rotate-12" />
              <div className="absolute top-20 left-20 w-32 h-1 bg-lime-400 -rotate-6" />
              <div className="absolute top-32 left-16 w-40 h-1 bg-lime-400 rotate-45" />
              <div className="absolute bottom-20 right-16 w-28 h-1 bg-lime-400 -rotate-12" />
              <div className="absolute top-16 left-14 w-3 h-3 rounded-full bg-lime-400" />
              <div className="absolute top-36 left-44 w-3 h-3 rounded-full bg-lime-400" />
              <div className="absolute bottom-24 right-20 w-3 h-3 rounded-full bg-lime-400" />

              <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-black/70 backdrop-blur-md border border-lime-400/10 p-3">
                <div className="text-xs uppercase tracking-widest text-lime-400">
                  Territory Control Center
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  Capture new streets, defend key zones, and rise on the leaderboard.
                </div>
              </div>
            </div>

            <div className="border-t border-lime-400/10 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Global Rank</span>
                <span className="text-lime-400">#128 Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="relative z-10 px-6 lg:px-16 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="label-upper inline-block mb-3" style={{ color: '#CCFF00' }}>How It Works</div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
            Run. Claim. Dominate.
          </h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto text-sm">
            Three simple steps to start conquering your city.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Go for a Run',
              desc: 'Lace up and head out. Any run counts — track your route, distance, and pace in real-time.',
              icon: '🏃'
            },
            {
              step: '02',
              title: 'Capture Territory',
              desc: 'Every kilometer you run claims new tiles on the map. Build your zone and defend it from rivals.',
              icon: '🗺'
            },
            {
              step: '03',
              title: 'Climb the Ranks',
              desc: 'Compete with runners in your city. The more territory you own, the higher you rise on the leaderboard.',
              icon: '👑'
            }
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-2xl p-6 text-center"
              style={{
                background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
                border: '1px solid #222'
              }}
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <div className="text-xs font-black tracking-widest mb-2" style={{ color: '#CCFF00' }}>{item.step}</div>
              <div className="text-lg font-black text-white mb-2">{item.title}</div>
              <p className="text-sm" style={{ color: '#888' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 px-6 lg:px-16 py-16 text-center">
        <div
          className="rounded-3xl p-10 max-w-3xl mx-auto relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #CCFF00 0%, #B8E600 100%)',
            color: '#000'
          }}
        >
          <div className="absolute top-0 right-0 w-60 h-60 rounded-full blur-3xl opacity-20 bg-white" />
          <h2 className="text-3xl sm:text-4xl font-black uppercase mb-4">Start Your Conquest</h2>
          <p className="text-lg opacity-80 mb-8 max-w-md mx-auto">
            Join 500+ runners already claiming territory in your city.
          </p>
          <Link to="/signup" className="inline-block px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wider" style={{ background: '#000', color: '#CCFF00' }}>
            Create Free Account
          </Link>
          <p className="text-xs opacity-60 mt-4">No credit card required. Free to play.</p>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-6 lg:px-16 py-8 border-t" style={{ borderColor: '#111' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border flex items-center justify-center" style={{ borderColor: '#CCFF00' }}>
              <span className="text-xs font-black" style={{ color: '#CCFF00' }}>Z</span>
            </div>
            <span className="font-black text-sm tracking-wider text-white">RUNZONE</span>
          </div>
          <div className="flex items-center gap-6 text-xs" style={{ color: '#444' }}>
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>Contact</span>
          </div>
          <span className="text-xs" style={{ color: '#333' }}>
            &copy; 2026 RunZone. All rights reserved.
          </span>
        </div>
      </div>

      {/* Bottom glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: '#CCFF00' }}
      />
    </div>
  )
}

export default Landing
