const axios = require("axios");
const GitAccount = require("../models/GitAccount");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const calculateScore = (userData, repos, totalStars) => {
  const repoCount = repos.length;
  
  // 1. Repos Score (Max 20)
  // 50 repos for max score
  const reposScore = repoCount === 0 ? 0 : Math.min((repoCount / 50) * 20, 20);

  // 2. Stars Score (Max 20)
  // 100 stars for max score
  const starsScore = repoCount === 0 ? 0 : Math.min((totalStars / 100) * 20, 20);

  // 3. Profile Completeness (Max 20)
  let profileScore = 0;
  if (userData.name) profileScore += 5;
  if (userData.bio) profileScore += 5;
  if (userData.location) profileScore += 5;
  if (userData.blog || userData.twitter_username) profileScore += 5;

  // 4. Activity Score (Max 20) - based on recently updated repos (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentActiveRepos = repos.filter(r => new Date(r.updated_at) > thirtyDaysAgo).length;
  
  // 5 active repos in 30 days for max activity score
  const activityScore = repoCount === 0 ? 0 : Math.min((recentActiveRepos / 5) * 20, 20);

  // 5. Consistency Score (Max 20) - based on activity frequency and repo maintenance
  // Consistency = (Volume of recent activity) + (Maintenance Ratio)
  let consistencyScore = 0;
  if (repoCount > 0) {
    const maintenanceRatio = recentActiveRepos / repoCount;
    const volumeScore = Math.min(recentActiveRepos / 3, 1) * 10; // Max 10 pts for 3+ recent repos
    const ratioScore = maintenanceRatio * 10; // Max 10 pts for high maintenance ratio
    consistencyScore = volumeScore + ratioScore;
  }
  consistencyScore = Math.min(consistencyScore, 20);

  const total = reposScore + starsScore + profileScore + activityScore + consistencyScore;

  return {
    total: Math.round(total),
    reposScore: Math.round(reposScore),
    starsScore: Math.round(starsScore),
    profileScore: Math.round(profileScore),
    activityScore: Math.round(activityScore),
    consistencyScore: Math.round(consistencyScore)
  };
};

