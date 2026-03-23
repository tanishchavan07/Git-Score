require('dotenv').config({ path: 'd:/Tanish/Git-Score/backend/.env' });
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let mongoURI = process.env.MONGO_URI || process.env.MONGO_URL;

    if (process.env.USE_CLOUD === "false" && process.env.MONGO_LOCAL) {
      mongoURI = process.env.MONGO_LOCAL;
    }

    if (!mongoURI) {
      throw new Error("MongoDB connection string not defined (MONGO_URI or MONGO_URL)");
    }

    console.log(`Attempting to connect to: ${mongoURI ? mongoURI.split('@').pop() : 'undefined'}`);
    await mongoose.connect(mongoURI);

    console.log(`\n\n✅ MongoDB Connected Successfully (${process.env.USE_CLOUD === "true" ? "Cloud" : "Local/Default"})\n\n`);
    process.exit(0);
  } catch (error) {
    console.error("\n\n❌ MongoDB Connection Error: ", error.message, "\n\n");
    process.exit(1);
  }
};

connectDB();
