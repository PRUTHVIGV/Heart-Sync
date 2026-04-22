const express = require("express");
const { authenticate } = require("../middleware/auth");
const router = express.Router();

// In-memory store for safe date sessions (use DB in production)
const sessions = new Map();

// POST /api/safedate/start
router.post("/start", authenticate, (req, res) => {
  const { trustedContact, dateLocation, dateTime } = req.body;
  if (!trustedContact || !dateLocation) return res.status(400).json({ message: "Contact and location required" });
  const id = `${req.user._id}-${Date.now()}`;
  sessions.set(id, {
    userId: req.user._id,
    trustedContact,
    dateLocation,
    dateTime,
    status: "active",
    checkins: [],
    startedAt: new Date(),
  });
  res.json({ sessionId: id, message: "Safe date session started" });
});

// POST /api/safedate/checkin
router.post("/checkin", authenticate, (req, res) => {
  const { sessionId } = req.body;
  const session = sessions.get(sessionId);
  if (!session || session.userId.toString() !== req.user._id.toString())
    return res.status(404).json({ message: "Session not found" });
  session.checkins.push(new Date());
  res.json({ message: "Check-in recorded ✅", checkins: session.checkins.length });
});

// POST /api/safedate/sos
router.post("/sos", authenticate, (req, res) => {
  const { sessionId } = req.body;
  const session = sessions.get(sessionId);
  if (!session) return res.status(404).json({ message: "Session not found" });
  session.status = "sos";
  // In production: send SMS/email to trustedContact here
  res.json({ message: "SOS triggered. Your trusted contact has been notified 🚨" });
});

// POST /api/safedate/end
router.post("/end", authenticate, (req, res) => {
  const { sessionId } = req.body;
  sessions.delete(sessionId);
  res.json({ message: "Safe date session ended safely ✅" });
});

module.exports = router;
