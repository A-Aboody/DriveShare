import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { reviews as reviewsApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { UserProfile, Review } from '../../types'
import './ProfilePage.css'

const stars = (n: number) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n))

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const fmtMember = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

function RevCard({ review }: { review: Review }) {
  return (
    <div className="rev-card">
      <div className="rev-card-top">
        <div className="rev-card-reviewer">
          <div className="rev-card-avatar">{review.reviewer.email[0].toUpperCase()}</div>
          <span className="rev-card-email">{review.reviewer.email}</span>
        </div>
        <div className="rev-card-right">
          <span className="rev-card-stars">{stars(review.rating)}</span>
          <span className="rev-card-date">{fmtDate(review.createdAt)}</span>
        </div>
      </div>
      {review.comment && <div className="rev-card-comment">"{review.comment}"</div>}
    </div>
  )
}

function ReviewCol({ title, subtitle, reviews, average }: {
  title: string
  subtitle: string
  reviews: Review[]
  average: number | null
}) {
  return (
    <div className="profile-review-col">
      <div className="profile-review-col-header">
        <div>
          <div className="profile-review-col-title">{title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{subtitle}</div>
        </div>
        {average !== null ? (
          <div className="profile-review-col-avg">
            <span className="profile-review-col-stars">{stars(average)}</span>
            <span className="profile-review-col-val">{average.toFixed(1)}</span>
          </div>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>No reviews</span>
        )}
      </div>
      {reviews.length === 0
        ? <div className="profile-review-none">Nothing here yet.</div>
        : reviews.map(r => <RevCard key={r.id} review={r} />)
      }
    </div>
  )
}

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { user: me } = useAuth()

  const [profile, setProfile]   = useState<UserProfile | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error,   setError]     = useState('')

  const [editingBio, setEditingBio] = useState(false)
  const [bioText,    setBioText]    = useState('')
  const [savingBio,  setSavingBio]  = useState(false)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    reviewsApi.getProfile(userId)
      .then(data => { setProfile(data); setBioText(data.user.bio ?? ''); setLoading(false) })
      .catch(e => { setError((e as Error).message || 'Profile not found'); setLoading(false) })
  }, [userId])

  const saveBio = async () => {
    if (!userId) return
    setSavingBio(true)
    try {
      await reviewsApi.updateBio(userId, bioText)
      setProfile(p => p ? { ...p, user: { ...p.user, bio: bioText } } : p)
      setEditingBio(false)
    } catch { /* ignore */ }
    finally { setSavingBio(false) }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>
  if (error || !profile) return (
    <div className="empty">
      <p>{error || 'Profile not found'}</p>
      <Link to="/cars" className="btn btn-secondary">Back to Cars</Link>
    </div>
  )

  const { user, asOwnerReviews, asRenterReviews, averageAsOwner, averageAsRenter, overallAverage, totalReviews } = profile
  const isOwn = me?.id === user.id

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

      {/* Hero banner */}
      <div className="profile-hero" />

      {/* Identity */}
      <div className="profile-identity">
        <div className="profile-avatar">{user.email[0].toUpperCase()}</div>
        <div className="profile-identity-info">
          <div className="profile-email">{user.email}</div>
          <div className="profile-since">Member since {fmtMember(user.createdAt)}</div>
        </div>
        {isOwn && (
          <Link to="/bookings" className="btn btn-secondary btn-sm">My Bookings</Link>
        )}
      </div>

      {/* Stats */}
      <div className="profile-stats">
        <div className="profile-stat">
          <div className={`profile-stat-val ${overallAverage === null ? 'neutral' : ''}`}>
            {overallAverage !== null ? overallAverage.toFixed(1) : '—'}
          </div>
          <div className="profile-stat-label">Overall rating</div>
        </div>
        <div className="profile-stat">
          <div className={`profile-stat-val ${averageAsOwner === null ? 'neutral' : ''}`}>
            {averageAsOwner !== null ? averageAsOwner.toFixed(1) : '—'}
          </div>
          <div className="profile-stat-label">As owner</div>
        </div>
        <div className="profile-stat">
          <div className={`profile-stat-val ${averageAsRenter === null ? 'neutral' : ''}`}>
            {averageAsRenter !== null ? averageAsRenter.toFixed(1) : '—'}
          </div>
          <div className="profile-stat-label">As renter</div>
        </div>
      </div>

      <div className="profile-body">

        {/* Bio */}
        <div className="profile-bio-block">
          <div className="profile-bio-header">
            <span className="profile-bio-title">About</span>
            {isOwn && !editingBio && (
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingBio(true)}>
                {user.bio ? 'Edit' : 'Add bio'}
              </button>
            )}
          </div>

          {editingBio ? (
            <>
              <textarea
                className="profile-bio-textarea"
                rows={3}
                maxLength={200}
                value={bioText}
                onChange={e => setBioText(e.target.value)}
                placeholder="Write a short bio…"
                autoFocus
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={saveBio} disabled={savingBio}>
                  {savingBio ? 'Saving…' : 'Save'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditingBio(false); setBioText(user.bio ?? '') }}>
                  Cancel
                </button>
              </div>
            </>
          ) : user.bio ? (
            <p className="profile-bio-text">{user.bio}</p>
          ) : (
            <p className="profile-bio-empty">{isOwn ? 'Tell others a bit about yourself.' : 'No bio yet.'}</p>
          )}
        </div>

        {/* Reviews side by side */}
        <div className="profile-reviews-grid">
          <ReviewCol
            title="As an Owner"
            subtitle={`${asOwnerReviews.length} review${asOwnerReviews.length !== 1 ? 's' : ''} from renters`}
            reviews={asOwnerReviews}
            average={averageAsOwner}
          />
          <ReviewCol
            title="As a Renter"
            subtitle={`${asRenterReviews.length} review${asRenterReviews.length !== 1 ? 's' : ''} from owners`}
            reviews={asRenterReviews}
            average={averageAsRenter}
          />
        </div>

      </div>
    </div>
  )
}
