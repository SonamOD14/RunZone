import { useState, useEffect, useRef, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getRunHistory } from '../api/runs'
import { getMyTiles } from '../api/territory'
import { getMyRank } from '../api/leaderboard'

const MAX_AVATAR_BYTES = 1.5 * 1024 * 1024 // 1.5MB cap — localStorage quotas are small (~5-10MB total)

// --- Streak math -----------------------------------------------------
// A streak day = at least one run logged that calendar day (local time).
// Current streak = consecutive days ending today OR yesterday (so it
// doesn't zero out at midnight before today's run happens).
// Best streak = longest consecutive run anywhere in history.
function computeStreaks(runs) {
  if (!runs || runs.length === 0) {
    return { current: 0, best: 0, last7: [], activeToday: false }
  }

  const dayKey = (d) => {
    const dt = new Date(d)
    return `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`
  }

  const dayMs = 24 * 60 * 60 * 1000
  const uniqueDays = new Set(runs.map((r) => dayKey(r.created_at)))

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Walk backwards from today (or yesterday if today has no run yet)
  let cursor = new Date(today)
  const activeToday = uniqueDays.has(dayKey(cursor))
  if (!activeToday) {
    cursor = new Date(today.getTime() - dayMs)
  }

  let current = 0
  while (uniqueDays.has(dayKey(cursor))) {
    current += 1
    cursor = new Date(cursor.getTime() - dayMs)
  }

  // Best streak: sort unique day timestamps ascending, walk for max run length
  const sortedDays = Array.from(uniqueDays)
    .map((key) => {
      const [y, m, d] = key.split('-').map(Number)
      return new Date(y, m, d).getTime()
    })
    .sort((a, b) => a - b)

  let best = sortedDays.length ? 1 : 0
  let run = 1
  for (let i = 1; i < sortedDays.length; i++) {
    if (sortedDays[i] - sortedDays[i - 1] === dayMs) {
      run += 1
    } else {
      run = 1
    }
    best = Math.max(best, run)
  }
  best = Math.max(best, current)

  // Last 7 calendar days, oldest -> newest, for the mini strip
  const last7 = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * dayMs)
    last7.push({
      date: d,
      active: uniqueDays.has(dayKey(d)),
      isToday: i === 0,
    })
  }

  return { current, best, last7, activeToday }
}

