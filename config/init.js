require("dotenv").config();

// Validate required environment variables
const requiredEnvVars = [
  "MONGODB_URI",
  "JWT_KEY",
  "EXPRESS_SESSION_SECRET",
  "OWNER_EMAIL",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(
      `FATAL ERROR: ${envVar} is not defined in environment variables`
    );
    process.exit(1);
  }
}

module.exports = process.env;
