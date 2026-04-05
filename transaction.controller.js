/**
 * controllers/transaction.controller.js
 * Financial record CRUD — all user-scoped.
 */

const txService   = require("../services/transaction.service");
const ApiResponse = require("../utils/ApiResponse");

const getTransactions = async (req, res, next) => {
  try {
    const result = await txService.getTransactions(req.user._id, req.query);
    return ApiResponse.success(res, 200, "Transactions fetched.", result.transactions, result.meta);
  } catch (err) {
    next(err);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const tx = await txService.getTransactionById(req.params.id, req.user._id);
    return ApiResponse.success(res, 200, "Transaction fetched.", tx);
  } catch (err) {
    next(err);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const tx = await txService.createTransaction(req.user._id, req.body);
    return ApiResponse.success(res, 201, "Transaction created.", tx);
  } catch (err) {
    next(err);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const tx = await txService.updateTransaction(req.params.id, req.user._id, req.body);
    return ApiResponse.success(res, 200, "Transaction updated.", tx);
  } catch (err) {
    next(err);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const result = await txService.deleteTransaction(req.params.id, req.user._id);
    return ApiResponse.success(res, 200, "Transaction deleted.", result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
