const express = require("express");
const { authenticate } = require("../middleware/auth");
const router = express.Router();

const ROOMS = [
  { id: "foodies", name: "Foodies 🍜", city: "All Cities", members: 0 },
  { id: "hikers", name: "Hikers 🏔️", city: "All Cities", members: 0 },
  { id: "bookclub", name: "Book Club 📚", city: "All Cities", members: 0 },
  { id: "gamers", name: "Gamers 🎮", city: "All Cities", members: 0 },
  { id: "music", name: "Music Lovers 🎵", city: "All Cities", members: 0 },
  { id: "travel", name: "Travel Buddies ✈️", city: "All Cities", members: 0 },
  { id: "fitness", name: "Fitness 💪", city: "All Cities", members: 0 },
  { id: "movies", name: "Movie Buffs 🎬", city: "All Cities", members: 0 },
];

// In-memory messages per room (use DB in production)
const roomMessages = new Map();

// GET /api/rooms
router.get("/", authenticate, (req, res) => {
  res.json({ rooms: ROOMS });
});

// GET /api/rooms/:roomId/messages
router.get("/:roomId/messages", authenticate, (req, res) => {
  const msgs = roomMessages.get(req.params.roomId) || [];
  res.json({ messages: msgs.slice(-50) });
});

// POST /api/rooms/:roomId/messages
router.post("/:roomId/messages", authenticate, (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ message: "Empty message" });
  const msg = {
    _id: Date.now().toString(),
    sender: { _id: req.user._id, name: req.user.name, photos: req.user.photos },
    content: content.trim(),
    createdAt: new Date(),
  };
  const msgs = roomMessages.get(req.params.roomId) || [];
  msgs.push(msg);
  roomMessages.set(req.params.roomId, msgs);
  res.status(201).json({ message: msg });
});

module.exports = router;
