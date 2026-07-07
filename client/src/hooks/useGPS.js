import { useState, useEffect } from 'react'

function useGPS() {
  const [position, setPosition] = useState(null)
  const [error, setError] = useState(null)
  const [permission, setPermission] = useState('prompt')

  useEffect(() => {
    // Ask for permission immediately when hook is used
    if (!navigator.geolocation) {
      setError('GPS not supported on this device.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPermission('granted')
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        })
      },
      (err) => {
        setPermission('denied')
        setError('Please allow location access to use RunZone.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  return { position, error, permission }
}

export default useGPS