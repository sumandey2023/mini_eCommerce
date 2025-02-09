const express = require("express");
const app = express();
const db = require("./config/mongoose-connect");

const cookiParser = require("cookie-parser");
const path = require("path");
const ownerRouter = require("./routes/ownerRouter");
const userRouter = require("./routes/userRouter");
const productRouter = require("./routes/productRouter");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookiParser());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.use("/owner", ownerRouter);
app.use("/user", userRouter);
app.use("/product", productRouter);

app.listen(3000);
