import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getRunStats, getRunHistory } from '../api/runs'
import { getMyTiles } from '../api/territory'
import { getLeaderboard } from '../api/leaderboard'

function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [tiles, setTiles] = useState(null)
  const [recentRuns, setRecentRuns] = useState([])
  const [topRunners, setTopRunners] = useState([])
  const [loading, setLoading] = useState(true)

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
        setRecentRuns(runsRes.data.runs.slice(0, 3))
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
      <div className="px-6 pt-12 pb-4 flex justify-between items-start">
        <div>
          <div className="label-upper mb-1" style={{ color: '#CCFF00' }}>Operative</div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wide">
            {user?.username}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full live-pulse" style={{ background: '#CCFF00' }}/>
          <span className="label-upper" style={{ color: '#CCFF00' }}>SCORE</span>
          <span className="font-black text-white">{(tiles?.total_tiles || 0) * 34}</span>
        </div>
      </div>

      {/* Global Domination Hero Card */}
      <div className="px-6 mb-4">
        <div className="rounded-2xl p-6 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
          border: '1px solid #222'
        }}>
          {/* Glow */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-10" style={{ background: '#CCFF00' }}/>

          <div className="label-upper mb-1" style={{ color: '#CCFF00' }}>Global Domination</div>
          <div className="text-6xl font-black lime-text-glow mb-0" style={{ color: '#CCFF00', fontFamily: 'Space Grotesk' }}>
            {((tiles?.total_tiles || 0) * 0.0057).toFixed(1)}
          </div>
          <div className="text-white font-bold text-lg mb-1">SQ KM OWNED</div>
          <div className="text-xs mb-4" style={{ color: '#666' }}>
            Top {Math.max(1, 100 - (tiles?.total_tiles || 0))}% of Sector-7 Zone
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-3 text-center" style={{ background: '#0e0e0e' }}>
              <div className="text-xl font-black" style={{ color: '#CCFF00' }}>
                {stats?.total_distance_km || '0.00'}
              </div>
              <div className="label-upper mt-1">KM</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: '#0e0e0e' }}>
              <div className="text-xl font-black text-white">
                {stats?.total_runs || 0}
              </div>
              <div className="label-upper mt-1">RUNS</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: '#0e0e0e' }}>
              <div className="text-xl font-black" style={{ color: '#CCFF00' }}>
                {tiles?.total_tiles || 0}
              </div>
              <div className="label-upper mt-1">TILES</div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Intel */}
      {recentRuns.length > 0 && (
        <div className="px-6 mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="label-upper" style={{ color: '#CCFF00' }}>Daily Intel</span>
          </div>
          <div className="card">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-black" style={{ color: '#CCFF00' }}>
                  {(recentRuns[0]?.distance_meters / 1000).toFixed(1)}
                </div>
                <div className="label-upper mt-1">DIST KM</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">
                  {Math.floor((recentRuns[0]?.duration_seconds || 0) / 60)}:{String((recentRuns[0]?.duration_seconds || 0) % 60).padStart(2, '0')}
                </div>
                <div className="label-upper mt-1">TIME</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">
                  {recentRuns[0]?.tiles_captured || 0}
                </div>
                <div className="label-upper mt-1">TILES</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zone Ops - Start Run CTA */}
      <div className="px-6 mb-4">
        <div className="label-upper mb-3" style={{ color: '#CCFF00' }}>Zone Ops</div>
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="inline-block px-2 py-1 rounded text-xs font-bold mb-2" style={{ background: 'rgba(204,255,0,0.1)', color: '#CCFF00' }}>
                ACTIVE
              </div>
              <div className="text-white font-black text-lg">Capture the Streets</div>
              <div className="text-sm mt-1" style={{ color: '#666' }}>
                Run and claim new territory tiles
              </div>
            </div>
          </div>
          <Link
            to="/run"
            className="btn-lime text-center block"
          >
            ⚡ INITIALIZE RUN
          </Link>
        </div>
      </div>

      {/* Top Operatives */}
      <div className="px-6 mb-4">
        <div className="flex justify-between items-center mb-3">
          <span className="label-upper" style={{ color: '#CCFF00' }}>Top Operatives</span>
          <Link to="/leaderboard" className="text-xs font-bold" style={{ color: '#CCFF00' }}>VIEW ALL</Link>
        </div>

        {topRunners.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-4xl mb-2">🏃</div>
            <p className="text-sm" style={{ color: '#666' }}>No operatives yet. Be the first!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {topRunners.map((runner) => (
              <div key={runner.id} className="card flex items-center gap-4">
                <div className="text-lg font-black w-8 text-center" style={{ color: '#CCFF00' }}>
                  {String(runner.rank).padStart(2, '0')}
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-black text-sm" style={{ background: '#CCFF00' }}>
                  {runner.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white text-sm uppercase">{runner.username}</div>
                  <div className="label-upper">{runner.total_distance_km} KM Total</div>
                </div>
                <div className="text-right">
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