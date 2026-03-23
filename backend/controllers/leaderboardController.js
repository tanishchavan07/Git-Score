const GitAccount = require("../models/GitAccount");

// Simple in-memory cache for Global Leaderboard (5 mins)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

exports.getGlobalLeaderboard = async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Cache key specific to role, page, limit
    const cacheKey = `global_${role || "all"}_${pageNum}_${limitNum}`;

    // Return cache if valid
    if (cache.has(cacheKey)) {
      const cachedEntry = cache.get(cacheKey);
      if (Date.now() - cachedEntry.timestamp < CACHE_TTL) {
        return res.json({ cached: true, ...cachedEntry.data });
      } else {
        cache.delete(cacheKey);
      }
    }

    // Build filter query
    const filter = {};
    if (role) {
      filter["role.primary"] = { $regex: new RegExp(`^${role}$`, "i") };
    }

    // Query DB
    const totalCount = await GitAccount.countDocuments(filter);
    
    // Efficiently Find, Sort, Select, Paginate
    const leaderboardData = await GitAccount.find(filter)
      .sort({ "score.total": -1 }) // Sort by score descending
      .select("username name avatar score.total role.primary followers publicRepos analyzedAt")
      .skip(skip)
      .limit(limitNum)
      .lean(); // Faster query returning plain js object

    // Add dynamic rank
    const leaderboardWithRank = leaderboardData.map((user, index) => ({
      ...user,
      rank: skip + index + 1
    }));

    const responseData = {
      leaderboard: leaderboardWithRank,
      totalCount,
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
    };

    // Save to cache
    cache.set(cacheKey, { timestamp: Date.now(), data: responseData });

    res.json({ cached: false, ...responseData });
  } catch (error) {
    console.error("Global Leaderboard Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getUserLeaderboard = async (req, res) => {
  try {
    // Requires Auth Middleware to populate req.user.id
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not Authorized" });
    }

    const { role, page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query specifically for user
    const filter = { user: req.user.id };
    if (role) {
      filter["role.primary"] = { $regex: new RegExp(`^${role}$`, "i") };
    }

    const totalCount = await GitAccount.countDocuments(filter);

    const leaderboardData = await GitAccount.find(filter)
      .sort({ "score.total": -1 })
      .select("username name avatar score.total role.primary followers publicRepos analyzedAt")
      .skip(skip)
      .limit(limitNum)
      .lean();

    const leaderboardWithRank = leaderboardData.map((user, index) => ({
      ...user,
      rank: skip + index + 1
    }));

    res.json({
      leaderboard: leaderboardWithRank,
      totalCount,
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (error) {
    console.error("User Leaderboard Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
