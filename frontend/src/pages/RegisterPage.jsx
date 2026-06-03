import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import useAuthStore from '../context/authStore'
import useLangStore from '../context/langStore'
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa'

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    preferredLanguage: 'mr',
    address: { street: '', city: '', district: '', state: 'Maharashtra', pincode: '' }
  })
  const [showPass, setShowPass] = useState(false)
  const [step, setStep] = useState(1)
  const { register, loading } = useAuthStore()
  const { t, lang, setLang } = useLangStore()
  const navigate = useNavigate()

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }))
  const setAddr = (field, val) => setForm(f => ({ ...f, address: { ...f.address, [field]: val } }))

  const handleNext = () => {
    if (!form.name || !form.email || !form.phone) return toast.error('Please fill all required fields')
    if (!/^\d{10}$/.test(form.phone)) return toast.error('Enter valid 10-digit mobile number')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    const result = await register(form)
    if (result.success) {
      toast.success('Registration successful! Welcome to MahaJanSeva')
      navigate('/dashboard')
    } else {
      toast.error(result.message)
    }
  }

  const districts = ['Pune', 'Mumbai', 'Nashik', 'Nagpur', 'Aurangabad', 'Solapur', 'Kolhapur', 'Satara', 'Sangli', 'Ahmednagar', 'Thane', 'Raigad', 'Latur', 'Osmanabad', 'Nanded', 'Jalna', 'Parbhani', 'Hingoli', 'Buldhana', 'Akola', 'Washim', 'Amravati', 'Wardha', 'Yavatmal', 'Bhandara', 'Gondia', 'Chandrapur', 'Gadchiroli', 'Jalgaon', 'Dhule', 'Nandurbar', 'Ratnagiri', 'Sindhudurg']

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0f1f35 0%, #1e3a5f 100%)' }}>
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-saffron-500 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-primary-500 blur-3xl" />
        </div>
        <div className="relative text-center">
          <img src="./public/logo.png" alt="MahaJanSeva" className="w-12 h-12 mx-auto mb-4 object-contain" />
          <h2 className="text-4xl font-bold text-white mb-4">Join Maha Jan Seva</h2>
          <p className="text-slate-300 mb-8">Register once, access all government services</p>
          <div className="space-y-3 text-left">
            {['Free registration', 'Secure document upload', 'Real-time tracking', 'Multilingual support', 'Online wallet', 'AI chat support'].map(f => (
              <div key={f} className="flex items-center gap-3 text-slate-300">
                <span className="text-primary-400 text-lg">✓</span> {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">{t('register')}</h1>
            <p className="text-slate-500 text-sm mt-1">Create your MahaJanSeva account</p>
            <div className="flex justify-center gap-2 mt-3">
              {['en','mr','hi'].map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${lang===l?'bg-primary-600 text-white':'bg-slate-100 text-slate-600'}`}>
                  {l==='en'?'EN':l==='mr'?'मराठी':'हिंदी'}
                </button>
              ))}
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1,2].map(s => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${step >= s ? 'bg-primary-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <p className="text-xs text-slate-500 text-center mb-4">Step {step} of 2 — {step===1?'Personal Info':'Address & Password'}</p>

          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('name')} *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)}
                  className="input-field" placeholder={lang==='mr'?'पूर्ण नाव':'Full Name'} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('email')} *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  className="input-field" placeholder="email@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('phone')} *</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)}
                  className="input-field" placeholder="10-digit mobile number" maxLength={10} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('language')}</label>
                <select value={form.preferredLanguage} onChange={e => set('preferredLanguage', e.target.value)} className="input-field">
                  <option value="en">English</option>
                  <option value="mr">मराठी</option>
                  <option value="hi">हिंदी</option>
                </select>
              </div>
              <button onClick={handleNext} className="btn-primary w-full py-3">{t('next')} →</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('city')}</label>
                  <input value={form.address.city} onChange={e => setAddr('city', e.target.value)}
                    className="input-field" placeholder={lang==='mr'?'शहर':'City'} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('district')}</label>
                  <select value={form.address.district} onChange={e => setAddr('district', e.target.value)} className="input-field">
                    <option value="">Select District</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('pincode')}</label>
                <input value={form.address.pincode} onChange={e => setAddr('pincode', e.target.value)}
                  className="input-field" placeholder="6-digit pincode" maxLength={6} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('password')} *</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={e => set('password', e.target.value)}
                    className="input-field pr-10" placeholder="Min 6 characters" required />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password *</label>
                <input type="password" value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  className="input-field" placeholder="Re-enter password" required />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1 py-3">← {t('back')}</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                  {loading ? <><FaSpinner className="animate-spin" /> ...</> : t('register')}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-slate-500 mt-5">
            {t('alreadyUser')}{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">{t('login')}</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
