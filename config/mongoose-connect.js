const mongoose = require("mongoose");
const dbgr = require("debug")("development: mongoose");

// Get MongoDB URI from environment variable
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://sdey99901:suman2023@sportsphere-db.suavd.mongodb.net/SportSphere-db?retryWrites=true&w=majority&appName=SportSphere-db";

// Configure mongoose options
const mongooseOptions = {
  serverSelectionTimeoutMS: 60000,
  socketTimeoutMS: 60000,
  autoIndex: true,
  maxPoolSize: 50,
  minPoolSize: 10,
  family: 4,
  retryWrites: true,
  retryReads: true,
  connectTimeoutMS: 60000,
};

// Create connection function with retries
const connectDB = async (retryCount = 0) => {
  try {
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);

    // Maximum 5 retries
    if (retryCount < 5) {
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff
      console.log(
        `Retrying connection in ${retryDelay / 1000} seconds... (Attempt ${
          retryCount + 1
        }/5)`
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return connectDB(retryCount + 1);
    } else {
      console.error("Failed to connect to MongoDB after 5 attempts");
      process.exit(1);
    }
  }
};

// Connect to database with initial connection
connectDB().catch((error) => {
  console.error("Initial connection error:", error);
  process.exit(1);
});

// Handle connection events
mongoose.connection.on("connected", () => {
  console.log(
    `Mongoose connected to MongoDB (${
      process.env.NODE_ENV || "development"
    } mode)`
  );
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected - attempting to reconnect...");
  connectDB().catch(console.error);
});

// Handle application termination
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});

// Handle unexpected errors
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

module.exports = mongoose.connection;
