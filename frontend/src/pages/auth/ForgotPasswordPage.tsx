import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { recovery } from '../../lib/api'
import './Auth.css'

type Questions = { question1: string; question2: string; question3: string }

const TOTAL_STEPS = 3

export default function ForgotPasswordPage() {
  const navigate = useNavigate()

  const [step, setStep]       = useState(0)
  const [email, setEmail]     = useState('')
  const [questions, setQuestions] = useState<Questions | null>(null)
  const [answers, setAnswers] = useState(['', '', ''])
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  // Step 0: look up questions by email
  const handleFindAccount = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const qs = await recovery.getQuestions(email)
      setQuestions(qs)
      setStep(1)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // Step 1: store answers and advance
  const handleVerifyAnswers = (e: FormEvent) => {
    e.preventDefault()
    if (answers.some(a => !a.trim())) {
      setError('Please answer all three questions.')
      return
    }
    setError('')
    setStep(2)
  }

  // Step 2: submit new password
  const handleReset = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await recovery.resetPassword(email, answers as [string, string, string], password)
      navigate('/login', { state: { message: 'Password reset. Please sign in.' } })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const setAnswer = (i: number, val: string) => {
    setAnswers(prev => {
      const next = [...prev]
      next[i] = val
      return next
    })
  }

  const questionList = questions
    ? [questions.question1, questions.question2, questions.question3]
    : []

  return (
    <div className="auth-split">
      {/* Left branding panel */}
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
          <h2 className="auth-panel-headline">Locked out?<br />No worries.</h2>
          <p className="auth-panel-sub">Answer your security questions to reset your password and get back on the road.</p>
          <ul className="auth-feature-list">
            <li><span className="auth-feature-dot" />Verify with your security questions</li>
            <li><span className="auth-feature-dot" />Choose a new password instantly</li>
            <li><span className="auth-feature-dot" />No email required to recover</li>
          </ul>
        </div>

        <p className="auth-panel-footer">University of Michigan–Dearborn · CIS 476</p>
      </div>

      {/* Right form panel */}
      <div className="auth-panel-right">
        <div className="auth-form-box">
          {/* Step indicator dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? 18 : 7,
                  height: 7,
                  borderRadius: 4,
                  background: i < step
                    ? 'var(--text-3)'
                    : i === step
                      ? 'var(--accent)'
                      : 'var(--border-2)',
                  transition: 'all 0.2s',
                }}
              />
            ))}
            <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 6 }}>
              {step + 1} / {TOTAL_STEPS}
            </span>
          </div>

          {/* Step 0: enter email */}
          {step === 0 && (
            <>
              <h1 className="auth-title">Find your account</h1>
              <p className="auth-sub">Enter the email address you registered with.</p>
              <form className="auth-form" onSubmit={handleFindAccount}>
                <div className="form-group">
                  <label className="form-label">Email address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                {error && <p className="form-error">{error}</p>}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                >
                  {loading ? 'Looking up…' : 'Find my account'}
                </button>
              </form>
            </>
          )}

          {/* Step 1: answer questions */}
          {step === 1 && questions && (
            <>
              <h1 className="auth-title">Answer your questions</h1>
              <p className="auth-sub">These are the security questions you set when registering.</p>
              <form className="auth-form" onSubmit={handleVerifyAnswers}>
                {questionList.map((q, i) => (
                  <div className="form-group" key={i}>
                    <label className="form-label">{q}</label>
                    <input
                      type="text"
                      placeholder="Your answer"
                      value={answers[i]}
                      onChange={e => setAnswer(i, e.target.value)}
                      required
                      autoFocus={i === 0}
                    />
                  </div>
                ))}
                {error && <p className="form-error">{error}</p>}
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                >
                  Verify answers
                </button>
              </form>
              <p className="auth-link" style={{ marginTop: 16 }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setStep(0); setError('') }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-3)', padding: 0 }}
                >
                  Use a different email
                </button>
              </p>
            </>
          )}

          {/* Step 2: new password */}
          {step === 2 && (
            <>
              <h1 className="auth-title">Set a new password</h1>
              <p className="auth-sub">Pick something you'll remember. At least 6 characters.</p>
              <form className="auth-form" onSubmit={handleReset}>
                <div className="form-group">
                  <label className="form-label">New password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    minLength={6}
                    required
                    autoFocus
                  />
                </div>
                {error && <p className="form-error">{error}</p>}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                >
                  {loading ? 'Resetting…' : 'Reset password'}
                </button>
              </form>
            </>
          )}

          <p className="auth-link" style={{ marginTop: 20 }}>
            Remembered it? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
