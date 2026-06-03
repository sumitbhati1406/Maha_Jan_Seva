import { useEffect, useState } from 'react'
import api from '../../utils/api'
import { FaArrowUp, FaArrowDown, FaSync } from 'react-icons/fa'

export default function AdminTransactions() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState('')

  const fetch = (p = 1) => {
    setLoading(true)
    api.get(`/admin/transactions?page=${p}&limit=30`)
      .then(r => { setData(r.data.transactions); setTotal(r.data.total); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(() => { fetch(page) }, [page])

  const filtered = filter ? data.filter(t => t.type === filter) : data

  const typeIcon = (type) => type === 'credit'
    ? <FaArrowDown className="text-green-600" />
    : type === 'refund'
    ? <FaSync className="text-blue-500" />
    : <FaArrowUp className="text-red-500" />

  const typeBadge = (type) => ({
    credit: 'badge-green', debit: 'badge-red', refund: 'badge-blue'
  }[type] || 'badge-gray')

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800">All Transactions</h1>
        <div className="text-sm text-slate-500">Total: {total}</div>
      </div>

      <div className="card">
        <div className="flex gap-2 mb-4">
          {['', 'credit', 'debit', 'refund'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {f === '' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(8)].map((_,i) => <div key={i} className="h-12 shimmer rounded-xl" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Type','User','Description','Mode','Amount','Prev Bal','Balance','Date'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t._id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        {typeIcon(t.type)}
                        <span className={typeBadge(t.type)}>{t.type}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="text-xs font-medium">{t.user?.name}</div>
                      <div className="text-xs text-slate-400">{t.user?.phone}</div>
                    </td>
                    <td className="py-2 px-3 text-xs text-slate-600 max-w-[160px]">
                      <div className="truncate">{t.description}</div>
                      {t.transactionId && <div className="text-slate-400 font-mono truncate">{t.transactionId.slice(0,16)}...</div>}
                    </td>
                    <td className="py-2 px-3"><span className="badge badge-gray">{t.paymentMode}</span></td>
                    <td className={`py-2 px-3 font-bold ${t.type === 'credit' ? 'text-green-600' : t.type === 'refund' ? 'text-blue-600' : 'text-red-600'}`}>
                      {t.type === 'debit' ? '-' : '+'}₹{t.amount}
                    </td>
                    <td className="py-2 px-3 text-slate-500 text-xs">₹{t.prevBalance}</td>
                    <td className="py-2 px-3 font-semibold text-slate-700">₹{t.balance}</td>
                    <td className="py-2 px-3 text-xs text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString('en-IN')}<br/>
                      <span>{new Date(t.createdAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="text-center py-10 text-slate-400">No transactions</div>}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-slate-500">Page {page} • Showing {filtered.length} of {total}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 rounded-lg bg-slate-100 disabled:opacity-40 hover:bg-slate-200">Prev</button>
            <button disabled={page * 30 >= total} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 rounded-lg bg-slate-100 disabled:opacity-40 hover:bg-slate-200">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
