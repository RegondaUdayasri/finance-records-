/**
 * controllers/user.controller.js
 * Admin-only user management endpoints.
 */

const userService = require("../services/user.service");
const ApiResponse = require("../utils/ApiResponse");

const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, role, status } = req.query;
    const result = await userService.getAllUsers({ page, limit, role, status });
    return ApiResponse.success(res, 200, "Users fetched.", result.users, result.meta);
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return ApiResponse.success(res, 200, "User fetched.", user);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.user._id);
    return ApiResponse.success(res, 200, "User updated.", user);
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const result = await userService.deleteUser(req.params.id, req.user._id);
    return ApiResponse.success(res, 200, "User and all their data deleted.", result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
