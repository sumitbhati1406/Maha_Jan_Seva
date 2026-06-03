import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../../utils/api'
import { FaUsers, FaFileAlt, FaCheckCircle, FaClock, FaRupeeSign } from 'react-icons/fa'

const STATUS_COLORS = { 'Pending': 'badge-yellow', 'In Process': 'badge-blue', 'Done - Completed': 'badge-green', 'Rejected': 'badge-red' }

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard').then(r => { setData(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {[...Array(8)].map((_,i) => <div key={i} className="h-28 rounded-2xl shimmer" />)}
    </div>
  )

  const stats = [
    { label: 'Total Users', value: data?.stats?.totalUsers || 0, icon: FaUsers, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Applications', value: data?.stats?.totalApplications || 0, icon: FaFileAlt, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Pending', value: data?.stats?.pendingApplications || 0, icon: FaClock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Completed', value: data?.stats?.completedApplications || 0, icon: FaCheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  ]

  const chartData = (data?.monthlyStats || []).map(m => ({
    month: `${m._id.month}/${m._id.year}`,
    Applications: m.count,
    Revenue: m.revenue
  }))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <div className="text-sm text-slate-500">{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</div>
      </div>

      {/* Revenue highlight */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1e3a5f, #0f1f35)' }}>
        <div className="flex items-center justify-between text-white">
          <div>
            <div className="text-slate-300 text-sm">Total Revenue</div>
            <div className="text-4xl font-bold mt-1">₹{(data?.stats?.totalRevenue || 0).toLocaleString('en-IN')}</div>
          </div>
          <FaRupeeSign className="text-white/20" size={60} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="card flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <s.icon className={s.color} size={20} />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-bold text-slate-700 mb-4">Monthly Applications</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="Applications" fill="#16a34a" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3 className="font-bold text-slate-700 mb-4">Monthly Revenue (₹)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="Revenue" fill="#f97316" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Applications */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-700">Recent Applications</h3>
          <Link to="/admin/applications" className="text-sm text-primary-600 hover:underline">View All →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Token', 'User', 'Service', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.recentApplications || []).map(app => (
                <tr key={app._id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono text-xs">#{app.tokenNo}</td>
                  <td className="py-2 px-3">
                    <div className="text-xs font-medium">{app.user?.name}</div>
                    <div className="text-xs text-slate-400">{app.user?.phone}</div>
                  </td>
                  <td className="py-2 px-3 text-xs max-w-[120px]">
                    <div className="truncate">{app.service?.name?.en}</div>
                  </td>
                  <td className="py-2 px-3 text-xs font-semibold text-primary-600">₹{app.payment?.amount}</td>
                  <td className="py-2 px-3">
                    <span className={STATUS_COLORS[app.status] || 'badge-gray'}>{app.status}</span>
                  </td>
                  <td className="py-2 px-3 text-xs text-slate-400">
                    {new Date(app.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
