import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaFileAlt, FaIdCard, FaPassport, FaWallet, FaShieldAlt, FaMobileAlt, FaCheckCircle } from 'react-icons/fa'
import useLangStore from '../context/langStore'

const services = [
  { icon: '📄', name: 'GST Filing', name_mr: 'GST फायलिंग', price: '₹250+' },
  { icon: '🪪', name: 'PAN Card', name_mr: 'पॅन कार्ड', price: '₹107' },
  { icon: '📰', name: 'Gazette', name_mr: 'गॅझेट', price: '₹849' },
  { icon: '✈️', name: 'Passport', name_mr: 'पासपोर्ट', price: '₹1750' },
  { icon: '🏛️', name: 'Caste Certificate', name_mr: 'जात प्रमाणपत्र', price: '₹299' },
  { icon: '💼', name: 'ITR Filing', name_mr: 'ITR फायलिंग', price: '₹450+' },
  { icon: '🆔', name: 'Aadhaar', name_mr: 'आधार', price: '₹75' },
  { icon: '🏭', name: 'Udyog Aadhaar', name_mr: 'उद्योग आधार', price: '₹299' },
]

export default function LandingPage() {
  const { t, lang, setLang } = useLangStore()

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="./public/logoland.png" alt="MahaJanSeva" className="w-20 h-20 mx-auto mb-6 object-contain" />
        
          </div>
          <div className="flex items-center gap-3">
            <select value={lang} onChange={e => setLang(e.target.value)}
              className="text-xs border rounded-lg px-2 py-1.5 focus:outline-none">
              <option value="en">EN</option>
              <option value="mr">मराठी</option>
              <option value="hi">हिंदी</option>
            </select>
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-primary-600">{t('login')}</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">{t('register')}</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f1f35 0%, #1e3a5f 50%, #0f1f35 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-saffron-500 blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-primary-500 blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-20 relative">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="flex-1">
              {/* India flag colors badge */}
              <div className="inline-flex items-center gap-2 mb-6">
                <span className="w-3 h-3 rounded-full bg-saffron-500"></span>
                <span className="w-3 h-3 rounded-full bg-white"></span>
                <span className="w-3 h-3 rounded-full bg-primary-500"></span>
                <span className="text-sm text-slate-300 font-medium">Government Services Portal</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                {lang === 'mr' ? 'सर्व सरकारी सेवा' : lang === 'hi' ? 'सभी सरकारी सेवाएं' : 'All Government Services'}
                <br />
                <span style={{ background: 'linear-gradient(135deg, #ff9500, #ffcc00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {lang === 'mr' ? 'एकाच ठिकाणी' : lang === 'hi' ? 'एक जगह पर' : 'At One Place'}
                </span>
              </h1>
              <p className="text-slate-300 text-lg mb-8">
                {lang === 'mr'
                  ? 'GST, PAN, गॅझेट, आधार, पासपोर्ट आणि बरेच काही - सहज आणि जलद'
                  : lang === 'hi'
                  ? 'GST, PAN, गजट, आधार, पासपोर्ट और बहुत कुछ - आसान और तेज'
                  : 'GST, PAN, Gazette, Aadhaar, Passport and much more - Easy & Fast'}
              </p>
              <div className="flex gap-4">
                <Link to="/register" className="btn-saffron text-base px-8 py-3 rounded-xl">
                  {lang === 'mr' ? 'मोफत नोंदणी करा' : lang === 'hi' ? 'मुफ्त पंजीकरण करें' : 'Get Started Free'}
                </Link>
                <Link to="/login" className="border border-white/30 text-white px-8 py-3 rounded-xl hover:bg-white/10 transition-all text-base">
                  {t('login')}
                </Link>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex-1">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: lang === 'mr' ? 'सेवा उपलब्ध' : 'Services', value: '23+', icon: '🏛️' },
                  { label: lang === 'mr' ? 'ग्राहक' : 'Users', value: '10K+', icon: '👥' },
                  { label: lang === 'mr' ? 'पूर्ण अर्ज' : 'Completed', value: '50K+', icon: '✅' },
                  { label: lang === 'mr' ? 'जिल्हे' : 'Districts', value: 'All MH', icon: '📍' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10">
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-slate-300 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-saffron-500 py-2 overflow-hidden">
        <div className="ticker-content text-white text-sm font-medium">
          🔔 GST Filing ₹250 | PAN Card ₹107 | Gazette Name Change ₹849 | Passport ₹1750 | ITR Filing ₹450 | Caste Certificate ₹299 | Aadhaar Reprint ₹75 | Domicile Certificate ₹199 &nbsp;&nbsp;&nbsp;&nbsp;
          🔔 GST Filing ₹250 | PAN Card ₹107 | Gazette Name Change ₹849 | Passport ₹1750 | ITR Filing ₹450 | Caste Certificate ₹299 | Aadhaar Reprint ₹75 | Domicile Certificate ₹199
        </div>
      </div>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-3">
            {lang === 'mr' ? 'आमच्या सेवा' : lang === 'hi' ? 'हमारी सेवाएं' : 'Our Services'}
          </h2>
          <p className="text-slate-500">
            {lang === 'mr' ? 'सर्व सरकारी कागदपत्रे एकाच छताखाली' : 'All government documents under one roof'}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {services.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} viewport={{ once: true }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group">
              <div className="text-3xl mb-3">{s.icon}</div>
              <div className="font-semibold text-slate-700 text-sm group-hover:text-primary-600 transition-colors">
                {lang === 'mr' ? s.name_mr : s.name}
              </div>
              <div className="text-primary-600 font-bold text-sm mt-1">{s.price}</div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/register" className="btn-primary px-10 py-3 text-base">
            {lang === 'mr' ? 'सर्व सेवा पहा' : 'View All Services'}
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
            {lang === 'mr' ? 'आम्ही का?' : 'Why Choose Us?'}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <FaShieldAlt className="text-primary-600" size={28} />, title: lang === 'mr' ? 'सुरक्षित' : 'Secure', desc: lang === 'mr' ? 'आपली माहिती पूर्णपणे सुरक्षित' : 'Your data is fully secure' },
              { icon: <FaMobileAlt className="text-saffron-500" size={28} />, title: lang === 'mr' ? 'मोबाईल अनुकूल' : 'Mobile Friendly', desc: lang === 'mr' ? 'कुठूनही, कधीही अर्ज करा' : 'Apply from anywhere, anytime' },
              { icon: <FaCheckCircle className="text-primary-600" size={28} />, title: lang === 'mr' ? 'जलद प्रक्रिया' : 'Fast Processing', desc: lang === 'mr' ? 'जलद आणि विश्वासार्ह सेवा' : 'Fast and reliable service' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm text-center border border-slate-100">
                <div className="flex justify-center mb-4">{f.icon}</div>
                <h3 className="font-bold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0f1f35' }} className="text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="font-bold text-xl mb-3">{t('appName')}</div>
              <p className="text-slate-400 text-sm">
                {lang === 'mr' ? 'महाराष्ट्रातील नागरिकांसाठी सर्व सरकारी सेवा एकाच ठिकाणी' : 'All government services for Maharashtra citizens at one place'}
              </p>
            </div>
            <div>
              <div className="font-semibold mb-3">{t('contactUs')}</div>
              <p className="text-slate-400 text-sm">📞 +91 98765 43210</p>
              <p className="text-slate-400 text-sm">✉️ support@mahajanseva.com</p>
              <p className="text-slate-400 text-sm mt-2">⏰ Mon-Sat: 9AM - 6PM</p>
            </div>
            <div>
              <div className="font-semibold mb-3">{t('help')}</div>
              <Link to="/login" className="block text-slate-400 text-sm hover:text-white mb-1">{t('login')}</Link>
              <Link to="/register" className="block text-slate-400 text-sm hover:text-white mb-1">{t('register')}</Link>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} MahaJanSeva. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
