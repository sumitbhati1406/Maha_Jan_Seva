const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  senderType: { type: String, enum: ['user', 'admin', 'ai'], required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderName: { type: String },
  isRead: { type: Boolean, default: false },
  attachments: [{ name: String, url: String }]
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomId: { type: String, unique: true, required: true },
  status: { type: String, enum: ['open', 'closed', 'pending'], default: 'open' },
  subject: { type: String, default: 'General Query' },
  messages: [messageSchema],
  lastMessage: { type: String },
  lastMessageAt: { type: Date, default: Date.now },
  unreadAdmin: { type: Number, default: 0 },
  unreadUser: { type: Number, default: 0 },
  assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
