import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAllTiles, getMyTiles } from '../api/territory'
import { MapContainer, TileLayer, Rectangle, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Convert tile coordinates back to lat/lng bounds for drawing on map
function tileToBounds(tile_x, tile_y, zoom) {
  const n = Math.pow(2, zoom)
  const west = (tile_x / n) * 360 - 180
  const east = ((tile_x + 1) / n) * 360 - 180
  const northRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * tile_y) / n)))
  const southRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * (tile_y + 1)) / n)))
  const north = (northRad * 180) / Math.PI
  const south = (southRad * 180) / Math.PI
  return [[south, west], [north, east]]
}

function TerritoryView() {
  const { user } = useAuth()
  const [allTiles, setAllTiles] = useState([])
  const [myTiles, setMyTiles] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('map')

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
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#080808' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#CCFF00', borderTopColor: 'transparent' }}/>
          <span className="label-upper" style={{ color: '#CCFF00' }}>Scanning territory...</span>
        </div>
      </div>
    )
  }

  const myTilesList = allTiles.filter(t => t.owner_id === user?.id)
  const otherTiles = allTiles.filter(t => t.owner_id !== user?.id && t.owner_id !== null)
  const unclaimedTiles = allTiles.filter(t => t.owner_id === null)

  const tabs = [
    { key: 'map', label: 'MAP' },
    { key: 'all', label: 'ALL' },
    { key: 'mine', label: 'MINE' },
    { key: 'rivals', label: 'RIVALS' },
  ]

  const activeTiles = activeTab === 'all' ? allTiles :
    activeTab === 'mine' ? myTilesList : otherTiles

  // Default center — Kathmandu
  const defaultCenter = [27.7103, 85.3222]

  // If user has tiles use first tile as center
  const mapCenter = myTilesList.length > 0
    ? (() => {
        const bounds = tileToBounds(myTilesList[0].tile_x, myTilesList[0].tile_y, myTilesList[0].zoom)
        return [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2]
      })()
    : defaultCenter

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>

      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="label-upper mb-1" style={{ color: '#CCFF00' }}>Tactical</div>
            <h1 className="text-3xl font-black text-white uppercase">Territory Scanner</h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: 'rgba(204,255,0,0.1)', border: '1px solid rgba(204,255,0,0.3)' }}>
            <div className="w-2 h-2 rounded-full live-pulse" style={{ background: '#CCFF00' }}/>
            <span className="label-upper" style={{ color: '#CCFF00' }}>LIVE</span>
          </div>
        </div>
      </div>

      {/* Territory Stats Hero */}
      <div className="px-6 mb-4">
        <div className="rounded-2xl p-5 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
          border: '1px solid #222'
        }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10" style={{ background: '#CCFF00' }}/>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-4xl font-black lime-text-glow" style={{ color: '#CCFF00', fontFamily: 'Space Grotesk' }}>
                {myTiles?.total_tiles || 0}
              </div>
              <div className="label-upper mt-1" style={{ color: '#CCFF00' }}>Your Tiles</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white" style={{ fontFamily: 'Space Grotesk' }}>
                {otherTiles.length}
              </div>
              <div className="label-upper mt-1">Rivals</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white" style={{ fontFamily: 'Space Grotesk' }}>
                {unclaimedTiles.length}
              </div>
              <div className="label-upper mt-1">Unclaimed</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between mb-1">
              <span className="label-upper">Zone Control</span>
              <span className="label-upper" style={{ color: '#CCFF00' }}>
                {allTiles.length > 0 ? Math.round((myTilesList.length / allTiles.length) * 100) : 0}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ background: '#1a1a1a' }}>
              <div
                className="h-1.5 rounded-full lime-glow transition-all"
                style={{
                  background: '#CCFF00',
                  width: `${allTiles.length > 0 ? (myTilesList.length / allTiles.length) * 100 : 0}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-4">
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 py-2.5 rounded-xl text-xs font-black tracking-wider transition-all"
              style={{
                background: activeTab === tab.key ? '#CCFF00' : '#111',
                color: activeTab === tab.key ? '#000' : '#666',
                border: `1px solid ${activeTab === tab.key ? '#CCFF00' : '#222'}`
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAP TAB */}
      {activeTab === 'map' && (
        <div className="px-6">
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #222', height: '1050px' }}>
            <MapContainer
              center={mapCenter}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              {/* Dark map tiles */}
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />

              {/* My tiles - lime green */}
              {myTilesList.map((tile, index) => (
                <Rectangle
                  key={`my-${index}`}
                  bounds={tileToBounds(tile.tile_x, tile.tile_y, tile.zoom)}
                  pathOptions={{
                    color: '#CCFF00',
                    fillColor: '#CCFF00',
                    fillOpacity: 0.3,
                    weight: 1
                  }}
                >
                  <Popup>
                    <div style={{ background: '#111', color: '#CCFF00', padding: '8px', borderRadius: '8px', fontWeight: 'bold' }}>
                      🟢 Your Territory<br />
                      <span style={{ color: '#fff', fontSize: '11px' }}>Tile [{tile.tile_x}, {tile.tile_y}]</span>
                    </div>
                  </Popup>
                </Rectangle>
              ))}

              {/* Rival tiles - red */}
              {otherTiles.map((tile, index) => (
                <Rectangle
                  key={`rival-${index}`}
                  bounds={tileToBounds(tile.tile_x, tile.tile_y, tile.zoom)}
                  pathOptions={{
                    color: '#ff4444',
                    fillColor: '#ff4444',
                    fillOpacity: 0.25,
                    weight: 1
                  }}
                >
                  <Popup>
                    <div style={{ background: '#111', color: '#ff4444', padding: '8px', borderRadius: '8px', fontWeight: 'bold' }}>
                      🔴 {tile.username}'s Territory<br />
                      <span style={{ color: '#fff', fontSize: '11px' }}>Tile [{tile.tile_x}, {tile.tile_y}]</span>
                    </div>
                  </Popup>
                </Rectangle>
              ))}

            </MapContainer>
          </div>

          {/* Map Legend */}
          <div className="flex gap-4 mt-3 px-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: '#CCFF00' }}/>
              <span className="label-upper">Your Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: '#ff4444' }}/>
              <span className="label-upper">Rivals</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: '#333' }}/>
              <span className="label-upper">Unclaimed</span>
            </div>
          </div>

          {/* Empty state */}
          {allTiles.length === 0 && (
            <div className="mt-4 card text-center py-8">
              <div className="text-4xl mb-2">🗺️</div>
              <div className="text-white font-bold mb-1">No territory yet</div>
              <p className="text-sm" style={{ color: '#666' }}>Go for a run to claim your first tiles!</p>
            </div>
          )}
        </div>
      )}

      {/* LIST TABS */}
      {activeTab !== 'map' && (
        <div className="px-6">
          {activeTiles.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-5xl mb-3">🗺️</div>
              <div className="text-white font-bold mb-1">No tiles found</div>
              <p className="text-sm" style={{ color: '#666' }}>
                {activeTab === 'mine' ? 'Go for a run to capture territory' : 'No data available'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {activeTiles.slice(0, 50).map((tile, index) => {
                const isOwned = tile.owner_id === user?.id
                const isRival = tile.owner_id && tile.owner_id !== user?.id
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 rounded-xl px-4 py-3"
                    style={{
                      background: '#111',
                      border: `1px solid ${isOwned ? 'rgba(204,255,0,0.3)' : '#1f1f1f'}`
                    }}
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: isOwned ? '#CCFF00' : isRival ? '#ff4444' : '#333' }}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white font-mono">
                        [{tile.tile_x}, {tile.tile_y}]
                      </div>
                      <div className="label-upper mt-0.5">
                        {isOwned ? 'Owned by you' : tile.username ? `${tile.username}` : 'Unclaimed'}
                      </div>
                    </div>
                    <div
                      className="px-2 py-1 rounded text-xs font-black tracking-wider"
                      style={{
                        background: isOwned ? 'rgba(204,255,0,0.1)' : isRival ? 'rgba(255,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                        color: isOwned ? '#CCFF00' : isRival ? '#ff4444' : '#444'
                      }}
                    >
                      {isOwned ? 'YOURS' : isRival ? 'RIVAL' : 'FREE'}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

    </div>
  )
}

export default TerritoryView