function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [runs, setRuns] = useState([])
  const [tiles, setTiles] = useState(null)
  const [rank, setRank] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')

  const [profilePic, setProfilePic] = useState(() => {
    try {
      return localStorage.getItem(`runzone_avatar_${user?.username}`) || null
    } catch {
      // localStorage can throw in private-browsing / disabled-storage contexts
      return null
    }
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [runsRes, tilesRes, rankRes] = await Promise.all([
          getRunHistory(),
          getMyTiles(),
          getMyRank(),
        ])
        setRuns(runsRes.data.runs)
        setTiles(tilesRes.data)
        setRank(rankRes.data.rank)
      } catch (err) {
        console.error('Profile fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleAvatarClick = () => {
    setAvatarError('')
    fileInputRef.current.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return

    setAvatarError('')

    if (!file.type.startsWith('image/')) {
      setAvatarError('Select an image file.')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError('Image too large — keep it under 1.5MB.')
      return
    }

    setUploading(true)
    const reader = new FileReader()

    reader.onloadend = () => {
      const base64String = reader.result
      setProfilePic(base64String)
      setUploading(false)
      try {
        localStorage.setItem(`runzone_avatar_${user?.username}`, base64String)
      } catch {
        // Quota exceeded or storage unavailable — keep the image visible
        // for this session but tell the operative it won't persist.
        setAvatarError('Saved for this session only — device storage is full.')
      }
    }

    reader.onerror = () => {
      setUploading(false)
      setAvatarError('Could not read that file. Try another image.')
    }

    reader.readAsDataURL(file)
  }

  const totalDistance = runs.reduce((sum, run) => sum + (run.distance_meters || 0), 0)
  const level = Math.max(1, Math.floor(totalDistance / 10000) + 1)
  const nextLevelDistance = level * 10000
  const progressPercent = Math.min(100, (totalDistance / nextLevelDistance) * 100)
  const nearLevelUp = progressPercent >= 85

  const streak = useMemo(() => computeStreaks(runs), [runs])

  const honors = [
    { icon: 'FC', label: 'First Capture', earned: runs.length > 0 },
    { icon: 'NO', label: 'Night Ops', earned: false },
    { icon: '50', label: '50KM Club', earned: totalDistance >= 50000 },
    { icon: 'S7', label: 'Sector Control', earned: (tiles?.total_tiles || 0) >= 10 },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#080808' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#CCFF00', borderTopColor: 'transparent' }} />
          <span className="label-upper" style={{ color: '#CCFF00' }}>Loading operative data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
      <style>{`
        @keyframes rz-rise {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes rz-pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(204,255,0,0.45); }
          70% { box-shadow: 0 0 0 10px rgba(204,255,0,0); }
          100% { box-shadow: 0 0 0 0 rgba(204,255,0,0); }
        }
        @keyframes rz-flame {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.08) rotate(-2deg); }
        }
        .rz-stagger { animation: rz-rise 0.4s ease both; }
        .rz-near-levelup { animation: rz-pulse-ring 1.8s ease-out infinite; }
        .rz-flame-icon { animation: rz-flame 1.6s ease-in-out infinite; display: inline-block; }
        @media (prefers-reduced-motion: reduce) {
          .rz-stagger, .rz-near-levelup, .rz-flame-icon { animation: none !important; }
        }
      `}</style>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex justify-between items-center rz-stagger" style={{ animationDelay: '0ms' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 border-2 flex items-center justify-center" style={{ borderColor: '#CCFF00' }}>
            <span className="text-xs font-black" style={{ color: '#CCFF00' }}>Z</span>
          </div>
          <span className="font-black text-white tracking-wider">RUNZONE</span>
        </div>
        <button style={{ color: '#666' }} aria-label="Settings">
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>
        </button>
      </div>

      {/* Operative Card */}
      <div className="px-6 mb-4 rz-stagger" style={{ animationDelay: '60ms' }}>
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)', border: '1px solid #222' }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10" style={{ background: '#CCFF00' }} />

          <div className="flex items-center gap-4 mb-4">
            {/* Avatar block */}
            <div className="flex-shrink-0">
              <div
                onClick={handleAvatarClick}
                role="button"
                aria-label="Change profile photo"
                className={`w-20 h-20 rounded-full flex items-center justify-center font-black text-2xl flex-shrink-0 lime-glow relative cursor-pointer group overflow-hidden select-none ring-4 transition-transform hover:scale-[1.03] ${nearLevelUp ? 'rz-near-levelup' : ''}`}
                style={{ background: '#CCFF00', color: '#000', boxShadow: '0 0 30px rgba(204,255,0,0.35)' }}
              >
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className={`w-full h-full object-cover transition-opacity ${uploading ? 'opacity-40' : 'opacity-100'}`}
                  />
                ) : (
                  user?.username?.charAt(0).toUpperCase()
                )}
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#CCFF00', borderTopColor: 'transparent' }} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] text-white font-black tracking-tighter">EDIT</span>
                </div>
              </div>
              {avatarError && (
                <div className="mt-2 text-[10px] font-bold max-w-[88px] text-center leading-tight" style={{ color: '#ff5c5c' }}>
                  {avatarError}
                </div>
              )}
            </div>

            <div>
              <div className="text-3xl font-black text-white uppercase tracking-wide">
                {user?.username}
              </div>
              <div
                className="inline-block px-2 py-0.5 rounded text-xs font-black mt-1"
                style={{ background: 'rgba(204,255,0,0.1)', color: '#CCFF00', border: '1px solid rgba(204,255,0,0.2)' }}
              >
                ⚡ ELITE OPERATIVE
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="px-3 py-1 rounded-full text-xs font-black" style={{ background: '#CCFF00', color: '#000' }}>
                  LEVEL {level}
                </div>
                <div className="text-xs" style={{ color: '#888' }}>
                  {(totalDistance / 1000).toFixed(1)} km completed
                </div>
              </div>
            </div>
          </div>

          {/* Big stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-4" style={{ background: '#0e0e0e' }}>
              <div className="text-3xl font-black text-white" style={{ fontFamily: 'Space Grotesk' }}>
                {(totalDistance / 1000).toFixed(0)}
              </div>
              <div className="label-upper mt-1" style={{ color: '#CCFF00' }}>Total Distance KM</div>
            </div>
            <div className="rounded-xl p-4" style={{ background: '#0e0e0e' }}>
              <div className="text-3xl font-black text-white" style={{ fontFamily: 'Space Grotesk' }}>
                #{rank || '--'}
              </div>
              <div className="label-upper mt-1" style={{ color: '#CCFF00' }}>Global Rank</div>
            </div>
            <div className="rounded-xl p-4" style={{ background: '#0e0e0e' }}>
              <div className="text-3xl font-black text-white" style={{ fontFamily: 'Space Grotesk' }}>
                {level}
              </div>
              <div className="label-upper mt-1" style={{ color: '#CCFF00' }}>Level</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs mb-2">
              <span style={{ color: '#888' }}>Progress to next level</span>
              <span style={{ color: '#CCFF00' }}>{progressPercent.toFixed(0)}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#222' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%`, background: '#CCFF00' }}
              />
            </div>
          </div>

          <div className="mt-5 flex gap-2 flex-wrap">
            <div className="px-3 py-1 rounded-full text-[10px] font-black" style={{ background: '#151515', color: '#CCFF00' }}>
              ACTIVE STATUS
            </div>
            <div className="px-3 py-1 rounded-full text-[10px] font-black" style={{ background: '#151515', color: '#fff' }}>
              GRID {tiles?.total_tiles || 0}
            </div>
            <div className="px-3 py-1 rounded-full text-[10px] font-black" style={{ background: '#151515', color: '#fff' }}>
              OPS {runs.length}
            </div>
          </div>
        </div>
      </div>

      {/* Deployment Streak */}
      <div className="px-6 mb-4 rz-stagger" style={{ animationDelay: '120ms' }}>
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: streak.current > 0
              ? 'linear-gradient(135deg, rgba(204,255,0,0.10) 0%, #111 60%)'
              : 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
            border: streak.current > 0 ? '1px solid rgba(204,255,0,0.25)' : '1px solid #222',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="label-upper" style={{ color: '#CCFF00' }}>Deployment Streak</div>
            {streak.current > 0 && !streak.activeToday && (
              <div className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,92,92,0.12)', color: '#ff8a8a', border: '1px solid rgba(255,92,92,0.25)' }}>
                AT RISK · LOG TODAY
              </div>
            )}
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-3xl ${streak.current > 0 ? 'rz-flame-icon' : ''}`} style={{ filter: streak.current > 0 ? 'none' : 'grayscale(1) opacity(0.4)' }}>
                🔥
              </span>
              <div>
                <div className="text-3xl font-black text-white leading-none" style={{ fontFamily: 'Space Grotesk' }}>
                  {streak.current}
                </div>
                <div className="label-upper" style={{ color: '#888' }}>day{streak.current === 1 ? '' : 's'}</div>
              </div>
            </div>

            <div className="h-10 w-px flex-shrink-0" style={{ background: '#222' }} />

            <div className="flex-1">
              <div className="flex justify-between mb-1.5">
                {streak.last7.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1" style={{ width: 24 }}>
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black transition-all"
                      style={{
                        background: d.active ? '#CCFF00' : '#151515',
                        color: d.active ? '#000' : '#555',
                        border: d.isToday ? '1px solid #CCFF00' : '1px solid #222',
                      }}
                    >
                      {d.active ? '●' : ''}
                    </div>
                    <span className="text-[8px] font-bold" style={{ color: d.isToday ? '#CCFF00' : '#555' }}>
                      {d.date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-[10px] font-bold mt-1" style={{ color: '#666' }}>
                Best run: <span style={{ color: '#CCFF00' }}>{streak.best} day{streak.best === 1 ? '' : 's'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-6 mb-4 rz-stagger" style={{ animationDelay: '160ms' }}>
        <div className="grid grid-cols-3 gap-3">
          <div className="card">
            <div className="text-3xl font-black text-white">{tiles?.total_tiles || 0}</div>
            <div className="label-upper mt-1" style={{ color: '#CCFF00' }}>Territories</div>
          </div>
          <div className="card">
            <div className="text-3xl font-black text-white">{runs.length}</div>
            <div className="label-upper mt-1">Total Runs</div>
          </div>
          <div className="card">
            <div className="text-3xl font-black text-white">
              {runs.length > 0 ? Math.round(totalDistance / runs.length / 1000) : 0}
            </div>
            <div className="label-upper mt-1">Avg KM</div>
          </div>
        </div>
      </div>

      {/* Honors */}
      <div className="px-6 mb-4 rz-stagger" style={{ animationDelay: '200ms' }}>
        <div className="label-upper mb-3" style={{ color: '#CCFF00' }}>Honors & Commendations</div>
        <div className="grid grid-cols-4 gap-2">
          {honors.map((honor, i) => (
            <div
              key={i}
              className="card text-center py-3 transition-opacity"
              style={{ opacity: honor.earned ? 1 : 0.3 }}
            >
              <div
                className="w-10 h-10 mx-auto mb-2 flex items-center justify-center rounded-lg text-xs font-black"
                style={{ background: '#151515', color: '#CCFF00', border: '1px solid #222' }}
              >
                {honor.icon}
              </div>
              <div className="text-xs font-bold text-white leading-tight">{honor.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Ops */}
      <div className="px-6 mb-6 rz-stagger" style={{ animationDelay: '240ms' }}>
        <div className="label-upper mb-3 flex items-center gap-2" style={{ color: '#CCFF00' }}>
          <span>■</span>
          <span>Recent Operations</span>
        </div>
        {runs.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-4xl mb-2">■</div>
            <p className="text-sm" style={{ color: '#666' }}>No missions completed yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {runs.slice(0, 5).map((run, index) => (
              <div
                key={run.id}
                className="flex items-center gap-4 rounded-xl px-4 py-3 transition-transform hover:scale-[1.01]"
                style={{ background: 'linear-gradient(135deg, #111 0%, #161616 100%)', border: '1px solid #1f1f1f' }}
              >
                <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: '#CCFF00' }} />
                <div className="flex-1">
                  <div className="text-sm font-black text-white">
                    {index === 0 ? 'SECTOR BREACH' : index === 1 ? 'DAWN PATROL' : 'TERRITORY CLAIM'}
                  </div>
                  <div className="label-upper mt-0.5">
                    {new Date(run.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {Math.floor((run.duration_seconds || 0) / 60)}min
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black" style={{ color: '#CCFF00' }}>
                    {(run.distance_meters / 1000).toFixed(1)}k
                  </div>
                  <div className="label-upper">meters</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-6 mb-6 rz-stagger" style={{ animationDelay: '280ms' }}>
        <div className="flex gap-3">
          <button
            className="flex-1 py-3 rounded-xl font-black text-xs tracking-widest transition-all hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, rgba(204,255,0,0.18) 0%, rgba(204,255,0,0.08) 100%)',
              border: '1px solid rgba(204,255,0,0.25)',
              color: '#CCFF00',
            }}
          >
            ✦ EDIT PROFILE
          </button>
          <button
            onClick={handleLogout}
            className="px-5 py-3 rounded-xl font-black text-xs tracking-widest transition-all hover:brightness-125"
            style={{ background: '#111', border: '1px solid #222', color: '#999' }}
          >
            ⏻ LOGOUT
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile