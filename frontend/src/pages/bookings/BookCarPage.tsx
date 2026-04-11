import { useState, useEffect, type FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { cars as carsApi, bookings as bookingsApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { gradientForModel } from '../car/AddCarPage'
import type { Car } from '../../types'

function daysBetween(start: string, end: string) {
  if (!start || !end) return 0
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)))
}

const today = () => new Date().toISOString().split('T')[0]

export default function BookCarPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate  = useNavigate()

  const [car, setCar]           = useState<Car | null>(null)
  const [loadingCar, setLoadingCar] = useState(true)
  const [startDate, setStartDate]   = useState('')
  const [endDate, setEndDate]       = useState('')
  const [error, setError]           = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (!id) return
    carsApi.get(id)
      .then(data => { setCar(data); setLoadingCar(false) })
      .catch(() => { setError('Car not found'); setLoadingCar(false) })
  }, [id, user, navigate])

  const days  = daysBetween(startDate, endDate)
  const total = car ? days * car.price : 0

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!car || !user || !id) return
    if (!startDate || !endDate) { setError('Please select both dates.'); return }
    if (days <= 0) { setError('End date must be after start date.'); return }
    setError('')
    setSubmitting(true)
    try {
      const booking = await bookingsApi.create({
        userId: user.id,
        carId: id,
        startDate,
        endDate,
      })
      navigate(`/payment?bookingId=${booking.id}&amount=${total}`)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingCar) return <div className="loading"><div className="spinner" /></div>
  if (!car || error === 'Car not found') {
    return (
      <div className="empty">
        <p>Car not found.</p>
        <Link to="/cars" className="btn btn-secondary">Browse Cars</Link>
      </div>
    )
  }

  const gradient = gradientForModel(car.model)

  return (
    <div className="page">
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        {/* Car summary card */}
        <div
          className="card"
          style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}
        >
          <div style={{ background: gradient, padding: '24px 24px 20px' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>
              {car.model}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
              {car.year} · {car.location}
            </div>
          </div>
          <div style={{ padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Daily rate</span>
            <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
              ${car.price}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-3)' }}>/day</span>
            </span>
          </div>
        </div>

        {/* Booking form */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>
            Choose your dates
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="form-group">
                <label className="form-label">Start date</label>
                <input
                  type="date"
                  min={today()}
                  value={startDate}
                  onChange={e => { setStartDate(e.target.value); if (endDate && e.target.value >= endDate) setEndDate('') }}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End date</label>
                <input
                  type="date"
                  min={startDate || today()}
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Live estimate */}
            {days > 0 && (
              <div
                style={{
                  background: 'var(--bg-3)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
                  {days} day{days !== 1 ? 's' : ''} × ${car.price}/day
                </span>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                  ${total.toLocaleString()}
                </span>
              </div>
            )}

            {error && <p className="form-error">{error}</p>}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting || days <= 0}
              style={{ justifyContent: 'center' }}
            >
              {submitting ? 'Confirming…' : 'Confirm booking'}
            </button>

            <Link to={`/cars/${id}`} className="btn btn-ghost" style={{ justifyContent: 'center', textAlign: 'center' }}>
              Back to listing
            </Link>
          </form>
        </div>

      </div>
    </div>
  )
}
