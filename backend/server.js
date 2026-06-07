import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from "./src/routes/auth.js";
import userRoutes from "./src/routes/users.js";
import serviceRoutes from "./src/routes/services.js";
import applicationRoutes from "./src/routes/applications.js";
import paymentRoutes from "./src/routes/payments.js";
import chatRoutes from "./src/routes/chat.js";
import adminRoutes from "./src/routes/admin.js";
import walletRoutes from "./src/routes/wallet.js";
import uploadRoutes from "./src/routes/uploads.js";

dotenv.config();

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
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/uploads", uploadRoutes);

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

export { app, io };
