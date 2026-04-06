const express = require("express");
const User = require("../models/User");
const Match = require("../models/Match");
const Notification = require("../models/Notification");
const { sendMatchEmail } = require("../config/email");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// GET /api/matches/discover - get profiles to swipe on
router.get("/discover", authenticate, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    // Build gender filter
    let genderFilter = {};
    if (currentUser.interestedIn === "men") genderFilter = { gender: "male" };
    else if (currentUser.interestedIn === "women") genderFilter = { gender: "female" };

    const profiles = await User.find({
      _id: {
        $ne: currentUser._id,
        $nin: [...currentUser.swipedRight, ...currentUser.swipedLeft, ...(currentUser.blockedUsers || [])],
      },
      isActive: true,
      showMe: true,
      photos: { $exists: true, $not: { $size: 0 } },
      age: { $gte: currentUser.ageMin || 18, $lte: currentUser.ageMax || 50 },
      blockedUsers: { $nin: [currentUser._id] },
      ...genderFilter,
    })
      .select("-password -swipedRight -swipedLeft -email")
      .limit(20);

    res.json({ profiles });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/matches/swipe
router.post("/swipe", authenticate, async (req, res) => {
  try {
    const { targetUserId, direction } = req.body;
    const currentUser = await User.findById(req.user._id);

    // Daily swipe limit for free users
    if (!currentUser.isPremium) {
      const now = new Date();
      const resetAt = new Date(currentUser.swipesResetAt);
      const hoursSinceReset = (now - resetAt) / (1000 * 60 * 60);
      if (hoursSinceReset >= 24) {
        currentUser.swipesUsed = 0;
        currentUser.swipesResetAt = now;
      }
      if (currentUser.swipesUsed >= 20) {
        return res.status(429).json({
          message: "Daily swipe limit reached. Upgrade to Premium for unlimited swipes!",
          limitReached: true,
        });
      }
      currentUser.swipesUsed += 1;
    }

    if (direction === "right") {
      currentUser.swipedRight.push(targetUserId);
      await currentUser.save();

      // Check if target also swiped right on current user
      const targetUser = await User.findById(targetUserId);
      const isMatch = targetUser.swipedRight.includes(req.user._id);

      if (isMatch) {
        const match = await Match.create({ users: [req.user._id, targetUserId] });
        // Notify both users
        await Notification.create([
          { recipient: req.user._id, type: "match", message: `You matched with ${targetUser.name}! 💕`, link: `/chat/${match._id}` },
          { recipient: targetUserId, type: "match", message: `You matched with ${currentUser.name}! 💕`, link: `/chat/${match._id}` },
        ]);
        sendMatchEmail(currentUser.email, currentUser.name, targetUser.name);
        sendMatchEmail(targetUser.email, targetUser.name, currentUser.name);
        return res.json({ matched: true, matchId: match._id });
      }
    } else {
      currentUser.swipedLeft.push(targetUserId);
      await currentUser.save();
    }

    res.json({ matched: false });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/matches/superlike
router.post("/superlike", authenticate, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const currentUser = await User.findById(req.user._id);
    currentUser.swipedRight.push(targetUserId);
    await currentUser.save();

    const targetUser = await User.findById(targetUserId);
    const isMatch = targetUser.swipedRight.includes(req.user._id);

    if (isMatch) {
      const match = await Match.create({ users: [req.user._id, targetUserId] });
      await Notification.create([
        { recipient: req.user._id, type: "match", message: `You matched with ${targetUser.name}! 💕`, link: `/chat/${match._id}` },
        { recipient: targetUserId, type: "match", message: `You matched with ${currentUser.name}! 💕`, link: `/chat/${match._id}` },
      ]);
      return res.json({ matched: true, matchId: match._id });
    }

    // Notify target of superlike
    await Notification.create({
      recipient: targetUserId,
      type: "superlike",
      message: `${currentUser.name} super liked you! ⭐`,
    });

    res.json({ matched: false });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/matches - get all matches for current user
router.get("/", authenticate, async (req, res) => {
  try {
    const matches = await Match.find({ users: req.user._id })
      .populate({ path: "users", select: "name photos age location" })
      .populate("lastMessage")
      .sort({ lastMessageAt: -1, createdAt: -1 });

    const formatted = matches.map((match) => ({
      _id: match._id,
      user: match.users.find((u) => u._id.toString() !== req.user._id.toString()),
      lastMessage: match.lastMessage,
      createdAt: match.createdAt,
    }));

    res.json({ matches: formatted });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/matches/:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id).populate("users", "name photos age location bio");
    if (!match) return res.status(404).json({ message: "Match not found" });
    if (!match.users.some((u) => u._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    res.json({ match });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
