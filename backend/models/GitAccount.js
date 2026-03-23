const mongoose = require("mongoose");

const gitAccountSchema = new mongoose.Schema(
  {
    // 🔗 reference to your user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // 👤 basic github info
    username: String,
    name: String,
    avatar: String,
    bio: String,
    location: String,
    followers: Number,
    following: Number,
    publicRepos: Number,
    profileUrl: String,

    // 📊 repo stats
    totalStars: Number,
    totalForks: Number,
    totalOpenIssues: Number,
    topRepo: String,

    // 🧠 language breakdown
    languages: [
      {
        name: String,
        percentage: Number,
      },
    ],

    primaryLanguage: String,

    // ⚡ activity
    recentCommits: Number,
    activeDays: Number,
    lastActive: Date,

    // 🧮 productivity score
    score: {
      total: Number, // 0–100
      reposScore: Number,
      starsScore: Number,
      activityScore: Number,
      consistencyScore: Number,
      profileScore: Number,
    },

    level: {
      type: String, // Beginner / Intermediate / Pro
    },

    // 🧠 role detection
    role: {
      primary: String, // Full Stack, Backend, etc.
      source: {
        type: String,
        enum: ["user", "ai"],
        default: "ai",
      }, // Track if role was explicitly set by user or AI
      secondary: String,
      confidence: String, // high / low
    },

    // 💡 insights (auto generated)
    insights: [String],

    // 📈 improvement suggestions
    improvements: [String],

    // ⭐ useful flags
    isTrending: Boolean,
    isConsistent: Boolean,
    isBeginnerFriendly: Boolean,

    // 📌 user actions
    savedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    saveCount: { type: Number, default: 0 },

    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    likeCount: { type: Number, default: 0 },

    // ⏱️ tracking
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GitAccount", gitAccountSchema);