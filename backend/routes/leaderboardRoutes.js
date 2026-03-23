const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  getGlobalLeaderboard,
  getUserLeaderboard,
} = require("../controllers/leaderboardController");

router.get("/global", getGlobalLeaderboard);
router.get("/user", protect, getUserLeaderboard);

module.exports = router;
