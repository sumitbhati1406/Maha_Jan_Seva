import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../utils/api'
import useLangStore from '../../context/langStore'
import { FaCheckCircle, FaFileAlt, FaClock, FaMoneyBillWave, FaArrowLeft } from 'react-icons/fa'

export default function ServiceDetail() {
  const { id } = useParams()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const { lang, t } = useLangStore()

  useEffect(() => {
    api.get(`/services/${id}`).then(r => { setService(r.data.service); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="h-64 rounded-2xl shimmer" />
  if (!service) return <div className="text-center py-20 text-slate-400">Service not found</div>

  const name = service.name?.[lang] || service.name?.en
  const desc = service.description?.[lang] || service.description?.en

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <Link to="/services" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600">
        <FaArrowLeft size={12} /> Back to Services
      </Link>

      <div className="card">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}>
            {service.category==='GST'?'📄':service.category==='PAN'?'🪪':service.category==='Gazette'?'📰':service.category==='Aadhaar'?'🆔':service.category==='Passport'?'✈️':service.category==='ITR'?'💼':'📜'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-800">{name}</h1>
              {service.isNew && <span className="badge badge-green">New</span>}
            </div>
            <p className="text-slate-500 text-sm mt-1">{desc || 'Government service processing'}</p>
            <div className="flex gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-sm">
                <FaMoneyBillWave className="text-primary-600" />
                <span className="font-bold text-primary-600">
                  {service.isOnCall ? 'On Call' : `₹${service.price}${service.priceMax ? `-${service.priceMax}` : ''}`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <FaClock className="text-slate-400" />
                <span>{service.processingDays || 7} days processing</span>
              </div>
              <span className="badge badge-blue">{service.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Required Documents */}
      {service.requiredDocuments?.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <FaFileAlt className="text-primary-500" /> {t('documents')}
          </h2>
          <div className="space-y-2">
            {service.requiredDocuments.map((doc, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                <FaCheckCircle className={`mt-0.5 flex-shrink-0 ${doc.isRequired ? 'text-primary-500' : 'text-slate-300'}`} />
                <div>
                  <div className="text-sm font-medium text-slate-700">{doc.name}</div>
                  {doc.description && <div className="text-xs text-slate-400 mt-0.5">{doc.description}</div>}
                  <span className={`text-xs ${doc.isRequired ? 'text-red-500' : 'text-slate-400'}`}>
                    {doc.isRequired ? t('required') : t('optional')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Process Steps */}
      {service.steps?.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-slate-700 mb-4">Process Steps</h2>
          <div className="space-y-3">
            {service.steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-primary-600 text-white text-sm flex items-center justify-center flex-shrink-0 font-bold">{i+1}</div>
                <div>
                  <div className="text-sm font-medium text-slate-700">{step.title}</div>
                  {step.description && <div className="text-xs text-slate-400 mt-0.5">{step.description}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="flex gap-3">
        <Link to={`/services/${id}/apply`} className="btn-primary flex-1 text-center py-3 text-base">
          {t('apply')} — {service.isOnCall ? 'On Call' : `₹${service.price}`}
        </Link>
      </div>
    </div>
  )
}
