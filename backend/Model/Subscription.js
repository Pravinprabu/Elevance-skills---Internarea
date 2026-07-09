const mongoose = require("mongoose");
const SubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plan: { type: String, enum: ["bronze", "silver", "gold"], required: true },
  amount: Number,
  paymentId: String,
  orderId: String,
  invoiceSentAt: Date,
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,
});
module.exports = mongoose.model("Subscription", SubscriptionSchema);