exports.analyzeUser = async (req, res) => {
  try {
    let { username } = req.params;
    const userRole = req.query.role || req.body?.role;

    if (username) {
        username = decodeURIComponent(username);
    }

    if (username.includes("github.com/")) {
        const urlParts = username.split("github.com/");
        username = urlParts[1].split("/")[0].split("?")[0];
    } else if (username.startsWith("@")) {
        username = username.substring(1);
    }
    username = username.trim();

    if (!username) {
      return res.status(400).json({ message: "GitHub username is required" });
    }

    const currentUserId = req.user?.id || null;
    const force = req.query.force === 'true';

    console.log("Re-analyzing user:", username);
    console.log("Using cache:", !force);

    // 🕒 Check existing PERSONAL record and cache logic (24 hours)
    let existingAccount = await GitAccount.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, "i") },
      user: currentUserId 
    });
    
    if (existingAccount) {
      if (userRole && existingAccount.role?.primary !== userRole) {
        if (!existingAccount.role) existingAccount.role = {};
        existingAccount.role.primary = userRole;
        existingAccount.role.source = "user";
        await existingAccount.save();
      }

      if (!force && existingAccount.analyzedAt) {
        const hoursSinceLastUpdate = (Date.now() - existingAccount.analyzedAt) / (1000 * 60 * 60);
        if (hoursSinceLastUpdate < 24) {
          return res.json({
            cached: true,
            hoursAgo: Math.round(hoursSinceLastUpdate),
            saved: existingAccount,
            ai: {
              role: existingAccount.role?.primary || "Unknown",
              strengths: existingAccount.insights,
              improvements: existingAccount.improvements,
              summary: "Loaded from personal cache"
            }
          });
        }
      }
    } else if (!force) {
      // 🌐 Check GLOBAL record if personal does not exist
      const globalAccount = await GitAccount.findOne({ 
        username: { $regex: new RegExp(`^${username}$`, "i") } 
      }).sort({ analyzedAt: -1 });

      if (globalAccount && globalAccount.analyzedAt) {
        const hoursSinceLastUpdate = (Date.now() - globalAccount.analyzedAt) / (1000 * 60 * 60);
        if (hoursSinceLastUpdate < 24) {
          // Clone it for the current user
          const newAccountData = globalAccount.toObject();
          delete newAccountData._id;
          delete newAccountData.createdAt;
          delete newAccountData.updatedAt;
          
          newAccountData.user = currentUserId;
          newAccountData.analyzedAt = new Date();
          
          if (userRole) {
            if (!newAccountData.role) newAccountData.role = {};
            newAccountData.role.primary = userRole;
            newAccountData.role.source = "user";
          }

          const clonedAccount = await GitAccount.create(newAccountData);
          
          return res.json({
            cached: true,
            hoursAgo: Math.round(hoursSinceLastUpdate),
            saved: clonedAccount,
            ai: {
              role: clonedAccount.role?.primary || "Unknown",
              strengths: clonedAccount.insights,
              improvements: clonedAccount.improvements,
              summary: "Loaded from global cache"
            }
          });
        }
      }
    }

    // 🔹 Fetch GitHub data
    let userRes, reposRes;
    try {
      userRes = await axios.get(`https://api.github.com/users/${username}`);
      reposRes = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    } catch (githubErr) {
      return res.status(githubErr.response?.status || 500).json({ 
        message: "Failed to fetch data from GitHub API", 
        details: githubErr.response?.data?.message || githubErr.message 
      });
    }

    const userData = userRes.data;
    const repos = reposRes.data;

    // 🔹 Calculate metrics
    const totalStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
    const totalForks = repos.reduce((acc, repo) => acc + repo.forks_count, 0);
    const totalOpenIssues = repos.reduce((acc, repo) => acc + repo.open_issues_count, 0);

    const langCount = {};
    repos.forEach((repo) => {
      if (repo.language) {
        langCount[repo.language] = (langCount[repo.language] || 0) + 1;
      }
    });

    const sortedLangs = Object.keys(langCount).sort((a, b) => langCount[b] - langCount[a]);
    const primaryLanguage = sortedLangs.length > 0 ? sortedLangs[0] : "None";

    const languages = sortedLangs.map((lang) => ({
      name: lang,
      percentage: Number(((langCount[lang] / repos.length) * 100).toFixed(2)),
    }));

    // Calculate Scores
    const score = calculateScore(userData, repos, totalStars);
    
    // Determine level
    let level = "Beginner";
    if (score.total >= 80) level = "Pro";
    else if (score.total >= 40) level = "Intermediate";

    // 🔥 AI Generation
    let aiData;
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `You are an AI that analyzes GitHub profiles and returns ONLY valid JSON.
Do NOT include markdown, explanation, or extra text.
Return strictly in this format:
{
  "role": "string (e.g., Frontend Developer, Full Stack)",
  "strengths": ["string", "string"],
  "weaknesses": ["string"],
  "improvements": ["string", "string"],
  "summary": "string"
}
Data:
Followers: ${userData.followers}
Repos: ${repos.length}
Stars: ${totalStars}
Languages: ${JSON.stringify(languages)}
Bio: ${userData.bio || "None"}
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
      aiData = JSON.parse(text);
    } catch (aiErr) {
      console.warn("AI Parsing or API failed:", aiErr.message);
      aiData = {
        role: "Developer",
        strengths: ["Active GitHub user"],
        weaknesses: [],
        improvements: ["Add more detailed repository descriptions", "Increase open source contributions"],
        summary: "Profile analysis unavailable due to AI limits."
      };
    }

    // 💾 Upsert in DB
    const updateData = {
      user: currentUserId,
      username: userData.login,
      name: userData.name || userData.login,
      avatar: userData.avatar_url,
      bio: userData.bio,
      location: userData.location,
      followers: userData.followers,
      following: userData.following,
      publicRepos: userData.public_repos,
      profileUrl: userData.html_url,
      totalStars,
      totalForks,
      totalOpenIssues,
      languages,
      primaryLanguage,
      recentCommits: repos.length,
      score,
      level,
      role: {
        primary: userRole || aiData.role,
        source: userRole ? "user" : "ai",
      },
      insights: aiData.strengths,
      improvements: aiData.improvements,
      analyzedAt: new Date()
    };

    const saved = await GitAccount.findOneAndUpdate(
      { 
        username: new RegExp(`^${userData.login}$`, "i"),
        user: currentUserId
      },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({
      cached: false,
      saved,
      ai: aiData,
      isSaved: saved.savedBy?.includes(currentUserId) || false,
      isLiked: saved.likedBy?.includes(currentUserId) || false,
    });
  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({ message: "Internal Server Error", details: error.message });
  }
};

// @desc    Toggle Save/Unsave Profile
// @route   POST /git/save/:username
// @access  Private
exports.toggleSave = async (req, res) => {
  try {
    const { username } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Not authorized" });

    // Find any existing record of this profile globally to check status
    const account = await GitAccount.findOne({ username: new RegExp(`^${username}$`, "i") });
    if (!account) return res.status(404).json({ message: "GitHub profile not found. Analyze it first." });

    const isSaved = account.savedBy?.includes(userId);

    const updateOp = isSaved 
      ? { $pull: { savedBy: userId }, $inc: { saveCount: -1 } }
      : { $addToSet: { savedBy: userId }, $inc: { saveCount: 1 } };

    // Efficiently update ALL associated copies of this username to keep global states perfectly synced
    await GitAccount.updateMany({ username: new RegExp(`^${username}$`, "i") }, updateOp);

    res.json({
      success: true,
      isSaved: !isSaved,
      saveCount: account.saveCount + (isSaved ? -1 : 1),
      message: !isSaved ? "Profile saved" : "Profile unsaved"
    });
  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Toggle Like/Unlike Profile
// @route   POST /git/like/:username
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const { username } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Not authorized" });

    const account = await GitAccount.findOne({ username: new RegExp(`^${username}$`, "i") });
    if (!account) return res.status(404).json({ message: "GitHub profile not found. Analyze it first." });

    const isLiked = account.likedBy?.includes(userId);

    const updateOp = isLiked 
      ? { $pull: { likedBy: userId }, $inc: { likeCount: -1 } }
      : { $addToSet: { likedBy: userId }, $inc: { likeCount: 1 } };

    await GitAccount.updateMany({ username: new RegExp(`^${username}$`, "i") }, updateOp);

    res.json({
      success: true,
      isLiked: !isLiked,
      likeCount: account.likeCount + (isLiked ? -1 : 1),
      message: !isLiked ? "Profile liked" : "Profile unliked"
    });
  } catch (error) {
    console.error("Like Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};