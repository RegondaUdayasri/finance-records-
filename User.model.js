/**
 * models/User.model.js
 *
 * Schema:
 *   - name, email (unique), password (hashed), role, status
 *   - Roles: viewer | analyst | admin
 *   - Status: active | inactive (admin can deactivate users)
 *
 * Relationships:
 *   - One User → Many Transactions (userId on Transaction)
 */

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const ROLES    = ["viewer", "analyst", "admin"];
const STATUSES = ["active", "inactive"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // Never returned in queries by default
    },
    role: {
      type: String,
      enum: ROLES,
      default: "viewer",
    },
    status: {
      type: String,
      enum: STATUSES,
      default: "active",
    },
  },
  {
    timestamps: true, // Adds createdAt, updatedAt automatically
  }
);

// ─── Hash password before saving ─────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  // Only hash if the password field was modified
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance method: compare raw password to hash ───────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Virtual: hide sensitive fields in JSON output ───────────────────────────
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
