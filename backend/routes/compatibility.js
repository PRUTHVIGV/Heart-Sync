const express = require("express");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// Cache to avoid recalculating same pair
const cache = new Map();

function calcDimensions(a, b) {
  const sharedInterests = (a.interests || []).filter((i) => (b.interests || []).includes(i));
  const interests = Math.min(Math.round((sharedInterests.length / Math.max((a.interests || []).length, 1)) * 100), 100);
  const personality = a.personalityType && a.personalityType === b.personalityType ? 90 : a.personalityType && b.personalityType ? 40 : 50;
  const loveLanguage = a.loveLanguage && a.loveLanguage === b.loveLanguage ? 95 : a.loveLanguage && b.loveLanguage ? 35 : 50;
  const lifestyle = [
    a.diet === b.diet, a.exercise === b.exercise, a.drinking === b.drinking,
    a.smoking === b.smoking, a.kids === b.kids,
  ].filter(Boolean).length * 20;
  const goals = a.relationshipGoal && a.relationshipGoal === b.relationshipGoal ? 100 : a.relationshipGoal && b.relationshipGoal ? 30 : 50;
  return { interests, personality, loveLanguage, lifestyle, goals };
}

function calcScore(dims) {
  return Math.min(Math.round(
    dims.interests * 0.30 +
    dims.personality * 0.15 +
    dims.loveLanguage * 0.25 +
    dims.lifestyle * 0.15 +
    dims.goals * 0.15
  ), 99);
}

function buildInsights(a, b, dims) {
  const sharedInterests = (a.interests || []).filter((i) => (b.interests || []).includes(i));
  const greenFlags = [];
  const growthAreas = [];

  if (sharedInterests.length > 0) greenFlags.push(`Both love ${sharedInterests.slice(0, 2).join(" & ")}`);
  if (a.relationshipGoal === b.relationshipGoal && a.relationshipGoal) greenFlags.push(`Same relationship goal: ${a.relationshipGoal}`);
  if (a.loveLanguage === b.loveLanguage && a.loveLanguage) greenFlags.push(`Same love language: ${a.loveLanguage}`);
  if (a.personalityType === b.personalityType && a.personalityType) greenFlags.push(`Both are ${a.personalityType}s`);

  if (a.loveLanguage && b.loveLanguage && a.loveLanguage !== b.loveLanguage) growthAreas.push(`Different love languages — worth discussing`);
  if (a.relationshipGoal && b.relationshipGoal && a.relationshipGoal !== b.relationshipGoal) growthAreas.push(`Different relationship goals — be upfront early`);
  if (sharedInterests.length === 0) growthAreas.push(`No shared interests yet — great chance to explore new things together`);

  const score = calcScore(dims);
  const summary = score >= 75
    ? `You and ${b.name} have strong natural chemistry. ${sharedInterests.length > 0 ? `Your shared love of ${sharedInterests[0]} is a great starting point.` : "Your values align well."}`
    : score >= 50
    ? `You and ${b.name} have solid compatibility with some exciting differences to explore.`
    : `You and ${b.name} are quite different — but opposites can attract! Focus on what you do share.`;

  const icebreaker = sharedInterests.length > 0
    ? `Hey ${b.name}! I noticed we're both into ${sharedInterests[0]} — what got you into it? 😊`
    : b.prompts?.[0]?.answer
    ? `Hey ${b.name}! I saw your answer about "${b.prompts[0].answer}" — I'd love to hear more about that!`
    : `Hey ${b.name}! Your profile caught my eye — what's been the highlight of your week? 😊`;

  return { summary, greenFlags, growthAreas, icebreaker };
}

// POST /api/compatibility
router.post("/", authenticate, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const cacheKey = [req.user._id.toString(), targetUserId].sort().join("-");

    if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));

    const [a, b] = await Promise.all([
      User.findById(req.user._id),
      User.findById(targetUserId),
    ]);
    if (!a || !b) return res.status(404).json({ message: "User not found" });

    const dimensions = calcDimensions(a, b);
    const score = calcScore(dimensions);
    const { summary, greenFlags, growthAreas, icebreaker } = buildInsights(a, b, dimensions);

    const result = { score, dimensions, summary, greenFlags, growthAreas, icebreaker };
    cache.set(cacheKey, result);
    // Clear cache after 1 hour
    setTimeout(() => cache.delete(cacheKey), 60 * 60 * 1000);

    res.json(result);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
