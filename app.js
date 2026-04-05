/**
 * app.js — Express application setup
 * Registers middleware, routes, and global error handler
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const transactionRoutes = require("./routes/transaction.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const ApiError = require("./utils/ApiError");

const app = express();

// ─── Security & Utility Middleware ───────────────────────────────────────────
app.use(helmet());                        // Sets secure HTTP headers
app.use(cors());                          // Enable CORS for all origins (restrict in prod)
app.use(express.json());                  // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));                 // HTTP request logger
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/v1/auth",         authRoutes);
app.use("/api/v1/users",        userRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/dashboard",    dashboardRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Catches all errors thrown/passed via next(err) throughout the app
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message    = err.message    || "Internal Server Error";

  // Log stack trace only in development
  if (process.env.NODE_ENV === "development") {
    console.error("❌ Error:", err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;
