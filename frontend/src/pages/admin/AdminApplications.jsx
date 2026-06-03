import { useEffect, useState } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { FaSearch, FaEdit, FaDownload, FaSpinner } from 'react-icons/fa'

const STATUS_COLORS = { 'Pending': 'badge-yellow', 'In Process': 'badge-blue', 'Done - Completed': 'badge-green', 'Rejected': 'badge-red', 'Cancelled': 'badge-gray', 'Refunded': 'badge-gray' }
const STATUSES = ['Pending', 'In Process', 'Done - Completed', 'Rejected', 'Cancelled', 'Refunded']

export default function AdminApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selected, setSelected] = useState(null)
  const [updateData, setUpdateData] = useState({ status: '', adminRemarks: '', completedFile: '' })
  const [updating, setUpdating] = useState(false)

  useEffect(() => { fetchApplications() }, [page, statusFilter])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (statusFilter) params.append('status', statusFilter)
      if (search) params.append('search', search)
      const { data } = await api.get(`/applications?${params}`)
      setApplications(data.applications || [])
      setTotalPages(data.pages || 1)
    } catch {}
    setLoading(false)
  }

  const openUpdate = (app) => {
    setSelected(app)
    setUpdateData({ status: app.status, adminRemarks: app.adminRemarks || '', completedFile: app.completedFile || '' })
  }

  const handleUpdate = async () => {
    if (!updateData.status) return toast.error('Select a status')
    setUpdating(true)
    try {
      await api.put(`/applications/${selected._id}/status`, updateData)
      toast.success('Application updated!')
      setSelected(null)
      fetchApplications()
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed') }
    setUpdating(false)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Applications</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyPress={e => e.key==='Enter' && fetchApplications()}
            className="input-field pl-9" placeholder="Search token number..." />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="input-field w-auto min-w-[150px]">
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Token', 'User', 'Service', 'Amount', 'Status', 'Date', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12"><FaSpinner className="animate-spin mx-auto text-slate-400" size={24} /></td></tr>
              ) : applications.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">No applications found</td></tr>
              ) : applications.map(app => (
                <tr key={app._id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs font-bold">#{app.tokenNo}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-medium">{app.user?.name}</div>
                    <div className="text-xs text-slate-400">{app.user?.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-xs max-w-[130px]">
                    <div className="truncate">{app.service?.name?.en}</div>
                    <div className="text-slate-400">{app.service?.category}</div>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-primary-600">₹{app.payment?.amount}</td>
                  <td className="px-4 py-3"><span className={STATUS_COLORS[app.status]||'badge-gray'}>{app.status}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-400">{new Date(app.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openUpdate(app)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                      <FaEdit size={13} />
                    </button>
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

      {/* Update Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="font-bold text-slate-800 text-lg">Update Application</h2>
            <div className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3">
              <div><strong>Token:</strong> #{selected.tokenNo}</div>
              <div><strong>User:</strong> {selected.user?.name}</div>
              <div><strong>Service:</strong> {selected.service?.name?.en}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select value={updateData.status} onChange={e => setUpdateData(p => ({ ...p, status: e.target.value }))} className="input-field">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Admin Remarks</label>
              <textarea value={updateData.adminRemarks} onChange={e => setUpdateData(p => ({ ...p, adminRemarks: e.target.value }))}
                className="input-field h-20 resize-none" placeholder="Remarks for user..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Completed File URL (optional)</label>
              <input value={updateData.completedFile} onChange={e => setUpdateData(p => ({ ...p, completedFile: e.target.value }))}
                className="input-field" placeholder="https://..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="btn-outline flex-1 py-2.5">Cancel</button>
              <button onClick={handleUpdate} disabled={updating} className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2">
                {updating ? <><FaSpinner className="animate-spin" /> Updating...</> : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
