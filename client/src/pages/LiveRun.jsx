import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { startRun, endRun } from '../api/runs'

// Calculate distance between two GPS points in meters
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

// Format seconds into mm:ss
function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
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

  const watchId = useRef(null)
  const timerRef = useRef(null)
  const lastPos = useRef(null)

  // Start GPS tracking
  const startGPS = () => {
    if (!navigator.geolocation) {
      setError('GPS not supported on this device.')
      return
    }
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setCurrentPos({ lat, lng })

        if (lastPos.current) {
          const dist = getDistance(
            lastPos.current.lat,
            lastPos.current.lng,
            lat,
            lng
          )
          // Only count movement over 5 meters to avoid GPS noise
          if (dist > 5) {
            setDistance(prev => prev + dist)
            setCoordinates(prev => [...prev, { lat, lng }])
            lastPos.current = { lat, lng }
          }
        } else {
          lastPos.current = { lat, lng }
          setCoordinates([{ lat, lng }])
        }
      },
      (err) => setError('GPS error: ' + err.message),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    )
  }

  // Stop GPS tracking
  const stopGPS = () => {
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
  }

  // Start timer
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1)
    }, 1000)
  }

  // Stop timer
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  // Handle start run
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

  // Handle pause
  const handlePause = () => {
    setIsPaused(true)
    stopGPS()
    stopTimer()
  }

  // Handle resume
  const handleResume = () => {
    setIsPaused(false)
    startGPS()
    startTimer()
  }

  // Handle finish run
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopGPS()
      stopTimer()
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col pb-24">

      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-3xl font-black text-gray-900">Live Run</h1>
        <p className="text-gray-400 text-sm mt-1">GPS tracking your territory</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-2xl mb-4">
          {error}
        </div>
      )}

      {/* Stats Display */}
      <div className="px-6 mb-6">
        <div className="bg-gray-900 rounded-3xl p-8 text-white text-center">
          {/* Distance */}
          <div className="mb-6">
            <div className="text-6xl font-black text-white">
              {(distance / 1000).toFixed(2)}
            </div>
            <div className="text-gray-400 text-lg font-medium">kilometers</div>
          </div>

          {/* Time and GPS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="text-2xl font-bold">{formatTime(duration)}</div>
              <div className="text-gray-400 text-xs mt-1">Duration</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="text-2xl font-bold">{coordinates.length}</div>
              <div className="text-gray-400 text-xs mt-1">Points tracked</div>
            </div>
          </div>

          {/* GPS Status */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full ${currentPos ? 'bg-[#AAEE00]' : 'bg-gray-500'} ${isRunning && !isPaused ? 'animate-pulse' : ''}`}/>
            <span className="text-gray-400 text-xs">
              {currentPos ? 'GPS locked' : 'Waiting for GPS...'}
            </span>
          </div>
        </div>
      </div>

      {/* Current Position */}
      {currentPos && (
        <div className="px-6 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-gray-400 text-xs font-medium mb-1">Current Position</p>
            <p className="text-gray-900 text-sm font-mono">
              {currentPos.lat.toFixed(6)}, {currentPos.lng.toFixed(6)}
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="px-6">
        {!isRunning ? (
          // Start button
          <button
            onClick={handleStart}
            className="w-full bg-[#AAEE00] text-black font-black py-6 rounded-3xl text-2xl hover:bg-[#99dd00] transition-colors shadow-lg"
          >
            START
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            {!isPaused ? (
              // Pause button
              <button
                onClick={handlePause}
                className="w-full bg-yellow-400 text-black font-black py-5 rounded-3xl text-xl hover:bg-yellow-300 transition-colors"
              >
                PAUSE
              </button>
            ) : (
              // Resume button
              <button
                onClick={handleResume}
                className="w-full bg-[#AAEE00] text-black font-black py-5 rounded-3xl text-xl hover:bg-[#99dd00] transition-colors"
              >
                RESUME
              </button>
            )}

            {/* Finish button */}
            <button
              onClick={handleFinish}
              disabled={finishing || coordinates.length === 0}
              className="w-full bg-gray-900 text-white font-black py-5 rounded-3xl text-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {finishing ? 'Saving...' : 'FINISH RUN'}
            </button>
          </div>
        )}
      </div>

    </div>
  )
}

export default LiveRun