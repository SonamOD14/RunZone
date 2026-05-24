import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { startRun, endRun } from '../api/runs'

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function LiveRun() {
  const navigate = useNavigate()
  const [runId, setRunId] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [distance, setDistance] = useState(0)
  const [duration, setDuration] = useState(0)
  const [coordinates, setCoordinates] = useState([])
  const [currentPos, setCurrentPos] = useState(null)
  const [error, setError] = useState('')
  const [finishing, setFinishing] = useState(false)
  const [speed, setSpeed] = useState(0)

  const watchId = useRef(null)
  const timerRef = useRef(null)
  const lastPos = useRef(null)
  const lastTime = useRef(null)

  const startGPS = () => {
    if (!navigator.geolocation) {
      setError('GPS not supported on this device.')
      return
    }
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setCurrentPos({ lat, lng })
        const now = Date.now()

        if (lastPos.current) {
          const dist = getDistance(lastPos.current.lat, lastPos.current.lng, lat, lng)
          if (dist > 5) {
            const timeDiff = (now - lastTime.current) / 1000
            const currentSpeed = (dist / timeDiff) * 3.6
            setSpeed(currentSpeed.toFixed(1))
            setDistance(prev => prev + dist)
            setCoordinates(prev => [...prev, { lat, lng }])
            lastPos.current = { lat, lng }
            lastTime.current = now
          }
        } else {
          lastPos.current = { lat, lng }
          lastTime.current = now
          setCoordinates([{ lat, lng }])
        }
      },
      (err) => setError('GPS error: ' + err.message),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    )
  }

  const stopGPS = () => {
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
  }

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1)
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const handleStart = async () => {
    try {
      const res = await startRun()
      setRunId(res.data.run.id)
      setIsRunning(true)
      startGPS()
      startTimer()
    } catch (err) {
      setError('Could not start run. Try again.')
    }
  }

  const handlePause = () => {
    setIsPaused(true)
    stopGPS()
    stopTimer()
  }

  const handleResume = () => {
    setIsPaused(false)
    startGPS()
    startTimer()
  }

  const handleFinish = async () => {
    setFinishing(true)
    stopGPS()
    stopTimer()
    try {
      await endRun({
        run_id: runId,
        distance_meters: Math.round(distance),
        duration_seconds: duration,
        coordinates
      })
      navigate('/dashboard')
    } catch (err) {
      setError('Could not save run. Try again.')
      setFinishing(false)
    }
  }

  useEffect(() => {
    return () => {
      stopGPS()
      stopTimer()
    }
  }, [])

  const pace = distance > 0 && duration > 0
    ? ((duration / 60) / (distance / 1000)).toFixed(1)
    : '0.0'

  return (
    <div className="min-h-screen flex flex-col pb-24" style={{ background: '#080808' }}>

      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 border-2 flex items-center justify-center" style={{ borderColor: '#CCFF00' }}>
            <span className="text-xs font-black" style={{ color: '#CCFF00' }}>Z</span>
          </div>
          <span className="font-black text-white tracking-wider">RUNZONE</span>
        </div>
        {isRunning && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: 'rgba(204,255,0,0.1)', border: '1px solid rgba(204,255,0,0.3)' }}>
            <div className="w-2 h-2 rounded-full live-pulse" style={{ background: '#CCFF00' }}/>
            <span className="label-upper" style={{ color: '#CCFF00' }}>LIVE GPS</span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444' }}>
          {error}
        </div>
      )}

      {/* Main Stats */}
      <div className="px-6 mb-6 text-center">
        <div className="label-upper mb-2" style={{ color: '#666' }}>Duration</div>
        <div className="text-7xl font-black text-white mb-6" style={{ fontFamily: 'Space Grotesk', letterSpacing: '-2px' }}>
          {formatTime(duration)}
        </div>

        <div className="label-upper mb-1" style={{ color: '#CCFF00' }}>Total Distance</div>
        <div className="text-6xl font-black lime-text-glow mb-1" style={{ color: '#CCFF00', fontFamily: 'Space Grotesk' }}>
          {(distance / 1000).toFixed(2)}
        </div>
        <div className="text-white font-bold text-xl">km</div>
      </div>

      {/* Secondary Stats */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center">
            <div className="text-xl font-black text-white">{speed}</div>
            <div className="label-upper mt-1">km/h</div>
          </div>
          <div className="card text-center">
            <div className="text-xl font-black text-white">{pace}</div>
            <div className="label-upper mt-1">min/km</div>
          </div>
          <div className="card text-center">
            <div className="text-xl font-black text-white">{coordinates.length}</div>
            <div className="label-upper mt-1">points</div>
          </div>
        </div>
      </div>

      {/* GPS Status */}
      <div className="px-6 mb-6">
        <div className="card flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${currentPos ? 'live-pulse' : ''}`} style={{ background: currentPos ? '#CCFF00' : '#333' }}/>
          <div>
            <div className="text-sm font-bold text-white">
              {currentPos ? 'GPS Signal Locked' : 'Acquiring GPS...'}
            </div>
            {currentPos && (
              <div className="label-upper mt-0.5">
                {currentPos.lat.toFixed(5)}, {currentPos.lng.toFixed(5)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 flex-1 flex flex-col justify-end">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="btn-lime py-6 text-xl tracking-widest"
          >
            ⚡ INITIALIZE RUN
          </button>
        ) : (
          <div className="flex flex-col items-center gap-4">

            {/* Big pause/resume circle button */}
            <button
              onClick={isPaused ? handleResume : handlePause}
              className="w-28 h-28 rounded-full flex items-center justify-center lime-glow transition-all"
              style={{ background: '#CCFF00' }}
            >
              {isPaused ? (
                <svg viewBox="0 0 24 24" className="w-12 h-12" fill="#000">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-12 h-12" fill="#000">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              )}
            </button>

            <div className="label-upper" style={{ color: '#666' }}>
              {isPaused ? 'TAP TO RESUME' : 'TAP TO PAUSE'}
            </div>

            {/* Finish button */}
            <button
              onClick={handleFinish}
              disabled={finishing || coordinates.length === 0}
              className="btn-ghost py-4"
              style={{ opacity: finishing || coordinates.length === 0 ? 0.4 : 1 }}
            >
              {finishing ? 'SAVING MISSION...' : 'END MISSION'}
            </button>

          </div>
        )}
      </div>

    </div>
  )
}

export default LiveRun