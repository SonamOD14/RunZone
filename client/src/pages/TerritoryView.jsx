import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAllTiles, getMyTiles, getMyHistory, getTileInfo, abandonTile } from '../api/territory'
import { MapContainer, TileLayer, Rectangle, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

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

function tileCenter(tile_x, tile_y, zoom) {
  const bounds = tileToBounds(tile_x, tile_y, zoom)
  return [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2]
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return 'Unknown'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function MapClickHandler({ onClick }) {
  useMapEvents({ click: (e) => onClick(e.latlng) })
  return null
}

function TerritoryView() {
  const { user } = useAuth()
  const [allTiles, setAllTiles] = useState([])
  const [territoryStats, setTerritoryStats] = useState(null)
  const [myTiles, setMyTiles] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('map')
  const [selectedTile, setSelectedTile] = useState(null)
  const [tileDetail, setTileDetail] = useState(null)
  const [tileDetailLoading, setTileDetailLoading] = useState(false)
  const [abandoning, setAbandoning] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [rivalFilter, setRivalFilter] = useState('all')
  const [mapCenter, setMapCenter] = useState([27.7103, 85.3222])

  const fetchData = useCallback(async () => {
    try {
      const [allRes, myRes, histRes] = await Promise.all([
        getAllTiles(),
        getMyTiles(),
        getMyHistory()
      ])
      setAllTiles(allRes.data.tiles)
      setTerritoryStats(allRes.data.stats)
      setMyTiles(myRes.data)
      setHistory(histRes.data.history)

      const myList = allRes.data.tiles.filter(t => t.owner_id === user?.id)
      if (myList.length > 0) {
        setMapCenter(tileCenter(myList[0].tile_x, myList[0].tile_y, myList[0].zoom))
      }
    } catch (err) {
      console.error('Territory fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  const myTilesList = allTiles.filter(t => t.owner_id === user?.id)
  const otherTiles = allTiles.filter(t => t.owner_id !== user?.id && t.owner_id !== null)
  const unclaimedTiles = allTiles.filter(t => t.owner_id === null)

  const uniqueRivals = [...new Set(otherTiles.map(t => t.owner_id))].map(ownerId => {
    const tile = otherTiles.find(t => t.owner_id === ownerId)
    return { id: ownerId, username: tile.username, count: otherTiles.filter(t => t.owner_id === ownerId).length }
  }).sort((a, b) => b.count - a.count)

  const tabs = [
    { key: 'map', label: 'MAP' },
    { key: 'all', label: 'ALL' },
    { key: 'mine', label: 'MINE' },
    { key: 'rivals', label: 'RIVALS' },
    { key: 'history', label: 'HISTORY' },
  ]

  const filteredTiles = searchQuery.trim()
    ? allTiles.filter(t => {
        const q = searchQuery.toLowerCase()
        return (
          `${t.tile_x}`.includes(q) ||
          `${t.tile_y}`.includes(q) ||
          (t.username && t.username.toLowerCase().includes(q))
        )
      })
    : null

  const activeTiles = filteredTiles || (
    activeTab === 'all' ? allTiles :
    activeTab === 'mine' ? myTilesList :
    activeTab === 'rivals' ? otherTiles :
    []
  )

  const rivalTiles = rivalFilter === 'all' ? otherTiles :
    otherTiles.filter(t => t.owner_id === parseInt(rivalFilter))

  const handleTileClick = async (tile) => {
    setSelectedTile(tile)
    setTileDetailLoading(true)
    setTileDetail(null)
    try {
      const res = await getTileInfo(tile.tile_x, tile.tile_y, tile.zoom || 15)
      setTileDetail(res.data)
    } catch (err) {
      console.error('Tile detail error:', err)
    } finally {
      setTileDetailLoading(false)
    }
  }

  const handleAbandon = async (tile) => {
    if (!confirm('Abandon this tile? It will become unclaimed.')) return
    setAbandoning(true)
    try {
      await abandonTile(tile.tile_x, tile.tile_y, tile.zoom || 15)
      setSelectedTile(null)
      setTileDetail(null)
      await fetchData()
    } catch (err) {
      console.error('Abandon error:', err)
    } finally {
      setAbandoning(false)
    }
  }

  const handleMapClick = () => {
    setSelectedTile(null)
    setTileDetail(null)
  }

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

  const zonePercent = allTiles.length > 0 ? Math.round((myTilesList.length / allTiles.length) * 100) : 0

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>

      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="label-upper mb-1" style={{ color: '#CCFF00' }}>Tactical</div>
            <h1 className="text-3xl font-black text-white uppercase">Territory</h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: 'rgba(204,255,0,0.1)', border: '1px solid rgba(204,255,0,0.3)' }}>
            <div className="w-2 h-2 rounded-full live-pulse" style={{ background: '#CCFF00' }}/>
            <span className="label-upper" style={{ color: '#CCFF00' }}>LIVE</span>
          </div>
        </div>
      </div>

      {/* Stats Hero */}
      <div className="px-6 mb-4">
        <div className="rounded-2xl p-5 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
          border: '1px solid #222'
        }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10" style={{ background: '#CCFF00' }}/>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-3xl font-black lime-text-glow" style={{ color: '#CCFF00', fontFamily: 'Space Grotesk' }}>
                {myTiles?.total_tiles || 0}
              </div>
              <div className="label-upper mt-1" style={{ color: '#CCFF00' }}>Yours</div>
            </div>
            <div>
              <div className="text-3xl font-black text-white" style={{ fontFamily: 'Space Grotesk' }}>
                {uniqueRivals.length}
              </div>
              <div className="label-upper mt-1">Rivals</div>
            </div>
            <div>
              <div className="text-3xl font-black text-white" style={{ fontFamily: 'Space Grotesk' }}>
                {unclaimedTiles.length}
              </div>
              <div className="label-upper mt-1">Free</div>
            </div>
            <div>
              <div className="text-3xl font-black text-white" style={{ fontFamily: 'Space Grotesk' }}>
                {allTiles.length}
              </div>
              <div className="label-upper mt-1">Total</div>
            </div>
          </div>

          {/* Zone Control bar */}
          <div className="mt-4">
            <div className="flex justify-between mb-1">
              <span className="label-upper">Zone Control</span>
              <span className="label-upper" style={{ color: '#CCFF00' }}>{zonePercent}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ background: '#1a1a1a' }}>
              <div
                className="h-1.5 rounded-full lime-glow transition-all"
                style={{ background: '#CCFF00', width: `${zonePercent}%` }}
              />
            </div>
          </div>

          {/* Decay warning */}
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,136,0,0.08)', border: '1px solid rgba(255,136,0,0.2)' }}>
            <span className="text-xs">⚠</span>
            <span className="text-[10px] font-bold" style={{ color: '#ff8800' }}>Tiles decay after 7 days of inactivity</span>
          </div>
        </div>
      </div>

      {/* Search bar (always visible) */}
      <div className="px-6 mb-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search tiles or usernames..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium outline-none"
            style={{ background: '#111', border: '1px solid #222', color: '#fff' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#666' }}>✕</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-4">
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSearchQuery(''); setSelectedTile(null); setTileDetail(null); }}
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
          <div className="rounded-2xl overflow-hidden relative" style={{ border: '1px solid #222', height: selectedTile ? '500px' : '800px' }}>
            <MapContainer
              center={mapCenter}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />

              <MapClickHandler onClick={handleMapClick} />

              {myTilesList.map((tile, i) => (
                <Rectangle
                  key={`my-${i}`}
                  bounds={tileToBounds(tile.tile_x, tile.tile_y, tile.zoom)}
                  pathOptions={{
                    color: '#CCFF00',
                    fillColor: '#CCFF00',
                    fillOpacity: selectedTile?.tile_x === tile.tile_x && selectedTile?.tile_y === tile.tile_y ? 0.5 : 0.3,
                    weight: selectedTile?.tile_x === tile.tile_x && selectedTile?.tile_y === tile.tile_y ? 3 : 1
                  }}
                  eventHandlers={{ click: () => handleTileClick(tile) }}
                >
                  <Popup>
                    <div style={{ background: '#111', color: '#CCFF00', padding: '8px', borderRadius: '8px', fontWeight: 'bold' }}>
                      Your Territory<br />
                      <span style={{ color: '#aaa', fontSize: '11px' }}>Tile [{tile.tile_x}, {tile.tile_y}]</span><br />
                      <span style={{ color: '#666', fontSize: '10px' }}>Captured {formatTimeAgo(tile.captured_at)}</span>
                    </div>
                  </Popup>
                </Rectangle>
              ))}

              {rivalTiles.map((tile, i) => (
                <Rectangle
                  key={`rival-${i}`}
                  bounds={tileToBounds(tile.tile_x, tile.tile_y, tile.zoom)}
                  pathOptions={{
                    color: '#ff4444',
                    fillColor: '#ff4444',
                    fillOpacity: selectedTile?.tile_x === tile.tile_x && selectedTile?.tile_y === tile.tile_y ? 0.45 : 0.25,
                    weight: selectedTile?.tile_x === tile.tile_x && selectedTile?.tile_y === tile.tile_y ? 3 : 1
                  }}
                  eventHandlers={{ click: () => handleTileClick(tile) }}
                >
                  <Popup>
                    <div style={{ background: '#111', color: '#ff4444', padding: '8px', borderRadius: '8px', fontWeight: 'bold' }}>
                      {tile.username}'s Territory<br />
                      <span style={{ color: '#aaa', fontSize: '11px' }}>Tile [{tile.tile_x}, {tile.tile_y}]</span><br />
                      <span style={{ color: '#666', fontSize: '10px' }}>Last visited {formatTimeAgo(tile.last_visited)}</span>
                    </div>
                  </Popup>
                </Rectangle>
              ))}
            </MapContainer>
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-3 px-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: '#CCFF00' }}/>
              <span className="label-upper">Yours</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: '#ff4444' }}/>
              <span className="label-upper">Rivals</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: '#333' }}/>
              <span className="label-upper">Free</span>
            </div>
          </div>

          {/* Tile Detail Panel */}
          {selectedTile && (
            <div className="mt-4 rounded-2xl overflow-hidden" style={{ background: '#111', border: '1px solid #222' }}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #1f1f1f' }}>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: selectedTile.owner_id === user?.id ? '#CCFF00' : '#ff4444' }}/>
                  <div>
                    <div className="text-sm font-black text-white">
                      Tile [{selectedTile.tile_x}, {selectedTile.tile_y}]
                    </div>
                    <div className="label-upper mt-0.5">
                      {selectedTile.owner_id === user?.id ? 'Your Territory' : selectedTile.username ? `${selectedTile.username}'s Territory` : 'Unclaimed'}
                    </div>
                  </div>
                </div>
                <button onClick={() => { setSelectedTile(null); setTileDetail(null); }} className="text-xs" style={{ color: '#666' }}>✕</button>
              </div>

              {tileDetailLoading ? (
                <div className="px-5 py-6 text-center">
                  <div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: '#CCFF00', borderTopColor: 'transparent' }}/>
                </div>
              ) : tileDetail ? (
                <div className="px-5 py-4">
                  {/* Tile info grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl p-3" style={{ background: '#0e0e0e' }}>
                      <div className="label-upper mb-1">Owner</div>
                      <div className="text-sm font-black text-white">{tileDetail.tile.username || 'None'}</div>
                    </div>
                    <div className="rounded-xl p-3" style={{ background: '#0e0e0e' }}>
                      <div className="label-upper mb-1">Captured</div>
                      <div className="text-sm font-bold" style={{ color: '#CCFF00' }}>{formatTimeAgo(tileDetail.tile.captured_at)}</div>
                    </div>
                    <div className="rounded-xl p-3" style={{ background: '#0e0e0e' }}>
                      <div className="label-upper mb-1">Last Visited</div>
                      <div className="text-sm font-bold" style={{ color: '#ff8800' }}>{formatTimeAgo(tileDetail.tile.last_visited)}</div>
                    </div>
                    <div className="rounded-xl p-3" style={{ background: '#0e0e0e' }}>
                      <div className="label-upper mb-1">Captures</div>
                      <div className="text-sm font-black text-white">{tileDetail.history?.length || 0}</div>
                    </div>
                  </div>

                  {/* History */}
                  {tileDetail.history && tileDetail.history.length > 0 && (
                    <div className="mb-4">
                      <div className="label-upper mb-2" style={{ color: '#CCFF00' }}>Capture History</div>
                      <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                        {tileDetail.history.map((h, i) => (
                          <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: '#0e0e0e' }}>
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black" style={{ background: h.captured_by === user?.id ? '#CCFF00' : '#333', color: h.captured_by === user?.id ? '#000' : '#888' }}>
                                {h.username?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <span className="text-xs font-bold text-white">{h.username || 'Unknown'}</span>
                            </div>
                            <span className="text-[10px]" style={{ color: '#666' }}>{formatTime(h.captured_at)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Abandon button (only for own tiles) */}
                  {selectedTile.owner_id === user?.id && (
                    <button
                      onClick={() => handleAbandon(selectedTile)}
                      disabled={abandoning}
                      className="w-full py-2.5 rounded-xl text-xs font-black tracking-wider transition-all"
                      style={{
                        background: abandoning ? '#222' : 'rgba(255,68,68,0.1)',
                        color: abandoning ? '#666' : '#ff4444',
                        border: '1px solid rgba(255,68,68,0.3)'
                      }}
                    >
                      {abandoning ? 'Abandoning...' : 'ABANDON TILE'}
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {allTiles.length === 0 && (
            <div className="mt-4 rounded-2xl text-center py-8" style={{ background: '#111', border: '1px solid #222' }}>
              <div className="text-4xl mb-2">🗺️</div>
              <div className="text-white font-bold mb-1">No territory yet</div>
              <p className="text-sm" style={{ color: '#666' }}>Go for a run to claim your first tiles!</p>
            </div>
          )}
        </div>
      )}

      {/* LIST TABS (ALL / MINE) */}
      {(activeTab === 'all' || activeTab === 'mine') && (
        <div className="px-6">
          {activeTiles.length === 0 ? (
            <div className="rounded-2xl text-center py-12" style={{ background: '#111', border: '1px solid #222' }}>
              <div className="text-5xl mb-3">🗺️</div>
              <div className="text-white font-bold mb-1">No tiles found</div>
              <p className="text-sm" style={{ color: '#666' }}>
                {activeTab === 'mine' ? 'Go for a run to capture territory' : 'No data available'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {activeTiles.slice(0, 100).map((tile, i) => {
                const isOwned = tile.owner_id === user?.id
                const isRival = tile.owner_id && tile.owner_id !== user?.id
                return (
                  <button
                    key={i}
                    onClick={() => { setActiveTab('map'); handleTileClick(tile); }}
                    className="flex items-center gap-4 rounded-xl px-4 py-3 text-left w-full transition-all"
                    style={{
                      background: '#111',
                      border: `1px solid ${isOwned ? 'rgba(204,255,0,0.3)' : '#1f1f1f'}`
                    }}
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: isOwned ? '#CCFF00' : isRival ? '#ff4444' : '#333' }}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white font-mono">[{tile.tile_x}, {tile.tile_y}]</div>
                      <div className="label-upper mt-0.5">
                        {isOwned ? 'Owned by you' : tile.username || 'Unclaimed'}
                      </div>
                    </div>
                    <div className="text-right">
                      {tile.captured_at && (
                        <div className="text-[10px]" style={{ color: '#666' }}>{formatTimeAgo(tile.captured_at)}</div>
                      )}
                      <div
                        className="px-2 py-1 rounded text-[10px] font-black tracking-wider mt-1 inline-block"
                        style={{
                          background: isOwned ? 'rgba(204,255,0,0.1)' : isRival ? 'rgba(255,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                          color: isOwned ? '#CCFF00' : isRival ? '#ff4444' : '#444'
                        }}
                      >
                        {isOwned ? 'YOURS' : isRival ? 'RIVAL' : 'FREE'}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* RIVALS TAB */}
      {activeTab === 'rivals' && (
        <div className="px-6">
          {/* Rival filter chips */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            <button
              onClick={() => setRivalFilter('all')}
              className="px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider whitespace-nowrap transition-all"
              style={{
                background: rivalFilter === 'all' ? '#CCFF00' : '#111',
                color: rivalFilter === 'all' ? '#000' : '#666',
                border: `1px solid ${rivalFilter === 'all' ? '#CCFF00' : '#222'}`
              }}
            >
              ALL ({otherTiles.length})
            </button>
            {uniqueRivals.map(r => (
              <button
                key={r.id}
                onClick={() => setRivalFilter(String(r.id))}
                className="px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider whitespace-nowrap transition-all"
                style={{
                  background: rivalFilter === String(r.id) ? '#ff4444' : '#111',
                  color: rivalFilter === String(r.id) ? '#fff' : '#666',
                  border: `1px solid ${rivalFilter === String(r.id) ? '#ff4444' : '#222'}`
                }}
              >
                {r.username} ({r.count})
              </button>
            ))}
          </div>

          {/* Rival summary cards */}
          {uniqueRivals.length > 0 && (
            <div className="flex flex-col gap-2 mb-4">
              {uniqueRivals.map(r => (
                <div key={r.id} className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black" style={{ background: '#ff4444', color: '#fff' }}>
                    {r.username?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">{r.username}</div>
                    <div className="label-upper mt-0.5">{r.count} tiles owned</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black" style={{ color: '#ff4444' }}>{r.count}</div>
                    <div className="label-upper">tiles</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rival tiles list */}
          {rivalTiles.length === 0 ? (
            <div className="rounded-2xl text-center py-12" style={{ background: '#111', border: '1px solid #222' }}>
              <div className="text-5xl mb-3">🎉</div>
              <div className="text-white font-bold mb-1">No rival tiles</div>
              <p className="text-sm" style={{ color: '#666' }}>No competitors in your area yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {rivalTiles.slice(0, 100).map((tile, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveTab('map'); handleTileClick(tile); }}
                  className="flex items-center gap-4 rounded-xl px-4 py-3 text-left w-full transition-all"
                  style={{ background: '#111', border: '1px solid #1f1f1f' }}
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: '#ff4444' }}/>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white font-mono">[{tile.tile_x}, {tile.tile_y}]</div>
                    <div className="label-upper mt-0.5">{tile.username}</div>
                  </div>
                  {tile.last_visited && (
                    <div className="text-[10px]" style={{ color: '#666' }}>{formatTimeAgo(tile.last_visited)}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="px-6">
          {history.length === 0 ? (
            <div className="rounded-2xl text-center py-12" style={{ background: '#111', border: '1px solid #222' }}>
              <div className="text-5xl mb-3">📜</div>
              <div className="text-white font-bold mb-1">No capture history</div>
              <p className="text-sm" style={{ color: '#666' }}>Start running to build your capture log</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {history.map((h, i) => (
                <div key={i} className="rounded-xl px-4 py-3" style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black" style={{ background: '#CCFF00', color: '#000' }}>
                        {h.username?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span className="text-sm font-bold text-white">{h.username || 'Unknown'}</span>
                    </div>
                    <span className="text-[10px]" style={{ color: '#666' }}>{formatTime(h.captured_at)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-xs" style={{ color: '#CCFF00' }}>
                      [{h.tile_x}, {h.tile_y}]
                    </div>
                    {h.run_id && (
                      <div className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(204,255,0,0.1)', color: '#CCFF00' }}>
                        Run #{h.run_id}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}

export default TerritoryView
