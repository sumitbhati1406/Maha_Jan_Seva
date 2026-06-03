import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import useAuthStore from '../../context/authStore'
import useLangStore from '../../context/langStore'
import { FaWallet, FaCreditCard, FaMobileAlt, FaSpinner, FaQrcode, FaCheckCircle } from 'react-icons/fa'

const AMOUNTS = [100, 200, 500, 1000, 2000, 5000]

export default function WalletPage() {
  const { user, refreshUser } = useAuthStore()
  const { lang, t } = useLangStore()
  const [amount, setAmount] = useState('')
  const [mobile, setMobile] = useState(user?.phone || '')
  const [method, setMethod] = useState('razorpay')
  const [loading, setLoading] = useState(false)
  const [upiData, setUpiData] = useState(null)
  const [utrNo, setUtrNo] = useState('')

  useEffect(() => { refreshUser() }, [])

  const handleRazorpay = async () => {
    if (!amount || Number(amount) < 10) return toast.error('Minimum recharge ₹10')
    setLoading(true)
    try {
      const { data } = await api.post('/payments/create-order', { amount: Number(amount) })
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || data.keyId,
        amount: data.order.amount,
        currency: 'INR',
        name: 'MahaJanSeva',
        description: 'Wallet Recharge',
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/payments/verify', { ...response, amount: Number(amount) })
            if (verifyRes.data.success) {
              toast.success(`₹${amount} added to wallet!`)
              refreshUser()
              setAmount('')
            }
          } catch { toast.error('Verification failed') }
        },
        prefill: { name: user.name, email: user.email, contact: user.phone },
        theme: { color: '#16a34a' }
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch { toast.error('Payment gateway error. Check Razorpay config.') }
    setLoading(false)
  }

  const handleUPIInitiate = async () => {
    if (!amount || Number(amount) < 10) return toast.error('Minimum recharge ₹10')
    if (!mobile || mobile.length !== 10) return toast.error('Enter valid 10-digit mobile')
    setLoading(true)
    try {
      const { data } = await api.post('/payments/upi-initiate', { amount: Number(amount), mobile })
      setUpiData(data)
      toast.success('UPI order created! Scan QR and complete payment.')
    } catch { toast.error('UPI initiation failed') }
    setLoading(false)
  }

  const handleUTRSubmit = async () => {
    if (!utrNo) return toast.error('Enter UTR/Reference Number')
    toast.success('UTR submitted! Admin will verify and credit your wallet within 30 minutes.')
    setUpiData(null)
    setUtrNo('')
    setAmount('')
  }

  return (
    <div className="max-w-lg mx-auto space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-800">{t('wallet')}</h1>

      {/* Balance Card */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f1f35, #1e3a5f)' }}>
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-primary-500/10" />
        <div className="relative">
          <div className="text-slate-300 text-sm mb-1">{t('walletBalance')}</div>
          <div className="text-4xl font-bold mb-1">₹{user?.walletBalance || 0}</div>
          <div className="text-slate-400 text-xs">{user?.name} • {user?.email}</div>
        </div>
        <FaWallet className="absolute top-6 right-6 text-white/20" size={40} />
      </motion.div>

      {/* Recharge Form */}
      {!upiData ? (
        <div className="card space-y-4">
          <h2 className="font-bold text-slate-700">{t('rechargeWallet')}</h2>

          {/* Quick amounts */}
          <div>
            <div className="text-sm font-medium text-slate-600 mb-2">Quick Amount</div>
            <div className="grid grid-cols-3 gap-2">
              {AMOUNTS.map(a => (
                <button key={a} onClick={() => setAmount(String(a))}
                  className={`py-2 rounded-xl text-sm font-medium border transition-all ${
                    amount===String(a) ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 text-slate-700 hover:border-primary-400'
                  }`}>₹{a}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Custom Amount</label>
            <input value={amount} onChange={e => setAmount(e.target.value)} type="number"
              className="input-field" placeholder="Enter amount (min ₹10)" min={10} />
          </div>

          {/* Payment Method */}
          <div>
            <div className="text-sm font-medium text-slate-600 mb-2">Payment Method</div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setMethod('razorpay')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${method==='razorpay'?'border-primary-500 bg-primary-50':'border-slate-200 hover:border-slate-300'}`}>
                <FaCreditCard className={method==='razorpay'?'text-primary-600':'text-slate-400'} size={22} />
                <span className="text-sm font-medium">Card / UPI</span>
                <span className="text-xs text-slate-400">Razorpay</span>
              </button>
              <button onClick={() => setMethod('upi')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${method==='upi'?'border-primary-500 bg-primary-50':'border-slate-200 hover:border-slate-300'}`}>
                <FaQrcode className={method==='upi'?'text-primary-600':'text-slate-400'} size={22} />
                <span className="text-sm font-medium">UPI / QR</span>
                <span className="text-xs text-slate-400">Direct Pay</span>
              </button>
            </div>
          </div>

          {method === 'upi' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mobile Number</label>
              <input value={mobile} onChange={e => setMobile(e.target.value)}
                className="input-field" placeholder="10-digit mobile" maxLength={10} />
            </div>
          )}

          <button
            onClick={method==='razorpay' ? handleRazorpay : handleUPIInitiate}
            disabled={loading || !amount}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <><FaSpinner className="animate-spin" /> Processing...</> :
              method==='razorpay' ? `Pay ₹${amount||0} via Card/UPI` : `Generate UPI QR for ₹${amount||0}`}
          </button>
        </div>
      ) : (
        /* UPI Payment Page */
        <div className="card space-y-4">
          <div className="text-center">
            <h2 className="font-bold text-slate-700 text-lg mb-1">Complete UPI Payment</h2>
            <p className="text-sm text-slate-500">Scan QR code or use UPI ID below</p>
          </div>

          {/* QR Placeholder */}
          <div className="flex flex-col items-center gap-3 p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <div className="w-40 h-40 bg-white rounded-xl flex items-center justify-center shadow-inner border border-slate-200">
              <div className="text-center text-slate-400">
                <FaQrcode size={60} className="mx-auto mb-2" />
                <div className="text-xs">QR Code</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">UPI ID</div>
              <div className="font-bold text-slate-800">{import.meta.env.VITE_UPI_ID || 'mahajanseva@upi'}</div>
              <div className="text-2xl font-bold text-primary-600 mt-2">₹{upiData?.amount}</div>
              <div className="text-xs text-slate-400 mt-1">Order: {upiData?.orderId}</div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
            1. Scan QR or pay to UPI ID above<br />
            2. Enter UTR/Reference number below<br />
            3. Admin will verify within 30 minutes
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">UTR / Reference Number</label>
            <input value={utrNo} onChange={e => setUtrNo(e.target.value)}
              className="input-field" placeholder="Enter UTR number from payment app" />
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setUpiData(null); setUtrNo('') }}
              className="btn-outline flex-1 py-2.5">Cancel</button>
            <button onClick={handleUTRSubmit} className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2">
              <FaCheckCircle /> Submit UTR
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
