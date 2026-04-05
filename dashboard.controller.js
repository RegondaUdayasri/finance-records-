/**
 * controllers/dashboard.controller.js
 * Analytics endpoints — powers the Finance Dashboard UI.
 * Analyst and Admin roles only (enforced in routes via RBAC middleware).
 */

const dashboardService = require("../services/dashboard.service");
const ApiResponse      = require("../utils/ApiResponse");

/** GET /dashboard/summary — total income, expenses, net balance */
const getSummary = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const summary = await dashboardService.getSummary(req.user._id, { dateFrom, dateTo });
    return ApiResponse.success(res, 200, "Dashboard summary fetched.", summary);
  } catch (err) {
    next(err);
  }
};

/** GET /dashboard/categories — category-wise totals */
const getCategoryTotals = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, type } = req.query;
    const data = await dashboardService.getCategoryTotals(req.user._id, { dateFrom, dateTo, type });
    return ApiResponse.success(res, 200, "Category totals fetched.", data);
  } catch (err) {
    next(err);
  }
};

/** GET /dashboard/trends — monthly income vs expense trends */
const getMonthlyTrends = async (req, res, next) => {
  try {
    const months = req.query.months ? parseInt(req.query.months) : 12;
    if (isNaN(months) || months < 1 || months > 36) {
      return res.status(400).json({
        success: false,
        message: "months must be a number between 1 and 36.",
      });
    }
    const data = await dashboardService.getMonthlyTrends(req.user._id, { months });
    return ApiResponse.success(res, 200, "Monthly trends fetched.", data);
  } catch (err) {
    next(err);
  }
};

/** GET /dashboard/recent — latest N transactions */
const getRecentTransactions = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const data  = await dashboardService.getRecentTransactions(req.user._id, limit);
    return ApiResponse.success(res, 200, "Recent transactions fetched.", data);
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary, getCategoryTotals, getMonthlyTrends, getRecentTransactions };
