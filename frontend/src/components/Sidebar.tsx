import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Sidebar.css'

const IconHome = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const IconCar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="11" width="22" height="9" rx="2"/><path d="M5 11V8a2 2 0 012-2h10a2 2 0 012 2v3"/><circle cx="7" cy="20" r="1"/><circle cx="17" cy="20" r="1"/>
  </svg>
)
const IconList = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
)
const IconBell = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
)
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const IconLogin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
)
const IconBooking = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconChat = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
)
const IconProfile = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isAdd  = pathname === '/cars/add'
  const isEdit = /^\/cars\/.+\/edit$/.test(pathname)
  const isCars = pathname === '/cars' || (!isAdd && !isEdit && /^\/cars(\/|$)/.test(pathname))

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#000" stroke="none">
              <rect x="1" y="11" width="22" height="9" rx="2"/>
              <path d="M5 11V8a2 2 0 012-2h10a2 2 0 012 2v3"/>
              <circle cx="7" cy="20" r="1.5" fill="#fff"/>
              <circle cx="17" cy="20" r="1.5" fill="#fff"/>
            </svg>
          </div>
          <span className="sidebar-logo-name">DriveShare</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <Link to="/" className={`sidebar-item ${pathname === '/' ? 'active' : ''}`}>
            <IconHome /><span>Dashboard</span>
          </Link>
          <Link to="/cars" className={`sidebar-item ${isCars ? 'active' : ''}`}>
            <IconCar /><span>Browse Cars</span>
          </Link>
        </div>

        {user && (
          <>
            <div className="sidebar-divider" />
            <div className="sidebar-section-label">My Account</div>
            <div className="sidebar-section">
              <Link to="/cars/add" className={`sidebar-item ${isAdd ? 'active' : ''}`}>
                <IconPlus /><span>List a Car</span>
              </Link>
              <Link to="/bookings" className={`sidebar-item ${pathname === '/bookings' ? 'active' : ''}`}>
                <IconBooking /><span>My Bookings</span>
              </Link>
              <Link to="/chat" className={`sidebar-item ${pathname.startsWith('/chat') ? 'active' : ''}`}>
                <IconChat /><span>Messages</span>
              </Link>
              <Link to="/notifications" className={`sidebar-item ${pathname === '/notifications' ? 'active' : ''}`}>
                <IconBell /><span>Notifications</span>
              </Link>
              <Link to={`/profile/${user.id}`} className={`sidebar-item ${pathname.startsWith('/profile') ? 'active' : ''}`}>
                <IconProfile /><span>My Profile</span>
              </Link>
            </div>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        {user ? (
          <>
            <div className="sidebar-user">
              <div className="sidebar-avatar">{user.email[0].toUpperCase()}</div>
              <span className="sidebar-email">{user.email}</span>
            </div>
            <button className="sidebar-item sidebar-logout" onClick={handleLogout}>
              <IconLogout /><span>Sign out</span>
            </button>
          </>
        ) : (
          <Link to="/login" className="sidebar-item">
            <IconLogin /><span>Sign in</span>
          </Link>
        )}
      </div>
    </aside>
  )
}
