import { useEffect, useState } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { FaSearch, FaToggleOn, FaToggleOff, FaWallet, FaSpinner } from 'react-icons/fa'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [creditModal, setCreditModal] = useState(null)
  const [creditData, setCreditData] = useState({ amount: '', remark: '' })
  const [crediting, setCrediting] = useState(false)

  useEffect(() => { fetchUsers() }, [page])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (search) params.append('search', search)
      const { data } = await api.get(`/admin/users?${params}`)
      setUsers(data.users || [])
      setTotalPages(data.pages || 1)
    } catch {}
    setLoading(false)
  }

  const toggleUser = async (userId) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/toggle`)
      toast.success(data.message)
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u))
    } catch { toast.error('Action failed') }
  }

  const handleCredit = async () => {
    if (!creditData.amount || Number(creditData.amount) < 1) return toast.error('Enter valid amount')
    setCrediting(true)
    try {
      const { data } = await api.post('/wallet/admin-credit', { userId: creditModal._id, ...creditData })
      toast.success(data.message)
      setUsers(prev => prev.map(u => u._id === creditModal._id ? { ...u, walletBalance: data.newBalance } : u))
      setCreditModal(null)
      setCreditData({ amount: '', remark: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    setCrediting(false)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-800">Users</h1>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyPress={e => e.key==='Enter' && fetchUsers()}
            className="input-field pl-9" placeholder="Search name, email, phone..." />
        </div>
        <button onClick={fetchUsers} className="btn-primary px-5">Search</button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                {['Name', 'Email', 'Phone', 'District', 'Wallet', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12"><FaSpinner className="animate-spin mx-auto text-slate-400" size={24} /></td></tr>
              ) : users.map(u => (
                <tr key={u._id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {u.name?.[0]}
                      </div>
                      <span className="text-xs font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{u.email}</td>
                  <td className="px-4 py-3 text-xs">{u.phone}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{u.address?.district || '—'}</td>
                  <td className="px-4 py-3 text-xs font-bold text-primary-600">₹{u.walletBalance}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => toggleUser(u._id)} title="Toggle Active"
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${u.isActive ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                        {u.isActive ? <FaToggleOff size={14} /> : <FaToggleOn size={14} />}
                      </button>
                      <button onClick={() => setCreditModal(u)} title="Credit Wallet"
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                        <FaWallet size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 disabled:opacity-40">←</button>
          <span className="px-3 py-1.5 text-sm">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 disabled:opacity-40">→</button>
        </div>
      )}

      {/* Credit Modal */}
      {creditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h2 className="font-bold text-slate-800">Credit Wallet — {creditModal.name}</h2>
            <div className="text-sm text-slate-500">Current Balance: <strong>₹{creditModal.walletBalance}</strong></div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (₹)</label>
              <input type="number" value={creditData.amount} onChange={e => setCreditData(p => ({ ...p, amount: e.target.value }))}
                className="input-field" placeholder="Enter amount" min={1} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Remark</label>
              <input value={creditData.remark} onChange={e => setCreditData(p => ({ ...p, remark: e.target.value }))}
                className="input-field" placeholder="Cash payment / UPI verified..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCreditModal(null)} className="btn-outline flex-1 py-2.5">Cancel</button>
              <button onClick={handleCredit} disabled={crediting} className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2">
                {crediting ? <FaSpinner className="animate-spin" /> : null} Credit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
