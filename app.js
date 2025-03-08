const express = require("express");
const app = express();
const db = require("./config/mongoose-connect");
const cookiParser = require("cookie-parser");
const path = require("path");
const expressSession = require("express-session");
const flash = require("connect-flash");
require("dotenv").config();
const port = process.env.PORT || 4000; // Temporarily hardcoded port
const ownerRouter = require("./routes/ownerRouter");
const userRouter = require("./routes/userRouter");
const winston = require("winston");
const productRouter = require("./routes/productRouter");
const indexRouter = require("./routes/index");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

app.use((req, res, next) => {
  logger.info(`Request: ${req.method} ${req.url}`);
  next();
});

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  next(err);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookiParser());

app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRET,
  })
);

app.use(flash());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.use("/owner", ownerRouter);
app.use("/user", userRouter);
app.use("/product", productRouter);
app.use("/", indexRouter);

app.listen(port, () => {
  // Removed req, res parameters as they're not needed
  console.log(`Server is running on port ${port}`);
  logger.info(`Server is running on port ${port}`);
});
