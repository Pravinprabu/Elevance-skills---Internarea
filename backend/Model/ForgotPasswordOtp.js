const mongoose = require("mongoose");
const ForgotPasswordOtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
  usedAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("ForgotPasswordOtp", ForgotPasswordOtpSchema);
