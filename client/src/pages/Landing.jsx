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

      {/* ========== ANIMATED BACKGROUND ========== */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-lime-400/5 via-black to-black" />
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-lime-400/10 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-lime-300/5 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#CCFF00 1px, transparent 1px), linear-gradient(90deg, #CCFF00 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #CCFF00 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* ========== NAV ========== */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 border-2 flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(204,255,0,0.3)]" style={{ borderColor: '#CCFF00' }}>
            <span className="text-base font-black" style={{ color: '#CCFF00' }}>Z</span>
          </div>
          <span className="font-black text-white text-lg tracking-[0.2em]">RUNZONE</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/leaderboard" className="hidden sm:block text-xs font-semibold tracking-wider text-gray-400 hover:text-white transition-colors">
            LEADERBOARD
          </Link>
          <Link to="/login" className="text-xs font-bold tracking-wider px-5 py-2.5 rounded-xl border transition-all duration-300" style={{ borderColor: '#333', color: '#CCFF00' }}>
            SIGN IN
          </Link>
        </div>
      </nav>

      {/* ========== HERO ========== */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-12 md:pt-16 md:pb-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Left */}
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border" style={{ borderColor: 'rgba(204,255,0,0.15)', background: 'rgba(204,255,0,0.04)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#CCFF00', boxShadow: '0 0 6px #CCFF00' }} />
              <span className="text-[10px] font-bold tracking-[0.15em]" style={{ color: '#CCFF00' }}>
                REAL-WORLD TERRITORY RUNNING
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-none mb-6">
              <span className="text-white inline-block animate-fade-in-up">RUN.</span>
              <br />
              <span className="text-white inline-block animate-fade-in-up" style={{ animationDelay: '0.15s' }}>CLAIM.</span>
              <br />
              <span className="inline-block animate-fade-in-up" style={{ color: '#CCFF00', textShadow: '0 0 40px rgba(204,255,0,0.3)', animationDelay: '0.3s' }}>
                CONQUER.
              </span>
            </h1>

            <p className="text-base sm:text-lg mb-8 max-w-xl leading-relaxed text-gray-400 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              Transform every run into a strategic battle for territory. Track your routes,
              expand your influence across the city, and rise through the ranks to dominate the map.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <Link to="/signup" className="btn-lime text-center sm:max-w-[200px] inline-flex items-center justify-center gap-2">
                GET STARTED
                <span className="text-base">→</span>
              </Link>
              <Link to="/login" className="btn-ghost text-center sm:max-w-[160px]">
                SIGN IN
              </Link>
            </div>

            <div className="flex flex-wrap gap-8 sm:gap-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              {[
                { value: '10K+', label: 'Territories Claimed' },
                { value: '500+', label: 'Active Runners' },
                { value: '24/7', label: 'Live Competition' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: '#CCFF00', fontFamily: "'Space Grotesk', sans-serif" }}>
                    {s.value}
                  </div>
                  <div className="text-xs font-medium tracking-wider mt-1" style={{ color: '#555' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Radar/Map Visual */}
          <div className="flex-shrink-0 animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96">
              {/* Outer rings */}
              <div className="absolute inset-0 rounded-full border" style={{ borderColor: 'rgba(204,255,0,0.08)' }} />
              <div className="absolute inset-[15%] rounded-full border" style={{ borderColor: 'rgba(204,255,0,0.06)' }} />
              <div className="absolute inset-[30%] rounded-full border" style={{ borderColor: 'rgba(204,255,0,0.04)' }} />

              {/* Sweep */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="absolute inset-0" style={{
                  background: 'conic-gradient(from 0deg, transparent 0%, rgba(204,255,0,0.05) 30%, transparent 50%)',
                  animation: 'radarSweep 4s linear infinite',
                }} />
              </div>

              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full" style={{ background: '#CCFF00', boxShadow: '0 0 20px rgba(204,255,0,0.6)' }}>
                <div className="absolute inset-0 rounded-full animate-ping" style={{ background: '#CCFF00', opacity: 0.3 }} />
              </div>

              {/* Blips */}
              {[
                { top: '28%', left: '25%', delay: '0s' },
                { top: '45%', left: '65%', delay: '1.5s' },
                { top: '65%', left: '30%', delay: '0.8s' },
                { top: '20%', left: '60%', delay: '2.2s' },
                { top: '70%', left: '70%', delay: '1s' },
              ].map((blip, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full" style={{
                    top: blip.top, left: blip.left,
                    background: '#CCFF00',
                    boxShadow: '0 0 10px rgba(204,255,0,0.5)',
                    animation: `pulseRing 2s ease-out ${blip.delay} infinite`,
                  }}
                />
              ))}

              {/* Corner brackets */}
              {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos, i) => (
                <div key={i} className={`absolute ${pos} w-6 h-6`}>
                  <div className="absolute w-4 h-[1.5px]" style={{ background: '#CCFF00', [i === 1 || i === 3 ? 'right' : 'left']: 0, top: 0 }} />
                  <div className="absolute h-4 w-[1.5px]" style={{ background: '#CCFF00', [i === 1 || i === 3 ? 'right' : 'left']: 0, top: 0 }} />
                  <div className="absolute w-4 h-[1.5px]" style={{ background: '#CCFF00', [i === 1 || i === 3 ? 'right' : 'left']: 0, bottom: 0 }} />
                  <div className="absolute h-4 w-[1.5px]" style={{ background: '#CCFF00', [i === 1 || i === 3 ? 'right' : 'left']: 0, bottom: 0 }} />
                </div>
              ))}

              {/* Grid lines inside */}
              <svg className="absolute inset-[8%] w-[84%] h-[84%] opacity-10" viewBox="0 0 100 100">
                <line x1="0" y1="50" x2="100" y2="50" stroke="#CCFF00" strokeWidth="0.3" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="#CCFF00" strokeWidth="0.3" />
                <line x1="25" y1="0" x2="25" y2="100" stroke="#CCFF00" strokeWidth="0.15" />
                <line x1="75" y1="0" x2="75" y2="100" stroke="#CCFF00" strokeWidth="0.15" />
                <line x1="0" y1="25" x2="100" y2="25" stroke="#CCFF00" strokeWidth="0.15" />
                <line x1="0" y1="75" x2="100" y2="75" stroke="#CCFF00" strokeWidth="0.15" />
              </svg>

              {/* Bottom label */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-[0.2em] text-center" style={{ color: 'rgba(204,255,0,0.3)' }}>
                SECTOR SCAN ACTIVE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border" style={{ borderColor: 'rgba(204,255,0,0.15)', background: 'rgba(204,255,0,0.04)' }}>
            <span className="text-[10px] font-bold tracking-[0.15em]" style={{ color: '#CCFF00' }}>
              WHY RUNZONE
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight">
            Every Run is a<br />
            <span style={{ color: '#CCFF00' }}>Strategic Mission</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="1.5">
                  <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              ),
              title: 'Real-Time Tracking',
              desc: 'GPS-powered route tracking with live distance, pace, and duration metrics as you run.',
            },
            {
              icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="1.5">
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              ),
              title: 'Territory Capture',
              desc: 'Every kilometer you run captures tiles on the city map. Build your zone and defend it.',
            },
            {
              icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="1.5">
                  <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ),
              title: 'Live Leaderboard',
              desc: 'Compete with runners in real-time. See who owns the most territory in your city.',
            },
            {
              icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="1.5">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
              title: 'Runner Community',
              desc: 'Connect with local runners, form squads, and coordinate territory takeovers.',
            },
          ].map((f, i) => (
            <div
              key={f.title}
              className="group rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, rgba(17,17,17,1) 0%, rgba(26,26,26,1) 100%)',
                border: '1px solid #222',
                animation: 'fadeInUp 0.6s ease-out forwards',
                animationDelay: `${0.2 + i * 0.1}s`,
                opacity: 0,
              }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(204,255,0,0.15)]" style={{ background: 'rgba(204,255,0,0.06)', border: '1px solid rgba(204,255,0,0.1)' }}>
                {f.icon}
              </div>
              <h3 className="text-base font-black text-white mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#666' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border" style={{ borderColor: 'rgba(204,255,0,0.15)', background: 'rgba(204,255,0,0.04)' }}>
            <span className="text-[10px] font-bold tracking-[0.15em]" style={{ color: '#CCFF00' }}>
              HOW IT WORKS
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight">
            Three Steps to<br />
            <span style={{ color: '#CCFF00' }}>Domination</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[16.66%] right-[16.66%] h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(204,255,0,0.2), transparent)' }} />

          {[
            {
              step: '01',
              title: 'Go for a Run',
              desc: 'Lace up and head out. Any run counts — track your route, distance, and pace in real-time.',
              icon: (
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="1.5">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
            },
            {
              step: '02',
              title: 'Capture Territory',
              desc: 'Every kilometer you run claims new tiles on the map. Build your zone and defend it from rivals.',
              icon: (
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="1.5">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              step: '03',
              title: 'Climb the Ranks',
              desc: 'Compete with runners in your city. The more territory you own, the higher you rise on the leaderboard.',
              icon: (
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="1.5">
                  <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ),
            },
          ].map((item, i) => (
            <div
              key={item.step}
              className="relative rounded-2xl p-7 text-center transition-all duration-500 hover:shadow-[0_0_30px_rgba(204,255,0,0.06)]"
              style={{
                background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
                border: '1px solid #222',
                animation: 'fadeInUp 0.6s ease-out forwards',
                animationDelay: `${0.3 + i * 0.15}s`,
                opacity: 0,
              }}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(204,255,0,0.06)', border: '1px solid rgba(204,255,0,0.1)' }}>
                {item.icon}
              </div>
              <div className="text-[11px] font-black tracking-[0.2em] mb-2" style={{ color: 'rgba(204,255,0,0.4)' }}>
                STEP {item.step}
              </div>
              <h3 className="text-lg font-black text-white mb-2">{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#666' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== STATS SECTION ========== */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="rounded-3xl p-8 md:p-14 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(17,17,17,0.8) 0%, rgba(26,26,26,0.8) 100%)',
          border: '1px solid #222',
        }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: '#CCFF00' }} />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 relative z-10">
            {[
              { value: '10,000+', label: 'Territories Claimed', sub: 'and counting' },
              { value: '500+', label: 'Active Operatives', sub: 'daily runners' },
              { value: '50+', label: 'Cities Covered', sub: 'worldwide' },
              { value: '24/7', label: 'Live Action', sub: 'never stops' },
            ].map((s, i) => (
              <div key={s.label} className="text-center" style={{
                animation: 'fadeInUp 0.6s ease-out forwards',
                animationDelay: `${0.3 + i * 0.1}s`,
                opacity: 0,
              }}>
                <div className="text-3xl md:text-4xl font-black tracking-tight mb-1" style={{
                  color: '#CCFF00',
                  fontFamily: "'Space Grotesk', sans-serif",
                  textShadow: '0 0 30px rgba(204,255,0,0.15)',
                }}>
                  {s.value}
                </div>
                <div className="text-sm font-bold text-white mb-0.5">{s.label}</div>
                <div className="text-xs" style={{ color: '#444' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-16 md:pb-24">
        <div className="rounded-3xl p-10 md:p-16 text-center relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #CCFF00 0%, #B8E600 100%)',
          color: '#000',
        }}>
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-20 bg-white" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-10 bg-white" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.08)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-black" />
              <span className="text-[10px] font-bold tracking-[0.15em]">READY TO COMPETE</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase mb-4 leading-tight">
              Start Your<br />
              Conquest Today
            </h2>
            <p className="text-base md:text-lg opacity-80 mb-8 max-w-lg mx-auto">
              Join 500+ runners already claiming territory in their cities. Every run is a move on the board.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-300 hover:scale-105"
              style={{ background: '#000', color: '#CCFF00' }}
            >
              Create Free Account
              <span className="text-base">→</span>
            </Link>
            <p className="text-xs opacity-60 mt-4">No credit card required. Free to play.</p>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="relative z-10 border-t" style={{ borderColor: '#111' }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 border flex items-center justify-center" style={{ borderColor: '#CCFF00' }}>
                <span className="text-xs font-black" style={{ color: '#CCFF00' }}>Z</span>
              </div>
              <span className="font-black text-sm tracking-wider text-white">RUNZONE</span>
            </div>
            <div className="flex items-center gap-8 text-xs" style={{ color: '#444' }}>
              <span className="hover:text-gray-300 transition-colors cursor-pointer">Terms of Service</span>
              <span className="hover:text-gray-300 transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-gray-300 transition-colors cursor-pointer">Contact</span>
            </div>
            <span className="text-xs" style={{ color: '#333' }}>
              &copy; 2026 RunZone. All rights reserved.
            </span>
          </div>
        </div>
      </footer>

      {/* Bottom glow */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-32 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: '#CCFF00' }} />
    </div>
  )
}

export default Landing
