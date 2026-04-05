/**
 * routes/auth.routes.js
 *
 * Public routes (no auth required):
 *   POST /api/v1/auth/signup
 *   POST /api/v1/auth/login
 *
 * Protected route:
 *   GET  /api/v1/auth/me  → requires valid JWT
 */

const router     = require("express").Router();
const controller = require("../controllers/auth.controller");
const { protect }        = require("../middleware/auth.middleware");
const { validateSignup, validateLogin } = require("../utils/validators/auth.validator");

router.post("/signup", validateSignup, controller.signup);
router.post("/login",  validateLogin,  controller.login);
router.get ("/me",     protect,        controller.getMe);

module.exports = router;
