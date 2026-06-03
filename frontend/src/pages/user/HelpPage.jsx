import { useState } from 'react'
import useLangStore from '../../context/langStore'
import { FaPhone, FaEnvelope, FaWhatsapp, FaChevronDown, FaChevronUp } from 'react-icons/fa'

const FAQs = [
  { q: 'How do I apply for a service?', q_mr: 'सेवेसाठी अर्ज कसा करावा?', a: 'Go to Services, select a service, fill the form, upload documents and submit. Amount is deducted from wallet.', a_mr: 'सेवा विभागात जा, सेवा निवडा, फॉर्म भरा, कागदपत्रे अपलोड करा आणि सादर करा.' },
  { q: 'How to recharge wallet?', q_mr: 'वॉलेट रिचार्ज कसे करावे?', a: 'Go to Wallet, enter amount, choose payment method (Razorpay card/UPI or direct UPI QR scan) and complete payment.', a_mr: 'वॉलेट विभागात जा, रक्कम टाका, पेमेंट पद्धत निवडा आणि पेमेंट पूर्ण करा.' },
  { q: 'How long does processing take?', q_mr: 'प्रक्रियेला किती वेळ लागतो?', a: 'Processing time varies by service. PAN: 15-20 days, Gazette: 30-45 days, Caste Certificate: 7-15 days.', a_mr: 'सेवेनुसार वेळ बदलतो. पॅन: 15-20 दिवस, गॅझेट: 30-45 दिवस.' },
  { q: 'Can I get a refund?', q_mr: 'परतावा मिळेल का?', a: 'If your application is rejected due to our error, full refund is processed to wallet within 24 hours.', a_mr: 'आमच्या चुकीमुळे अर्ज नाकारल्यास, 24 तासांत वॉलेटमध्ये परतावा दिला जातो.' },
  { q: 'What documents are required?', q_mr: 'कोणती कागदपत्रे लागतात?', a: 'Each service has specific document requirements. Check the service detail page for the complete list.', a_mr: 'प्रत्येक सेवेसाठी विशिष्ट कागदपत्रे लागतात. सेवा तपशील पृष्ठ तपासा.' },
  { q: 'How to track application status?', q_mr: 'अर्जाची स्थिती कशी तपासावी?', a: 'Go to My Applications and click on any application to see detailed status and updates.', a_mr: 'माझे अर्ज विभागात जा आणि कोणत्याही अर्जावर क्लिक करा.' },
]

export default function HelpPage() {
  const { lang, t } = useLangStore()
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('help')}</h1>
        <p className="text-slate-500 text-sm">{lang==='mr'?'आम्ही कसे मदत करू शकतो?':'How can we help you?'}</p>
      </div>

      {/* Contact Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: FaPhone, color: 'bg-green-50 text-green-600', label: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210' },
          { icon: FaEnvelope, color: 'bg-blue-50 text-blue-600', label: 'Email', value: 'support@mahajanseva.com', href: 'mailto:support@mahajanseva.com' },
          { icon: FaWhatsapp, color: 'bg-emerald-50 text-emerald-600', label: 'WhatsApp', value: '+91 98765 43210', href: 'https://wa.me/919876543210' },
        ].map((c, i) => (
          <a key={i} href={c.href} target="_blank" rel="noopener noreferrer"
            className="card flex flex-col items-center gap-3 text-center hover:shadow-md transition-all hover:border-primary-200">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.color}`}>
              <c.icon size={22} />
            </div>
            <div>
              <div className="font-semibold text-slate-700 text-sm">{c.label}</div>
              <div className="text-xs text-slate-500">{c.value}</div>
            </div>
          </a>
        ))}
      </div>

      {/* Hours */}
      <div className="card bg-primary-50 border-primary-100">
        <h3 className="font-bold text-primary-700 mb-2">🕐 {lang==='mr'?'कार्यालयीन वेळ':'Office Hours'}</h3>
        <div className="text-sm text-primary-600 space-y-1">
          <div>Monday – Saturday: 9:00 AM – 6:00 PM</div>
          <div>Sunday: Closed</div>
        </div>
      </div>

      {/* FAQ */}
      <div className="card">
        <h2 className="font-bold text-slate-700 mb-4">{t('faq')}</h2>
        <div className="space-y-2">
          {FAQs.map((faq, i) => (
            <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq===i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-all">
                <span className="text-sm font-medium text-slate-700">{lang==='mr' ? faq.q_mr : faq.q}</span>
                {openFaq===i ? <FaChevronUp size={12} className="text-slate-400 flex-shrink-0" /> : <FaChevronDown size={12} className="text-slate-400 flex-shrink-0" />}
              </button>
              {openFaq===i && (
                <div className="px-4 pb-4 text-sm text-slate-500 bg-slate-50">
                  {lang==='mr' ? faq.a_mr : faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
