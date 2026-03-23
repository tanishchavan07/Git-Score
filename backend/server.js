const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db"); 

dotenv.config();

const app = express();

// connect DB
connectDB();

// middleware
const allowedOrigins = [
  "http://localhost:3000",
  "https://git-score.vercel.app",
  "https://git-score-fggvmsdsm-tanishchavan06-3441s-projects.vercel.app",
  "https://git-score-sandy.vercel.app",
  process.env.FRONTEND_URL, // From .env
].filter(Boolean); // Remote false values if FRONTEND_URL is not set

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(o =>
      origin.startsWith(o)
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// routes
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const gitRoutes = require("./routes/gitRoutes")
const leaderboardRoutes = require("./routes/leaderboardRoutes")
// test route
app.get("/", (req, res) => {
  res.send("API is running ");
});

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/git", gitRoutes);
app.use("/leaderboard", leaderboardRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  
  console.log(`Server running on port ${PORT}`);
});