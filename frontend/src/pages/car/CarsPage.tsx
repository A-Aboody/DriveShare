import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { cars as carsApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import CarCard from '../../components/CarCard'
import type { Car } from '../../types'

const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

export default function CarsPage() {
  const { user } = useAuth()
  const [carList, setCarList] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [showMine, setShowMine] = useState(false)

  const fetchCars = (location?: string) => {
    setLoading(true)
    carsApi.list(location || undefined)
      .then(setCarList)
      .catch(() => setCarList([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCars(query || undefined)
  }, [query])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    setQuery(search.trim())
    setShowMine(false)
  }

  const handleShowMine = () => {
    if (!user) return
    setLoading(true)
    setShowMine(true)
    setQuery('')
    setSearch('')
    carsApi.mine(user.id)
      .then(setCarList)
      .catch(() => setCarList([]))
      .finally(() => setLoading(false))
  }

  const handleShowAll = () => {
    setShowMine(false)
    setQuery('')
    setSearch('')
    fetchCars()
  }

  const displayed = carList

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {showMine ? 'My Listings' : query ? `Cars in "${query}"` : 'Browse Cars'}
          </h1>
          {!loading && <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>{displayed.length} car{displayed.length !== 1 ? 's' : ''} found</p>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {user && (
            <button className="btn btn-secondary btn-sm" onClick={showMine ? handleShowAll : handleShowMine}>
              {showMine ? 'All Cars' : 'My Listings'}
            </button>
          )}
          {user && (
            <Link to="/cars/add" className="btn btn-primary btn-sm">+ List a Car</Link>
          )}
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}>
            <IconSearch />
          </span>
          <input
            type="text"
            placeholder="Search by location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 32 }}
          />
        </div>
        <button type="submit" className="btn btn-secondary">Search</button>
        {query && (
          <button type="button" className="btn btn-ghost" onClick={handleShowAll}>Clear</button>
        )}
      </form>

      {/* Car grid */}
      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : displayed.length === 0 ? (
        <div className="empty">
          <p>{query ? `No cars found in "${query}"` : 'No cars listed yet.'}</p>
          {user && <Link to="/cars/add" className="btn btn-primary btn-sm">List a Car</Link>}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
        }}>
          {displayed.map(car => <CarCard key={car.id} car={car} />)}
        </div>
      )}
    </div>
  )
}
