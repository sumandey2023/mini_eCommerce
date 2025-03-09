const mongoose = require("mongoose");
const config = require("config");
const dbgr = require("debug")("development: mongoose");

// Get MongoDB URI from environment variable in production, fallback to config
let MONGODB_URI = process.env.MONGODB_URI || config.get("MONGODB_URI");

// Validate MongoDB URI format
if (!MONGODB_URI) {
  console.error("FATAL ERROR: MONGODB_URI is not defined");
  process.exit(1);
}

// Ensure URI starts with mongodb:// or mongodb+srv://
if (
  !MONGODB_URI.startsWith("mongodb://") &&
  !MONGODB_URI.startsWith("mongodb+srv://")
) {
  MONGODB_URI = `mongodb://${MONGODB_URI}`;
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB...");
    dbgr("Connected to MongoDB...");
  })
  .catch((err) => {
    console.error("Could not connect to MongoDB...", err);
    dbgr("Could not connect to MongoDB...", err);
    process.exit(1);
  });

module.exports = mongoose.connection;
