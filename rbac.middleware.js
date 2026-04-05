/**
 * middleware/rbac.middleware.js
 *
 * Role-Based Access Control (RBAC) middleware.
 * Used AFTER the `protect` middleware (which sets req.user).
 *
 * Roles hierarchy:
 *   viewer   → read-only access to transactions & dashboard
 *   analyst  → viewer + analytics / advanced dashboard access
 *   admin    → full access including user management
 *
 * Usage in routes:
 *   router.get("/users", protect, authorize("admin"), ...)
 *   router.get("/analytics", protect, authorize("analyst", "admin"), ...)
 */

const ApiError = require("../utils/ApiError");

/**
 * @param  {...string} roles - Allowed roles for the route
 * @returns Express middleware
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required."));
  }

  if (!roles.includes(req.user.role)) {
    return next(
      new ApiError(
        403,
        `Access denied. Required role(s): ${roles.join(", ")}. Your role: ${req.user.role}.`
      )
    );
  }

  next();
};

module.exports = { authorize };
