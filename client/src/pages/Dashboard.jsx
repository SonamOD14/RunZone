import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getRunStats, getRunHistory } from '../api/runs'
import { getMyTiles } from '../api/territory'
import { getLeaderboard } from '../api/leaderboard'
import StatCard from '../components/StatCard'

function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [tiles, setTiles] = useState(null)
  const [runs, setRuns] = useState([])
  const [topRunners, setTopRunners] = useState([])
  const [loading, setLoading] = useState(true)

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Morning'
    if (hour < 18) return 'Afternoon'
    return 'Evening'
  }, [])

  const recentRun = runs[0] || null
  const totalTiles = tiles?.total_tiles || 0
  const totalRuns = stats?.total_runs || 0
  const totalKm = parseFloat(stats?.total_distance_km) || 0

  const level = Math.max(1, Math.floor(totalTiles / 5) + 1)
  const xp = totalTiles * 100
  const nextLevelXp = level * 500
  const xpProgress = Math.min(100, (xp / nextLevelXp) * 100)
  const score = Math.round((totalTiles * 34) + (totalKm * 5))

  const streak = useMemo(() => {
    if (!runs.length) return 0
    let s = 0
    const today = new Date()
    const ranToday = runs.some(r => {
      const d = new Date(r.created_at || r.started_at)
      return d.toDateString() === today.toDateString()
    })
    const startOffset = ranToday ? 0 : 1
    for (let i = startOffset; i < 365; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toDateString()
      if (runs.some(r => new Date(r.created_at || r.started_at).toDateString() === dateStr)) {
        s++
      } else break
    }
    return s
  }, [runs])

  const weeklyData = useMemo(() => {
    const days = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toDateString()
      const dayRuns = runs.filter(r =>
        new Date(r.created_at || r.started_at).toDateString() === dateStr
      )
      days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        distance: dayRuns.reduce((s, r) => s + (r.distance_meters || 0), 0),
        runs: dayRuns.length
      })
    }
    return days
  }, [runs])

  const maxWeeklyDist = Math.max(...weeklyData.map(d => d.distance), 1)

  const bestRun = useMemo(() =>
    runs.length ? runs.reduce((best, r) =>
      (r.tiles_captured || 0) > (best.tiles_captured || 0) ? r : best
    ) : null
  , [runs])

  const recentPace = useMemo(() => {
    if (!recentRun || !recentRun.distance_meters || !recentRun.duration_seconds) return null
    const totalMin = recentRun.duration_seconds / 60
    const distKm = recentRun.distance_meters / 1000
    const pace = totalMin / distKm
    const mins = Math.floor(pace)
    const secs = Math.round((pace - mins) * 60)
    return `${mins}:${String(secs).padStart(2, '0')}`
  }, [recentRun])

  const achievements = useMemo(() => [
    {
      icon: '🏆', title: 'First Territory', desc: 'Capture your first tile',
      unlocked: totalTiles >= 1,
      progress: Math.min(100, totalTiles * 100)
    },
    {
      icon: '🔥', title: 'Active Runner', desc: 'Complete 5 runs',
      unlocked: totalRuns >= 5,
      progress: Math.min(100, (totalRuns / 5) * 100)
    },
    {
      icon: '🗺', title: 'Explorer', desc: 'Run 25 KM total',
      unlocked: totalKm >= 25,
      progress: Math.min(100, (totalKm / 25) * 100)
    },
    {
      icon: '⚡', title: 'Streaker', desc: '3-day run streak',
      unlocked: streak >= 3,
      progress: Math.min(100, (streak / 3) * 100)
    },
    {
      icon: '💎', title: 'Tile Mogul', desc: 'Own 25 tiles',
      unlocked: totalTiles >= 25,
      progress: Math.min(100, (totalTiles / 25) * 100)
    },
    {
      icon: '🚀', title: 'First Run', desc: 'Complete your first run',
      unlocked: totalRuns >= 1,
      progress: totalRuns >= 1 ? 100 : 0
    }
  ], [totalTiles, totalRuns, totalKm, streak])

  const weeklyRunsTotal = weeklyData.reduce((s, d) => s + d.runs, 0)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, tilesRes, runsRes, leaderboardRes] = await Promise.all([
          getRunStats(),
          getMyTiles(),
          getRunHistory(),
          getLeaderboard()
        ])
        setStats(statsRes.data)
        setTiles(tilesRes.data)
        setRuns(runsRes.data.runs || [])
        setTopRunners(leaderboardRes.data.leaderboard.slice(0, 3))
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#080808' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 rounded-full border-t-transparent animate-spin" style={{ borderColor: '#CCFF00', borderTopColor: 'transparent' }}/>
          <span className="label-upper" style={{ color: '#CCFF00' }}>Syncing data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#080808' }}>

      {/* Header */}
      <div className="px-6 pt-12 pb-5 flex justify-between items-center" style={{ animation: 'fadeIn 0.4s ease-out' }}>
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black relative shrink-0"
            style={{
              background: '#CCFF00',
              color: '#000',
              boxShadow: '0 0 25px rgba(204,255,0,0.35)'
            }}
          >
            {user?.username?.charAt(0)?.toUpperCase()}
            {streak > 0 && (
              <span className="absolute -top-1 -right-1 text-sm">🔥</span>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black text-white uppercase tracking-wide truncate">
              Good {greeting}, {user?.username}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="px-2 py-1 rounded-full text-[10px] font-black" style={{ background:'#151515', color:'#CCFF00' }}>
                LEVEL {level}
              </span>
              {streak > 0 && (
                <span className="text-[10px] font-bold" style={{ color: '#ff8800' }}>
                  ● {streak}-DAY STREAK
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="rounded-xl px-4 py-3 text-center shrink-0" style={{ background:'#111', border:'1px solid #222' }}>
          <div className="label-upper" style={{ color:'#CCFF00' }}>Score</div>
          <div className="text-xl font-black text-white">{score}</div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="px-6 mb-4" style={{ animation: 'fadeIn 0.4s ease-out 0.05s both' }}>
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg,#CCFF00 0%,#B8E600 100%)',
            color: '#000'
          }}
        >
          <div className="text-xs font-black uppercase tracking-wider">Welcome Back</div>
          <div className="text-2xl font-black mt-1">
            {streak >= 3 ? `${streak}-day streak! Keep it going!` : 'Ready to conquer new territory?'}
          </div>
          <div className="text-sm mt-2 opacity-70">
            Every kilometer expands your zone and increases your rank.
          </div>
        </div>
      </div>

      {/* Level & Stats Card */}
      <div className="px-6 mb-4" style={{ animation: 'fadeIn 0.4s ease-out 0.1s both' }}>
        <div className="rounded-2xl p-6 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
          border: '1px solid #222'
        }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-10" style={{ background: '#CCFF00' }}/>
          <div className="label-upper mb-1" style={{ color: '#CCFF00' }}>LEVEL {level} OPERATIVE</div>
          <div className="text-6xl font-black lime-text-glow mb-0" style={{ color: '#CCFF00', fontFamily: 'Space Grotesk' }}>
            {(totalTiles * 0.0057).toFixed(1)}
          </div>
          <div className="text-white font-bold text-lg mb-1">SQ KM OWNED</div>
          <div className="text-xs mb-4" style={{ color: '#666' }}>
            Top {Math.max(1, 100 - totalTiles)}% of Sector-7 Zone
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-2">
              <span style={{ color:'#888' }}>XP Progress</span>
              <span style={{ color:'#CCFF00' }}>{xp}/{nextLevelXp}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background:'#222' }}>
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width:`${xpProgress}%`, background:'#CCFF00' }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-3 text-center" style={{ background: '#0e0e0e' }}>
              <div className="text-xl font-black" style={{ color: '#CCFF00' }}>{totalKm.toFixed(2)}</div>
              <div className="label-upper mt-1">KM</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: '#0e0e0e' }}>
              <div className="text-xl font-black text-white">{totalRuns}</div>
              <div className="label-upper mt-1">RUNS</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: '#0e0e0e' }}>
              <div className="text-xl font-black" style={{ color: '#CCFF00' }}>{totalTiles}</div>
              <div className="label-upper mt-1">TILES</div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Activity */}
      {runs.length > 0 && (
        <div className="px-6 mb-4" style={{ animation: 'fadeIn 0.4s ease-out 0.15s both' }}>
          <div className="flex justify-between items-center mb-3">
            <span className="label-upper" style={{ color: '#CCFF00' }}>Weekly Activity</span>
            <span className="text-xs" style={{ color: '#888' }}>{weeklyRunsTotal} runs</span>
          </div>
          <div className="card">
            <div className="flex items-end justify-between gap-2" style={{ height: 120 }}>
              {weeklyData.map((day) => {
                const barH = Math.max(3, (day.distance / maxWeeklyDist) * 80)
                return (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <span className="text-[10px] font-bold" style={{ color: day.distance > 0 ? '#CCFF00' : '#333' }}>
                      {day.distance > 0 ? (day.distance / 1000).toFixed(1) : ''}
                    </span>
                    <div
                      className="w-full rounded-t-md transition-all duration-700 ease-out"
                      style={{
                        height: `${barH}px`,
                        background: day.distance > 0
                          ? 'linear-gradient(180deg, #CCFF00, rgba(204,255,0,0.2))'
                          : '#111',
                        border: day.distance > 0 ? 'none' : '1px solid #222'
                      }}
                    />
                    <span className="text-[10px] font-bold" style={{ color: '#666' }}>{day.day}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Daily Intel - Last Run */}
      {recentRun && (
        <div className="px-6 mb-4" style={{ animation: 'fadeIn 0.4s ease-out 0.2s both' }}>
          <div className="flex justify-between items-center mb-3">
            <span className="label-upper" style={{ color: '#CCFF00' }}>Last Run</span>
            <span className="text-xs" style={{ color: '#888' }}>
              {new Date(recentRun.created_at || recentRun.started_at).toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric'
              })}
            </span>
          </div>
          <div className="card">
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-2xl font-black" style={{ color: '#CCFF00' }}>
                  {(recentRun.distance_meters / 1000).toFixed(1)}
                </div>
                <div className="label-upper mt-1">KM</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">
                  {Math.floor((recentRun.duration_seconds || 0) / 60)}:{String((recentRun.duration_seconds || 0) % 60).padStart(2, '0')}
                </div>
                <div className="label-upper mt-1">TIME</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">
                  {recentRun.tiles_captured || 0}
                </div>
                <div className="label-upper mt-1">TILES</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">
                  {recentPace || '--'}
                </div>
                <div className="label-upper mt-1">PACE</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Best Run */}
      {bestRun && bestRun !== recentRun && (
        <div className="px-6 mb-4" style={{ animation: 'fadeIn 0.4s ease-out 0.25s both' }}>
          <div className="label-upper mb-3" style={{ color: '#CCFF00' }}>Best Run</div>
          <div className="card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💪</span>
              <div>
                <div className="text-white font-bold">{(bestRun.distance_meters / 1000).toFixed(1)} KM</div>
                <div className="label-upper">{bestRun.tiles_captured || 0} tiles captured</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-black">
                {Math.floor((bestRun.duration_seconds || 0) / 60)}:{String((bestRun.duration_seconds || 0) % 60).padStart(2, '0')}
              </div>
              <div className="label-upper">DURATION</div>
            </div>
          </div>
        </div>
      )}

      {/* Zone Ops */}
      <div className="px-6 mb-4" style={{ animation: 'fadeIn 0.4s ease-out 0.3s both' }}>
        <div className="label-upper mb-3" style={{ color: '#CCFF00' }}>Zone Ops</div>
        <div className="card">
          <div className="mb-3">
            <div className="inline-block px-2 py-1 rounded text-xs font-bold mb-2" style={{ background: 'rgba(204,255,0,0.1)', color: '#CCFF00' }}>
              MISSION READY
            </div>
            <div className="text-white font-black text-lg">Capture the Streets</div>
            <div className="text-sm mt-1" style={{ color: '#666' }}>
              Run and claim new territory tiles
            </div>
          </div>
          <Link to="/run" className="btn-lime text-center block">
            START MISSION
          </Link>
        </div>
      </div>

      {/* Achievements */}
      <div className="px-6 mb-4" style={{ animation: 'fadeIn 0.4s ease-out 0.35s both' }}>
        <div className="label-upper mb-3" style={{ color:'#CCFF00' }}>
          Achievements
        </div>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((a) => (
            <div
              key={a.title}
              className="card"
              style={{
                opacity: a.unlocked ? 1 : 0.5,
                border: a.unlocked ? '1px solid rgba(204,255,0,0.3)' : '1px solid #222'
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{a.icon}</span>
                <span className="text-xs font-bold text-white uppercase">{a.title}</span>
                {a.unlocked && <span className="ml-auto text-[10px] font-black" style={{ color: '#CCFF00' }}>✓</span>}
              </div>
              <p className="text-[10px] mb-2" style={{ color: '#666' }}>{a.desc}</p>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#222' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${a.progress}%`,
                    background: a.unlocked ? '#CCFF00' : '#444'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Operatives */}
      <div className="px-6 mb-4" style={{ animation: 'fadeIn 0.4s ease-out 0.4s both' }}>
        <div className="flex justify-between items-center mb-3">
          <span className="label-upper" style={{ color: '#CCFF00' }}>Top Operatives</span>
          <Link to="/leaderboard" className="text-xs font-bold" style={{ color: '#CCFF00' }}>VIEW ALL</Link>
        </div>
        {topRunners.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-4xl mb-2">🏃</div>
            <p className="text-sm" style={{ color: '#666' }}>No operatives yet. Be the first!</p>
            <Link to="/run" className="btn-lime text-center block mt-4 max-w-xs mx-auto">
              START RUNNING
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {topRunners.map((runner) => (
              <div key={runner.id} className="card flex items-center gap-4">
                <div className="text-lg font-black w-8 text-center shrink-0" style={{ color: '#CCFF00' }}>
                  {runner.rank === 1 ? '🥇' : runner.rank === 2 ? '🥈' : runner.rank === 3 ? '🥉' : `#${runner.rank}`}
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-black text-sm shrink-0" style={{ background: '#CCFF00' }}>
                  {runner.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm uppercase flex items-center gap-2 truncate">
                    {runner.username}
                    {runner.rank === 1 && <span>👑</span>}
                  </div>
                  <div className="label-upper truncate">{runner.total_distance_km} KM Total</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-black text-white">{runner.total_tiles}</div>
                  <div className="label-upper">tiles</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default Dashboard
