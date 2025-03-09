// Load environment variables first
require("./config/init");

const express = require("express");
const app = express();
const db = require("./config/mongoose-connect");
const cookiParser = require("cookie-parser");
const path = require("path");
const expressSession = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const bcrypt = require("bcrypt");
const ownerModel = require("./models/owner-model");

// Security best practices
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1); // trust first proxy
  app.disable("x-powered-by"); // disable x-powered-by header
}

const port = process.env.PORT || 3000;
const ownerRouter = require("./routes/ownerRouter");
const userRouter = require("./routes/userRouter");
const winston = require("winston");
const productRouter = require("./routes/productRouter");
const indexRouter = require("./routes/index");

// Configure winston logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "error" : "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  next(err);
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookiParser());

// Session configuration
app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRET,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 24 * 60 * 60,
      autoRemove: "native",
      touchAfter: 24 * 3600,
      crypto: {
        secret: process.env.EXPRESS_SESSION_SECRET,
      },
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    },
  })
);

app.use(flash());

// Serve static files
const staticOptions = {
  maxAge: process.env.NODE_ENV === "production" ? "1d" : 0,
  etag: true,
};
app.use(express.static(path.join(__dirname, "public"), staticOptions));
app.set("view engine", "ejs");

// Create initial owner account if it doesn't exist
const createInitialOwner = async () => {
  try {
    const ownerExists = await ownerModel.findOne({
      email: process.env.OWNER_EMAIL,
    });
    if (!ownerExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);
      await ownerModel.create({
        fullname: "Admin",
        email: process.env.OWNER_EMAIL,
        password: hashedPassword,
      });
      console.log("Initial owner account created");
    }
  } catch (error) {
    console.error("Error creating initial owner:", error);
  }
};

// Call the function after database connection
db.once("connected", createInitialOwner);

// Routes
app.use("/owner", ownerRouter);
app.use("/user", userRouter);
app.use("/product", productRouter);
app.use("/", indexRouter);

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start server
app.listen(port, () => {
  console.log(
    `Server is running on port ${port} (${
      process.env.NODE_ENV || "development"
    } mode)`
  );
  logger.info(
    `Server is running on port ${port} (${
      process.env.NODE_ENV || "development"
    } mode)`
  );
});
