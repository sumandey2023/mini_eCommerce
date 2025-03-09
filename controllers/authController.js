const userModel = require("../models/user-model");
const ownerModel = require("../models/owner-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generateToken");
const isLogedIn = require("../middlewares/isLogedIn");

module.exports.registerUser = async (req, res) => {
  try {
    let { name, email, password } = req.body;
    let user = await userModel.findOne({ email });
    if (user) {
      req.flash("error", "Email already exists");
      return res.redirect("/");
    }
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) {
          req.flash("error", "Registration failed");
          return res.redirect("/");
        }
        try {
          let user = await userModel.create({
            fullname: name,
            email,
            password: hash,
          });
          let token = generateToken(user);
          res.cookie("token", token);
          res.redirect("/shop");
        } catch (error) {
          console.error("User creation error:", error);
          req.flash("error", "Registration failed");
          res.redirect("/");
        }
      });
    });
  } catch (error) {
    console.error("Registration error:", error);
    req.flash("error", "Registration failed");
    res.redirect("/");
  }
};

module.exports.loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (email === process.env.OWNER_EMAIL) {
      const owner = await ownerModel.findOne({ email });
      if (!owner) {
        req.flash("error", "Owner account not found");
        return res.redirect("/");
      }

      bcrypt.compare(password, owner.password, (err, result) => {
        if (err) {
          console.error("Password comparison error:", err);
          req.flash("error", "Login failed");
          return res.redirect("/");
        }
        if (result) {
          let token = generateToken(owner);
          res.cookie("token", token);
          return res.redirect("/owner/admin");
        } else {
          req.flash("error", "Invalid password");
          return res.redirect("/");
        }
      });
    } else {
      const user = await userModel.findOne({ email });
      if (!user) {
        req.flash("error", "User not found");
        return res.redirect("/");
      }

      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          console.error("Password comparison error:", err);
          req.flash("error", "Login failed");
          return res.redirect("/");
        }
        if (result) {
          let token = generateToken(user);
          res.cookie("token", token);
          return res.redirect("/shop");
        } else {
          req.flash("error", "Invalid password");
          return res.redirect("/");
        }
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    req.flash("error", "Login failed");
    return res.redirect("/");
  }
};

module.exports.logOut = (req, res) => {
  res.cookie("token", "");
  res.redirect("/");
};
