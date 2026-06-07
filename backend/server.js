const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// ---------------- SOCKET.IO ----------------
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
  },
});

// ---------------- MIDDLEWARE ----------------
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("dev"));

// Attach io
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ---------------- API ROUTES ----------------
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/users", require("./src/routes/users"));
app.use("/api/services", require("./src/routes/services"));
app.use("/api/applications", require("./src/routes/applications"));
app.use("/api/payments", require("./src/routes/payments"));
app.use("/api/chat", require("./src/routes/chat"));
app.use("/api/admin", require("./src/routes/admin"));
app.use("/api/wallet", require("./src/routes/wallet"));
app.use("/api/uploads", require("./src/routes/uploads"));

// ---------------- HEALTH CHECK ----------------
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "MahaJanSeva API running",
    timestamp: new Date(),
  });
});

// ---------------- SOCKET CHAT ----------------
const chatRooms = new Map();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    if (!chatRooms.has(roomId)) chatRooms.set(roomId, []);
  });

  socket.on("send_message", (data) => {
    const { roomId, message, sender, senderType } = data;

    const msgObj = {
      message,
      sender,
      senderType,
      timestamp: new Date(),
      id: Date.now(),
    };

    if (chatRooms.has(roomId)) {
      chatRooms.get(roomId).push(msgObj);
    }

    io.to(roomId).emit("receive_message", msgObj);

    if (senderType === "user") {
      io.to("admin_room").emit("new_user_message", { roomId, ...msgObj });
    }
  });

  socket.on("join_admin", () => {
    socket.join("admin_room");
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ---------------- FRONTEND SERVE (REACT BUILD) ----------------
const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
});

// ---------------- MONGODB + SERVER ----------------
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(
        `📌 Admin: ${process.env.ADMIN_EMAIL} / ${process.env.ADMIN_PASSWORD}`
      );
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  });

module.exports = { app, io };
