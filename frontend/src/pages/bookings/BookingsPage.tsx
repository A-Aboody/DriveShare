import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { bookings as bookingsApi, reviews as reviewsApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { BookingWithCar, ReviewGiven } from '../../types'
import './BookingsPage.css'

type MainTab = 'renter' | 'owner'
type SubTab  = 'upcoming' | 'past'

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
        >★</button>
      ))}
    </div>
  )
}

/** Inline review form used by both renter and owner cards */
function ReviewForm({
  label,
  onSubmit,
  onCancel,
}: {
  label: string
  onSubmit: (rating: number, comment: string) => Promise<void>
  onCancel: () => void
}) {
  const [rating, setRating]   = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async () => {
    if (rating === 0) { setError('Please select a rating.'); return }
    setError('')
    setSubmitting(true)
    try {
      await onSubmit(rating, comment)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="review-form">
      <div className="review-form-label">{label}</div>
      <StarRating value={rating} onChange={setRating} />
      <textarea
        className="review-textarea"
        placeholder="Optional comment…"
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={3}
      />
      {error && <p className="form-error">{error}</p>}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit review'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

/** Card shown in the "As Renter" tab */
function RenterBookingCard({
  booking,
  userId,
  reviewedBookingIds,
  onCancelled,
  onReviewed,
}: {
  booking: BookingWithCar
  userId: string
  reviewedBookingIds: Set<string>
  onCancelled: (id: string) => void
  onReviewed: (id: string, rating: number, comment: string) => void
}) {
  const now   = new Date()
  const start = new Date(booking.startDate)
  const end   = new Date(booking.endDate)
  const days  = daysBetween(booking.startDate, booking.endDate)
  const total = days * booking.car.price

  const canCancel      = booking.status === 'confirmed' && start > now
  const tripEnded      = booking.status === 'confirmed' && end < now
  const alreadyReviewed = reviewedBookingIds.has(booking.id + ':renter')

  const [cancelling, setCancelling] = useState(false)
  const [showReview, setShowReview] = useState(false)

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

  const handleReviewOwner = async (rating: number, comment: string) => {
    if (!booking.user) return
    await reviewsApi.create({
      reviewerId: userId,
      revieweeId: booking.car.ownerId ?? '',
      bookingId: booking.id,
      rating,
      comment,
      role: 'renter',
    })
    onReviewed(booking.id, rating, comment)
    setShowReview(false)
  }

  return (
    <div className="booking-card card">
      <div className="booking-card-header">
        <div>
          <div className="booking-car-name">
            <Link to={`/cars/${booking.car.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              {booking.car.model}
            </Link>
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
          <button className="btn btn-danger btn-sm" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? 'Cancelling…' : 'Cancel booking'}
          </button>
        )}
        {tripEnded && !alreadyReviewed && !showReview && (
          <button className="btn btn-secondary btn-sm" onClick={() => setShowReview(true)}>
            Review owner
          </button>
        )}
        {tripEnded && alreadyReviewed && (
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Owner reviewed</span>
        )}
        {booking.car.ownerId && (
          <Link
            to={`/profile/${booking.car.ownerId}`}
            className="btn btn-ghost btn-sm"
            style={{ marginLeft: 'auto' }}
          >
            View owner profile
          </Link>
        )}
      </div>

      {showReview && (
        <ReviewForm
          label="How was the owner?"
          onSubmit={handleReviewOwner}
          onCancel={() => setShowReview(false)}
        />
      )}

      {booking.rating && (
        <div className="booking-existing-review">
          <span style={{ color: 'var(--yellow)' }}>
            {'★'.repeat(booking.rating)}{'☆'.repeat(5 - booking.rating)}
          </span>
          {booking.comment && (
            <span className="booking-review-comment">{booking.comment}</span>
          )}
        </div>
      )}
    </div>
  )
}

/** Card shown in the "As Owner" tab */
function OwnerBookingCard({
  booking,
  userId,
  reviewedBookingIds,
  onReviewed,
}: {
  booking: BookingWithCar
  userId: string
  reviewedBookingIds: Set<string>
  onReviewed: (bookingId: string) => void
}) {
  const now = new Date()
  const end = new Date(booking.endDate)

  const tripEnded      = booking.status === 'confirmed' && end < now
  const alreadyReviewed = reviewedBookingIds.has(booking.id + ':owner')
  const renterId       = (booking as any).user?.id as string | undefined
  const renterEmail    = (booking as any).user?.email as string | undefined

  const [showReview, setShowReview] = useState(false)

  const handleReviewRenter = async (rating: number, comment: string) => {
    if (!renterId) return
    await reviewsApi.create({
      reviewerId: userId,
      revieweeId: renterId,
      bookingId: booking.id,
      rating,
      comment,
      role: 'owner',
    })
    onReviewed(booking.id)
    setShowReview(false)
  }

  const days  = daysBetween(booking.startDate, booking.endDate)
  const total = days * booking.car.price

  return (
    <div className="booking-card card">
      <div className="booking-card-header">
        <div>
          <div className="booking-car-name">
            {booking.car.model}
            <span className="booking-car-year">{booking.car.year}</span>
          </div>
          <div className="booking-dates">{formatDateRange(booking.startDate, booking.endDate)}</div>
          {renterEmail && (
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
              Rented by {renterEmail}
            </div>
          )}
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
        {tripEnded && !alreadyReviewed && !showReview && renterId && (
          <button className="btn btn-secondary btn-sm" onClick={() => setShowReview(true)}>
            Review renter
          </button>
        )}
        {tripEnded && alreadyReviewed && (
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Renter reviewed</span>
        )}
        {renterId && (
          <Link
            to={`/profile/${renterId}`}
            className="btn btn-ghost btn-sm"
            style={{ marginLeft: 'auto' }}
          >
            View renter profile
          </Link>
        )}
      </div>

      {showReview && (
        <ReviewForm
          label="How was the renter?"
          onSubmit={handleReviewRenter}
          onCancel={() => setShowReview(false)}
        />
      )}
    </div>
  )
}

export default function BookingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [renterItems, setRenterItems] = useState<BookingWithCar[]>([])
  const [ownerItems, setOwnerItems]   = useState<BookingWithCar[]>([])
  const [reviewsGiven, setReviewsGiven] = useState<ReviewGiven[]>([])
  const [loading, setLoading]         = useState(true)
  const [mainTab, setMainTab]         = useState<MainTab>('renter')
  const [subTab, setSubTab]           = useState<SubTab>('upcoming')

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

  // Set of "bookingId:role" keys for O(1) lookup
  const reviewedIds = new Set(reviewsGiven.map(r => `${r.bookingId}:${r.role}`))

  const now = new Date()

  const renterUpcoming = renterItems.filter(b =>
    b.status === 'confirmed' && new Date(b.startDate) > now
  )
  const renterPast = renterItems.filter(b =>
    b.status === 'cancelled' || (b.status === 'confirmed' && new Date(b.startDate) <= now)
  )

  const ownerUpcoming = ownerItems.filter(b =>
    b.status === 'confirmed' && new Date(b.startDate) > now
  )
  const ownerPast = ownerItems.filter(b =>
    b.status === 'cancelled' || (b.status === 'confirmed' && new Date(b.startDate) <= now)
  )

  const activeRenter = subTab === 'upcoming' ? renterUpcoming : renterPast
  const activeOwner  = subTab === 'upcoming' ? ownerUpcoming  : ownerPast

  const handleCancelled = (id: string) =>
    setRenterItems(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))

  const handleRenterReviewed = (id: string, rating: number, comment: string) => {
    setRenterItems(prev => prev.map(b => b.id === id ? { ...b, rating, comment } : b))
    setReviewsGiven(prev => [...prev, { bookingId: id, role: 'renter', rating, comment }])
  }

  const handleOwnerReviewed = (bookingId: string) =>
    setReviewsGiven(prev => [...prev, { bookingId, role: 'owner', rating: 0, comment: '' }])

  if (loading) return <div className="loading"><div className="spinner" /></div>

  const items      = mainTab === 'renter' ? activeRenter : activeOwner
  const upcoming   = mainTab === 'renter' ? renterUpcoming : ownerUpcoming
  const past       = mainTab === 'renter' ? renterPast    : ownerPast
  const totalCount = mainTab === 'renter' ? renterItems.length : ownerItems.length

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.4px', color: 'var(--text)', margin: 0 }}>
            My Bookings
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
            {totalCount} booking{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Main tabs: As Renter / As Owner */}
      <div className="bookings-tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
        <button
          className={`bookings-tab ${mainTab === 'renter' ? 'active' : ''}`}
          onClick={() => setMainTab('renter')}
        >
          As Renter
          {renterItems.length > 0 && (
            <span className="bookings-tab-count">{renterItems.length}</span>
          )}
        </button>
        <button
          className={`bookings-tab ${mainTab === 'owner' ? 'active' : ''}`}
          onClick={() => setMainTab('owner')}
        >
          As Owner
          {ownerItems.length > 0 && (
            <span className="bookings-tab-count">{ownerItems.length}</span>
          )}
        </button>
      </div>

      {/* Sub tabs: Upcoming / Past */}
      <div className="bookings-tabs" style={{ marginTop: 0 }}>
        <button
          className={`bookings-tab ${subTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setSubTab('upcoming')}
        >
          Upcoming
          {upcoming.length > 0 && <span className="bookings-tab-count">{upcoming.length}</span>}
        </button>
        <button
          className={`bookings-tab ${subTab === 'past' ? 'active' : ''}`}
          onClick={() => setSubTab('past')}
        >
          Past
          {past.length > 0 && <span className="bookings-tab-count">{past.length}</span>}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="empty">
          <p>No {subTab} bookings.</p>
        </div>
      ) : (
        <div className="bookings-list">
          {mainTab === 'renter'
            ? items.map(b => (
                <RenterBookingCard
                  key={b.id}
                  booking={b}
                  userId={user!.id}
                  reviewedBookingIds={reviewedIds}
                  onCancelled={handleCancelled}
                  onReviewed={handleRenterReviewed}
                />
              ))
            : items.map(b => (
                <OwnerBookingCard
                  key={b.id}
                  booking={b}
                  userId={user!.id}
                  reviewedBookingIds={reviewedIds}
                  onReviewed={handleOwnerReviewed}
                />
              ))
          }
        </div>
      )}
    </div>
  )
}
