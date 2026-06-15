import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { startRun, endRun } from '../api/runs'

// Constants for performance
const EARTH_RADIUS_METERS = 6371000
const MIN_DISTANCE_THRESHOLD_METERS = 5 // Filters out minor GPS jitter

function getDistance(lat1, lng1, lat2, lng2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_METERS * c
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function LiveRun() {
  const navigate = useNavigate()
  
  // State Management
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

  // Refs for tracking system variables without triggering re-renders
  const watchId = useRef(null)
  const timerRef = useRef(null)
  const wakeLockRef = useRef(null)
  
  // Keep track of GPS updates safely using refs to prevent stale closure bugs
  const trackingData = useRef({ lastPos: null, lastTime: null })

  // Request Wake Lock to keep the mobile screen from sleeping during a run
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
      } catch (err) {
        console.warn('Wake Lock request failed:', err.message)
      }
    }
  }

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().then(() => {
        wakeLockRef.current = null
      })
    }
  }

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
        const { lastPos, lastTime } = trackingData.current

        if (lastPos) {
          const dist = getDistance(lastPos.lat, lastPos.lng, lat, lng)
          
          if (dist > MIN_DISTANCE_THRESHOLD_METERS) {
            const timeDiff = (now - lastTime) / 1000
            // Guard against divide-by-zero or instantly fast telemetry jumps
            const currentSpeed = timeDiff > 0 ? (dist / timeDiff) * 3.6 : 0
            
            setSpeed(currentSpeed.toFixed(1))
            setDistance((prev) => prev + dist)
            setCoordinates((prev) => [...prev, { lat, lng }])
            
            trackingData.current = { lastPos: { lat, lng }, lastTime: now }
          }
        } else {
          trackingData.current = { lastPos: { lat, lng }, lastTime: now }
          setCoordinates([{ lat, lng }])
        }
      },
      (err) => {
        // Handle common code 1: Permission Denied, 2: Position Unavailable, 3: Timeout
        setError(`GPS error: ${err.message}`)
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    )
  }

  const stopGPS = () => {
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
    // Clear tracking telemetry on stop/pause
    trackingData.current = { lastPos: null, lastTime: null }
  }

  const startTimer = () => {
    if (timerRef.current) return
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1)
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const handleStart = async () => {
    setError('')
    try {
      const res = await startRun()
      setRunId(res.data.run.id)
      setIsRunning(true)
      startGPS()
      startTimer()
      requestWakeLock()
    } catch (err) {
      setError('Could not start run. Please check your connection and try again.')
    }
  }

  const handlePause = () => {
    setIsPaused(true)
    stopGPS()
    stopTimer()
    releaseWakeLock()
  }

  const handleResume = () => {
    setIsPaused(false)
    startGPS()
    startTimer()
    requestWakeLock()
  }

  const handleFinish = async () => {
    setFinishing(true)
    stopGPS()
    stopTimer()
    releaseWakeLock()
    
    try {
      await endRun({
        run_id: runId,
        distance_meters: Math.round(distance),
        duration_seconds: duration,
        coordinates
      })
      navigate('/dashboard')
    } catch (err) {
      setError('Could not save run. Attempting to keep your data intact...')
      setFinishing(false)
    }
  }

  // Auto-cleanup on component unmount
  useEffect(() => {
    return () => {
      stopGPS()
      stopTimer()
      releaseWakeLock()
    }
  }, [])

  // Optimized Pace calculation with realistic bounds checking
  const pace = useMemo(() => {
    if (distance < 5 || duration === 0) return '0.0'
    const kms = distance / 1000
    const minutes = duration / 60
    const rawPace = minutes / kms
    
    // Safety check: If pace calculation yields unrealistic numbers (> 60 min/km), treat as stationary
    return rawPace > 60 ? '0.0' : rawPace.toFixed(1)
  }, [distance, duration])

  return (
    <div className="min-h-screen flex flex-col pb-24" style={{ background: '#080808' }}>
      
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex justify-between items-center">
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
      </header>

      {/* Error Alert Display */}
      {error && (
        <div role="alert" className="mx-6 mb-4 px-4 py-3 rounded-xl text-sm transition-all" style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444' }}>
          {error}
        </div>
      )}

      {/* Main Statistics Visualizer */}
      <main className="px-6 mb-6 text-center">
        <div className="label-upper mb-2" style={{ color: '#666' }}>Duration</div>
        <div className="text-7xl font-black text-white mb-6" style={{ fontFamily: 'Space Grotesk', letterSpacing: '-2px' }}>
          {formatTime(duration)}
        </div>

        <div className="label-upper mb-1" style={{ color: '#CCFF00' }}>Total Distance</div>
        <div className="text-6xl font-black lime-text-glow mb-1" style={{ color: '#CCFF00', fontFamily: 'Space Grotesk' }}>
          {(distance / 1000).toFixed(2)}
        </div>
        <div className="text-white font-bold text-xl">km</div>
      </main>

      {/* Secondary Metrics Dashboard Grid */}
      <section className="px-6 mb-6" aria-label="Current Metrics">
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
      </section>

      {/* Device Telemetry Diagnostics */}
      <footer className="px-6 mb-6">
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
      </footer>

      {/* Mission Controller Inputs */}
      <div className="px-6 flex-1 flex flex-col justify-endß">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="btn-lime py-6 text-xl tracking-widest active:scale-95 transition-transform"
          >
            ⚡ INITIALIZE RUN
          </button>
        ) : (
          <div className="flex flex-col items-center gap-4">
            
            <button
              onClick={isPaused ? handleResume : handlePause}
              aria-label={isPaused ? 'Resume Run' : 'Pause Run'}
              className="w-28 h-28 rounded-full flex items-center justify-center lime-glow transition-all active:scale-90"
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

            <button
              onClick={handleFinish}
              disabled={finishing || coordinates.length === 0}
              className="btn-ghost py-4 select-none"
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

