const express = require("express");
const router = express.Router();
exports.router = router;
const {
  registerUser,
  loginUser,
  logOut,
} = require("../controllers/authController");
router.get("/", (req, res) => {
  res.send("Welcome to the home page");
});

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/logout", logOut);
module.exports = router;
