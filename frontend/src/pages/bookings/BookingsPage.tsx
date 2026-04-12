import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { bookings as bookingsApi, reviews as reviewsApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { gradientForModel } from '../car/AddCarPage'
import type { BookingWithCar, ReviewGiven } from '../../types'
import './BookingsPage.css'

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysBetween(start: string, end: string) {
  return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000))
}

function StatusBadge({ status }: { status: string }) {
  const cls = status === 'confirmed' ? 'badge badge-green'
    : status === 'cancelled' ? 'badge badge-red'
    : 'badge badge-yellow'
  return <span className={cls}>{status}</span>
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="star-rating">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          className={`star ${n <= (hover || value) ? 'active' : ''}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
        >★</button>
      ))}
    </div>
  )
}

function ReviewForm({ label, onSubmit, onCancel }: {
  label: string
  onSubmit: (rating: number, comment: string) => Promise<void>
  onCancel: () => void
}) {
  const [rating, setRating]     = useState(0)
  const [comment, setComment]   = useState('')
  const [submitting, setSub]    = useState(false)
  const [err, setErr]           = useState('')

  const submit = async () => {
    if (!rating) { setErr('Pick a star rating.'); return }
    setSub(true); setErr('')
    try { await onSubmit(rating, comment) }
    catch (e) { setErr((e as Error).message) }
    finally { setSub(false) }
  }

  return (
    <div className="review-form">
      <div className="review-form-label">{label}</div>
      <StarPicker value={rating} onChange={setRating} />
      <textarea
        className="review-textarea"
        rows={2}
        placeholder="Leave a comment (optional)…"
        value={comment}
        onChange={e => setComment(e.target.value)}
      />
      {err && <p className="form-error">{err}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary btn-sm" onClick={submit} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

function TripCard({
  booking,
  role,
  userId,
  reviewedIds,
  onCancelled,
  onReviewed,
}: {
  booking: BookingWithCar
  role: 'renter' | 'owner'
  userId: string
  reviewedIds: Set<string>
  onCancelled: (id: string) => void
  onReviewed:  (bookingId: string, reviewerRole: string) => void
}) {
  const days  = daysBetween(booking.startDate, booking.endDate)
  const total = days * booking.car.price
  const now   = new Date()
  const start = new Date(booking.startDate)

  const alreadyReviewed = reviewedIds.has(`${booking.id}:${role}`)
  const canCancel       = role === 'renter' && booking.status === 'confirmed' && start > now
  const canReview       = booking.status === 'confirmed' && !alreadyReviewed

  const otherUserId    = role === 'renter'
    ? (booking.car as any).ownerId as string
    : (booking as any).user?.id as string
  const otherUserEmail = role === 'renter'
    ? (booking.car as any).owner?.email ?? 'owner'
    : (booking as any).user?.email ?? 'renter'

  const [cancelling, setCancelling] = useState(false)
  const [showReview, setShowReview] = useState(false)

  const handleCancel = async () => {
    if (!confirm('Cancel this booking?')) return
    setCancelling(true)
    try { await bookingsApi.cancel(booking.id, userId); onCancelled(booking.id) }
    catch (e) { alert((e as Error).message) }
    finally { setCancelling(false) }
  }

  const handleReview = async (rating: number, comment: string) => {
    await reviewsApi.create({
      reviewerId: userId,
      revieweeId: otherUserId,
      bookingId:  booking.id,
      rating,
      comment,
      role,
    })
    onReviewed(booking.id, role)
    setShowReview(false)
  }

  const reviewLabel = role === 'renter' ? `How was ${otherUserEmail} as an owner?` : `How was ${otherUserEmail} as a renter?`

  return (
    <div className="trip-card">
      {/* Gradient banner */}
      <div className="trip-card-banner" style={{ background: gradientForModel(booking.car.model) }}>
        <span className="trip-card-model">{booking.car.model} {booking.car.year}</span>
        <span className="trip-card-status"><StatusBadge status={booking.status} /></span>
      </div>

      <div className="trip-card-body">
        <div className="trip-card-row">
          <div className="trip-card-dates">
            <span>{fmt(booking.startDate)}</span>
            <span className="trip-card-dates-sep">to</span>
            <span>{fmt(booking.endDate)}</span>
          </div>
          <div className="trip-card-price">
            ${total.toLocaleString()}
            <span className="trip-card-price-note">{days}d × ${booking.car.price}/day</span>
          </div>
        </div>

        {role === 'owner' && (booking as any).user?.email && (
          <div className="trip-card-meta">
            Rented by {(booking as any).user.email}
          </div>
        )}

        <div className="trip-card-actions">
          {canCancel && (
            <button className="btn btn-danger btn-sm" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? 'Cancelling…' : 'Cancel'}
            </button>
          )}
          {canReview && !showReview && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowReview(true)}>
              Leave a review
            </button>
          )}
          {alreadyReviewed && (
            <span className="trip-reviewed-badge">✓ Reviewed</span>
          )}
          <Link to={`/cars/${booking.car.id}`} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>
            View car
          </Link>
          {otherUserId && (
            <Link to={`/profile/${otherUserId}`} className="btn btn-ghost btn-sm">
              View profile
            </Link>
          )}
        </div>

        {showReview && (
          <ReviewForm
            label={reviewLabel}
            onSubmit={handleReview}
            onCancel={() => setShowReview(false)}
          />
        )}
      </div>
    </div>
  )
}

export default function BookingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [renterItems, setRenterItems]   = useState<BookingWithCar[]>([])
  const [ownerItems,  setOwnerItems]    = useState<BookingWithCar[]>([])
  const [reviewsGiven, setReviewsGiven] = useState<ReviewGiven[]>([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    Promise.all([
      bookingsApi.getForUser(user.id),
      bookingsApi.getForOwner(user.id),
      reviewsApi.getGiven(user.id),
    ]).then(([renter, owner, given]) => {
      setRenterItems(renter)
      setOwnerItems(owner)
      setReviewsGiven(given)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user, navigate])

  const reviewedIds = new Set(reviewsGiven.map(r => `${r.bookingId}:${r.role}`))

  const handleCancelled = (id: string) =>
    setRenterItems(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))

  const handleReviewed = (bookingId: string, role: string) =>
    setReviewsGiven(prev => [...prev, { bookingId, role, rating: 0, comment: '' }])

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

      {/* Hero header */}
      <div className="bookings-hero">
        <div>
          <div className="bookings-hero-title">My Bookings</div>
          <div className="bookings-hero-sub">All your trips and listings in one place</div>
        </div>
        <div className="bookings-hero-stats">
          <div className="bookings-stat">
            <div className="bookings-stat-val">{renterItems.length}</div>
            <div className="bookings-stat-label">as renter</div>
          </div>
          <div className="bookings-stat">
            <div className="bookings-stat-val">{ownerItems.length}</div>
            <div className="bookings-stat-label">as owner</div>
          </div>
        </div>
      </div>

      <div className="bookings-body">

        {/* Trips you took */}
        <div>
          <div className="bookings-section-label">
            <span className="bookings-section-title">Your Rentals</span>
            <span className="bookings-section-count">{renterItems.length}</span>
          </div>
          {renterItems.length === 0 ? (
            <div className="bookings-empty">
              No rentals yet. <Link to="/cars" style={{ color: 'var(--accent)' }}>Browse cars</Link> to book your first trip.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {renterItems.map(b => (
                <TripCard
                  key={b.id}
                  booking={b}
                  role="renter"
                  userId={user!.id}
                  reviewedIds={reviewedIds}
                  onCancelled={handleCancelled}
                  onReviewed={handleReviewed}
                />
              ))}
            </div>
          )}
        </div>

        {/* Cars you listed that were booked */}
        <div>
          <div className="bookings-section-label">
            <span className="bookings-section-title">Your Listings</span>
            <span className="bookings-section-count">{ownerItems.length}</span>
          </div>
          {ownerItems.length === 0 ? (
            <div className="bookings-empty">
              None of your cars have been booked yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ownerItems.map(b => (
                <TripCard
                  key={b.id}
                  booking={b}
                  role="owner"
                  userId={user!.id}
                  reviewedIds={reviewedIds}
                  onCancelled={handleCancelled}
                  onReviewed={handleReviewed}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
