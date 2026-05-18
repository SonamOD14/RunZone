import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getLeaderboard, getMyRank } from '../api/leaderboard'
import LeaderboardCard from '../components/LeaderboardCard'

function Leaderboard() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const leaderboardRes = await getLeaderboard()
        setLeaderboard(leaderboardRes.data.leaderboard)

        if (user) {
          const rankRes = await getMyRank()
          setMyRank(rankRes.data.rank)
        }
      } catch (err) {
        console.error('Leaderboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f0]">
        <div className="text-[#AAEE00] text-xl animate-pulse">Loading rankings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] pb-24">

      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-3xl font-black text-gray-900">Leaderboard</h1>
        <p className="text-gray-400 text-sm mt-1">Top runners in your city</p>
      </div>

      {/* My Rank Banner */}
      {user && myRank && (
        <div className="px-6 mb-6">
          <div className="bg-gray-900 rounded-3xl p-5 text-white flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Your current rank</p>
              <p className="text-4xl font-black text-[#AAEE00]">#{myRank}</p>
            </div>
            <div className="text-5xl">🏆</div>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="px-6 mb-6">
          <div className="flex items-end justify-center gap-3">

            {/* 2nd place */}
            <div className="flex-1 bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-gray-600">
                2
              </div>
              <p className="font-bold text-gray-900 text-sm truncate">{leaderboard[1]?.username}</p>
              <p className="text-gray-400 text-xs">{leaderboard[1]?.total_tiles} tiles</p>
            </div>

            {/* 1st place */}
            <div className="flex-1 bg-gray-900 rounded-2xl p-5 text-center shadow-lg">
              <div className="text-2xl mb-1">👑</div>
              <div className="w-12 h-12 bg-[#AAEE00] rounded-full flex items-center justify-center mx-auto mb-2 font-black text-black text-lg">
                1
              </div>
              <p className="font-bold text-white text-sm truncate">{leaderboard[0]?.username}</p>
              <p className="text-gray-400 text-xs">{leaderboard[0]?.total_tiles} tiles</p>
            </div>

            {/* 3rd place */}
            <div className="flex-1 bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-amber-600">
                3
              </div>
              <p className="font-bold text-gray-900 text-sm truncate">{leaderboard[2]?.username}</p>
              <p className="text-gray-400 text-xs">{leaderboard[2]?.total_tiles} tiles</p>
            </div>

          </div>
        </div>
      )}

      {/* Full List */}
      <div className="px-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">All Runners</h2>
        {leaderboard.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
            <div className="text-4xl mb-2">🏃</div>
            <p className="text-gray-400 text-sm">No runners yet. Be the first!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {leaderboard.map((runner) => (
              <LeaderboardCard
                key={runner.id}
                rank={runner.rank}
                username={runner.username}
                total_tiles={runner.total_tiles}
                total_distance_km={runner.total_distance_km}
                isCurrentUser={user?.id === runner.id}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default Leaderboard