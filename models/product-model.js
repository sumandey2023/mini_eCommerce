const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: Buffer,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: true,
    enum: ["Cricket", "Football", "Basketball", "Fitness", "Other"],
  },
  bgcolor: {
    type: String,
    required: true,
  },
  panelcolor: {
    type: String,
    required: true,
  },
  textcolor: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("product", productSchema);
