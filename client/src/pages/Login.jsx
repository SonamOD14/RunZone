import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login as loginAPI } from '../api/auth'

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await loginAPI(form)
      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#080808' }}>

      {/* Background grid */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(#CCFF00 1px, transparent 1px), linear-gradient(90deg, #CCFF00 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }}/>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-12 pb-6">
        <Link to="/">
          <span className="text-2xl font-black" style={{ color: '#CCFF00' }}>←</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 border-2 flex items-center justify-center" style={{ borderColor: '#CCFF00' }}>
            <span className="text-xs font-black" style={{ color: '#CCFF00' }}>Z</span>
          </div>
          <span className="font-black text-white tracking-wider">RUNZONE</span>
        </div>
        <Link to="/signup" className="text-xs font-bold" style={{ color: '#CCFF00' }}>SIGN UP</Link>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 px-6 pb-10">

        {/* Title */}
        <div className="mb-8">
          <div className="label-upper mb-2" style={{ color: '#CCFF00' }}>Returning Operative</div>
          <h1 className="text-4xl font-black uppercase text-white leading-tight">
            WELCOME<br />
            <span style={{ color: '#CCFF00' }}>BACK,</span><br />
            OPERATIVE.
          </h1>
          <p className="text-sm mt-2" style={{ color: '#666' }}>
            Synchronize your biometrics to continue.
          </p>
        </div>

        {/* Form */}
        <div className="card mb-4">

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444' }}>
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">

            {/* Email */}
            <div>
              <label className="label-upper mb-2 block">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="agent@runzone.cmd"
                value={form.email}
                onChange={handleChange}
                className="input-dark"
              />
            </div>

            {/* Password */}
            <div>
              <label className="label-upper mb-2 block">Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="input-dark"
              />
              <div className="text-right mt-2">
                <span className="text-xs font-bold cursor-pointer" style={{ color: '#CCFF00' }}>
                  FORGOT PASSWORD?
                </span>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-lime mt-2"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'SYNCING...' : 'SIGN IN ⚡'}
            </button>

          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: '#222' }}/>
          <span className="text-xs" style={{ color: '#444' }}>OR CONTINUE WITH</span>
          <div className="flex-1 h-px" style={{ background: '#222' }}/>
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button className="btn-ghost flex items-center justify-center gap-2 py-3">
            <span className="text-sm">G</span>
            <span className="text-sm">GOOGLE</span>
          </button>
          <button className="btn-ghost flex items-center justify-center gap-2 py-3">
            <span className="text-sm">🍎</span>
            <span className="text-sm">APPLE</span>
          </button>
        </div>

        {/* Signup link */}
        <p className="text-center text-sm" style={{ color: '#666' }}>
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold" style={{ color: '#CCFF00' }}>Sign Up</Link>
        </p>

      </div>

      {/* Bottom glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full blur-3xl opacity-15" style={{ background: '#CCFF00' }}/>

    </div>
  )
}

export default Login

