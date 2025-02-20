const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const ownerModel = require("../models/owner-model");
const isLogedIn = require("../middlewares/isLogedIn");
const productModel = require("../models/product-model");

if (process.env.NODE_ENV) {
  router.post("/create", async (req, res) => {
    let owner = await ownerModel.find();

    if (owner.length > 0) {
      res.status(503).send("Owner already exists");
    } else {
      let { fullname, email, password } = req.body;
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
          if (err) res.send(err.message);
          else {
            let createdOwner = await ownerModel.create({
              fullname,
              email,
              password: hash,
            });
          }
        });
      });
    }
  });
}

router.get("/admin", isLogedIn, (req, res) => {
  let success = req.flash("success");
  res.render("createproducts", { success });
});

router.get("/allProducts", isLogedIn, async (req, res) => {
  let products = await productModel.find();
  res.render("allProducts", { products });
});

router.get("/deleteProduct/:id", isLogedIn, async (req, res) => {
  let products = await productModel.findOneAndDelete({ _id: req.params.id });
  res.redirect("/owner/allProducts");
});
module.exports = router;
