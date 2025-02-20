const express = require("express");
const router = express.Router();

let productModel = require("../models/product-model");
const { logOut } = require("../controllers/authController");
// const { router } = require("./userRouter");
const isLogedIn = require("../middlewares/isLogedIn");
const userModel = require("../models/user-model");

router.get("/", (req, res) => {
  let error = req.flash("error");
  res.render("index", { error, loggedin: false });
});

router.get("/shop", isLogedIn, async (req, res) => {
  let products = await productModel.find();
  let success = req.flash("success");
  res.render("shop", { products, success });
});

router.get("/addtocart/:id", isLogedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  user.cart.push(req.params.id);
  await user.save();
  req.flash("success", "added to the cart");
  res.redirect("/cart");
});
router.get("/cart", isLogedIn, async (req, res) => {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("cart");
  let bill = 0;
  let discount = 0;
  user.cart.forEach((e) => {
    bill += e.price;
    discount += e.discount;
  });

  res.render("cart", { user, bill, discount });
});

router.get("/deletefromcart/:id", isLogedIn, async (req, res) => {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("cart");
  user.cart = user.cart.filter((item) => item._id.toString() !== req.params.id);
  await user.save();
  res.redirect("/cart");
});
router.get("/logout", logOut);
module.exports = router;
