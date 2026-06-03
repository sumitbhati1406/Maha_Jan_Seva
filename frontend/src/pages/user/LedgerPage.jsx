import { useEffect, useState } from 'react'
import api from '../../utils/api'
import useLangStore from '../../context/langStore'
import { FaWallet } from 'react-icons/fa'

export default function LedgerPage() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { lang, t } = useLangStore()

  useEffect(() => { fetchTxns() }, [page])

  const fetchTxns = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/wallet/transactions?page=${page}&limit=20`)
      setTransactions(data.transactions || [])
      setTotalPages(data.pages || 1)
    } catch {}
    setLoading(false)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('ledger')}</h1>
        <p className="text-slate-500 text-sm">Complete transaction history</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_,i) => <div key={i} className="h-16 rounded-xl shimmer" />)}
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Date', 'Service', 'Token', 'Mode', 'Prev Bal', 'Debit', 'Credit', 'Balance'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-12 text-slate-400">
                      <FaWallet size={32} className="mx-auto mb-2 opacity-30" />
                      No transactions yet
                    </td></tr>
                  ) : transactions.map(txn => (
                    <tr key={txn._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                        {new Date(txn.createdAt).toLocaleString('en-IN', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' })}
                      </td>
                      <td className="px-4 py-3 max-w-[140px]">
                        <div className="text-xs font-medium text-slate-700 truncate">{txn.serviceName || txn.description}</div>
                        {txn.remark && <div className="text-xs text-slate-400">{txn.remark}</div>}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{txn.application?.tokenNo || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="badge badge-blue text-[10px]">{txn.paymentMode}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{txn.prevBalance}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-red-600">
                        {txn.type === 'debit' ? txn.amount : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-green-600">
                        {txn.type === 'credit' || txn.type === 'refund' ? txn.amount : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-700">{txn.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 disabled:opacity-40 hover:bg-slate-100">←</button>
              <span className="px-3 py-1.5 text-sm">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 disabled:opacity-40 hover:bg-slate-100">→</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
