const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  orderItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "product" }],
  contact: String,
  address: String,
  payment: String,
  total: Number,
  status: {
    type: String,
    default: "Processing", // Can be "Processing", "Shipped", "Delivered"
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("order", orderSchema);
