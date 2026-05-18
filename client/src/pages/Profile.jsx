import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getRunHistory } from '../api/runs'
import { getMyTiles } from '../api/territory'

function Profile() {
  const { user, logout } = useAuth()
  const [runs, setRuns] = useState([])
  const [tiles, setTiles] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [runsRes, tilesRes] = await Promise.all([
          getRunHistory(),
          getMyTiles()
        ])
        setRuns(runsRes.data.runs)
        setTiles(tilesRes.data)
      } catch (err) {
        console.error('Profile fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const totalDistance = runs.reduce((sum, run) => sum + (run.distance_meters || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f0]">
        <div className="text-[#AAEE00] text-xl animate-pulse">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] pb-24">

      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-3xl font-black text-gray-900">Profile</h1>
      </div>

      {/* User Card */}
      <div className="px-6 mb-6">
        <div className="bg-gray-900 rounded-3xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#AAEE00] rounded-full flex items-center justify-center">
              <span className="text-2xl font-black text-black">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-black">{user?.username}</h2>
              <p className="text-gray-400 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Your Stats</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
            <div className="text-2xl font-black text-gray-900">{runs.length}</div>
            <div className="text-gray-400 text-xs mt-1">Total Runs</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
            <div className="text-2xl font-black text-gray-900">
              {(totalDistance / 1000).toFixed(1)}
            </div>
            <div className="text-gray-400 text-xs mt-1">km Run</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
            <div className="text-2xl font-black text-[#AAEE00]">
              {tiles?.total_tiles || 0}
            </div>
            <div className="text-gray-400 text-xs mt-1">Tiles Owned</div>
          </div>
        </div>
      </div>

      {/* Run History */}
      <div className="px-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Run History</h2>
        {runs.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
            <div className="text-4xl mb-2">🏃</div>
            <p className="text-gray-400 text-sm">No runs yet. Start running!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {runs.map((run) => (
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

      {/* Logout */}
      <div className="px-6">
        <button
          onClick={logout}
          className="w-full bg-white border-2 border-red-200 text-red-500 font-bold py-4 rounded-2xl text-lg hover:bg-red-50 transition-colors"
        >
          Log Out
        </button>
      </div>

    </div>
  )
}

export default Profile
