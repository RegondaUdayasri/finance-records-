/**
 * routes/dashboard.routes.js
 * Analytics routes — restricted to analyst and admin roles.
 * Viewers cannot access these endpoints.
 *
 *   GET /api/v1/dashboard/summary
 *     ?dateFrom=2024-01-01&dateTo=2024-12-31
 *     → { totalIncome, totalExpenses, netBalance, transactionCount }
 *
 *   GET /api/v1/dashboard/categories
 *     ?dateFrom=...&dateTo=...&type=expense
 *     → [{ category, type, total, count }]
 *
 *   GET /api/v1/dashboard/trends
 *     ?months=12
 *     → [{ monthLabel, income, expenses, netBalance, transactions }]
 *
 *   GET /api/v1/dashboard/recent
 *     ?limit=10
 *     → [Transaction]
 */

const router     = require("express").Router();
const controller = require("../controllers/dashboard.controller");
const { protect }   = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/rbac.middleware");

// All dashboard routes: must be logged in AND be analyst or admin
router.use(protect, authorize("analyst", "admin"));

router.get("/summary",    controller.getSummary);
router.get("/categories", controller.getCategoryTotals);
router.get("/trends",     controller.getMonthlyTrends);
router.get("/recent",     controller.getRecentTransactions);

module.exports = router;
