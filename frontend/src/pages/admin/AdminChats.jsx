import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import api from '../../utils/api'
import { FaPaperPlane, FaUser, FaCircle } from 'react-icons/fa'
import useAuthStore from '../../context/authStore'

export default function AdminChats() {
  const [chats, setChats] = useState([])
  const [selected, setSelected] = useState(null)
  const [input, setInput] = useState('')
  const [socket, setSocket] = useState(null)
  const { user } = useAuthStore()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    api.get('/chat/all').then(r => setChats(r.data.chats || []))
    const s = io(import.meta.env.VITE_SOCKET_URL || '', { withCredentials: true })
    s.emit('join_admin')
    s.on('new_user_message', (data) => {
      setChats(prev => prev.map(c => c.roomId === data.roomId
        ? { ...c, lastMessage: data.message, unreadAdmin: (c.unreadAdmin || 0) + 1 }
        : c
      ))
    })
    s.on('receive_message', (msg) => {
      setSelected(prev => prev ? { ...prev, messages: [...(prev.messages || []), msg] } : prev)
    })
    setSocket(s)
    return () => s.disconnect()
  }, [])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [selected?.messages])

  const openChat = (chat) => {
    setSelected(chat)
    if (socket) socket.emit('join_room', chat.roomId)
  }

  const sendMsg = () => {
    if (!input.trim() || !selected || !socket) return
    const msg = { roomId: selected.roomId, message: input, sender: user?.name || 'Admin', senderType: 'admin' }
    socket.emit('send_message', msg)
    api.post(`/chat/${selected.roomId}/message`, { content: input, senderType: 'admin' })
    setInput('')
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-800 mb-5">Chat Management</h1>
      <div className="flex gap-4 h-[calc(100vh-200px)] min-h-[500px]">
        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 card overflow-y-auto p-0">
          <div className="p-4 border-b border-slate-100 font-semibold text-slate-700 text-sm">
            All Chats ({chats.length})
          </div>
          {chats.length === 0 && <div className="p-6 text-center text-slate-400 text-sm">No chats yet</div>}
          {chats.map(chat => (
            <div key={chat._id} onClick={() => openChat(chat)}
              className={`p-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-all ${selected?._id === chat._id ? 'bg-primary-50 border-l-2 border-l-primary-600' : ''}`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600">
                  {chat.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium truncate">{chat.user?.name || 'User'}</div>
                    {chat.unreadAdmin > 0 && (
                      <span className="bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                        {chat.unreadAdmin}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 truncate">{chat.lastMessage || 'No messages'}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <FaCircle className={`text-xs ${chat.status === 'open' ? 'text-green-500' : 'text-slate-300'}`} size={6} />
                    <span className="text-xs text-slate-400">{chat.user?.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex-1 card flex flex-col p-0 overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <FaUser size={40} className="mx-auto mb-3 text-slate-200" />
                <p>Select a chat to start</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600">
                  {selected.user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-sm">{selected.user?.name}</div>
                  <div className="text-xs text-slate-500">{selected.user?.email} • {selected.user?.phone}</div>
                </div>
                <div className="ml-auto">
                  <span className={selected.status === 'open' ? 'badge-green' : 'badge-gray'}>{selected.status}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {(selected.messages || []).map((msg, i) => (
                  <div key={i} className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                      msg.senderType === 'admin'
                        ? 'bg-primary-600 text-white rounded-tr-sm'
                        : msg.senderType === 'ai'
                        ? 'bg-purple-100 text-purple-800 rounded-tl-sm'
                        : 'bg-white text-slate-700 shadow-sm rounded-tl-sm border'
                    }`}>
                      <div className="text-xs opacity-70 mb-1">{msg.senderName || msg.senderType}</div>
                      {typeof msg.content === 'string' ? msg.content : msg.message}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t border-slate-100 bg-white flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && sendMsg()}
                  placeholder="Type admin reply..." className="flex-1 input-field text-sm" />
                <button onClick={sendMsg} disabled={!input.trim()}
                  className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center disabled:opacity-50">
                  <FaPaperPlane size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
