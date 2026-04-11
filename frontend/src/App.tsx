import { Routes, Route, Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/dashboard/Dashboard'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import CarsPage from './pages/car/CarsPage'
import CarDetailPage from './pages/car/CarDetailPage'
import AddCarPage from './pages/car/AddCarPage'
import EditCarPage from './pages/car/EditCarPage'
import NotificationsPage from './pages/notifications/NotificationsPage'

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
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cars" element={<CarsPage />} />
        <Route path="/cars/add" element={<AddCarPage />} />
        <Route path="/cars/:id" element={<CarDetailPage />} />
        <Route path="/cars/:id/edit" element={<EditCarPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>
    </Routes>
  )
}
