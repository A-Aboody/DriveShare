import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-split">
      {/* Left panel — branding */}
      <div className="auth-panel-left">
        <div className="auth-brand">
          <div className="auth-brand-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#000" stroke="none">
              <rect x="1" y="11" width="22" height="9" rx="2"/>
              <path d="M5 11V8a2 2 0 012-2h10a2 2 0 012 2v3"/>
              <circle cx="7" cy="20" r="1.5" fill="#fff"/>
              <circle cx="17" cy="20" r="1.5" fill="#fff"/>
            </svg>
          </div>
          <span className="auth-brand-name">DriveShare</span>
        </div>

        <div className="auth-panel-copy">
          <h2 className="auth-panel-headline">Drive more.<br />Own less.</h2>
          <p className="auth-panel-sub">Peer-to-peer car rentals without the middleman.</p>

          <ul className="auth-feature-list">
            <li><span className="auth-feature-dot" />Rent directly from local owners</li>
            <li><span className="auth-feature-dot" />List your car when you're not using it</li>
            <li><span className="auth-feature-dot" />Watch cars and get notified on price drops</li>
          </ul>
        </div>

        <p className="auth-panel-footer">University of Michigan–Dearborn · CIS 476</p>
      </div>

      {/* Right panel — form */}
      <div className="auth-panel-right">
        <div className="auth-form-box">
          <h1 className="auth-title">Sign in</h1>
          <p className="auth-sub">Welcome back to DriveShare.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="auth-link">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
