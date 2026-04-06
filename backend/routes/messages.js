const express = require("express");
const Message = require("../models/Message");
const Match = require("../models/Match");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// GET /api/messages/:matchId
router.get("/:matchId", authenticate, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match || !match.users.includes(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const messages = await Message.find({ matchId: req.params.matchId })
      .populate("sender", "name photos")
      .sort({ createdAt: 1 })
      .limit(100);

    // Mark messages as read
    await Message.updateMany(
      { matchId: req.params.matchId, sender: { $ne: req.user._id }, read: false },
      { read: true }
    );

    res.json({ messages });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/messages/:matchId
router.post("/:matchId", authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: "Message cannot be empty" });

    const match = await Match.findById(req.params.matchId);
    if (!match || !match.users.includes(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const message = await Message.create({
      matchId: req.params.matchId,
      sender: req.user._id,
      content: content.trim(),
    });

    await Match.findByIdAndUpdate(req.params.matchId, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
    });

    const populated = await message.populate("sender", "name photos");
    res.status(201).json({ message: populated });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
