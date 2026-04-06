const express = require("express");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const path = require("path");
const User = require("../models/User");
const Report = require("../models/Report");
const Notification = require("../models/Notification");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// S3 upload config
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `photos/${req.user._id}-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    cb(null, allowed.includes(file.mimetype));
  },
});

// PUT /api/users/profile
router.put("/profile", authenticate, async (req, res) => {
  try {
    const { bio, occupation, location, interests, photos } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { bio, occupation, location, interests, photos },
      { new: true, runValidators: true }
    );
    res.json({ user });
  } catch {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// POST /api/users/upload-photo
router.post("/upload-photo", authenticate, upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({ url: req.file.location });
});

// GET /api/users/:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -swipedRight -swipedLeft -blockedUsers");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/users/settings
router.put("/settings", authenticate, async (req, res) => {
  try {
    const { interestedIn, ageMin, ageMax, showMe, notifications } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { interestedIn, ageMin, ageMax, showMe, notifications },
      { new: true }
    );
    res.json({ user });
  } catch {
    res.status(500).json({ message: "Failed to update settings" });
  }
});

// POST /api/users/report
router.post("/report", authenticate, async (req, res) => {
  try {
    const { targetUserId, reason, details } = req.body;
    if (!targetUserId || !reason) return res.status(400).json({ message: "Missing fields" });
    await Report.create({ reporter: req.user._id, target: targetUserId, reason, details });
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Failed to submit report" });
  }
});

// POST /api/users/block
router.post("/block", authenticate, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) return res.status(400).json({ message: "Missing targetUserId" });
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { blockedUsers: targetUserId },
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Failed to block user" });
  }
});

module.exports = router;
