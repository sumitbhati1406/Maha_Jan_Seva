import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useAuthStore from '../../context/authStore'
import { FaTachometerAlt, FaFileAlt, FaUsers, FaList, FaMoneyBill, FaComments, FaBars, FaTimes, FaSignOutAlt, FaUser } from 'react-icons/fa'

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const navItems = [
    { path: '/admin', icon: FaTachometerAlt, label: 'Dashboard', end: true },
    { path: '/admin/applications', icon: FaFileAlt, label: 'Applications' },
    { path: '/admin/users', icon: FaUsers, label: 'Users' },
    { path: '/admin/services', icon: FaList, label: 'Services' },
    { path: '/admin/transactions', icon: FaMoneyBill, label: 'Transactions' },
    { path: '/admin/chats', icon: FaComments, label: 'Chats' },
  ]

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f1f5f9' }}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex-shrink-0`}
        style={{ backgroundColor: '#1e3a5f' }}>
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-saffron-500 flex items-center justify-center font-bold text-white text-sm">A</div>
            <div>
              <div className="text-white font-bold text-sm">Admin Panel</div>
              <div className="text-xs text-blue-200">MahaJanSeva</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
            <FaTimes />
          </button>
        </div>

        {/* Admin Info */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-saffron-500 flex items-center justify-center font-bold text-white">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="text-white text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-blue-200">Administrator</div>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map(({ path, icon: Icon, label, end }) => (
            <NavLink key={path} to={path} end={end} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-saffron-500 text-white' : 'text-blue-100 hover:bg-white/10'
                }`}>
              <Icon className="flex-shrink-0" /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1 border-t border-white/10">
          <NavLink to="/dashboard" className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-blue-200 hover:bg-white/10">
            <FaUser size={12} /> User View
          </NavLink>
          <button onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-red-400 hover:bg-red-400/10">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-600">
            <FaBars size={20} />
          </button>
          <h1 className="font-semibold text-slate-700">MahaJanSeva Admin Portal</h1>
          <div className="text-sm text-slate-500">{new Date().toLocaleDateString('en-IN')}</div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
