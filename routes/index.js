const express = require("express");
const router = express.Router();

let productModel = require("../models/product-model");
const { logOut } = require("../controllers/authController");
// const { router } = require("./userRouter");
const isLogedIn = require("../middlewares/isLogedIn");
const userModel = require("../models/user-model");
let orderModel = require("../models/order-model");
router.get("/", (req, res) => {
  let error = req.flash("error");
  res.render("index", { error, loggedin: false });
});

router.get("/shop", isLogedIn, async (req, res) => {
  try {
    let query = {};
    let sortOption = {};
    const { sortby, category, search } = req.query;

    // Apply search filter if provided
    if (search) {
      query.name = { $regex: search, $options: "i" }; // Case-insensitive search
    }

    // Apply category filter if selected
    if (category && category !== "all") {
      query.category = category;
    }

    // Apply sorting
    if (sortby === "newest") {
      sortOption = { createdAt: -1 };
    } else if (sortby === "price-low") {
      sortOption = { price: 1 };
    } else if (sortby === "price-high") {
      sortOption = { price: -1 };
    } else if (sortby === "discount") {
      sortOption = { discount: -1 };
    }

    // Get all products with filters
    let products = await productModel.find(query).sort(sortOption);

    // Get unique categories for filter
    const categories = await productModel.distinct("category");

    let success = req.flash("success");
    res.render("shop", {
      products,
      success,
      categories,
      activeCategory: category || "all",
      activeSortBy: sortby || "popular",
      searchQuery: search || "", // Pass search query back to view
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.get("/addtocart/:id", isLogedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  user.cart.push(req.params.id);
  await user.save();

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
router.post("/addPayment", isLogedIn, async (req, res) => {
  res.render("checkout", { user: req.user });
});
router.post("/checkout", isLogedIn, async (req, res) => {
  try {
    const { fullname, address, contact, payment } = req.body;
    let user = await userModel
      .findOne({ email: req.user.email })
      .populate("cart");

    let products = user.cart;
    let bill = 0;
    let discount = 0;
    products.forEach((e) => {
      bill += e.price;
      discount += e.discount;
    });

    let total = bill - discount;

    // Create order with user's email from session
    const newOrder = await orderModel.create({
      fullname,
      email: req.user.email,
      orderItems: products,
      contact,
      address,
      payment,
      total,
      status: "Processing",
      orderDate: new Date(),
    });

    // Clear cart after order
    user.cart = [];
    await user.save();

    req.flash("success", "Order placed successfully");
    res.redirect("/shop");
  } catch (err) {
    req.flash("error", "Failed to place order");
    res.redirect("/cart");
  }
});
router.get("/owner/orders", isLogedIn, async (req, res) => {
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
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.post("/owner/delete-order/:orderId", isLogedIn, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    await orderModel.findByIdAndDelete(orderId);
    req.flash("success", "Order deleted successfully");
    res.redirect("/owner/orders");
  } catch (err) {
    req.flash("error", "Failed to delete order");
    res.redirect("/owner/orders");
  }
});

router.get("/logout", logOut);

// Add this new route for user orders
router.get("/user/orders", isLogedIn, async (req, res) => {
  try {
    let userOrders = await orderModel
      .find({ email: req.user.email })
      .populate("orderItems")
      .sort({ orderDate: -1 });

    let formattedOrders = userOrders.map((order) => ({
      orderId: order._id,
      date: order.orderDate || order.createdAt || new Date(),
      products: order.orderItems.map((item) => ({
        name: item.name,
      })),
      totalAmount: order.total,
      status: order.payment || "Processing",
      address: order.address,
    }));

    res.render("userOrders", { orders: formattedOrders });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;
