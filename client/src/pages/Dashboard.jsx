import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getRunStats, getRunHistory } from '../api/runs'
import { getMyTiles } from '../api/territory'
import StatCard from '../components/StatCard'

function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [tiles, setTiles] = useState(null)
  const [recentRuns, setRecentRuns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, tilesRes, runsRes] = await Promise.all([
          getRunStats(),
          getMyTiles(),
          getRunHistory()
        ])
        setStats(statsRes.data)
        setTiles(tilesRes.data)
        setRecentRuns(runsRes.data.runs.slice(0, 3))
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
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f0]">
        <div className="text-[#AAEE00] text-xl animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] pb-24">

      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <p className="text-gray-400 text-sm font-medium">Good morning,</p>
        <h1 className="text-3xl font-black text-gray-900">{user?.username} 👋</h1>
      </div>

      {/* Territory Hero Card */}
      <div className="px-6 mb-6">
        <div className="bg-gray-900 rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#AAEE00] rounded-full opacity-10 -mr-8 -mt-8"/>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#AAEE00] rounded-full opacity-10 -ml-8 -mb-8"/>
          <p className="text-gray-400 text-sm font-medium mb-1">Your Territory</p>
          <div className="text-6xl font-black text-white mb-1">
            {tiles?.total_tiles || 0}
          </div>
          <p className="text-gray-400 text-sm">tiles owned</p>
          <Link
            to="/territory"
            className="mt-4 inline-block bg-[#AAEE00] text-black font-bold px-4 py-2 rounded-xl text-sm"
          >
            View Map →
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Your Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Total Distance"
            value={stats?.total_distance_km || '0.00'}
            unit="km"
            icon="🏃"
          />
          <StatCard
            label="Total Runs"
            value={stats?.total_runs || 0}
            unit="runs"
            icon="⚡"
          />
          <StatCard
            label="Tiles Owned"
            value={tiles?.total_tiles || 0}
            unit="tiles"
            icon="🗺️"
          />
          <StatCard
            label="Active Days"
            value={stats?.total_runs || 0}
            unit="days"
            icon="🔥"
          />
        </div>
      </div>

      {/* Recent Runs */}
      <div className="px-6 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-gray-900">Recent Runs</h2>
          <Link to="/profile" className="text-[#AAEE00] text-sm font-bold">See all</Link>
        </div>

        {recentRuns.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
            <div className="text-4xl mb-2">🏃</div>
            <p className="text-gray-400 text-sm">No runs yet. Start your first run!</p>
            <Link
              to="/run"
              className="mt-3 inline-block bg-[#AAEE00] text-black font-bold px-4 py-2 rounded-xl text-sm"
            >
              Start Running
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentRuns.map((run) => (
              <div key={run.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">
                      {(run.distance_meters / 1000).toFixed(2)} km
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(run.created_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#AAEE00]">+{run.tiles_captured}</p>
                    <p className="text-gray-400 text-xs">tiles</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start Run CTA */}
      <div className="px-6">
        <Link
          to="/run"
          className="w-full bg-[#AAEE00] text-black font-bold py-4 rounded-2xl text-center text-lg block hover:bg-[#99dd00] transition-colors"
        >
          🏃 Start a Run
        </Link>
      </div>

    </div>
  )
}

export default Dashboard