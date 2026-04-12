import { Routes, Route, Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/dashboard/Dashboard'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import CarsPage from './pages/car/CarsPage'
import CarDetailPage from './pages/car/CarDetailPage'
import AddCarPage from './pages/car/AddCarPage'
import EditCarPage from './pages/car/EditCarPage'
import NotificationsPage from './pages/notifications/NotificationsPage'
import BookingsPage from './pages/bookings/BookingsPage'
import BookCarPage from './pages/bookings/BookCarPage'
import PaymentPage from './pages/payment/PaymentPage'
import ChatPage from './pages/chat/ChatPage'
import ProfilePage from './pages/profile/ProfilePage'

function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cars" element={<CarsPage />} />
        <Route path="/cars/add" element={<AddCarPage />} />
        <Route path="/cars/:id" element={<CarDetailPage />} />
        <Route path="/cars/:id/edit" element={<EditCarPage />} />
        <Route path="/cars/:id/book" element={<BookCarPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}
