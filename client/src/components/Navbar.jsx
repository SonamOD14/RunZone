import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user } = useAuth()
  const location = useLocation()

  // Hide navbar on landing, login, signup pages
  const hideOn = ['/', '/login', '/signup']
  if (hideOn.includes(location.pathname)) return null

  const links = [
    {
      path: '/dashboard',
      label: 'Home',
      icon: (active) => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill={active ? '#CCFF00' : '#444'}>
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      )
    },
    {
      path: '/territory',
      label: 'Territory',
      icon: (active) => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill={active ? '#CCFF00' : '#444'}>
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      )
    },
    {
      path: '/run',
      label: 'Live Run',
      icon: (active) => (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill={active ? '#000' : '#000'}>
          <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
        </svg>
      ),
      isCenter: true
    },
    {
      path: '/leaderboard',
      label: 'Leaderboard',
      icon: (active) => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill={active ? '#CCFF00' : '#444'}>
          <path d="M7.5 21H2V9h5.5v12zm7.25-18h-5.5v18h5.5V3zM22 11h-5.5v10H22V11z"/>
        </svg>
      )
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: (active) => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill={active ? '#CCFF00' : '#444'}>
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
        </svg>
      )
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{
      background: '#0e0e0e',
      borderTop: '1px solid #1f1f1f'
    }}>
      <div className="flex justify-around items-center max-w-md mx-auto px-4 py-2">
        {links.map((link) => {
          const active = location.pathname === link.path

          if (link.isCenter) {
            return (
              <Link key={link.path} to={link.path} className="flex flex-col items-center gap-1 -mt-6">
                <div className="w-14 h-14 rounded-full flex items-center justify-center lime-glow" style={{
                  background: '#CCFF00',
                  border: '3px solid #080808'
                }}>
                  {link.icon(active)}
                </div>
                <span className="text-xs font-bold" style={{ color: active ? '#CCFF00' : '#444' }}>
                  {link.label}
                </span>
              </Link>
            )
          }

          
          return (
            <Link key={link.path} to={link.path} className="flex flex-col items-center gap-1 py-1">
              {link.icon(active)}
              <span className="text-xs font-bold" style={{ color: active ? '#CCFF00' : '#444' }}>
                {link.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default Navbar