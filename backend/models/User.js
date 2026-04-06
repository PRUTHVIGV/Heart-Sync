const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const promptSchema = new mongoose.Schema({
  question: { type: String },
  answer: { type: String, maxlength: 150 },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    // ── Core ──────────────────────────────────────────────────────────────────
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    age: { type: Number, required: true, min: 18 },
    gender: { type: String, enum: ["male", "female", "non-binary", "other"], required: true },
    interestedIn: { type: String, enum: ["men", "women", "everyone"], required: true },

    // ── Profile ───────────────────────────────────────────────────────────────
    photos: [{ type: String }],
    bio: { type: String, maxlength: 500 },
    occupation: { type: String },
    company: { type: String },
    location: { type: String },
    hometown: { type: String },
    height: { type: String },
    interests: [{ type: String }],
    prompts: [promptSchema],

    // ── Personality & Lifestyle ───────────────────────────────────────────────
    relationshipGoal: { type: String, enum: ["long-term", "marriage", "casual", "friendship", "unsure"] },
    loveLanguage: { type: String, enum: ["words", "acts", "gifts", "time", "touch"] },
    personalityType: { type: String, enum: ["introvert", "extrovert", "ambivert"] },
    zodiac: { type: String },
    education: { type: String },
    drinking: { type: String },
    smoking: { type: String },
    exercise: { type: String },
    diet: { type: String },
    kids: { type: String },
    religion: { type: String },
    politics: { type: String },

    // ── Status ────────────────────────────────────────────────────────────────
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now },

    // ── Matching ──────────────────────────────────────────────────────────────
    swipedRight: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    swipedLeft: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // ── Settings ──────────────────────────────────────────────────────────────
    ageMin: { type: Number, default: 18 },
    ageMax: { type: Number, default: 50 },
    showMe: { type: Boolean, default: true },
    notifications: {
      newMatch: { type: Boolean, default: true },
      newMessage: { type: Boolean, default: true },
      superLike: { type: Boolean, default: true },
    },

    // ── Premium ───────────────────────────────────────────────────────────────
    isPremium: { type: Boolean, default: false },
    premiumSince: { type: Date },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },

    // ── Daily Limits ──────────────────────────────────────────────────────────
    swipesUsed: { type: Number, default: 0 },
    swipesResetAt: { type: Date, default: Date.now },
    superLikesUsed: { type: Number, default: 0 },
    superLikesResetAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (pwd) {
  return bcrypt.compare(pwd, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.swipedRight;
  delete obj.swipedLeft;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
