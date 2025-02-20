const express = require("express");
const upload = require("../config/multer-config");
const router = express.Router();
const productModel = require("../models/product-model");

router.post("/create", upload.single("image"), async (req, res) => {
  try {
    let { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;
    let product = await productModel.create({
      name,
      price,
      discount,
      bgcolor,
      panelcolor,
      textcolor,
      image: req.file.buffer,
    });
    req.flash("success", "product created successfully");
    res.redirect("/owner/admin");
  } catch (error) {
    res.send(error.message);
  }
});
module.exports = router;
