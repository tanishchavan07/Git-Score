const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri =
      process.env.USE_CLOUD === "true"
        ? process.env.MONGO_CLOUD
        : process.env.MONGO_LOCAL;

    await mongoose.connect(uri);

    console.log(
      `MongoDB Connected: ${
        process.env.USE_CLOUD === "true" ? "CLOUD 🌍" : "LOCAL 💻"
      }`
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;