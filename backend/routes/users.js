const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const Report = require("../models/Report");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// Use local storage if AWS not configured, S3 if configured
let upload;
const hasAWS = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID !== "<your_aws_access_key>";

if (hasAWS) {
  const multerS3 = require("multer-s3");
  const { S3Client } = require("@aws-sdk/client-s3");
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  upload = multer({
    storage: multerS3({
      s3,
      bucket: process.env.AWS_S3_BUCKET,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `photos/${req.user._id}-${Date.now()}${ext}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      cb(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype));
    },
  });
} else {
  // Local disk storage fallback for development
  const uploadDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, uploadDir),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${req.user._id}-${Date.now()}${ext}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      cb(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype));
    },
  });
}

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
  const url = hasAWS
    ? req.file.location
    : `${process.env.CLIENT_URL || "http://localhost:5000"}/uploads/${req.file.filename}`;
  res.json({ url });
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

// GET /api/users/:id  — must be AFTER named routes
router.get("/:id", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -swipedRight -swipedLeft -blockedUsers");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch {
    res.status(500).json({ message: "Server error" });
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
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { blockedUsers: targetUserId } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Failed to block user" });
  }
});

module.exports = router;
