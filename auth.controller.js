/**
 * controllers/auth.controller.js
 * Handles HTTP for signup and login.
 * All business logic lives in auth.service.js.
 */

const authService  = require("../services/auth.service");
const ApiResponse  = require("../utils/ApiResponse");

const signup = async (req, res, next) => {
  try {
    const { user, token } = await authService.signup(req.body);
    return ApiResponse.success(res, 201, "Account created successfully.", { user, token });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);
    return ApiResponse.success(res, 200, "Login successful.", { user, token });
  } catch (err) {
    next(err);
  }
};

/** Returns the currently authenticated user's profile */
const getMe = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware
    return ApiResponse.success(res, 200, "Profile fetched.", req.user);
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, getMe };
