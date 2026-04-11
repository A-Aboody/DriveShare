import { useState, useEffect, type FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { cars as carsApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { Car } from '../../types'

export default function EditCarPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [car, setCar] = useState<Car | null>(null)
  const [price, setPrice] = useState('')
  const [available, setAvailable] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    carsApi.get(id)
      .then(data => {
        setCar(data)
        setPrice(data.price.toString())
        setAvailable(data.available)
        setLoading(false)
      })
      .catch(() => { setError('Car not found'); setLoading(false) })
  }, [id])

  if (loading) return <div className="loading"><div className="spinner" /></div>
  if (error || !car) return <div className="empty"><p>{error}</p><Link to="/cars" className="btn btn-secondary">Back</Link></div>
  if (user?.id !== car.ownerId) return <div className="empty"><p>You don't own this listing.</p><Link to="/cars" className="btn btn-secondary">Back</Link></div>

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await carsApi.update(id!, {
        price: parseFloat(price),
        available,
      })
      navigate(`/cars/${id}`)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <div style={{ maxWidth: 480 }}>
      <Link to={`/cars/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-2)', marginBottom: 24 }}>
        Back to listing
      </Link>

      <div className="page-header" style={{ marginBottom: 24 }}>
        <h1 className="page-title">Edit {car.model}</h1>
      </div>

      <div className="card">
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20 }}>
          You can update the price and availability. Other fields require re-listing.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Price per day ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Availability</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className={`btn ${available ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setAvailable(true)}
              >
                Available
              </button>
              <button
                type="button"
                className={`btn ${!available ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setAvailable(false)}
              >
                Unavailable
              </button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>
              Watchers will be notified when availability changes.
            </p>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <Link to={`/cars/${id}`} className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
      </div>{/* end maxWidth wrapper */}
    </div>
  )
}
