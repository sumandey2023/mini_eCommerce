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
      return res.status(400).json({ message: "Email already exists" });
    }
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) res.send(err.message);
        else {
          let user = await userModel.create({
            name,
            email,
            password: hash,
          });
          let token = generateToken(user);
          res.cookie("token", token);
          res.redirect("/shop");
        }
      });
    });
  } catch (error) {
    console.log(error.massage);
  }
};

module.exports.loginUser = async (req, res) => {
  let { email, password } = req.body;
  if (email === process.env.OWNER_EMAIL) {
    let owner = await ownerModel.findOne({ email });

    bcrypt.compare(password, owner.password, (err, result) => {
      if (result) {
        let token = generateToken(owner);
        res.cookie("token", token);
        res.redirect("/owner/admin");
      } else {
        req.flash("error", "Email or password is incorrect");
        res.redirect("/");
      }
    });
  } else {
    let user = await userModel.findOne({ email });
    if (!user) {
      req.flash("error", "Email or password is incorrect");
      return res.redirect("/");
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        let token = generateToken(user);
        res.cookie("token", token);
        res.redirect("/shop");
      } else {
        req.flash("error", "Email or password is incorrect");
        res.redirect("/");
      }
    });
  }
};

module.exports.logOut = (req, res) => {
  res.cookie("token", "");
  res.redirect("/");
};
