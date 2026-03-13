require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
// const hpp = require("hpp");
const cors = require("cors");

const cookieParser = require("cookie-parser");

const connectDB = require("./config/mongo");
const { pgPool } = require("./config/postgres");

const authRoutes = require("./routes/auth");
const assignmentRoutes = require("./routes/assignments");
const queryRoutes = require("./routes/query");
const hintRoutes = require("./routes/hints");

const errorHandler = require("./middleware/errorHandler");

const app = express();

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter);


app.use(helmet());
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
    credentials: true,
    methods: ["GET", "POST"],
  })
);

app.use(express.json({ limit: "50kb" }));

app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/hints", hintRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;


// connect with mongodb and test postgres connection
(async () => {
  await connectDB();
  try {
    await pgPool.query("SELECT 1");
    console.log("✅ PostgreSQL connected");
  } catch (err) {
    console.log(err);
    console.error("❌ PostgreSQL connection failed:", err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`CipherSQL Studio backend running on port ${PORT}`);
  });
})();


// TODO
// clear sandbox table before as soon as request from client