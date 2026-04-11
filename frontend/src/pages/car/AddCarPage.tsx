import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { cars as carsApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import './AddCarPage.css'

const GRADIENTS = [
  'linear-gradient(135deg, #161622 0%, #1e1e38 100%)',
  'linear-gradient(135deg, #161a16 0%, #1a2e1e 100%)',
  'linear-gradient(135deg, #1a1616 0%, #2e1e1e 100%)',
  'linear-gradient(135deg, #161618 0%, #1e1a2e 100%)',
  'linear-gradient(135deg, #161a1a 0%, #1a2828 100%)',
  'linear-gradient(135deg, #1a1818 0%, #2a1e20 100%)',
]

export function gradientForModel(model: string) {
  if (!model.trim()) return GRADIENTS[0]
  const n = model.trim().toLowerCase().split('').reduce((sum, c) => sum + c.charCodeAt(0), 0)
  return GRADIENTS[n % GRADIENTS.length]
}

const MILEAGE_PRESETS = [
  { label: 'Under 10k',    value: 5000 },
  { label: '10k – 30k',   value: 20000 },
  { label: '30k – 60k',   value: 45000 },
  { label: '60k – 100k',  value: 80000 },
  { label: '100k – 150k', value: 125000 },
  { label: '150k+',       value: 160000 },
]

const MIN_YEAR = 1990
const MAX_YEAR = new Date().getFullYear() + 1
const TOTAL_STEPS = 3

export default function AddCarPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep]                   = useState(0)
  const [model, setModel]                 = useState('')
  const [year, setYear]                   = useState(new Date().getFullYear())
  const [yearRaw, setYearRaw]             = useState(String(new Date().getFullYear()))
  const [mileagePreset, setMileagePreset] = useState<number | null>(null)
  const [mileageCustom, setMileageCustom] = useState('')
  const [location, setLocation]           = useState('')
  const [price, setPrice]                 = useState('')
  const [error, setError]                 = useState('')
  const [loading, setLoading]             = useState(false)

  if (!user) {
    return (
      <div className="page">
        <div style={{ maxWidth: 400, margin: '0 auto', paddingTop: 80, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-2)', marginBottom: 20 }}>
            You need to be signed in to list a car.
          </p>
          <Link to="/login" className="btn btn-primary">Sign in</Link>
        </div>
      </div>
    )
  }

  const mileage = mileageCustom.trim()
    ? parseInt(mileageCustom)
    : mileagePreset ?? 0

  const canNext = [
    model.trim().length > 0 && year >= MIN_YEAR && year <= MAX_YEAR,
    mileageCustom.trim() !== '' || mileagePreset !== null,
    location.trim().length > 0 && parseFloat(price) > 0,
  ][step]

  const handleYearInput = (raw: string) => {
    setYearRaw(raw)
    const v = parseInt(raw)
    if (!isNaN(v)) setYear(Math.max(MIN_YEAR, Math.min(MAX_YEAR, v)))
  }

  const handleYearBlur = () => {
    const clamped = Math.max(MIN_YEAR, Math.min(MAX_YEAR, year))
    setYear(clamped)
    setYearRaw(String(clamped))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (step < TOTAL_STEPS - 1) { setStep(s => s + 1); return }
    setError('')
    setLoading(true)
    try {
      await carsApi.create({
        model: model.trim(),
        year,
        mileage,
        price: parseFloat(price),
        location: location.trim(),
        ownerId: user.id,
      })
      navigate('/cars')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const priceNum = parseFloat(price) || 0
  const gradient = gradientForModel(model)

  return (
    <div className="add-car">

      {/* Form panel */}
      <div className="add-car-form-panel">
        <div className="add-car-form-inner">

          {/* Steps bar */}
          <div className="add-car-steps">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`add-car-step-dot ${i < step ? 'done' : i === step ? 'active' : ''}`}
              />
            ))}
            <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 8 }}>
              {step + 1} / {TOTAL_STEPS}
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>

            {/* Step 0: The car */}
            {step === 0 && (
              <>
                <div className="add-car-step-eyebrow">Step 01</div>
                <div className="add-car-step-title">What's the car?</div>
                <div className="add-car-step-sub">
                  Start with the make and model. This is the first thing renters will see.
                </div>

                <div className="add-car-field">
                  <label className="add-car-field-label">Make & Model</label>
                  <input
                    type="text"
                    className="add-car-input-lg"
                    placeholder="e.g. Toyota Camry, Honda Civic…"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="add-car-field">
                  <label className="add-car-field-label">Year</label>
                  <div className="add-car-year-row">
                    <button
                      type="button"
                      className="add-car-year-btn"
                      onClick={() => { const y = Math.max(MIN_YEAR, year - 1); setYear(y); setYearRaw(String(y)) }}
                    >−</button>
                    <input
                      type="number"
                      className="add-car-year-input"
                      value={yearRaw}
                      min={MIN_YEAR}
                      max={MAX_YEAR}
                      onChange={e => handleYearInput(e.target.value)}
                      onBlur={handleYearBlur}
                    />
                    <button
                      type="button"
                      className="add-car-year-btn"
                      onClick={() => { const y = Math.min(MAX_YEAR, year + 1); setYear(y); setYearRaw(String(y)) }}
                    >+</button>
                  </div>
                  <span className="add-car-year-hint">{MIN_YEAR} to {MAX_YEAR}</span>
                </div>
              </>
            )}

            {/* Step 1: Mileage */}
            {step === 1 && (
              <>
                <div className="add-car-step-eyebrow">Step 02</div>
                <div className="add-car-step-title">How's it been driven?</div>
                <div className="add-car-step-sub">
                  Renters use mileage to gauge condition. Pick a range or enter the exact number.
                </div>

                <div className="add-car-field">
                  <label className="add-car-field-label">Mileage range</label>
                  <div className="add-car-chips">
                    {MILEAGE_PRESETS.map(p => (
                      <button
                        key={p.value}
                        type="button"
                        className={`add-car-chip ${mileagePreset === p.value && !mileageCustom ? 'selected' : ''}`}
                        onClick={() => { setMileagePreset(p.value); setMileageCustom('') }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="add-car-field">
                  <label className="add-car-field-label">Or enter exact mileage</label>
                  <input
                    type="number"
                    min="0"
                    className="add-car-input-lg"
                    placeholder="e.g. 47,000"
                    value={mileageCustom}
                    onChange={e => { setMileageCustom(e.target.value); setMileagePreset(null) }}
                  />
                </div>
              </>
            )}

            {/* Step 2: Location & Price */}
            {step === 2 && (
              <>
                <div className="add-car-step-eyebrow">Step 03</div>
                <div className="add-car-step-title">Where & how much?</div>
                <div className="add-car-step-sub">
                  Set your city and daily rate. You can always update the price later.
                </div>

                <div className="add-car-field">
                  <label className="add-car-field-label">Location</label>
                  <input
                    type="text"
                    className="add-car-input-lg"
                    placeholder="e.g. Detroit, MI"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="add-car-field">
                  <label className="add-car-field-label">Price per day</label>
                  <div className="add-car-price-wrap">
                    <span className="add-car-price-prefix">$</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      className="add-car-price-input"
                      placeholder="65"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                    />
                    <span className="add-car-price-suffix">/ day</span>
                  </div>
                  {priceNum > 0 && (
                    <div className="add-car-earnings">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                      </svg>
                      At ${priceNum}/day you could earn ~${(priceNum * 12).toLocaleString()} renting 12 days/month
                    </div>
                  )}
                </div>

                {error && <div className="add-car-error">{error}</div>}
              </>
            )}

            {/* Nav */}
            <div className="add-car-nav">
              <div style={{ display: 'flex', gap: 10 }}>
                {step > 0 && (
                  <button type="button" className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>
                    Back
                  </button>
                )}
                {step === 0 && (
                  <Link to="/cars" className="btn btn-ghost">Cancel</Link>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={!canNext || loading}
              >
                {step < TOTAL_STEPS - 1 ? 'Continue' : loading ? 'Listing…' : 'List my car'}
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Preview panel */}
      <div className="add-car-preview-panel">
        <div className="add-car-preview-label">Your listing preview</div>

        <div className="add-car-preview-card">
          <div className="add-car-preview-top" style={{ background: gradient }}>
            <span className="badge badge-green">Available</span>
          </div>
          <div className="add-car-preview-body">
            {model ? (
              <div className="add-car-preview-model">{model}</div>
            ) : (
              <div className="add-car-preview-model-placeholder" />
            )}
            <div className="add-car-preview-meta">
              {[
                year,
                location || null,
                mileage > 0 ? `${mileage.toLocaleString()} mi` : null,
              ].filter(Boolean).join(' · ')}
            </div>
            <div className="add-car-preview-footer">
              {priceNum > 0 ? (
                <>
                  <span className="add-car-preview-price">${priceNum}</span>
                  <span className="add-car-preview-price-unit">/day</span>
                </>
              ) : (
                <span style={{ color: 'var(--text-3)', fontSize: 13 }}>Price not set</span>
              )}
            </div>
          </div>
        </div>

        <p className="add-car-preview-hint">
          This is exactly how your car<br />will appear on the listings page.
        </p>
      </div>

    </div>
  )
}
