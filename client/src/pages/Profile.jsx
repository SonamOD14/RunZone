import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getRunHistory } from '../api/runs'
import { getMyTiles } from '../api/territory'
import { getMyRank } from '../api/leaderboard'

function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  
  const [runs, setRuns] = useState([])
  const [tiles, setTiles] = useState(null)
  const [rank, setRank] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  // Grab the image from localStorage on load so it survives refreshes
  const [profilePic, setProfilePic] = useState(() => {
    return localStorage.getItem(`runzone_avatar_${user?.username}`) || null
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [runsRes, tilesRes, rankRes] = await Promise.all([
          getRunHistory(),
          getMyTiles(),
          getMyRank()
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
    fileInputRef.current.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)

    // Convert file to Base64 DataURL so it can be saved permanently in the browser
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result
      
      // Save to state
      setProfilePic(base64String)
      
      // Save to localStorage linked to this specific user
      localStorage.setItem(`runzone_avatar_${user?.username}`, base64String)
      
      setUploading(false)
    }
    
    reader.readAsDataURL(file)
  }

  const totalDistance = runs.reduce((sum, run) => sum + (run.distance_meters || 0), 0)

  const honors = [
    { icon: '🎯', label: 'First Capture', earned: runs.length > 0 },
    { icon: '🌙', label: 'Night Owl', earned: false },
    { icon: '⚡', label: '50km Club', earned: totalDistance >= 50000 },
    { icon: '🗺️', label: 'Sector 7', earned: (tiles?.total_tiles || 0) >= 10 },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#080808' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#CCFF00', borderTopColor: 'transparent' }}/>
          <span className="label-upper" style={{ color: '#CCFF00' }}>Loading operative data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#080808' }}>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 border-2 flex items-center justify-center" style={{ borderColor: '#CCFF00' }}>
            <span className="text-xs font-black" style={{ color: '#CCFF00' }}>Z</span>
          </div>
          <span className="font-black text-white tracking-wider">RUNZONE</span>
        </div>
        <button style={{ color: '#666' }}>
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
        </button>
      </div>

      {/* Operative Card */}
      <div className="px-6 mb-4">
        <div className="rounded-2xl p-6 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
          border: '1px solid #222'
        }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10" style={{ background: '#CCFF00' }}/>

          <div className="flex items-center gap-4 mb-4">
            {/* Avatar block */}
            <div 
              onClick={handleAvatarClick}
              className="w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl flex-shrink-0 lime-glow relative cursor-pointer group overflow-hidden select-none"
              style={{ background: '#CCFF00', color: '#000' }}
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
                  <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#CCFF00', borderTopColor: 'transparent' }}/>
                </div>
              )}

              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] text-white font-black tracking-tighter">EDIT</span>
              </div>
            </div>

            <div>
              <div className="text-2xl font-black text-white uppercase tracking-wide">
                {user?.username}
              </div>
              <div
                className="inline-block px-2 py-0.5 rounded text-xs font-black mt-1"
                style={{ background: 'rgba(204,255,0,0.1)', color: '#CCFF00', border: '1px solid rgba(204,255,0,0.2)' }}
              >
                ⚡ ELITE OPERATIVE
              </div>
            </div>
          </div>

          {/* Big stats */}
          <div className="grid grid-cols-2 gap-3">
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
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-6 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="card">
            <div className="text-3xl font-black text-white">{tiles?.total_tiles || 0}</div>
            <div className="label-upper mt-1" style={{ color: '#CCFF00' }}>Territories</div>
          </div>
          <div className="card">
            <div className="text-3xl font-black text-white">{runs.length}</div>
            <div className="label-upper mt-1">Total Runs</div>
          </div>
        </div>
      </div>

      {/* Honors */}
      <div className="px-6 mb-4">
        <div className="label-upper mb-3" style={{ color: '#CCFF00' }}>Honors & Commendations</div>
        <div className="grid grid-cols-4 gap-2">
          {honors.map((honor, i) => (
            <div
              key={i}
              className="card text-center py-3"
              style={{ opacity: honor.earned ? 1 : 0.3 }}
            >
              <div className="text-2xl mb-1">{honor.icon}</div>
              <div className="text-xs font-bold text-white leading-tight">{honor.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Ops */}
      <div className="px-6 mb-6">
        <div className="label-upper mb-3" style={{ color: '#CCFF00' }}>Recent Ops</div>
        {runs.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-4xl mb-2">🏃</div>
            <p className="text-sm" style={{ color: '#666' }}>No missions completed yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {runs.slice(0, 5).map((run, index) => (
              <div
                key={run.id}
                className="flex items-center gap-4 rounded-xl px-4 py-3"
                style={{ background: '#111', border: '1px solid #1f1f1f' }}
              >
                <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: '#CCFF00' }}/>
                <div className="flex-1">
                  <div className="text-sm font-black text-white">
                    {index === 0 ? 'SECTOR BREACH' : index === 1 ? 'DAWN PATROL' : 'TERRITORY CLAIM'}
                  </div>
                  <div className="label-upper mt-0.5">
                    {new Date(run.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })} · {Math.floor((run.duration_seconds || 0) / 60)}min
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

      {/* Logout */}
      <div className="px-6">
        <button
          onClick={handleLogout}
          className="w-full py-4 rounded-xl font-black text-sm tracking-widest transition-all"
          style={{
            background: 'transparent',
            border: '1px solid #1f1f1f',
            color: '#666'
          }}
        >
          ↩ LOG OUT
        </button>
      </div>

    </div>
  )
}

export default Profile