import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import useLangStore from '../../context/langStore'
import { FaFileAlt, FaSearch, FaEye } from 'react-icons/fa'

const STATUS_COLORS = {
  'Pending': 'badge-yellow', 'In Process': 'badge-blue',
  'Done - Completed': 'badge-green', 'Rejected': 'badge-red',
  'Cancelled': 'badge-gray', 'Refunded': 'badge-gray'
}

export default function MyApplications() {
  const [applications, setApplications] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const { lang, t } = useLangStore()

  useEffect(() => { fetchApplications() }, [])
  useEffect(() => { filterApps() }, [applications, search, statusFilter])

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/applications/my')
      setApplications(data.applications || [])
    } catch {}
    setLoading(false)
  }

  const filterApps = () => {
    let list = [...applications]
    if (statusFilter !== 'All') list = list.filter(a => a.status === statusFilter)
    if (search) list = list.filter(a =>
      a.tokenNo?.includes(search) ||
      a.service?.name?.en?.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(list)
  }

  const statuses = ['All', 'Pending', 'In Process', 'Done - Completed', 'Rejected']

  if (loading) return (
    <div className="space-y-3">
      {[...Array(5)].map((_,i) => <div key={i} className="h-20 rounded-2xl shimmer" />)}
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('myApplications')}</h1>
        <p className="text-slate-500 text-sm">{applications.length} total applications</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-9" placeholder="Search by token or service..." />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${
              statusFilter===s ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-primary-300'
            }`}>{s}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <FaFileAlt size={48} className="mx-auto mb-4 opacity-30" />
          <p>{lang==='mr'?'कोणतेही अर्ज आढळले नाहीत':'No applications found'}</p>
          <Link to="/services" className="btn-primary mt-4 inline-block text-sm py-2 px-5">{t('apply')}</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => (
            <div key={app._id} className="card flex items-center justify-between gap-4 hover:border-primary-200 transition-all">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <FaFileAlt className="text-primary-600" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-700 truncate">
                    {app.service?.name?.[lang] || app.service?.name?.en}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5 flex-wrap">
                    <span>#{app.tokenNo}</span>
                    <span>{new Date(app.createdAt).toLocaleDateString('en-IN')}</span>
                    <span className="font-medium text-primary-600">₹{app.payment?.amount}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={STATUS_COLORS[app.status] || 'badge-gray'}>{app.status}</span>
                <Link to={`/applications/${app._id}`}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-primary-100 text-slate-500 hover:text-primary-600 transition-all">
                  <FaEye size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
