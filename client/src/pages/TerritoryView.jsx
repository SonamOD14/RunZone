import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAllTiles, getMyTiles } from '../api/territory'

function TerritoryView() {
  const { user } = useAuth()
  const [allTiles, setAllTiles] = useState([])
  const [myTiles, setMyTiles] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    async function fetchTiles() {
      try {
        const [allRes, myRes] = await Promise.all([
          getAllTiles(),
          getMyTiles()
        ])
        setAllTiles(allRes.data.tiles)
        setMyTiles(myRes.data)
      } catch (err) {
        console.error('Territory fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTiles()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f0]">
        <div className="text-[#AAEE00] text-xl animate-pulse">Loading territory...</div>
      </div>
    )
  }

  const myTilesList = allTiles.filter(t => t.owner_id === user?.id)
  const otherTiles = allTiles.filter(t => t.owner_id !== user?.id && t.owner_id !== null)
  const unclaimedTiles = allTiles.filter(t => t.owner_id === null)

  return (
    <div className="min-h-screen bg-[#f5f5f0] pb-24">

      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-3xl font-black text-gray-900">Territory</h1>
        <p className="text-gray-400 text-sm mt-1">Your digital kingdom</p>
      </div>

      {/* Territory Stats */}
      <div className="px-6 mb-6">
        <div className="bg-gray-900 rounded-3xl p-6 text-white">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-black text-[#AAEE00]">
                {myTiles?.total_tiles || 0}
              </div>
              <div className="text-gray-400 text-xs mt-1">Your tiles</div>
            </div>
            <div>
              <div className="text-3xl font-black text-white">
                {otherTiles.length}
              </div>
              <div className="text-gray-400 text-xs mt-1">Rivals</div>
            </div>
            <div>
              <div className="text-3xl font-black text-gray-400">
                {unclaimedTiles.length}
              </div>
              <div className="text-gray-400 text-xs mt-1">Unclaimed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-4">
        <div className="flex bg-white rounded-2xl p-1 border border-gray-100">
          {['all', 'mine', 'rivals'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-[#AAEE00] text-black'
                  : 'text-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tile List */}
      <div className="px-6">
        {activeTab === 'all' && (
          <div className="flex flex-col gap-3">
            {allTiles.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
                <div className="text-4xl mb-2">🗺️</div>
                <p className="text-gray-400 text-sm">No territory captured yet.</p>
                <p className="text-gray-400 text-sm">Go for a run to claim tiles!</p>
              </div>
            ) : (
              allTiles.slice(0, 50).map((tile, index) => (
                <div key={index} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${tile.owner_id === user?.id ? 'bg-[#AAEE00]' : tile.owner_id ? 'bg-red-400' : 'bg-gray-300'}`}/>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        Tile ({tile.tile_x}, {tile.tile_y})
                      </p>
                      <p className="text-gray-400 text-xs">
                        {tile.owner_id === user?.id ? 'Owned by you' : tile.username ? `Owned by ${tile.username}` : 'Unclaimed'}
                      </p>
                    </div>
                  </div>
                  <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                    tile.owner_id === user?.id
                      ? 'bg-[#f5ffe0] text-[#AAEE00]'
                      : tile.owner_id
                      ? 'bg-red-50 text-red-400'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {tile.owner_id === user?.id ? 'Yours' : tile.owner_id ? 'Rival' : 'Free'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'mine' && (
          <div className="flex flex-col gap-3">
            {myTilesList.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
                <div className="text-4xl mb-2">🏃</div>
                <p className="text-gray-400 text-sm">You haven't captured any tiles yet.</p>
              </div>
            ) : (
              myTilesList.map((tile, index) => (
                <div key={index} className="bg-white rounded-2xl p-4 border border-[#AAEE00] shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#AAEE00]"/>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        Tile ({tile.tile_x}, {tile.tile_y})
                      </p>
                      <p className="text-gray-400 text-xs">Zoom level {tile.zoom}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#f5ffe0] text-[#AAEE00]">
                    Yours
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'rivals' && (
          <div className="flex flex-col gap-3">
            {otherTiles.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
                <div className="text-4xl mb-2">🏆</div>
                <p className="text-gray-400 text-sm">No rivals yet. You own everything!</p>
              </div>
            ) : (
              otherTiles.slice(0, 50).map((tile, index) => (
                <div key={index} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-400"/>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        Tile ({tile.tile_x}, {tile.tile_y})
                      </p>
                      <p className="text-gray-400 text-xs">
                        Owned by {tile.username || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-50 text-red-400">
                    Rival
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TerritoryView