/**
 * routes/transaction.routes.js
 * All routes require authentication (any role can manage their own transactions).
 *
 *   GET    /api/v1/transactions          → list (with filters: dateFrom, dateTo, type, category)
 *   GET    /api/v1/transactions/:id      → get single
 *   POST   /api/v1/transactions          → create
 *   PATCH  /api/v1/transactions/:id      → update
 *   DELETE /api/v1/transactions/:id      → delete
 *
 * Query params for GET /:
 *   ?page=1&limit=20
 *   &dateFrom=2024-01-01&dateTo=2024-12-31
 *   &type=expense
 *   &category=Food
 */

const router     = require("express").Router();
const controller = require("../controllers/transaction.controller");
const { protect }  = require("../middleware/auth.middleware");
const {
  validateCreateTransaction,
  validateUpdateTransaction,
} = require("../utils/validators/transaction.validator");

// All transaction routes require a valid JWT
router.use(protect);

router.get   ("/",    controller.getTransactions);
router.get   ("/:id", controller.getTransactionById);
router.post  ("/",    validateCreateTransaction, controller.createTransaction);
router.patch ("/:id", validateUpdateTransaction, controller.updateTransaction);
router.delete("/:id", controller.deleteTransaction);

module.exports = router;
