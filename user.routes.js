/**
 * routes/user.routes.js
 * All routes require authentication + admin role.
 *
 *   GET    /api/v1/users          → list all users (paginated, filterable)
 *   GET    /api/v1/users/:id      → get single user
 *   PATCH  /api/v1/users/:id      → update role/status
 *   DELETE /api/v1/users/:id      → delete user + all their transactions
 */

const router     = require("express").Router();
const controller = require("../controllers/user.controller");
const { protect }        = require("../middleware/auth.middleware");
const { authorize }      = require("../middleware/rbac.middleware");
const { validateUpdateUser } = require("../utils/validators/user.validator");

// All user management routes require authentication AND admin role
router.use(protect, authorize("admin"));

router.get   ("/",    controller.getAllUsers);
router.get   ("/:id", controller.getUserById);
router.patch ("/:id", validateUpdateUser, controller.updateUser);
router.delete("/:id", controller.deleteUser);

module.exports = router;
