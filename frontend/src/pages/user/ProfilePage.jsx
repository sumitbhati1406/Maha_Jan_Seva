import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import useAuthStore from '../../context/authStore'
import useLangStore from '../../context/langStore'
import { FaUser, FaLock, FaSpinner, FaEdit } from 'react-icons/fa'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const { t, lang, setLang } = useLangStore()
  const [tab, setTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({ name: user?.name||'', phone: user?.phone||'', preferredLanguage: user?.preferredLanguage||'mr', address: user?.address || {} })
  const [passwords, setPasswords] = useState({ oldPassword:'', newPassword:'', confirmPassword:'' })

  const setAddr = (k, v) => setProfile(p => ({ ...p, address: { ...p.address, [k]: v } }))

  const saveProfile = async () => {
    setSaving(true)
    try {
      const { data } = await api.put('/auth/update-profile', profile)
      updateUser(data.user)
      setLang(profile.preferredLanguage)
      toast.success('Profile updated!')
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed') }
    setSaving(false)
  }

  const changePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('Passwords do not match')
    if (passwords.newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    setSaving(true)
    try {
      await api.put('/auth/change-password', { oldPassword: passwords.oldPassword, newPassword: passwords.newPassword })
      toast.success('Password changed successfully!')
      setPasswords({ oldPassword:'', newPassword:'', confirmPassword:'' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    setSaving(false)
  }

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-800">{t('profile')}</h1>

      {/* Avatar */}
      <div className="card flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <div className="font-bold text-slate-800 text-lg">{user?.name}</div>
          <div className="text-sm text-slate-500">{user?.email}</div>
          <div className="text-sm text-slate-500">{user?.phone}</div>
        </div>
        <div className="ml-auto">
          <div className="text-xs text-slate-400">{t('walletBalance')}</div>
          <div className="text-xl font-bold text-primary-600">₹{user?.walletBalance || 0}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[['profile', FaUser, t('profile')], ['password', FaLock, t('password')]].map(([id, Icon, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab===id?'bg-primary-600 text-white':'bg-white border border-slate-200 text-slate-600 hover:border-primary-300'}`}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="card space-y-4">
          <h2 className="font-bold text-slate-700 flex items-center gap-2"><FaEdit className="text-primary-500" /> Edit Profile</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('name')}</label>
            <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('phone')}</label>
            <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="input-field" maxLength={10} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('language')}</label>
            <select value={profile.preferredLanguage} onChange={e => setProfile(p => ({ ...p, preferredLanguage: e.target.value }))} className="input-field">
              <option value="en">English</option>
              <option value="mr">मराठी</option>
              <option value="hi">हिंदी</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['city', t('city')], ['district', t('district')], ['pincode', t('pincode')], ['street', t('address')]].map(([k,l]) => (
              <div key={k}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{l}</label>
                <input value={profile.address?.[k] || ''} onChange={e => setAddr(k, e.target.value)} className="input-field" />
              </div>
            ))}
          </div>
          <button onClick={saveProfile} disabled={saving} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {saving ? <><FaSpinner className="animate-spin" /> Saving...</> : 'Save Changes'}
          </button>
        </motion.div>
      )}

      {tab === 'password' && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="card space-y-4">
          <h2 className="font-bold text-slate-700 flex items-center gap-2"><FaLock className="text-primary-500" /> Change Password</h2>
          {[['oldPassword','Current Password'], ['newPassword','New Password'], ['confirmPassword','Confirm New Password']].map(([k,l]) => (
            <div key={k}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{l}</label>
              <input type="password" value={passwords[k]} onChange={e => setPasswords(p => ({ ...p, [k]: e.target.value }))} className="input-field" placeholder="••••••••" />
            </div>
          ))}
          <button onClick={changePassword} disabled={saving} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {saving ? <><FaSpinner className="animate-spin" /> Changing...</> : 'Change Password'}
          </button>
        </motion.div>
      )}
    </div>
  )
}
