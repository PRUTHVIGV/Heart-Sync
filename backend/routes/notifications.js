const express = require("express");
const Notification = require("../models/Notification");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// GET /api/notifications
router.get("/", authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json({ notifications });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/notifications/read-all
router.put("/read-all", authenticate, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/notifications/:id/read
router.put("/:id/read", authenticate, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true }
    );
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
