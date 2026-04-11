import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { cars as carsApi, watchlist as watchlistApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { gradientForModel } from './AddCarPage'
import type { Car } from '../../types'
import './CarDetailPage.css'

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [watching, setWatching] = useState(false)
  const [watchLoading, setWatchLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    carsApi.get(id)
      .then(data => { setCar(data); setLoading(false) })
      .catch(() => { setError('Car not found'); setLoading(false) })
  }, [id])

  useEffect(() => {
    if (!user || !id) return
    watchlistApi.status(user.id, id)
      .then(res => setWatching(res.watching))
      .catch(() => {})
  }, [user, id])

  const handleWatchlist = async () => {
    if (!user || !id) { navigate('/login'); return }
    setWatchLoading(true)
    try {
      if (watching) {
        await watchlistApi.remove(user.id, id)
        setWatching(false)
      } else {
        await watchlistApi.add(user.id, id)
        setWatching(true)
      }
    } catch { /* ignore */ } finally {
      setWatchLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !confirm('Delete this listing?')) return
    await carsApi.delete(id)
    navigate('/cars')
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>
  if (error || !car) return (
    <div className="empty">
      <p>{error || 'Car not found'}</p>
      <Link to="/cars" className="btn btn-secondary">Back to Cars</Link>
    </div>
  )

  const isOwner = user?.id === car.ownerId
  const ownerInitial = (car.owner?.email ?? car.ownerId)?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="car-detail">

      {/* Hero */}
      <div
        className="car-detail-hero"
        style={{ background: gradientForModel(car.model) }}
      >
        <Link to="/cars" className="car-detail-hero-back">Back to Cars</Link>

        <div className="car-detail-hero-content">
          <div>
            <div className="car-detail-hero-title">{car.model}</div>
            <div className="car-detail-hero-sub">
              {car.year} &nbsp;·&nbsp; {car.location}
              &nbsp;&nbsp;
              <span className={`badge ${car.available ? 'badge-green' : 'badge-red'}`}>
                {car.available ? 'Available' : 'Currently Rented'}
              </span>
            </div>
          </div>
          <div className="car-detail-hero-price">
            <span className="car-detail-hero-price-val">${car.price}</span>
            <span className="car-detail-hero-price-unit">/day</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="car-detail-body-full">

        {/* Stats grid */}
        <div className="car-detail-stats">
          {[
            { label: 'Year',     val: car.year },
            { label: 'Mileage',  val: `${car.mileage.toLocaleString()} mi` },
            { label: 'Location', val: car.location },
            { label: 'Status',   val: car.available ? 'Available now' : 'Currently rented' },
          ].map(({ label, val }) => (
            <div key={label} className="car-detail-stat">
              <div className="car-detail-stat-label">{label}</div>
              <div className="car-detail-stat-val">{val}</div>
            </div>
          ))}
        </div>

        {/* Owner */}
        <div className="car-detail-owner">
          <div className="car-detail-owner-avatar">{ownerInitial}</div>
          <div className="car-detail-owner-info">
            <div className="car-detail-owner-label">Listed by</div>
            <div className="car-detail-owner-email">{car.owner?.email ?? car.ownerId}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="car-detail-actions">
          {!isOwner && user && (
            <button
              className={`btn btn-lg ${watching ? 'btn-secondary' : 'btn-primary'}`}
              onClick={handleWatchlist}
              disabled={watchLoading}
            >
              {watching ? '★ Watching' : '☆ Watch this car'}
            </button>
          )}
          {!isOwner && user && car.available && (
            <Link to={`/cars/${car.id}/book`} className="btn btn-primary btn-lg">Book this car</Link>
          )}
          {!user && (
            <Link to="/login" className="btn btn-primary btn-lg">Sign in to Watch</Link>
          )}
          {isOwner && (
            <>
              <Link to={`/cars/${car.id}/edit`} className="btn btn-secondary btn-lg">Edit Listing</Link>
              <button className="btn btn-danger btn-lg" onClick={handleDelete}>Delete Listing</button>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
