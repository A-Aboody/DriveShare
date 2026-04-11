import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth as authApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

const QUESTIONS = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What was the name of your elementary school?",
  "What was the make of your first car?",
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({
    email: '',
    password: '',
    securityQuestion1: QUESTIONS[0],
    securityAnswer1: '',
    securityQuestion2: QUESTIONS[1],
    securityAnswer2: '',
    securityQuestion3: QUESTIONS[2],
    securityAnswer3: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await authApi.register(form)
      await login(form.email, form.password)
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
          <h2 className="auth-panel-headline">Your car<br />earns money.</h2>
          <p className="auth-panel-sub">List it on DriveShare and rent to people nearby.</p>

          <ul className="auth-feature-list">
            <li><span className="auth-feature-dot" />Set your own price per day</li>
            <li><span className="auth-feature-dot" />Keep full control of availability</li>
            <li><span className="auth-feature-dot" />Watchers get notified automatically</li>
          </ul>
        </div>

        <p className="auth-panel-footer">University of Michigan–Dearborn · CIS 476</p>
      </div>

      {/* Right panel — form */}
      <div className="auth-panel-right">
        <div className="auth-form-box" style={{ maxWidth: 460 }}>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-sub">Set up your DriveShare account.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required />
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Recovery questions
            </p>

            {([1, 2, 3] as const).map(n => (
              <div key={n} className="form-group">
                <label className="form-label">Security question {n}</label>
                <select value={form[`securityQuestion${n}` as keyof typeof form]} onChange={e => set(`securityQuestion${n}`, e.target.value)}>
                  {QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="Your answer"
                  value={form[`securityAnswer${n}` as keyof typeof form]}
                  onChange={e => set(`securityAnswer${n}`, e.target.value)}
                  required
                  style={{ marginTop: 6 }}
                />
              </div>
            ))}

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="auth-link">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}
