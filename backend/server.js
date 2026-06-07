const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/services', require('./src/routes/services'));
app.use('/api/applications', require('./src/routes/applications'));
app.use('/api/payments', require('./src/routes/payments'));
app.use('/api/chat', require('./src/routes/chat'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/wallet', require('./src/routes/wallet'));
app.use('/api/uploads', require('./src/routes/uploads'));
app.get("/", (req, res) => {
  res.send("🚀 Server is running successfully");
});
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MahaJanSeva API running', timestamp: new Date() });
});

// Seed admin + services (run once)
app.get('/api/seed', async (req, res) => {
  try {
    const { seedDatabase } = require('./src/utils/seeder');
    await seedDatabase();
    res.json({ success: true, message: 'Database seeded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// Socket.IO Chat
const chatRooms = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    if (!chatRooms.has(roomId)) chatRooms.set(roomId, []);
  });

  socket.on('send_message', async (data) => {
    const { roomId, message, sender, senderType } = data;
    const msgObj = { message, sender, senderType, timestamp: new Date(), id: Date.now() };

    if (chatRooms.has(roomId)) {
      chatRooms.get(roomId).push(msgObj);
    }

    io.to(roomId).emit('receive_message', msgObj);

    // Admin notification for new user message
    if (senderType === 'user') {
      io.to('admin_room').emit('new_user_message', { roomId, ...msgObj });
    }
  });

  socket.on('join_admin', () => {
    socket.join('admin_room');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB Atlas Connected');

    // Auto-seed admin on first run
    const User = require('./src/models/User');
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('⚡ No admin found. Run GET /api/seed to create admin & services.');
    }

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 MahaJanSeva Server running on port ${PORT}`);
      console.log(`📌 Admin login: ${process.env.ADMIN_EMAIL} / ${process.env.ADMIN_PASSWORD}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = { app, io };
