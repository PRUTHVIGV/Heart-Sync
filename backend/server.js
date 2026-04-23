require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const matchRoutes = require("./routes/matches");
const messageRoutes = require("./routes/messages");
const notificationRoutes = require("./routes/notifications");
const adminRoutes = require("./routes/admin");
const { authenticateSocket } = require("./middleware/auth");
const { router: paymentRoutes, handleWebhook } = require("./routes/payments");
const safeDateRoutes = require("./routes/safedate");
const roomRoutes = require("./routes/rooms");
const compatibilityRoutes = require("./routes/compatibility");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Connect DB
connectDB();

// Serve local uploads (dev fallback when AWS not configured)
app.use("/uploads", express.static(require("path").join(__dirname, "uploads")));

// Stripe webhook needs raw body - must be before express.json()
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), handleWebhook);

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: [process.env.CLIENT_URL || "http://localhost:3000", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "10mb" }));
app.options("*", cors());

// Rate limiting - generous for dev, strict for auth
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { message: "Too many attempts, try again later" } });
app.use("/api/", limiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/safedate", safeDateRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/compatibility", compatibilityRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

// Error handler (must be last)
app.use(errorHandler);

// Socket.io
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(); // allow connection, restrict in handlers
  authenticateSocket(socket, next);
});

io.on("connection", (socket) => {
  if (!socket.user) return; // unauthenticated, ignore
  const userId = socket.user._id.toString();
  socket.join(userId);

  socket.on("join_room", (matchId) => {
    socket.join(matchId);
  });

  socket.on("leave_room", (matchId) => {
    socket.leave(matchId);
  });

  socket.on("send_message", async (data) => {
    const Message = require("./models/Message");
    try {
      const message = await Message.create({
        matchId: data.matchId,
        sender: userId,
        content: data.content,
      });
      const populated = await message.populate("sender", "name photos");
      io.to(data.matchId).emit("receive_message", populated);
    } catch (err) {
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("typing", ({ matchId, userId: typingUserId }) => {
    socket.to(matchId).emit("user_typing", { userId: typingUserId });
  });

  socket.on("stop_typing", ({ matchId, userId: typingUserId }) => {
    socket.to(matchId).emit("user_stop_typing", { userId: typingUserId });
  });

  socket.on("disconnect", () => {
    socket.leave(userId);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
