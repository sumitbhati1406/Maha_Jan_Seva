import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useAuthStore from '../../context/authStore'
import useLangStore from '../../context/langStore'
import ChatWidget from '../ChatWidget'
import { 
  FaHome, FaList, FaFileAlt, FaWallet, FaUser, 
  FaSignOutAlt, FaBars, FaTimes, FaBook, FaQuestionCircle,
  FaShieldAlt, FaBell
} from 'react-icons/fa'

export default function UserLayout() {
  const { user, logout } = useAuthStore()
  const { t, lang, setLang } = useLangStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/dashboard', icon: FaHome, label: t('dashboard') },
    { path: '/services', icon: FaList, label: t('services') },
    { path: '/applications', icon: FaFileAlt, label: t('myApplications') },
    { path: '/wallet', icon: FaWallet, label: t('wallet') },
    { path: '/ledger', icon: FaBook, label: t('ledger') },
    { path: '/profile', icon: FaUser, label: t('profile') },
    { path: '/help', icon: FaQuestionCircle, label: t('help') },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy-900 text-white transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex-shrink-0`}
        style={{ backgroundColor: '#0f1f35' }}>
        
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold"
              style={{ background: 'linear-gradient(135deg, #ff9500 0%, #ff6b35 100%)' }}>
              म
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">{t('appName')}</div>
              <div className="text-xs text-slate-400">Seva Portal</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
            <FaTimes />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center font-bold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold truncate">{user?.name}</div>
              <div className="text-xs text-slate-400">
                ₹ {user?.walletBalance?.toFixed(0) || 0} Balance
              </div>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="p-3 flex-1 space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink key={path} to={path} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-white/10'
                }`}>
              <Icon className="text-base flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Admin Link */}
        {user?.role === 'admin' && (
          <div className="p-3">
            <NavLink to="/admin" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-saffron-400 hover:bg-white/10 border border-saffron-400/30">
              <FaShieldAlt />
              Admin Panel
            </NavLink>
          </div>
        )}

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-400/10 transition-all">
            <FaSignOutAlt /> {t('logout')}
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-600">
              <FaBars size={20} />
            </button>
            {/* Marquee */}
            <div className="hidden md:block overflow-hidden max-w-md">
              <div className="ticker-content text-xs text-slate-500">
                🔔 GST Filing | PAN Card | Gazette Name Change | Passport | Aadhaar | ITR | Caste Certificate
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <select value={lang} onChange={e => setLang(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="en">EN</option>
              <option value="mr">मराठी</option>
              <option value="hi">हिंदी</option>
            </select>
            {/* Wallet Badge */}
            <NavLink to="/wallet" className="hidden sm:flex items-center gap-1.5 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-xl text-sm font-semibold border border-primary-200">
              <FaWallet size={12} /> ₹{user?.walletBalance?.toFixed(0) || 0}
            </NavLink>
            <FaBell className="text-slate-500" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  )
}
