import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { notifications as notifApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { Notification } from '../../types'
import './NotificationsPage.css'

const TYPE_CONFIG: Record<string, { label: string; iconClass: string; icon: JSX.Element }> = {
  price_changed: {
    label: 'Price change',
    iconClass: 'notif-icon-price',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
  },
  availability_changed: {
    label: 'Availability',
    iconClass: 'notif-icon-avail',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
  },
  booking_created: {
    label: 'Booking',
    iconClass: 'notif-icon-booking',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  booking_confirmed: {
    label: 'Booking',
    iconClass: 'notif-icon-booking',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
}

const FALLBACK_CONFIG = TYPE_CONFIG.booking_created

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

type Filter = 'all' | 'unread'

export default function NotificationsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    notifApi.list(user.id)
      .then(setNotifs)
      .catch(() => setNotifs([]))
      .finally(() => setLoading(false))
  }, [user, navigate])

  const handleMarkRead = async (id: string) => {
    if (!user) return
    await notifApi.markRead(user.id, id)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const handleMarkAll = async () => {
    if (!user) return
    await notifApi.markAllRead(user.id)
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unread = notifs.filter(n => !n.read).length
  const displayed = filter === 'unread' ? notifs.filter(n => !n.read) : notifs

  return (
    <div className="notif-page">

      {/* Header */}
      <div className="notif-header">
        <div className="notif-header-left">
          <div className="notif-title">
            Notifications
            {unread > 0 && <span className="notif-unread-badge">{unread}</span>}
          </div>
          <div className="notif-sub">
            {loading ? 'Loading…' : unread > 0 ? `${unread} unread notification${unread !== 1 ? 's' : ''}` : 'You\'re all caught up'}
          </div>
        </div>
        {unread > 0 && (
          <button className="btn btn-secondary" onClick={handleMarkAll}>
            Mark all read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="notif-tabs">
        <button className={`notif-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All {!loading && notifs.length > 0 && `(${notifs.length})`}
        </button>
        <button className={`notif-tab ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>
          Unread {!loading && unread > 0 && `(${unread})`}
        </button>
      </div>

      {/* Feed */}
      <div className="notif-feed">
        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : displayed.length === 0 ? (
          <div className="notif-empty">
            <div className="notif-empty-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
            </div>
            <div>
              <div className="notif-empty-title">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </div>
              <div className="notif-empty-sub">
                {filter === 'unread'
                  ? 'Switch to All to see your full history.'
                  : 'Watch a car to get notified when its price or availability changes.'}
              </div>
            </div>
            {filter === 'all' && (
              <Link to="/cars" className="btn btn-secondary btn-sm">Browse Cars</Link>
            )}
          </div>
        ) : (
          displayed.map(notif => {
            const cfg = TYPE_CONFIG[notif.type] ?? FALLBACK_CONFIG
            return (
              <div
                key={notif.id}
                className={`notif-item ${notif.read ? 'read' : 'unread'}`}
                onClick={() => { if (!notif.read) handleMarkRead(notif.id) }}
              >
                <div className={`notif-icon ${cfg.iconClass}`}>{cfg.icon}</div>

                <div className="notif-content">
                  <div className="notif-meta">
                    <span className="notif-type-label">{cfg.label}</span>
                    <span className="notif-dot" />
                    <span className="notif-time">{formatTime(notif.createdAt)}</span>
                  </div>
                  <div className="notif-message">{notif.message}</div>
                  {notif.carId && (
                    <Link
                      to={`/cars/${notif.carId}`}
                      className="notif-car-link"
                      onClick={e => e.stopPropagation()}
                    >
                      View car
                    </Link>
                  )}
                </div>

                {!notif.read && <div className="notif-unread-dot" />}
              </div>
            )
          })
        )}
      </div>

    </div>
  )
}