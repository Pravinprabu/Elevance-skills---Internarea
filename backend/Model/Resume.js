const mongoose = require("mongoose");
const ResumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: String,
  email: String,
  phone: String,
  photo: String,          // base64 or URL
  summary: String,
  qualifications: [{ degree: String, institution: String, year: String }],
  experience: [{ role: String, company: String, duration: String, description: String }],
  skills: [String],
  paymentId: String,      // Razorpay payment ID stored after successful payment
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Resume", ResumeSchema);
