import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookings as bookingsApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { BookingWithCar } from '../../types'
import './BookingsPage.css'

type Tab = 'upcoming' | 'past'

function formatDateRange(start: string, end: string) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(start)} – ${fmt(end)}`
}

function daysBetween(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)))
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'confirmed' ? 'badge badge-green'
    : status === 'cancelled' ? 'badge badge-red'
    : 'badge badge-yellow'
  return <span className={cls}>{status}</span>
}

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`star ${n <= (hover || value) ? 'active' : ''}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          aria-label={`${n} star`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function BookingCard({
  booking,
  userId,
  onCancelled,
  onReviewed,
}: {
  booking: BookingWithCar
  userId: string
  onCancelled: (id: string) => void
  onReviewed: (id: string, rating: number, comment: string) => void
}) {
  const now = new Date()
  const start = new Date(booking.startDate)
  const end = new Date(booking.endDate)
  const days = daysBetween(booking.startDate, booking.endDate)
  const total = days * booking.car.price

  const canCancel = booking.status === 'confirmed' && start > now
  const canReview = booking.status === 'confirmed' && end < now && !booking.rating

  const [cancelling, setCancelling]   = useState(false)
  const [showReview, setShowReview]   = useState(false)
  const [rating, setRating]           = useState(0)
  const [comment, setComment]         = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [reviewError, setReviewError] = useState('')

  const handleCancel = async () => {
    if (!confirm('Cancel this booking?')) return
    setCancelling(true)
    try {
      await bookingsApi.cancel(booking.id, userId)
      onCancelled(booking.id)
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setCancelling(false)
    }
  }

  const handleReviewSubmit = async () => {
    if (rating === 0) { setReviewError('Please select a rating.'); return }
    setReviewError('')
    setSubmitting(true)
    try {
      await bookingsApi.review(booking.id, userId, rating, comment)
      onReviewed(booking.id, rating, comment)
      setShowReview(false)
    } catch (err) {
      setReviewError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="booking-card card">
      <div className="booking-card-header">
        <div>
          <div className="booking-car-name">
            {booking.car.model}
            <span className="booking-car-year">{booking.car.year}</span>
          </div>
          <div className="booking-dates">{formatDateRange(booking.startDate, booking.endDate)}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <StatusBadge status={booking.status} />
          <div className="booking-price">
            ${total.toLocaleString()}
            <span className="booking-price-note">({days}d × ${booking.car.price}/day)</span>
          </div>
        </div>
      </div>

      <div className="booking-actions">
        {canCancel && (
          <button
            className="btn btn-danger btn-sm"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? 'Cancelling…' : 'Cancel booking'}
          </button>
        )}
        {canReview && !showReview && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowReview(true)}
          >
            Leave a review
          </button>
        )}
      </div>

      {showReview && (
        <div className="review-form">
          <div className="review-form-label">How was your experience?</div>
          <StarRating value={rating} onChange={setRating} />
          <textarea
            className="review-textarea"
            placeholder="Optional comment…"
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
          />
          {reviewError && <p className="form-error">{reviewError}</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleReviewSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting…' : 'Submit review'}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setShowReview(false); setReviewError('') }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {booking.rating && (
        <div className="booking-existing-review">
          <span style={{ color: 'var(--yellow)' }}>{'★'.repeat(booking.rating)}{'☆'.repeat(5 - booking.rating)}</span>
          {booking.comment && <span className="booking-review-comment">{booking.comment}</span>}
        </div>
      )}
    </div>
  )
}

export default function BookingsPage() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [items, setItems]   = useState<BookingWithCar[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]       = useState<Tab>('upcoming')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    bookingsApi.getForUser(user.id)
      .then(data => { setItems(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user, navigate])

  const now = new Date()

  const upcoming = items.filter(b => {
    const start = new Date(b.startDate)
    return b.status === 'confirmed' && start > now
  })

  const past = items.filter(b => {
    const start = new Date(b.startDate)
    return b.status === 'cancelled' || (b.status === 'confirmed' && start <= now)
  })

  const visible = tab === 'upcoming' ? upcoming : past

  const handleCancelled = (id: string) => {
    setItems(prev =>
      prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b)
    )
  }

  const handleReviewed = (id: string, rating: number, comment: string) => {
    setItems(prev =>
      prev.map(b => b.id === id ? { ...b, rating, comment } : b)
    )
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.4px', color: 'var(--text)', margin: 0 }}>
            My Bookings
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
            {items.length} total booking{items.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bookings-tabs">
        <button
          className={`bookings-tab ${tab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setTab('upcoming')}
        >
          Upcoming
          {upcoming.length > 0 && (
            <span className="bookings-tab-count">{upcoming.length}</span>
          )}
        </button>
        <button
          className={`bookings-tab ${tab === 'past' ? 'active' : ''}`}
          onClick={() => setTab('past')}
        >
          Past
          {past.length > 0 && (
            <span className="bookings-tab-count">{past.length}</span>
          )}
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <p>No {tab} bookings.</p>
        </div>
      ) : (
        <div className="bookings-list">
          {visible.map(b => (
            <BookingCard
              key={b.id}
              booking={b}
              userId={user!.id}
              onCancelled={handleCancelled}
              onReviewed={handleReviewed}
            />
          ))}
        </div>
      )}
    </div>
  )
}
