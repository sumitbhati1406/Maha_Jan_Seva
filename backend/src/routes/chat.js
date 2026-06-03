const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { protect, adminOnly } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// @POST /api/chat/start - Start or get chat room
router.post('/start', protect, async (req, res) => {
  try {
    let chat = await Chat.findOne({ user: req.user._id, status: 'open' });
    if (!chat) {
      chat = await Chat.create({
        user: req.user._id,
        roomId: uuidv4(),
        subject: req.body.subject || 'General Query'
      });
    }
    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/chat/:roomId/message - Send message
router.post('/:roomId/message', protect, async (req, res) => {
  try {
    const { content, senderType } = req.body;
    const chat = await Chat.findOne({ roomId: req.params.roomId });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const msg = {
      content,
      senderType: senderType || 'user',
      sender: req.user._id,
      senderName: req.user.name
    };
    chat.messages.push(msg);
    chat.lastMessage = content;
    chat.lastMessageAt = new Date();
    if (senderType === 'user') chat.unreadAdmin += 1;
    else chat.unreadUser += 1;
    await chat.save();

    res.json({ success: true, message: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/chat/my - User get own chat
router.get('/my', protect, async (req, res) => {
  try {
    const chat = await Chat.findOne({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/chat/ai - AI chatbot response (FIXED)
router.post('/ai', protect, async (req, res) => {
  try {
    const { message, language } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.json({ success: true, reply: 'AI service not configured. Please contact support.' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: `You are MahaJanSeva AI Assistant. You help citizens with government service queries in Maharashtra, India.
Available services: GST Filing (Nil/Monthly), PAN Card (New/Correction), Gazette Name Change, Aadhaar services, Passport Renewal, ITR Filing, Caste Certificate, Domicile Certificate, EPF Claim, Shop Act License, Udyog Aadhaar, etc.
Reply in ${language === 'mr' ? 'Marathi (Devanagari script)' : language === 'hi' ? 'Hindi (Devanagari script)' : 'English'}.
Be concise, helpful, and friendly. Format fees as ₹amount. Keep replies under 150 words.`,
        messages: [{ role: 'user', content: message }]
      })
    });

    if (!response.ok) {
      const errData = await response.text();
      console.error('Anthropic API error:', response.status, errData);
      return res.json({ success: true, reply: 'Sorry, AI service is temporarily unavailable. Please try again later.' });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Sorry, I could not process your request. Please try again.';
    res.json({ success: true, reply });
  } catch (err) {
    console.error('Chat AI error:', err.message);
    res.status(500).json({ success: false, message: err.message, reply: 'AI service temporarily unavailable.' });
  }
});

// @GET /api/chat/all - Admin get all chats
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate('user', 'name email phone')
      .sort({ lastMessageAt: -1 });
    res.json({ success: true, chats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/chat/:roomId/close
router.put('/:roomId/close', protect, async (req, res) => {
  try {
    const chat = await Chat.findOneAndUpdate({ roomId: req.params.roomId }, { status: 'closed' }, { new: true });
    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
