const express = require("express");
const User = require("../models/User");
const Match = require("../models/Match");
const Message = require("../models/Message");
const Report = require("../models/Report");
const { authenticate } = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

router.use(authenticate, isAdmin);

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalUsers, totalMatches, premiumUsers, pendingReports, recentSignups, recentMessages] =
      await Promise.all([
        User.countDocuments(),
        Match.countDocuments(),
        User.countDocuments({ isPremium: true }),
        Report.countDocuments({ status: "pending" }),
        User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
        Message.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      ]);

    res.json({ totalUsers, totalMatches, premiumUsers, pendingReports, recentSignups, recentMessages });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/reports
router.get("/reports", async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporter", "name email")
      .populate("target", "name email")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ reports });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/admin/reports/:id
router.put("/reports/:id", async (req, res) => {
  try {
    const { action } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    if (action === "ban") {
      await User.findByIdAndUpdate(report.target, { isActive: false });
      report.status = "resolved";
    } else {
      report.status = "reviewed";
    }

    await report.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("name email age photos isPremium isActive isAdmin createdAt")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ users });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/admin/users/:id
router.put("/users/:id", async (req, res) => {
  try {
    const { isActive, isPremium, isAdmin: adminFlag } = req.body;
    const update = {};
    if (isActive !== undefined) update.isActive = isActive;
    if (isPremium !== undefined) update.isPremium = isPremium;
    if (adminFlag !== undefined) update.isAdmin = adminFlag;

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ user });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
