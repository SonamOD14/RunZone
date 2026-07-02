import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { getLeaderboard, getMyRank } from '../api/leaderboard'

const MEDALS = ['🥇', '🥈', '🥉']
const RANK_GRADIENTS = [
  'linear-gradient(135deg, #FFD700, #FDB931)',
  'linear-gradient(135deg, #E8E8E8, #B0B0B0)',
  'linear-gradient(135deg, #CD7F32, #A0652A)',
]

function hashColor(name) {
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 35%)`
}

function isActive(lastActive) {
  if (!lastActive) return false
  const diff = Date.now() - new Date(lastActive).getTime()
  return diff < 86400000
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function Leaderboard() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function fetchData() {
      try {
        setLoading(true)
        const res = await getLeaderboard()
        if (!mounted) return
        const list = res?.data?.leaderboard || []
        setEntries(list)
        if (user?.id) {
          try {
            const rankRes = await getMyRank()
            if (mounted && rankRes?.data) {
              setMyRank(rankRes.data.rank ?? null)
            }
          } catch (_) {}
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [user])

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  const myEntry = useMemo(() =>
    user?.id ? entries.find(r => String(r.id) === String(user.id)) : null
  , [entries, user])

  const tilesToNext = useMemo(() => {
    if (!myEntry || !myRank || myRank <= 1) return null
    const above = entries.find(r => Number(r.rank) === Number(myRank) - 1)
    if (!above) return null
    const diff = (above.total_tiles || 0) - (myEntry.total_tiles || 0)
    return diff > 0 ? diff : 0
  }, [myEntry, myRank, entries])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#080808' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 rounded-full border-t-transparent animate-spin" style={{ borderColor: '#CCFF00', borderTopColor: 'transparent' }}/>
          <span className="label-upper" style={{ color: '#CCFF00' }}>Loading leaderboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: '#080808' }}>

      {/* Header */}
      <div className="px-6 pt-12 pb-2" style={{ animation: 'fadeIn 0.4s ease-out' }}>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">🏆</span>
          <div>
            <div className="label-upper" style={{ color: '#CCFF00' }}>GLOBAL RANKINGS</div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              Leaderboard
            </h1>
          </div>
        </div>
        <p className="text-xs mt-2" style={{ color: '#888' }}>
          {entries.length} operatives in the field
        </p>
      </div>

      {/* Your Rank Card */}
      {myRank && myEntry && (
        <div className="px-6 mb-6 mt-4" style={{ animation: 'fadeIn 0.4s ease-out 0.1s both' }}>
          <div
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(204,255,0,0.08) 0%, #111 100%)',
              border: '1px solid rgba(204,255,0,0.2)',
              boxShadow: '0 0 30px rgba(204,255,0,0.06)'
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20" style={{ background: '#CCFF00' }}/>
            <div className="relative z-10">
              <div className="label-upper mb-3" style={{ color: '#CCFF00' }}>YOUR STANDING</div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#888' }}>Rank</div>
                  <div className="text-4xl font-black" style={{ color: '#CCFF00', fontFamily: 'Space Grotesk' }}>
                    #{myRank}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#888' }}>Tiles</div>
                  <div className="text-4xl font-black text-white" style={{ fontFamily: 'Space Grotesk' }}>
                    {myEntry.total_tiles || 0}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#888' }}>Next Rank</div>
                  <div className="text-4xl font-black text-white" style={{ fontFamily: 'Space Grotesk' }}>
                    #{Math.max(1, myRank - 1)}
                  </div>
                  {tilesToNext !== null && (
                    <div className="text-[10px] font-bold mt-1" style={{ color: '#CCFF00' }}>
                      {tilesToNext} tiles away
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {entries.length === 0 ? (
        <div className="px-6" style={{ animation: 'fadeIn 0.4s ease-out 0.15s both' }}>
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">🏃</div>
            <div className="text-white font-bold text-lg mb-2">No Operatives Yet</div>
            <p className="text-sm" style={{ color: '#888' }}>Be the first to claim territory and make your mark.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {top3.length > 0 && (
            <div className="px-6 mb-6" style={{ animation: 'fadeIn 0.4s ease-out 0.15s both' }}>
              <div className="label-upper mb-3" style={{ color: '#CCFF00' }}>TOP OPERATIVES</div>
              <div className="flex gap-3">
                {top3.length >= 2 && (
                  <div className="flex-1 rounded-2xl p-4 text-center relative overflow-hidden" style={{
                    background: 'linear-gradient(180deg, #1a1a1a 0%, #111 100%)',
                    border: '1px solid #2a2a2a',
                    marginTop: '12px'
                  }}>
                    <div className="text-2xl mb-2">{MEDALS[1]}</div>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm mx-auto mb-2"
                      style={{ background: RANK_GRADIENTS[1], color: RANK_COLORS[1] }}
                    >
                      {top3[1]?.username?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="text-white font-bold text-sm uppercase truncate">{top3[1]?.username || 'Runner'}</div>
                    <div className="text-lg font-black mt-1" style={{ color: '#CCFF00', fontFamily: 'Space Grotesk' }}>
                      {top3[1]?.total_tiles || 0}
                    </div>
                    <div className="label-upper">tiles</div>
                  </div>
                )}

                <div className="flex-1 rounded-2xl p-4 text-center relative overflow-hidden" style={{
                  background: 'linear-gradient(180deg, rgba(255,215,0,0.08) 0%, #111 100%)',
                  border: '1px solid rgba(255,215,0,0.2)',
                  transform: 'scale(1.05)',
                  zIndex: 1
                }}>
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }}/>
                  <div className="text-3xl mb-1">{MEDALS[0]}</div>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-black text-sm mx-auto mb-2"
                    style={{ background: RANK_GRADIENTS[0], color: '#000', boxShadow: '0 0 20px rgba(255,215,0,0.3)' }}
                  >
                    {top3[0]?.username?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="text-white font-black uppercase truncate">{top3[0]?.username || 'Runner'}</div>
                  <div className="text-2xl font-black mt-1" style={{ color: '#FFD700', fontFamily: 'Space Grotesk' }}>
                    {top3[0]?.total_tiles || 0}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#888' }}>tiles</div>
                  <div className="text-xs mt-1" style={{ color: '#666' }}>{top3[0]?.total_distance_km || '0'} KM</div>
                </div>

                {top3.length >= 3 && (
                  <div className="flex-1 rounded-2xl p-4 text-center relative overflow-hidden" style={{
                    background: 'linear-gradient(180deg, #1a1a1a 0%, #111 100%)',
                    border: '1px solid #2a2a2a',
                    marginTop: '20px'
                  }}>
                    <div className="text-2xl mb-2">{MEDALS[2]}</div>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm mx-auto mb-2"
                      style={{ background: RANK_GRADIENTS[2], color: '#fff' }}
                    >
                      {top3[2]?.username?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="text-white font-bold text-sm uppercase truncate">{top3[2]?.username || 'Runner'}</div>
                    <div className="text-lg font-black mt-1" style={{ color: '#CCFF00', fontFamily: 'Space Grotesk' }}>
                      {top3[2]?.total_tiles || 0}
                    </div>
                    <div className="label-upper">tiles</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Leaderboard List */}
          <div className="px-6" style={{ animation: 'fadeIn 0.4s ease-out 0.25s both' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="label-upper" style={{ color: '#CCFF00' }}>ALL OPERATIVES</span>
              <span className="text-xs" style={{ color: '#888' }}>
                {entries.length - top3.length} more
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {rest.map((runner, index) => {
                const rank = Number(runner.rank) || (index + 4)
                const isYou = user?.id && String(user.id) === String(runner.id)
                const active = isActive(runner.last_active)
                return (
                  <div
                    key={runner.id || index}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:scale-[1.01]"
                    style={{
                      background: isYou ? 'rgba(204,255,0,0.03)' : '#111',
                      border: `1px solid ${isYou ? 'rgba(204,255,0,0.25)' : '#1f1f1f'}`,
                      animation: `fadeIn 0.3s ease-out ${0.3 + index * 0.03}s both`
                    }}
                  >
                    {/* Rank */}
                    <div className="w-8 text-center font-black text-sm shrink-0" style={{ color: '#444', fontFamily: 'Space Grotesk' }}>
                      #{rank}
                    </div>

                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0"
                      style={{
                        background: isYou ? '#CCFF00' : hashColor(runner.username),
                        color: isYou ? '#000' : '#fff',
                        boxShadow: active && !isYou ? '0 0 0 2px rgba(204,255,0,0.3)' : 'none'
                      }}
                    >
                      {runner.username?.charAt(0)?.toUpperCase() || '?'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white uppercase truncate">
                          {runner.username || 'Unknown'}
                        </span>
                        {isYou && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: 'rgba(204,255,0,0.15)', color: '#CCFF00' }}>
                            YOU
                          </span>
                        )}
                        {active && !isYou && (
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 live-pulse" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: '#666' }}>
                        <span>{runner.total_distance_km || '0'} KM</span>
                        {runner.last_active && (
                          <span>{formatTimeAgo(runner.last_active)}</span>
                        )}
                      </div>
                    </div>

                    {/* Tiles */}
                    <div className="text-right shrink-0">
                      <div className="font-black text-base" style={{ color: '#CCFF00', fontFamily: 'Space Grotesk' }}>
                        {runner.total_tiles || 0}
                      </div>
                      <div className="text-[9px] font-black uppercase tracking-wider" style={{ color: '#555' }}>
                        tiles
                      </div>
                    </div>

                    {/* Arrow */}
                    <div style={{ color: isYou ? '#CCFF00' : '#222' }}>
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                        <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                      </svg>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const RANK_COLORS = ['#000', '#000', '#fff']

export default Leaderboard
