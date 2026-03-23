const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Check for MONGO_URI (deployment default) or MONGO_URL (user's current .env)
    // Also toggle between local and cloud based on USE_CLOUD
    let mongoURI = process.env.MONGO_URI || process.env.MONGO_URL;

    // Use LOCAL if USE_CLOUD is explicitly set to false
    if (process.env.USE_CLOUD === "false" && process.env.MONGO_LOCAL) {
      mongoURI = process.env.MONGO_LOCAL;
    }

    if (!mongoURI) {
      throw new Error("MongoDB connection string not defined (MONGO_URI or MONGO_URL)");
    }

    await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected 🌍 (${process.env.USE_CLOUD === "true" ? "Cloud" : "Local/Default"})`);
  } catch (error) {
    console.error("MongoDB Connection Error: ", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;