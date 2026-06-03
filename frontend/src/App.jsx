import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './context/authStore'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserLayout from './components/layout/UserLayout'
import AdminLayout from './components/layout/AdminLayout'

// User Pages
import Dashboard from './pages/user/Dashboard'
import ServicesPage from './pages/user/ServicesPage'
import ServiceDetail from './pages/user/ServiceDetail'
import ApplyService from './pages/user/ApplyService'
import MyApplications from './pages/user/MyApplications'
import ApplicationDetail from './pages/user/ApplicationDetail'
import WalletPage from './pages/user/WalletPage'
import LedgerPage from './pages/user/LedgerPage'
import ProfilePage from './pages/user/ProfilePage'
import HelpPage from './pages/user/HelpPage'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminApplications from './pages/admin/AdminApplications'
import AdminUsers from './pages/admin/AdminUsers'
import AdminServices from './pages/admin/AdminServices'
import AdminTransactions from './pages/admin/AdminTransactions'
import AdminChats from './pages/admin/AdminChats'

const ProtectedRoute = ({ children, adminRequired = false }) => {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (adminRequired && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontFamily: 'Poppins, sans-serif', fontSize: '14px' }
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* User Routes */}
        <Route path="/" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/:id" element={<ServiceDetail />} />
          <Route path="services/:id/apply" element={<ApplyService />} />
          <Route path="applications" element={<MyApplications />} />
          <Route path="applications/:id" element={<ApplicationDetail />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="ledger" element={<LedgerPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="help" element={<HelpPage />} />
        </Route>

        {/* Admin Routes - fixed adminRequired={true} */}
        <Route path="/admin" element={<ProtectedRoute adminRequired={true}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="chats" element={<AdminChats />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
