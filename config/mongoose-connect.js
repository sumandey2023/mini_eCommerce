const mongoose = require("mongoose");
const config = require("config");
const dbgr = require("debug")("development: mongoose");
mongoose
  // .connect(`${config.get("MONGODB_URI")}/SportSphere`)
  .connect(`${config.get("MONGODB_URI")}`)
  .then(() => dbgr("Connected to MongoDB..."))
  .catch((err) => dbgr("Could not connect to MongoDB...", err));

module.exports = mongoose.connection;
