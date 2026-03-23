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
  "https://git-score-sandy.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,                // allow cookies
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