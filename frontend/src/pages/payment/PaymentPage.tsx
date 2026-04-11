import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { payment as paymentApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import './PaymentPage.css'

function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

// cosmetic mask: format as card number groups
function maskCardDisplay(raw: string) {
  return raw.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

export default function PaymentPage() {
  const { user } = useAuth()
  const [params] = useSearchParams()

  const bookingId = params.get('bookingId') ?? ''
  const amount    = parseFloat(params.get('amount') ?? '0')

  const [cardNum, setCardNum]   = useState('')
  const [expiry, setExpiry]     = useState('')
  const [cvv, setCvv]           = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)

  if (!user) {
    return (
      <div className="payment-page">
        <div className="payment-card">
          <p style={{ color: 'var(--text-2)', textAlign: 'center' }}>
            You need to be signed in to pay.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ justifyContent: 'center' }}>Sign in</Link>
        </div>
      </div>
    )
  }

  const handlePay = async () => {
    setError('')
    setProcessing(true)
    try {
      await paymentApi.process(user.id, bookingId, amount)
      setSuccess(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setProcessing(false)
    }
  }

  const handleExpiryInput = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4)
    if (clean.length >= 3) {
      setExpiry(clean.slice(0, 2) + '/' + clean.slice(2))
    } else {
      setExpiry(clean)
    }
  }

  if (success) {
    return (
      <div className="payment-page">
        <div className="payment-card payment-success">
          <div className="payment-success-icon">
            <CheckIcon />
          </div>
          <div className="payment-success-title">Payment successful</div>
          <div className="payment-success-sub">
            Your booking has been confirmed. Have a great trip!
          </div>
          <Link to="/bookings" className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }}>
            View my bookings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="payment-page">
      <div className="payment-card">

        {/* Header */}
        <div className="payment-header">
          <div className="payment-lock-icon">
            <LockIcon />
          </div>
          <div className="payment-simulated-label">Simulated payment</div>
        </div>

        {/* Amount */}
        <div className="payment-amount">
          ${amount.toFixed(2)}
        </div>

        {/* Fake card form */}
        <div className="payment-form">
          <div className="form-group">
            <label className="form-label">Card number</label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={maskCardDisplay(cardNum)}
              onChange={e => setCardNum(e.target.value.replace(/\s/g, ''))}
              maxLength={19}
              inputMode="numeric"
            />
          </div>

          <div className="payment-form-row">
            <div className="form-group">
              <label className="form-label">Expiry</label>
              <input
                type="text"
                placeholder="MM/YY"
                value={expiry}
                onChange={e => handleExpiryInput(e.target.value)}
                maxLength={5}
                inputMode="numeric"
              />
            </div>
            <div className="form-group">
              <label className="form-label">CVV</label>
              <input
                type="text"
                placeholder="123"
                value={cvv}
                onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                inputMode="numeric"
              />
            </div>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <button
          className="btn btn-primary btn-lg"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={handlePay}
          disabled={processing}
        >
          {processing ? 'Processing…' : `Pay $${amount.toFixed(2)}`}
        </button>

        <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginTop: 12 }}>
          No real card is charged. This is a demo environment.
        </p>
      </div>
    </div>
  )
}
