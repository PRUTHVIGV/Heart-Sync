const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");
const { sendWelcomeEmail, sendPasswordResetEmail, sendVerificationEmail } = require("../config/email");

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/register
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
    body("age").isInt({ min: 18 }).withMessage("Must be 18 or older"),
    body("gender").notEmpty().withMessage("Gender is required"),
    body("interestedIn").notEmpty().withMessage("Interested in is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    try {
      const { name, email, password, age, gender, interestedIn } = req.body;
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: "Email already registered" });

      const user = await User.create({ name, email, password, age, gender, interestedIn });
      sendWelcomeEmail(email, name);
      res.status(201).json({ token: generateToken(user._id), user });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// POST /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail(),
    body("password").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: "Invalid credentials" });

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      user.lastActive = new Date();
      await user.save();
      res.json({ token: generateToken(user._id), user });
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// GET /api/auth/me
router.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    // Always return success to prevent email enumeration
    if (!user) return res.json({ success: true });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    // In production: send email via AWS SES or Nodemailer
    // For now, log the link
    console.log(`Password reset link for ${email}: ${resetLink}`);
    sendPasswordResetEmail(email, resetLink);
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!password || password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = password;
    await user.save();
    res.json({ success: true });
  } catch {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

module.exports = router;
