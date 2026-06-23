const mongoose = require("mongoose");
const AdminLoginOtpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  expiresAt: Date,
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("AdminLoginOtp", AdminLoginOtpSchema);
