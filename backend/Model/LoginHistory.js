const mongoose = require("mongoose");

const LoginHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  email: String,
  role: String,
  browser: String,
  os: String,
  deviceType: { type: String, enum: ["desktop", "laptop", "mobile", "tablet", "unknown"] },
  ipAddress: String,
  status: { type: String, enum: ["allowed", "blocked"], default: "allowed" },
  blockReason: String,        // e.g. "Outside allowed mobile login window"
  loginAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LoginHistory", LoginHistorySchema);
