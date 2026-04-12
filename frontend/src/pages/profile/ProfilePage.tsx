import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { reviews as reviewsApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { UserProfile, Review } from '../../types'
import './ProfilePage.css'

function stars(rating: number) {
  const n = Math.round(rating)
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="review-card card">
      <div className="review-card-top">
        <div className="review-card-reviewer">
          <div className="review-card-avatar">{review.reviewer.email[0].toUpperCase()}</div>
          <span className="review-card-email">{review.reviewer.email}</span>
        </div>
        <div className="review-card-meta">
          <span className="review-card-stars">{stars(review.rating)}</span>
          <span className="review-card-date">{formatDate(review.createdAt)}</span>
        </div>
      </div>
      {review.comment && (
        <div className="review-card-comment">"{review.comment}"</div>
      )}
    </div>
  )
}

function ReviewSection({
  title,
  subtitle,
  reviews,
  average,
}: {
  title: string
  subtitle: string
  reviews: Review[]
  average: number | null
}) {
  return (
    <div className="profile-review-section">
      <div className="profile-review-section-header">
        <div>
          <div className="profile-section-title">{title}</div>
          <div className="profile-section-sub">{subtitle}</div>
        </div>
        {average !== null && (
          <div className="profile-section-avg">
            <span className="profile-section-avg-val">{average.toFixed(1)}</span>
            <span className="profile-section-avg-stars">{stars(average)}</span>
            <span className="profile-section-avg-count">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
          </div>
        )}
        {average === null && (
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>No reviews yet</span>
        )}
      </div>
      {reviews.length === 0 ? (
        <div className="profile-empty-section">No {title.toLowerCase()} yet.</div>
      ) : (
        <div className="review-list">
          {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}
    </div>
  )
}

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { user: me } = useAuth()

  const [profile, setProfile]     = useState<UserProfile | null>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  const [editingBio, setEditingBio]   = useState(false)
  const [bioText, setBioText]         = useState('')
  const [savingBio, setSavingBio]     = useState(false)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    reviewsApi.getProfile(userId)
      .then(data => {
        setProfile(data)
        setBioText(data.user.bio ?? '')
        setLoading(false)
      })
      .catch(err => {
        setError((err as Error).message || 'Profile not found')
        setLoading(false)
      })
  }, [userId])

  const handleSaveBio = async () => {
    if (!userId) return
    setSavingBio(true)
    try {
      await reviewsApi.updateBio(userId, bioText)
      setProfile(prev => prev ? { ...prev, user: { ...prev.user, bio: bioText } } : prev)
      setEditingBio(false)
    } catch { /* ignore */ } finally {
      setSavingBio(false)
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  if (error || !profile) return (
    <div className="empty">
      <p>{error || 'Profile not found'}</p>
      <Link to="/cars" className="btn btn-secondary">Back to Cars</Link>
    </div>
  )

  const { user, asOwnerReviews, asRenterReviews, averageAsOwner, averageAsRenter, overallAverage, totalReviews } = profile
  const isOwnProfile = me?.id === user.id

  return (
    <div className="page">
      <div className="page-header">
        <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.4px', color: 'var(--text)', margin: 0 }}>
          {isOwnProfile ? 'My Profile' : 'User Profile'}
        </h1>
      </div>

      {/* Profile header */}
      <div className="profile-header">
        <div className="profile-avatar">{user.email[0].toUpperCase()}</div>
        <div className="profile-info">
          <div className="profile-email">{user.email}</div>
          <div className="profile-meta">Member since {formatDate(user.createdAt)}</div>

          {/* Bio */}
          {editingBio ? (
            <div className="profile-bio-edit">
              <textarea
                className="profile-bio-textarea"
                value={bioText}
                onChange={e => setBioText(e.target.value)}
                rows={2}
                maxLength={200}
                placeholder="Write a short bio…"
                autoFocus
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <button className="btn btn-primary btn-sm" onClick={handleSaveBio} disabled={savingBio}>
                  {savingBio ? 'Saving…' : 'Save'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditingBio(false); setBioText(user.bio ?? '') }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-bio-row">
              <span className="profile-bio-text">
                {user.bio ? user.bio : (isOwnProfile ? <span style={{ color: 'var(--text-3)' }}>No bio yet.</span> : null)}
              </span>
              {isOwnProfile && (
                <button className="btn btn-ghost btn-sm profile-bio-edit-btn" onClick={() => setEditingBio(true)}>
                  {user.bio ? 'Edit' : 'Add bio'}
                </button>
              )}
            </div>
          )}
        </div>

        {overallAverage !== null && (
          <div className="profile-rating-summary">
            <div className="profile-rating-value">{overallAverage.toFixed(1)}</div>
            <div className="profile-rating-stars">{stars(overallAverage)}</div>
            <div className="profile-rating-count">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</div>
          </div>
        )}
        {overallAverage === null && (
          <div className="profile-rating-summary">
            <div className="profile-rating-count" style={{ fontSize: 13 }}>No reviews yet</div>
          </div>
        )}
      </div>

      {/* Reviews split by type */}
      <ReviewSection
        title="As an Owner"
        subtitle="Reviews left by renters"
        reviews={asOwnerReviews}
        average={averageAsOwner}
      />
      <ReviewSection
        title="As a Renter"
        subtitle="Reviews left by owners"
        reviews={asRenterReviews}
        average={averageAsRenter}
      />
    </div>
  )
}
