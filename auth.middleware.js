/**
 * middleware/auth.middleware.js
 *
 * Verifies the Bearer JWT in the Authorization header.
 * Attaches the decoded user payload to req.user.
 *
 * Flow:
 *   1. Extract token from "Authorization: Bearer <token>"
 *   2. Verify with JWT_SECRET
 *   3. Fetch user from DB (ensures user still exists + is active)
 *   4. Attach user to req.user and call next()
 */

const jwt  = require("jsonwebtoken");
const User = require("../models/User.model");
const ApiError = require("../utils/ApiError");

const protect = async (req, res, next) => {
  try {
    // 1. Extract token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Access denied. No token provided.");
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify token signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new ApiError(401, err.name === "TokenExpiredError"
        ? "Token expired. Please log in again."
        : "Invalid token.");
    }

    // 3. Fetch user — confirms account still exists and is active
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      throw new ApiError(401, "User associated with this token no longer exists.");
    }
    if (user.status === "inactive") {
      throw new ApiError(403, "Your account has been deactivated. Contact an admin.");
    }

    // 4. Attach user to request for downstream use
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { protect };
