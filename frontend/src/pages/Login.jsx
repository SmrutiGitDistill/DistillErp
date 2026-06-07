import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [waking, setWaking] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setWaking(false)
    setError('')

    // Show "waking up" hint after 6 s if still loading (cold start scenario)
    const wakeTimer = setTimeout(() => setWaking(true), 6000)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || ''
      if (!msg || msg.toLowerCase().includes('network') || msg.toLowerCase().includes('socket')) {
        setError('Could not reach the server. It may still be waking up — please try again in a moment.')
      } else {
        setError(msg || 'Login failed. Please try again.')
      }
    } finally {
      clearTimeout(wakeTimer)
      setLoading(false)
      setWaking(false)
    }
  }

  const buttonLabel = () => {
    if (!loading) return 'Sign In'
    if (waking) return 'Server waking up...'
    return 'Signing in...'
  }

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block bg-amber-100 rounded-2xl p-4 mb-4">
            <span className="text-4xl">🏭</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-800">DistillERP</h1>
          <p className="text-stone-500 text-sm mt-1">Factory Management System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="admin@distillerp.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Cold-start hint */}
          {waking && !error && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-4 py-2.5 rounded-lg">
              The server is starting up (free hosting tier). This can take up to 60 seconds on the first request — please wait.
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {buttonLabel()}
          </button>
        </form>

        <p className="text-center text-xs text-stone-400 mt-6">
          DistillERP v1.0 · Confidential
        </p>
      </div>
    </div>
  )
}
