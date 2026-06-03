import { useEffect, useState } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { FaPlus, FaEdit, FaToggleOn, FaToggleOff, FaSpinner } from 'react-icons/fa'

const CATEGORIES = ['GST','PAN','Gazette','Aadhaar','Passport','ITR','Certificate','Registration','Other']

const emptyService = {
  name: { en: '', mr: '', hi: '' },
  description: { en: '', mr: '', hi: '' },
  category: 'GST', price: '', priceMax: '', isOnCall: false,
  isActive: true, isNew: true, processingDays: 7, serviceCode: '', order: 0,
  requiredDocuments: []
}

export default function AdminServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyService)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const fetchServices = () => {
    api.get('/services')
      .then(r => {
        const list = (r.data.services || []).filter(s => s && s.name)
        setServices(list)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }
  useEffect(() => { fetchServices() }, [])

  const openAdd = () => { setForm(emptyService); setEditing(null); setShowModal(true) }

  const openEdit = (s) => {
    setForm({
      ...s,
      name: { en: s.name?.en || '', mr: s.name?.mr || '', hi: s.name?.hi || '' },
      description: { en: s.description?.en || '', mr: s.description?.mr || '', hi: s.description?.hi || '' },
      price: s.price || '',
      priceMax: s.priceMax || '',
      requiredDocuments: s.requiredDocuments || []
    })
    setEditing(s._id)
    setShowModal(true)
  }

  const addDoc = () => setForm({...form, requiredDocuments: [...(form.requiredDocuments || []), { name: '', isRequired: true }]})
  const removeDoc = (i) => setForm({...form, requiredDocuments: form.requiredDocuments.filter((_,idx) => idx !== i)})
  const updateDoc = (i, field, val) => {
    const docs = [...form.requiredDocuments]
    docs[i] = {...docs[i], [field]: val}
    setForm({...form, requiredDocuments: docs})
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, price: Number(form.price) || 0, priceMax: Number(form.priceMax) || undefined }
      if (editing) {
        await api.put(`/services/${editing}`, payload)
        toast.success('Service updated')
      } else {
        await api.post('/services', payload)
        toast.success('Service created')
      }
      setShowModal(false)
      fetchServices()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving service')
    } finally { setSaving(false) }
  }

  const handleToggle = async (id, current) => {
    await api.put(`/services/${id}`, { isActive: !current })
    fetchServices()
    toast.success(!current ? 'Service activated' : 'Service deactivated')
  }

  const filtered = services.filter(s =>
    (s.name?.en?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (s.category?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (s.serviceCode?.toLowerCase() || '').includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Services Management</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <FaPlus size={12} /> Add Service
        </button>
      </div>

      <div className="card">
        <div className="flex gap-3 mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, category, code..." className="input-field max-w-sm" />
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(6)].map((_,i) => <div key={i} className="h-12 rounded-xl shimmer" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Code','Service Name','Category','Price','Docs','Status','Order','Actions'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s._id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono text-xs text-slate-500">{s.serviceCode}</td>
                    <td className="py-2 px-3">
                      <div className="font-medium text-slate-700">{s.name?.en || '-'}</div>
                      <div className="text-xs text-slate-400">{s.name?.mr || ''}</div>
                    </td>
                    <td className="py-2 px-3"><span className="badge badge-blue">{s.category}</span></td>
                    <td className="py-2 px-3 font-semibold text-primary-600">
                      {s.isOnCall ? 'On Call' : `₹${s.price}${s.priceMax ? ` - ₹${s.priceMax}` : ''}`}
                    </td>
                    <td className="py-2 px-3 text-slate-500 text-xs">
                      {(s.requiredDocuments || []).length} docs
                    </td>
                    <td className="py-2 px-3">
                      <span className={s.isActive ? 'badge-green' : 'badge-red'}>{s.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-500">{s.order}</td>
                    <td className="py-2 px-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(s)} className="text-blue-500 hover:text-blue-700 p-1"><FaEdit /></button>
                        <button onClick={() => handleToggle(s._id, s.isActive)}
                          className={s.isActive ? 'text-red-400 hover:text-red-600 p-1' : 'text-green-500 hover:text-green-700 p-1'}>
                          {s.isActive ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="text-center py-10 text-slate-400">No services found</div>}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editing ? 'Edit Service' : 'Add New Service'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">

              {/* Name */}
              <div className="grid grid-cols-3 gap-3">
                {['en','mr','hi'].map(l => (
                  <div key={l}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Name ({l.toUpperCase()})</label>
                    <input value={form.name[l]} onChange={e => setForm({...form, name: {...form.name, [l]: e.target.value}})}
                      className="input-field text-sm" placeholder={`Name in ${l}`} required={l === 'en'} />
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="grid grid-cols-3 gap-3">
                {['en','mr','hi'].map(l => (
                  <div key={l}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Description ({l.toUpperCase()})</label>
                    <textarea value={form.description[l]} onChange={e => setForm({...form, description: {...form.description, [l]: e.target.value}})}
                      className="input-field text-sm h-16 resize-none" placeholder={`Description in ${l}`} />
                  </div>
                ))}
              </div>

              {/* Category, Price, Code */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field text-sm">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Price (₹)</label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                    className="input-field text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Max Price (₹)</label>
                  <input type="number" value={form.priceMax} onChange={e => setForm({...form, priceMax: e.target.value})}
                    className="input-field text-sm" placeholder="optional" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Service Code</label>
                  <input value={form.serviceCode} onChange={e => setForm({...form, serviceCode: e.target.value})}
                    className="input-field text-sm" placeholder="GST001" required />
                </div>
              </div>

              {/* Processing Days, Order, Flags */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Processing Days</label>
                  <input type="number" value={form.processingDays} onChange={e => setForm({...form, processingDays: Number(e.target.value)})}
                    className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Order</label>
                  <input type="number" value={form.order} onChange={e => setForm({...form, order: Number(e.target.value)})}
                    className="input-field text-sm" />
                </div>
                <div className="flex items-end gap-4 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isOnCall} onChange={e => setForm({...form, isOnCall: e.target.checked})} />
                    <span className="text-sm text-slate-600">On Call</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isNew} onChange={e => setForm({...form, isNew: e.target.checked})} />
                    <span className="text-sm text-slate-600">New Badge</span>
                  </label>
                </div>
              </div>

              {/* Required Documents */}
              <div className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-700">Required Documents</label>
                  <button type="button" onClick={addDoc}
                    className="text-xs bg-primary-50 text-primary-600 px-3 py-1.5 rounded-lg hover:bg-primary-100 border border-primary-200 font-medium">
                    + Add Document
                  </button>
                </div>
                <div className="space-y-2">
                  {(form.requiredDocuments || []).map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
                      <input
                        value={doc.name}
                        onChange={e => updateDoc(i, 'name', e.target.value)}
                        placeholder="e.g. Aadhaar Card, Passport Photo, Signature..."
                        className="input-field text-sm flex-1 bg-white"
                      />
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 whitespace-nowrap cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={doc.isRequired}
                          onChange={e => updateDoc(i, 'isRequired', e.target.checked)}
                          className="accent-primary-600"
                        />
                        Required
                      </label>
                      <button type="button" onClick={() => removeDoc(i)}
                        className="text-red-400 hover:text-red-600 text-xl px-1 leading-none">×</button>
                    </div>
                  ))}
                  {(form.requiredDocuments || []).length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-2">No documents added — click "+ Add Document" to add</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <><FaSpinner className="animate-spin" /> Saving...</> : (editing ? 'Update Service' : 'Create Service')}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline">Cancel</button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  )
}