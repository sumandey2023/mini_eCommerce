const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const ownerModel = require("../models/owner-model");
const isLogedIn = require("../middlewares/isLogedIn");
const productModel = require("../models/product-model");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const orderModel = require("../models/order-model");

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
  res.render("createproducts", { path: "/owner/admin" });
});

router.get("/allProducts", isLogedIn, async (req, res) => {
  let products = await productModel.find();
  res.render("allProducts", { products, path: "/owner/allProducts" });
});

router.get("/orders", isLogedIn, async (req, res) => {
  try {
    let orders = await orderModel.find().populate("orderItems");
    let formattedOrders = orders.map((order) => ({
      orderId: order._id,
      customerName: order.fullname,
      email: order.email,
      contact: order.contact,
      address: order.address,
      products: order.orderItems.map((item) => ({
        name: item.name,
        quantity: 1,
      })),
      totalAmount: order.total,
      status: order.payment,
    }));

    const success = req.flash("success");
    const error = req.flash("error");

    res.render("orders", {
      orders: formattedOrders,
      success,
      error,
      path: "/owner/orders",
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.post("/create", isLogedIn, upload.single("image"), async (req, res) => {
  try {
    const { name, price, discount, category, bgcolor, panelcolor, textcolor } =
      req.body;

    await productModel.create({
      name,
      price,
      discount,
      category,
      image: req.file.buffer,
      bgcolor,
      panelcolor,
      textcolor,
    });

    req.flash("success", "Product created successfully");
    res.redirect("/owner/admin");
  } catch (err) {
    console.error("Error creating product:", err);
    req.flash("error", "Failed to create product");
    res.redirect("/owner/admin");
  }
});

router.post("/delete/:id", isLogedIn, async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.id);
    req.flash("success", "Product deleted successfully");
    res.redirect("/owner/allProducts");
  } catch (err) {
    req.flash("error", "Failed to delete product");
    res.redirect("/owner/allProducts");
  }
});

module.exports = router;
