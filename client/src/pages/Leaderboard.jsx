import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getLeaderboard, getMyRank } from '../api/leaderboard'

function Leaderboard() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [myData, setMyData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('global')

  useEffect(() => {
    async function fetchData() {
      try {
        const leaderboardRes = await getLeaderboard()
        setLeaderboard(leaderboardRes.data.leaderboard)
        if (user) {
          const rankRes = await getMyRank()
          setMyRank(rankRes.data.rank)
          const me = leaderboardRes.data.leaderboard.find(r => r.id === user.id)
          setMyData(me)
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
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#080808' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#CCFF00', borderTopColor: 'transparent' }}/>
          <span className="label-upper" style={{ color: '#CCFF00' }}>Loading rankings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#080808' }}>

      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="label-upper mb-1" style={{ color: '#CCFF00' }}>Global</div>
            <h1 className="text-3xl font-black text-white uppercase">Leaderboard</h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-4">
        <div className="flex gap-2">
          {['global', 'local'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-2 rounded-xl text-xs font-black tracking-wider transition-all uppercase"
              style={{
                background: activeTab === tab ? '#CCFF00' : '#111',
                color: activeTab === tab ? '#000' : '#666',
                border: `1px solid ${activeTab === tab ? '#CCFF00' : '#222'}`
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* My Standing Card */}
      {user && myRank && (
        <div className="px-6 mb-4">
          <div className="rounded-2xl p-5 relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
            border: '1px solid rgba(204,255,0,0.2)'
          }}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10" style={{ background: '#CCFF00' }}/>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="label-upper mb-1">Current Standing</div>
                <div className="text-4xl font-black lime-text-glow" style={{ color: '#CCFF00', fontFamily: 'Space Grotesk' }}>
                  #{myRank}
                </div>
              </div>
              <div>
                <div className="label-upper mb-1">Next Rank</div>
                <div className="text-2xl font-black text-white">
                  #{Math.max(1, myRank - 1)}
                </div>
                <div className="label-upper mt-1" style={{ color: '#CCFF00' }}>
                  {myData ? `${Math.max(0, (leaderboard[myRank - 2]?.total_tiles || 0) - myData.total_tiles)} tiles to go` : ''}
                </div>
              </div>
              <div>
                <div className="label-upper mb-1">Territories</div>
                <div className="text-2xl font-black text-white">
                  {myData?.total_tiles || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="px-6">
        {leaderboard.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-5xl mb-3">🏆</div>
            <div className="text-white font-bold mb-1">No operatives yet</div>
            <p className="text-sm" style={{ color: '#666' }}>Be the first to run and claim territory</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {leaderboard.map((runner) => {
              const isCurrentUser = user?.id === runner.id
              const isTop3 = runner.rank <= 3

              return (
                <div
                  key={runner.id}
                  className="flex items-center gap-4 rounded-xl px-4 py-3 transition-all"
                  style={{
                    background: isCurrentUser ? 'rgba(204,255,0,0.05)' : '#111',
                    border: `1px solid ${isCurrentUser ? 'rgba(204,255,0,0.3)' : '#1f1f1f'}`
                  }}
                >
                  {/* Rank */}
                  <div
                    className="w-8 text-center font-black text-sm"
                    style={{ color: isTop3 ? '#CCFF00' : '#444' }}
                  >
                    {String(runner.rank).padStart(2, '0')}
                  </div>

                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                    style={{
                      background: isCurrentUser ? '#CCFF00' : '#1a1a1a',
                      color: isCurrentUser ? '#000' : '#666',
                      border: `1px solid ${isCurrentUser ? '#CCFF00' : '#333'}`
                    }}
                  >
                    {runner.username.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-sm uppercase truncate">
                        {runner.username}
                      </span>
                      {isCurrentUser && (
                        <span
                          className="text-xs font-black px-1.5 py-0.5 rounded flex-shrink-0"
                          style={{ background: 'rgba(204,255,0,0.15)', color: '#CCFF00' }}
                        >
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="label-upper mt-0.5">
                      {runner.total_distance_km} KM Total
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-black text-white">{runner.total_tiles}</div>
                    <div className="label-upper">tiles</div>
                  </div>

                  {/* Trend icon */}
                  <div style={{ color: '#CCFF00' }}>
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                    </svg>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard
