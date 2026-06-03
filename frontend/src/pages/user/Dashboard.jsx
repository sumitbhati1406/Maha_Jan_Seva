import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../utils/api'
import useAuthStore from '../../context/authStore'
import useLangStore from '../../context/langStore'
import { FaFileAlt, FaWallet, FaCheckCircle, FaClock, FaChartBar, FaArrowRight } from 'react-icons/fa'

const statusColor = { 'Pending': 'badge-yellow', 'In Process': 'badge-blue', 'Done - Completed': 'badge-green', 'Rejected': 'badge-red', 'Cancelled': 'badge-gray', 'Refunded': 'badge-gray' }

export default function Dashboard() {
  const { user, refreshUser } = useAuthStore()
  const { t, lang } = useLangStore()
  const [applications, setApplications] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    refreshUser()
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [appRes, txnRes] = await Promise.all([
        api.get('/applications/my'),
        api.get('/wallet/transactions?limit=5')
      ])
      setApplications(appRes.data.applications || [])
      setTransactions(txnRes.data.transactions || [])
    } catch (e) {}
    setLoading(false)
  }

  const stats = [
    { label: lang==='mr'?'एकूण अर्ज':'Total Applications', value: applications.length, icon: FaFileAlt, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: lang==='mr'?'पूर्ण':'Completed', value: applications.filter(a=>a.status==='Done - Completed').length, icon: FaCheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: lang==='mr'?'प्रलंबित':'Pending', value: applications.filter(a=>a.status==='Pending').length, icon: FaClock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: lang==='mr'?'वॉलेट शिल्लक':'Wallet Balance', value: `₹${user?.walletBalance || 0}`, icon: FaWallet, color: 'text-primary-600', bg: 'bg-primary-50' },
  ]

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl shimmer" />)}
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #0f1f35, #1e3a5f)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white text-xl font-bold">
              {lang==='mr'?'नमस्कार':'Hello'}, {user?.name?.split(' ')[0]} 👋
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              {lang==='mr'?'तुमचा MahaJanSeva डॅशबोर्डमध्ये स्वागत आहे':'Welcome to your MahaJanSeva dashboard'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-white/60 text-xs">{lang==='mr'?'वॉलेट':'Wallet'}</div>
            <div className="text-white text-2xl font-bold">₹{user?.walletBalance || 0}</div>
            <Link to="/wallet" className="text-xs text-primary-300 hover:text-primary-200">
              {lang==='mr'?'रिचार्ज करा →':'Recharge →'}
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.08 }}
            className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <s.icon className={s.color} size={20} />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Services */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-700">{lang==='mr'?'जलद सेवा':'Quick Services'}</h3>
          <Link to="/services" className="text-sm text-primary-600 hover:underline flex items-center gap-1">{t('viewAll')} <FaArrowRight size={11} /></Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { icon:'📄', name:'GST', name_mr:'GST' },
            { icon:'🪪', name:'PAN', name_mr:'पॅन' },
            { icon:'📰', name:'Gazette', name_mr:'गॅझेट' },
            { icon:'✈️', name:'Passport', name_mr:'पासपोर्ट' },
            { icon:'💼', name:'ITR', name_mr:'ITR' },
            { icon:'📜', name:'Certificate', name_mr:'प्रमाणपत्र' },
          ].map((s, i) => (
            <Link key={i} to="/services" className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-primary-50 hover:text-primary-700 transition-all group">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-xs font-medium text-slate-600 group-hover:text-primary-600 text-center">
                {lang==='mr'?s.name_mr:s.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700">{lang==='mr'?'अलीकडील अर्ज':'Recent Applications'}</h3>
            <Link to="/applications" className="text-sm text-primary-600 hover:underline">{t('viewAll')}</Link>
          </div>
          {applications.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <FaFileAlt size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">{lang==='mr'?'अद्याप कोणताही अर्ज नाही':'No applications yet'}</p>
              <Link to="/services" className="btn-primary mt-3 inline-block text-sm py-2 px-4">{t('apply')}</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 4).map(app => (
                <Link key={app._id} to={`/applications/${app._id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all">
                  <div>
                    <div className="text-sm font-medium text-slate-700">
                      {app.service?.name?.[lang] || app.service?.name?.en}
                    </div>
                    <div className="text-xs text-slate-400">#{app.tokenNo}</div>
                  </div>
                  <span className={statusColor[app.status] || 'badge-gray'}>{app.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700">{lang==='mr'?'अलीकडील व्यवहार':'Recent Transactions'}</h3>
            <Link to="/ledger" className="text-sm text-primary-600 hover:underline">{t('viewAll')}</Link>
          </div>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <FaWallet size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">{lang==='mr'?'अद्याप कोणताही व्यवहार नाही':'No transactions yet'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map(txn => (
                <div key={txn._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div>
                    <div className="text-sm font-medium text-slate-700 truncate max-w-[180px]">{txn.description}</div>
                    <div className="text-xs text-slate-400">{new Date(txn.createdAt).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div className={`text-sm font-bold ${txn.type==='credit'?'text-green-600':'text-red-600'}`}>
                    {txn.type==='credit'?'+':'-'}₹{txn.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
