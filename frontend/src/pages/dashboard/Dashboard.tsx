import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cars as carsApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { gradientForModel } from '../car/AddCarPage'
import type { Car } from '../../types'
import './Dashboard.css'

function DashboardCarCard({ car }: { car: Car }) {
  return (
    <Link to={`/cars/${car.id}`} className="dash-card">
      <div className="dash-card-top" style={{ background: gradientForModel(car.model) }}>
        <span className={`badge ${car.available ? 'badge-green' : 'badge-red'}`}>
          {car.available ? 'Available' : 'Rented'}
        </span>
      </div>
      <div className="dash-card-body">
        <div className="dash-card-model">{car.model}</div>
        <div className="dash-card-meta">
          {car.year} · {car.location} · {car.mileage.toLocaleString()} mi
        </div>
        <div className="dash-card-footer">
          <div className="dash-card-price">
            <span>${car.price}</span>
            <span className="dash-card-price-unit">/day</span>
          </div>
          <span className="dash-card-cta">View</span>
        </div>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [carList, setCarList] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    carsApi.list()
      .then(setCarList)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    if (search.trim()) navigate(`/cars?location=${encodeURIComponent(search.trim())}`)
    else navigate('/cars')
  }

  const available = carList.filter(c => c.available)

  return (
    <div className="dashboard">

      {/* Hero */}
      <div className="dash-hero">
        <div className="dash-hero-inner">
          <div className="dash-hero-text">
            <h1 className="dash-hero-title">Find your drive.</h1>
            <p className="dash-hero-sub">
              Rent directly from local owners. No dealerships, no markups.
            </p>
          </div>

          <form className="dash-search" onSubmit={handleSearch}>
            <input
              type="text"
              className="dash-search-input"
              placeholder="Search by city or location…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          {!loading && carList.length > 0 && (
            <div className="dash-hero-stats">
              <div className="dash-hero-stat">
                <span className="dash-hero-stat-val">{available.length}</span>
                <span className="dash-hero-stat-label">cars available</span>
              </div>
              <div className="dash-hero-stat-sep" />
              <div className="dash-hero-stat">
                <span className="dash-hero-stat-val">${Math.min(...carList.map(c => c.price))}</span>
                <span className="dash-hero-stat-label">starting / day</span>
              </div>
              <div className="dash-hero-stat-sep" />
              <div className="dash-hero-stat">
                <span className="dash-hero-stat-val">
                  {[...new Set(carList.map(c => c.location))].length}
                </span>
                <span className="dash-hero-stat-label">
                  {[...new Set(carList.map(c => c.location))].length === 1 ? 'location' : 'locations'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cars grid */}
      <div className="dash-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">
            {loading ? 'Loading…' : available.length > 0 ? 'Available now' : 'All listings'}
          </h2>
          <Link to="/cars" className="dash-section-link">Browse all</Link>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : carList.length === 0 ? (
          <div className="dash-empty">
            <p>No cars listed yet.</p>
            {user ? (
              <Link to="/cars/add" className="btn btn-primary">List your car</Link>
            ) : (
              <Link to="/register" className="btn btn-primary">Get started</Link>
            )}
          </div>
        ) : (
          <div className="dash-grid">
            {carList.map((car) => (
              <DashboardCarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </div>

      {/* CTA for non-owners */}
      {!loading && user && (
        <div className="dash-cta-strip">
          <div className="dash-cta-text">
            <span>Have a car sitting idle?</span>
          </div>
          <Link to="/cars/add" className="btn btn-primary btn-sm">List a car</Link>
        </div>
      )}
      {!loading && !user && (
        <div className="dash-cta-strip">
          <div className="dash-cta-text">
            <span>Own a car? Earn money when you're not using it.</span>
          </div>
          <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
        </div>
      )}
    </div>
  )
}
