import { useState, useEffect, useRef } from 'react'
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'
import useAuthStore from '../context/authStore'
import useLangStore from '../context/langStore'
import toast from 'react-hot-toast'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('ai') // 'ai' or 'human'
  const { user } = useAuthStore()
  const { t, lang } = useLangStore()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        id: Date.now(),
        content: lang === 'mr' 
          ? 'नमस्कार! मी MahaJanSeva AI आहे. मी तुम्हाला सरकारी सेवांबद्दल मदत करू शकतो. तुम्हाला काय जाणून घ्यायचे आहे?'
          : lang === 'hi'
          ? 'नमस्ते! मैं MahaJanSeva AI हूं। मैं आपको सरकारी सेवाओं के बारे में मदद कर सकता हूं। आप क्या जानना चाहते हैं?'
          : 'Hello! I\'m MahaJanSeva AI. I can help you with government services. What would you like to know?',
        sender: 'ai',
        time: new Date()
      }])
    }
  }, [open, lang])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = { id: Date.now(), content: input, sender: 'user', time: new Date() }
    setMessages(prev => [...prev, userMsg])
    const question = input
    setInput('')

    if (mode === 'ai') {
      setLoading(true)
      try {
        const { data } = await api.post('/chat/ai', { message: question, language: lang })
        setMessages(prev => [...prev, { id: Date.now(), content: data.reply, sender: 'ai', time: new Date() }])
      } catch {
        setMessages(prev => [...prev, { id: Date.now(), content: 'Sorry, unable to connect. Please try again.', sender: 'ai', time: new Date() }])
      } finally {
        setLoading(false)
      }
    }
  }

  if (!user) return null

  return (
    <>
      {/* FAB */}
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-all flex items-center justify-center animate-pulse-green">
        {open ? <FaTimes size={20} /> : <FaComments size={22} />}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
            style={{ height: '480px' }}>

            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 text-white flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <FaRobot />
              </div>
              <div>
                <div className="font-semibold text-sm">MahaJanSeva AI</div>
                <div className="text-xs text-green-200 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span> Online
                </div>
              </div>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => setMode(mode === 'ai' ? 'human' : 'ai')}
                  className="text-xs bg-white/20 px-2 py-1 rounded-lg hover:bg-white/30">
                  {mode === 'ai' ? '👤 Human' : '🤖 AI'}
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender !== 'user' && (
                    <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                      <FaRobot className="text-primary-600 text-xs" />
                    </div>
                  )}
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-primary-600 text-white rounded-tr-sm'
                      : 'bg-white text-slate-700 shadow-sm rounded-tl-sm border border-slate-100'
                  }`}>
                    {msg.content}
                    <div className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-green-200' : 'text-slate-400'}`}>
                      {new Date(msg.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <span key={i} className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-3 py-2 flex gap-2 overflow-x-auto bg-white border-t border-slate-100">
              {['GST Filing', 'PAN Card', 'Gazette', 'Passport'].map(q => (
                <button key={q} onClick={() => setInput(q)}
                  className="text-xs bg-primary-50 text-primary-700 px-3 py-1 rounded-full whitespace-nowrap hover:bg-primary-100 border border-primary-200">
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                placeholder={lang === 'mr' ? 'संदेश टाका...' : lang === 'hi' ? 'संदेश लिखें...' : 'Type a message...'}
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button onClick={sendMessage} disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center disabled:opacity-50 hover:bg-primary-700 transition-all">
                <FaPaperPlane size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
