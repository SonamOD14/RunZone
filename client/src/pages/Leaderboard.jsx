import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getLeaderboard, getMyRank } from '../api/leaderboard'

function Leaderboard() {
  // Safe extraction of user context with an empty object fallback 
  const authContext = useAuth() || {}
  const { user } = authContext

  const [leaderboard, setLeaderboard] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [myData, setMyData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('global')
  const [apiError, setApiError] = useState(false)

  useEffect(() => {
    let isMounted = true
    console.log("⚡ [Leaderboard] Component mounted or user status changed. User ID:", user?.id || 'Guest')

    async function fetchData() {
      try {
        setLoading(true)
        setApiError(false)
        
        console.log("🛰️ [Leaderboard] Requesting getLeaderboard()...")
        const leaderboardRes = await getLeaderboard()
        console.log("📦 [Leaderboard] Raw Response Received:", leaderboardRes)
        
        if (!isMounted) return

        // Bulletproof parsing: accepts .data.leaderboard, raw array, or fallback array
        let list = []
        if (leaderboardRes?.data?.leaderboard && Array.isArray(leaderboardRes.data.leaderboard)) {
          list = leaderboardRes.data.leaderboard
        } else if (leaderboardRes?.data && Array.isArray(leaderboardRes.data)) {
          list = leaderboardRes.data
        } else if (Array.isArray(leaderboardRes)) {
          list = leaderboardRes
        } else {
          console.warn("⚠️ [Leaderboard] API response structure didn't match arrays. Received:", leaderboardRes)
        }

        setLeaderboard(list)

        // Only pull personal standing if a authenticated user session exists
        if (user && user.id) {
          console.log("🛰️ [Leaderboard] User logged in. Requesting getMyRank()...")
          try {
            const rankRes = await getMyRank()
            console.log("📦 [Leaderboard] Rank Response:", rankRes)
            
            if (isMounted && rankRes?.data) {
              const assignedRank = rankRes.data.rank || rankRes.data
              setMyRank(typeof assignedRank === 'number' ? assignedRank : null)
              
              const me = list.find(r => r && String(r.id) === String(user.id))
              setMyData(me || null)
            }
          } catch (rankErr) {
            console.error("❌ [Leaderboard] Failed to fetch personal rank profile data:", rankErr)
          }
        }
      } catch (err) {
        console.error('❌ [Leaderboard] Critical top-level fetch error:', err)
        if (isMounted) setApiError(true)
      } finally {
        if (isMounted) {
          console.log("✅ [Leaderboard] Loading process finalized.")
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [user])

  // Secure calculation handler for finding targets ahead of the current user
  const getTilesToGo = () => {
    if (!myData || !myRank || myRank <= 1) return null
    const nextPlayerUp = leaderboard.find(player => player && Number(player.rank) === Number(myRank) - 1)
    if (!nextPlayerUp) return null

    const diff = (nextPlayerUp.total_tiles || 0) - (myData.total_tiles || 0)
    return diff >= 0 ? `${diff} tiles to go` : '0 tiles to go'
  }

  // 1. Loading Phase
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3" style={{ background: '#080808' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#CCFF00', borderTopColor: 'transparent' }} />
        <span style={{ color: '#CCFF00', fontSize: '10px', fontWeight: 900, tracking: '0.1em', textTransform: 'uppercase' }}>
          Establishing Feed connection...
        </span>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 w-full block text-neutral-400 font-sans" style={{ background: '#080808', display: 'block' }}>
      
      {/* Header */}
      <header className="px-6 pt-12 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="mb-1 text-xs font-black uppercase tracking-widest" style={{ color: '#CCFF00' }}>
              ⚡ SECURE ZONE / {activeTab}
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              Leaderboard
            </h1>
          </div>
        </div>
      </header>

      {/* Navigation Controls */}
      <nav className="px-6 mb-6">
        <div className="flex gap-2 p-1 rounded-xl w-fit border border-[#222]" style={{ background: '#111' }}>
          {['global', 'local'].map(tab => {
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-2 rounded-lg text-xs font-black tracking-wider transition-all uppercase"
                style={{
                  background: isActive ? '#CCFF00' : 'transparent',
                  color: isActive ? '#000' : '#666',
                }}
              >
                {tab}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Network / Connection Diagnostic Feedback */}
      {apiError && (
        <div className="mx-6 mb-6 p-4 rounded-xl border border-red-900/30 bg-red-950/20 text-red-400 text-xs font-bold uppercase tracking-wide">
          ⚠️ Network Sync Failure. Displaying cached local datasets.
        </div>
      )}

      {/* User Dashboard Profile Module */}
      {user && myRank && (
        <section className="px-6 mb-6">
          <div className="rounded-2xl p-5 relative overflow-hidden border border-[rgba(204,255,0,0.15)] shadow-xl" style={{ background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)' }}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10 bg-[#CCFF00]" />

            <div className="grid grid-cols-3 gap-4 relative z-10">
              <div>
                <div className="text-[10px] uppercase font-black tracking-wider text-neutral-500 mb-1">Your Rank</div>
                <div className="text-4xl font-black tracking-tighter" style={{ color: '#CCFF00', textShadow: '0 0 10px rgba(204,255,0,0.2)' }}>
                  #{myRank}
                </div>
              </div>
              
              <div>
                <div className="text-[10px] uppercase font-black tracking-wider text-neutral-500 mb-1">Next Objective</div>
                <div className="text-2xl font-black text-white">
                  #{Math.max(1, myRank - 1)}
                </div>
                {getTilesToGo() && (
                  <div className="text-[10px] font-black tracking-wide mt-1" style={{ color: '#CCFF00' }}>
                    {getTilesToGo()}
                  </div>
                )}
              </div>

              <div>
                <div className="text-[10px] uppercase font-black tracking-wider text-neutral-500 mb-1">Sectors Held</div>
                <div className="text-2xl font-black text-white">
                  {myData?.total_tiles || 0}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Leaderboard Array Iteration Render Engine */}
      <main className="px-6">
        {leaderboard.length === 0 ? (
          <div className="border border-[#1f1f1f] bg-[#111] rounded-2xl text-center py-12 px-4">
            <div className="text-5xl mb-3">📡</div>
            <div className="text-white font-bold mb-1">Grid Offline / Empty</div>
            <p className="text-sm text-neutral-500">No telemetry profiles recovered in this sector scope yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {leaderboard.map((runner, index) => {
              if (!runner) return null
              
              // Fallback protection if backend database forgot to append sequence values
              const currentRank = runner.rank || (index + 1)
              const isCurrentUser = user?.id && String(user.id) === String(runner.id)
              const isTop3 = currentRank <= 3

              return (
                <div
                  key={runner.id || index}
                  className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-all ${
                    isCurrentUser ? 'bg-[rgba(204,255,0,0.02)]' : 'bg-[#111]'
                  }`}
                  style={{
                    border: `1px solid ${isCurrentUser ? 'rgba(204,255,0,0.3)' : '#1f1f1f'}`
                  }}
                >
                  {/* Rank Flag */}
                  <div
                    className="w-8 text-center font-black text-sm tracking-tighter"
                    style={{ color: isTop3 ? '#CCFF00' : '#444' }}
                  >
                    {String(currentRank).padStart(2, '0')}
                  </div>

                  {/* Operational Callsign Avatar Tag */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 border"
                    style={{
                      background: isCurrentUser ? '#CCFF00' : '#161616',
                      color: isCurrentUser ? '#000' : '#888',
                      borderColor: isCurrentUser ? '#CCFF00' : '#262626'
                    }}
                  >
                    {runner.username ? runner.username.charAt(0).toUpperCase() : '?'}
                  </div>

                  {/* Runner Core Information Identifiers */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-neutral-200 text-sm tracking-wide uppercase truncate">
                        {runner.username || 'Unknown Operative'}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded flex-shrink-0 bg-[rgba(204,255,0,0.15)] signatures-tag" style={{ color: '#CCFF00' }}>
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mt-0.5">
                      {typeof runner.total_distance_km === 'number' ? runner.total_distance_km.toFixed(1) : '0.0'} KM
                    </div>
                  </div>

                  {/* Quantitative Stats */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-black text-white text-base leading-none">{runner.total_tiles || 0}</div>
                    <div className="text-[9px] font-black uppercase tracking-wider text-neutral-500 mt-0.5">Tiles</div>
                  </div>

                  {/* Vector Directional Chevron */}
                  <div style={{ color: isCurrentUser ? '#CCFF00' : '#2a2a2a' }}>
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                    </svg>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default Leaderboard