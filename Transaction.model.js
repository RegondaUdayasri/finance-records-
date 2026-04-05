/**
 * models/Transaction.model.js
 *
 * Schema:
 *   - userId: references the User who owns this transaction
 *   - amount: positive number (in smallest currency unit or float)
 *   - type: "income" | "expense"
 *   - category: e.g. "Salary", "Food", "Rent" (free string + index)
 *   - date: when the transaction occurred
 *   - notes: optional free-text
 *
 * Indexes:
 *   - userId + date (for date-range dashboard queries)
 *   - type + category (for category-wise aggregations)
 */

const mongoose = require("mongoose");

const TYPES = ["income", "expense"];

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    type: {
      type: String,
      enum: TYPES,
      required: [true, "Type (income/expense) is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: 100,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ─── Compound indexes for common query patterns ───────────────────────────────
transactionSchema.index({ userId: 1, date: -1 });       // Date-range queries
transactionSchema.index({ userId: 1, type: 1 });         // Income/expense filters
transactionSchema.index({ userId: 1, category: 1 });     // Category filters

transactionSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
