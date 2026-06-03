import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import useAuthStore from '../context/authStore'
import useLangStore from '../context/langStore'
import { FaEye, FaEyeSlash, FaSpinner, FaGoogle, FaFacebook } from 'react-icons/fa'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const { login, loading } = useAuthStore()
  const { t, lang, setLang } = useLangStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(form.email, form.password)
    if (result.success) {
      toast.success(t('welcomeBack') + ', ' + result.user.name + '!')
      navigate(result.user.role === 'admin' ? '/admin' : '/dashboard')
    } else {
      toast.error(result.message)
    }
  }

  const handleGoogle = () => {
    toast('Google login coming soon!', { icon: '🔜' })
  }

  const handleFacebook = () => {
    toast('Facebook login coming soon!', { icon: '🔜' })
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0f1f35 0%, #1e3a5f 100%)' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-saffron-500 blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-primary-500 blur-3xl"></div>
        </div>
        <div className="relative text-center">
          <img src="/logo.png" alt="MahaJanSeva" className="w-20 h-20 mx-auto mb-6 object-contain" />
          <h2 className="text-4xl font-bold text-white mb-4">Maha Jan Seva</h2>
          <p className="text-slate-300 text-lg mb-8">महा जन सेवा पोर्टल</p>
          <div className="space-y-3">
            {['GST Filing', 'PAN Card', 'Gazette', 'Passport', 'Aadhaar', 'ITR', 'Certificates'].map(s => (
              <div key={s} className="flex items-center gap-3 text-slate-300">
                <span className="text-primary-400">✓</span> {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <img src="/logo.png" alt="MahaJanSeva" className="w-12 h-12 mx-auto mb-4 object-contain" />
            <h1 className="text-2xl font-bold text-slate-800">{t('login')}</h1>
            <p className="text-slate-500 text-sm mt-1">{t('tagline')}</p>
            <div className="flex justify-center gap-2 mt-3">
              {['en', 'mr', 'hi'].map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${lang === l ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {l === 'en' ? 'EN' : l === 'mr' ? 'मराठी' : 'हिंदी'}
                </button>
              ))}
            </div>
          </div>

          {/* Social Login */}
          <div className="space-y-3 mb-6">
            <button onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm font-medium text-slate-700">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button onClick={handleFacebook}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl hover:opacity-90 transition-all text-sm font-medium text-white"
              style={{ backgroundColor: '#1877F2' }}>
              <FaFacebook size={20} />
              Continue with Facebook
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-xs text-slate-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('email')}</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="input-field" placeholder="email@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('password')}</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="input-field pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
              <strong>Demo:</strong> Demo@mahajanseva.com / Demo@123 <br />
              or register as a new user
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? <><FaSpinner className="animate-spin" /> Loading...</> : t('login')}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {t('newUser')}{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">{t('register')}</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}