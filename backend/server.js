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

// Stripe webhook needs raw body - must be before express.json()
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), handleWebhook);

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "10mb" }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api/", limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

// Error handler (must be last)
app.use(errorHandler);

// Socket.io
io.use(authenticateSocket);

io.on("connection", (socket) => {
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
