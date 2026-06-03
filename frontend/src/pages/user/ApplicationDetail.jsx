import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../utils/api'
import useLangStore from '../../context/langStore'
import { FaArrowLeft, FaDownload, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa'

const STATUS_ICON = {
  'Pending': <FaClock className="text-yellow-500" />,
  'In Process': <FaClock className="text-blue-500" />,
  'Done - Completed': <FaCheckCircle className="text-green-500" />,
  'Rejected': <FaTimesCircle className="text-red-500" />,
}
const STATUS_COLOR = { 'Pending': 'badge-yellow', 'In Process': 'badge-blue', 'Done - Completed': 'badge-green', 'Rejected': 'badge-red', 'Cancelled': 'badge-gray', 'Refunded': 'badge-gray' }

export default function ApplicationDetail() {
  const { id } = useParams()
  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const { lang } = useLangStore()

  useEffect(() => {
    api.get(`/applications/${id}`).then(r => { setApp(r.data.application); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="h-64 rounded-2xl shimmer" />
  if (!app) return <div className="text-center py-20 text-slate-400">Application not found</div>

  const steps = ['Pending', 'In Process', 'Done - Completed']
  const currentStep = steps.indexOf(app.status)

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <Link to="/applications" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600">
        <FaArrowLeft size={12} /> Back
      </Link>

      {/* Status Card */}
      <div className="card" style={{ background: app.status==='Done - Completed' ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : app.status==='Rejected' ? 'linear-gradient(135deg,#fef2f2,#fee2e2)' : 'linear-gradient(135deg,#eff6ff,#dbeafe)' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Token Number</div>
            <div className="text-2xl font-bold text-slate-800">#{app.tokenNo}</div>
          </div>
          <div className="flex items-center gap-2">
            {STATUS_ICON[app.status]}
            <span className={STATUS_COLOR[app.status] || 'badge-gray'}>{app.status}</span>
          </div>
        </div>

        {/* Progress Steps */}
        {app.status !== 'Rejected' && app.status !== 'Cancelled' && (
          <div className="flex items-center mt-6 gap-0">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${currentStep >= i ? 'bg-primary-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>{i+1}</div>
                {i < steps.length-1 && <div className={`flex-1 h-1 ${currentStep > i ? 'bg-primary-500' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>
        )}
        {app.status !== 'Rejected' && (
          <div className="flex justify-between mt-1 text-xs text-slate-500">
            {steps.map(s => <span key={s} className="flex-1 text-center">{s}</span>)}
          </div>
        )}
      </div>

      {/* Service Info */}
      <div className="card">
        <h2 className="font-bold text-slate-700 mb-4">Service Details</h2>
        <div className="space-y-2">
          {[
            ['Service', app.service?.name?.[lang] || app.service?.name?.en],
            ['Category', app.service?.category],
            ['Submitted', new Date(app.createdAt).toLocaleString('en-IN')],
            ['Language', app.language?.toUpperCase()],
            ['Payment', `₹${app.payment?.amount} — ${app.payment?.status}`],
            ['Service Charge', `₹${app.payment?.serviceCharges}`],
            ['Service Fee', `₹${app.payment?.serviceFee}`],
          ].map(([k,v]) => v && (
            <div key={k} className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-500">{k}</span>
              <span className="text-sm font-medium text-slate-700">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Documents */}
      {app.documents?.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-slate-700 mb-4">Uploaded Documents</h2>
          <div className="space-y-2">
            {app.documents.map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-700">📄 {doc.name}</span>
                <a href={doc.url} target="_blank" rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700">
                  <FaDownload size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed File */}
      {app.completedFile && (
        <div className="card border-green-200 bg-green-50">
          <h2 className="font-bold text-green-700 mb-3">✅ Completed Document</h2>
          <a href={app.completedFile} target="_blank" rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2">
            <FaDownload /> Download Document
          </a>
        </div>
      )}

      {/* Remarks */}
      {app.adminRemarks && (
        <div className="card border-slate-200">
          <h2 className="font-bold text-slate-700 mb-2">Admin Remarks</h2>
          <p className="text-sm text-slate-600">{app.adminRemarks}</p>
        </div>
      )}
    </div>
  )
}
