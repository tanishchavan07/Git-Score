const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const GitAccount = require("../models/GitAccount");

const { editProfile, logoutUser, changePassword } = require("../controllers/userController");

// ─── Dashboard: All analyzed profiles for this user ──────────────────────────
router.get("/dashboard", protect, async (req, res) => {
  try {
    const data = await GitAccount.find({ user: req.user.id })
      .sort({ analyzedAt: -1 })
      .lean();
    res.json(data);
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Saved profiles: profiles saved by this user ─────────────────────────────
router.get("/saved", protect, async (req, res) => {
  try {
    const data = await GitAccount.find({ savedBy: req.user.id })
      .sort({ updatedAt: -1 })
      .lean();
    res.json(data);
  } catch (err) {
    console.error("Saved profiles error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Liked profiles: profiles liked by this user ──────────────────────────────
router.get("/liked", protect, async (req, res) => {
  try {
    const data = await GitAccount.find({ likedBy: req.user.id })
      .sort({ updatedAt: -1 })
      .lean();
    res.json(data);
  } catch (err) {
    console.error("Liked profiles error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Profile Management ───────────────────────────────────────────────────────
router.put("/edit-profile", protect, editProfile);
router.put("/change-password", protect, changePassword);
router.post("/logout", logoutUser);

module.exports = router;
