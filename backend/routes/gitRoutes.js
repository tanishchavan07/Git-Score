const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { analyzeUser, toggleSave, toggleLike } = require("../controllers/gitController");

router.get("/search/:username", protect, analyzeUser);
router.post("/save/:username", protect, toggleSave);
router.post("/like/:username", protect, toggleLike);

module.exports = router;