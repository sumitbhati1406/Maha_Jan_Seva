import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../utils/api'
import useLangStore from '../../context/langStore'
import { FaSearch, FaEye, FaFileAlt } from 'react-icons/fa'

const CATEGORIES = ['All', 'GST', 'PAN', 'Gazette', 'Aadhaar', 'Passport', 'ITR', 'Certificate', 'Registration', 'Other']

export default function ServicesPage() {
  const [services, setServices] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const { lang, t } = useLangStore()

  useEffect(() => { fetchServices() }, [])
  useEffect(() => { filterServices() }, [services, search, category])

  const fetchServices = async () => {
    try {
      const { data } = await api.get('/services')
      setServices(data.services || [])
    } catch {}
    setLoading(false)
  }

  const filterServices = () => {
    let list = [...services]
    if (category !== 'All') list = list.filter(s => s.category === category)
    if (search) list = list.filter(s =>
      s.name?.en?.toLowerCase().includes(search.toLowerCase()) ||
      s.name?.mr?.includes(search) ||
      s.name?.hi?.includes(search)
    )
    setFiltered(list)
  }

  const getName = (s) => s.name?.[lang] || s.name?.en || ''

  if (loading) return (
    <div className="space-y-4">
      <div className="h-12 rounded-xl shimmer w-full" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_,i) => <div key={i} className="h-48 rounded-2xl shimmer" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('services')}</h1>
        <p className="text-slate-500 text-sm">{lang==='mr'?'सर्व सरकारी सेवा एकाच ठिकाणी':'All government services at one place'}</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-9" placeholder={lang==='mr'?'सेवा शोधा...':'Search services...'} />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              category === cat ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300'
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-sm text-slate-500">{filtered.length} {lang==='mr'?'सेवा':'services'} {category!=='All'?`in ${category}`:''}</p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <FaFileAlt size={48} className="mx-auto mb-4 opacity-30" />
          <p>{lang==='mr'?'कोणतीही सेवा आढळली नाही':'No services found'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((s, i) => (
            <motion.div key={s._id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.04 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:border-primary-200 transition-all group">
              {/* Image/Icon Area */}
              <div className="h-28 flex items-center justify-center text-4xl"
                style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}>
                {s.category==='GST'?'📄':s.category==='PAN'?'🪪':s.category==='Gazette'?'📰':s.category==='Aadhaar'?'🆔':s.category==='Passport'?'✈️':s.category==='ITR'?'💼':s.category==='Certificate'?'📜':'🏛️'}
              </div>
              <div className="p-4">
                <div className="font-semibold text-slate-700 text-sm mb-1 group-hover:text-primary-600 transition-colors line-clamp-2 min-h-[2.5rem]">
                  {getName(s)}
                </div>
                <div className="flex items-center justify-between mb-3">
                  {s.isOnCall ? (
                    <span className="text-saffron-600 font-bold text-sm">On Call</span>
                  ) : (
                    <span className="text-primary-600 font-bold text-sm">
                      ₹{s.price}{s.priceMax ? `-${s.priceMax}` : ''}
                    </span>
                  )}
                  {s.isNew && <span className="badge badge-green text-[10px]">New</span>}
                </div>
                <div className="flex gap-2">
                  <Link to={`/services/${s._id}`}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-primary-50 hover:text-primary-600 text-xs font-medium transition-all border border-slate-100">
                    <FaEye size={11} /> View
                  </Link>
                  <Link to={`/services/${s._id}/apply`}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 text-xs font-medium transition-all">
                    <FaFileAlt size={11} /> {t('apply')}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
