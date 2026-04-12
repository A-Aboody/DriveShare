import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { reviews as reviewsApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { UserProfile } from '../../types'
import './ProfilePage.css'

function starsDisplay(rating: number) {
  const full = Math.round(rating)
  return '★'.repeat(full) + '☆'.repeat(5 - full)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { user: me } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) return
    reviewsApi.getProfile(userId)
      .then(data => { setProfile(data); setLoading(false) })
      .catch(() => { setError('Profile not found'); setLoading(false) })
  }, [userId])

  if (loading) return <div className="loading"><div className="spinner" /></div>
  if (error || !profile) return (
    <div className="empty">
      <p>{error || 'Profile not found'}</p>
      <Link to="/cars" className="btn btn-secondary">Back to Cars</Link>
    </div>
  )

  const { user, reviews, averageRating } = profile
  const initial = user.email[0].toUpperCase()
  const isOwnProfile = me?.id === user.id

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.4px', color: 'var(--text)', margin: 0 }}>
            {isOwnProfile ? 'My Profile' : 'User Profile'}
          </h1>
        </div>
      </div>

      {/* Profile header card */}
      <div className="profile-header">
        <div className="profile-avatar">{initial}</div>
        <div className="profile-info">
          <div className="profile-email">{user.email}</div>
          <div className="profile-meta">Member since {formatDate(user.createdAt)}</div>
        </div>
        {averageRating !== null && (
          <div className="profile-rating-summary">
            <div className="profile-rating-value">{averageRating.toFixed(1)}</div>
            <div className="profile-rating-stars">{starsDisplay(averageRating)}</div>
            <div className="profile-rating-count">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
          </div>
        )}
        {averageRating === null && (
          <div className="profile-rating-summary">
            <div className="profile-rating-count" style={{ fontSize: 13 }}>No reviews yet</div>
          </div>
        )}
      </div>

      {/* Reviews list */}
      <div className="profile-section-title">Reviews received</div>
      {reviews.length === 0 ? (
        <div className="empty" style={{ padding: '32px 0' }}>
          <p>No reviews yet.</p>
        </div>
      ) : (
        <div className="review-list">
          {reviews.map(r => (
            <div key={r.id} className="review-card card">
              <div className="review-card-top">
                <div className="review-card-reviewer">
                  <div className="review-card-avatar">
                    {r.reviewer.email[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="review-card-email">{r.reviewer.email}</span>
                    <span className="review-card-role">
                      {r.role === 'renter' ? 'renter' : 'owner'}
                    </span>
                  </div>
                </div>
                <div className="review-card-meta">
                  <span className="review-card-stars">{starsDisplay(r.rating)}</span>
                  <span className="review-card-date">{formatDate(r.createdAt)}</span>
                </div>
              </div>
              {r.comment && (
                <div className="review-card-comment">"{r.comment}"</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
