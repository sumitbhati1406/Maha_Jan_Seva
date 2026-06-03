import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SignatureCanvas from 'react-signature-canvas'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import useAuthStore from '../../context/authStore'
import useLangStore from '../../context/langStore'
import { FaArrowLeft, FaUpload, FaTrash, FaSpinner, FaPen, FaCheck } from 'react-icons/fa'

export default function ApplyService() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, refreshUser } = useAuthStore()
  const { lang, t } = useLangStore()
  const sigRef = useRef()

  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({})
  const [documents, setDocuments] = useState([])
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [signatureData, setSignatureData] = useState('')
  const [sigMode, setSigMode] = useState('draw') // draw | upload

  useEffect(() => {
    api.get(`/services/${id}`).then(r => { setService(r.data.service); setLoading(false) }).catch(() => setLoading(false))
    refreshUser()
  }, [id])

  const setField = (k, v) => setFormData(p => ({ ...p, [k]: v }))

  const handleDocUpload = async (e, docName) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingDoc(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await api.post('/uploads/document', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setDocuments(prev => [...prev.filter(d => d.name !== docName), { name: docName, url: data.url, type: file.type }])
      toast.success(`${docName} uploaded!`)
    } catch { toast.error('Upload failed. Check Cloudinary config.') }
    setUploadingDoc(false)
  }

  const clearSignature = () => { sigRef.current?.clear(); setSignatureData('') }
  const saveSignature = () => {
    if (sigRef.current?.isEmpty()) return toast.error('Please draw your signature')
    setSignatureData(sigRef.current.toDataURL())
    toast.success('Signature saved!')
  }

  const handleSubmit = async () => {
    if (user.walletBalance < service.price && !service.isOnCall) {
      toast.error(t('insufficientBalance') + `. Balance: ₹${user.walletBalance}, Required: ₹${service.price}`)
      return
    }
    setSubmitting(true)
    try {
      await api.post('/applications', {
        serviceId: id, formData, documents, signature: signatureData, language: lang
      })
      await refreshUser()
      toast.success(t('applicationSubmitted'))
      navigate('/applications')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed')
    }
    setSubmitting(false)
  }

  if (loading) return <div className="h-64 rounded-2xl shimmer" />
  if (!service) return <div className="text-center py-20 text-slate-400">Service not found</div>

  const name = service.name?.[lang] || service.name?.en
  const requiredDocs = service.requiredDocuments || []
  const needsSignature = ['PAN', 'Gazette', 'Passport'].includes(service.category)
  const totalSteps = 3

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <Link to={`/services/${id}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600">
        <FaArrowLeft size={12} /> {t('back')}
      </Link>

      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-slate-800">{name}</h1>
            <div className="text-sm text-slate-500 mt-0.5">
              {service.isOnCall ? 'On Call' : `₹${service.price}`} • Step {step} of {totalSteps}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">{t('walletBalance')}</div>
            <div className={`font-bold text-lg ${user.walletBalance >= service.price ? 'text-green-600' : 'text-red-500'}`}>
              ₹{user.walletBalance}
            </div>
          </div>
        </div>
        {/* Progress */}
        <div className="flex gap-1.5 mt-4">
          {[...Array(totalSteps)].map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${step > i ? 'bg-primary-500' : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>

      {/* Insufficient balance warning */}
      {!service.isOnCall && user.walletBalance < service.price && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 flex items-center justify-between">
          <span>⚠️ {t('insufficientBalance')}. Need ₹{service.price - user.walletBalance} more.</span>
          <Link to="/wallet" className="font-semibold underline">{t('recharge')}</Link>
        </div>
      )}

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="card space-y-4">
          <h2 className="font-bold text-slate-700 text-lg">
            {lang==='mr'?'वैयक्तिक माहिती':'Personal Information'}
          </h2>
          {[
            { key: 'applicantName', label: lang==='mr'?'अर्जदाराचे नाव':'Applicant Name', placeholder: user.name },
            { key: 'fatherName', label: lang==='mr'?'वडिलांचे नाव':'Father\'s Name', placeholder: '' },
            { key: 'dob', label: lang==='mr'?'जन्मतारीख':'Date of Birth', type: 'date' },
            { key: 'mobile', label: lang==='mr'?'मोबाईल':'Mobile', placeholder: user.phone },
            { key: 'email', label: lang==='mr'?'ईमेल':'Email', placeholder: user.email },
            { key: 'aadhaarNo', label: lang==='mr'?'आधार क्रमांक':'Aadhaar Number', placeholder: '12-digit number' },
            { key: 'address', label: lang==='mr'?'पत्ता':'Address', placeholder: 'Full address' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label>
              <input type={f.type||'text'} value={formData[f.key] || ''} onChange={e => setField(f.key, e.target.value)}
                className="input-field" placeholder={f.placeholder || ''} />
            </div>
          ))}
          <button onClick={() => setStep(2)} className="btn-primary w-full py-3">{t('next')} →</button>
        </motion.div>
      )}

      {/* Step 2: Documents */}
      {step === 2 && (
        <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="card space-y-4">
          <h2 className="font-bold text-slate-700 text-lg">{t('uploadDocument')}</h2>
          {requiredDocs.length === 0 && (
            <p className="text-slate-400 text-sm">No specific documents required for this service.</p>
          )}
          {requiredDocs.map((doc, i) => {
            const uploaded = documents.find(d => d.name === doc.name)
            return (
              <div key={i} className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-medium text-slate-700">{doc.name}</div>
                    <div className="text-xs text-slate-400">{doc.isRequired ? '* Required' : 'Optional'}</div>
                  </div>
                  {uploaded && <span className="text-green-600"><FaCheck /></span>}
                </div>
                {uploaded ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-600 flex-1 truncate">✓ {doc.name} uploaded</span>
                    <button onClick={() => setDocuments(prev => prev.filter(d => d.name !== doc.name))}
                      className="text-red-400 hover:text-red-600"><FaTrash size={12} /></button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 rounded-xl p-3 border border-dashed border-slate-300 transition-all">
                    {uploadingDoc ? <FaSpinner className="animate-spin text-slate-400" /> : <FaUpload className="text-slate-400" />}
                    <span className="text-sm text-slate-500">
                      {uploadingDoc ? 'Uploading...' : lang==='mr'?'फाईल निवडा':'Choose File (JPG/PNG/PDF)'}
                    </span>
                    <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={e => handleDocUpload(e, doc.name)} />
                  </label>
                )}
              </div>
            )
          })}

          {/* Signature */}
          {needsSignature && (
            <div>
              <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <FaPen className="text-primary-500" /> {t('addSignature')}
              </h3>
              <div className="flex gap-2 mb-3">
                <button onClick={() => setSigMode('draw')} className={`px-3 py-1.5 rounded-lg text-sm transition-all ${sigMode==='draw'?'bg-primary-600 text-white':'bg-slate-100 text-slate-600'}`}>Draw</button>
                <button onClick={() => setSigMode('upload')} className={`px-3 py-1.5 rounded-lg text-sm transition-all ${sigMode==='upload'?'bg-primary-600 text-white':'bg-slate-100 text-slate-600'}`}>Upload</button>
              </div>
              {sigMode === 'draw' ? (
                <div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white" style={{ touchAction: 'none' }}>
                    <SignatureCanvas ref={sigRef} penColor="#1e293b"
                      canvasProps={{ width: 500, height: 150, className: 'w-full', style: { maxWidth: '100%' } }} />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={clearSignature} className="btn-outline text-sm py-1.5 px-4">Clear</button>
                    <button onClick={saveSignature} className="btn-primary text-sm py-1.5 px-4">Save Signature</button>
                  </div>
                  {signatureData && <div className="mt-2 text-sm text-green-600">✓ Signature saved</div>}
                </div>
              ) : (
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 rounded-xl p-4 border border-dashed border-slate-300">
                  <FaUpload className="text-slate-400" />
                  <span className="text-sm text-slate-500">Upload signature image</span>
                  <input type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={async e => {
                    const file = e.target.files[0]
                    const reader = new FileReader()
                    reader.onload = ev => setSignatureData(ev.target.result)
                    reader.readAsDataURL(file)
                  }} />
                </label>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-outline flex-1 py-3">← {t('back')}</button>
            <button onClick={() => setStep(3)} className="btn-primary flex-1 py-3">{t('next')} →</button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Review & Submit */}
      {step === 3 && (
        <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="space-y-4">
          <div className="card">
            <h2 className="font-bold text-slate-700 text-lg mb-4">
              {lang==='mr'?'तपासा आणि सादर करा':'Review & Submit'}
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Service</span>
                <span className="text-sm font-medium">{name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Applicant</span>
                <span className="text-sm font-medium">{formData.applicantName || user.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Documents</span>
                <span className="text-sm font-medium">{documents.length} uploaded</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">{t('serviceCharge')}</span>
                <span className="text-sm font-medium">{service.isOnCall ? 'On Call' : `₹${service.price}`}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-primary-700">
                <span>Total Amount</span>
                <span>{service.isOnCall ? 'On Call' : `₹${service.price}`}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            {lang==='mr'
              ? '⚠️ अर्ज सादर केल्यावर, तुमच्या वॉलेटमधून रक्कम कपात केली जाईल.'
              : '⚠️ Upon submission, the amount will be deducted from your wallet.'}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-outline flex-1 py-3">← {t('back')}</button>
            <button onClick={handleSubmit} disabled={submitting || (!service.isOnCall && user.walletBalance < service.price)}
              className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-50">
              {submitting ? <><FaSpinner className="animate-spin" /> Submitting...</> : `${t('submit')} ${service.isOnCall ? '' : `(₹${service.price})`}`}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
