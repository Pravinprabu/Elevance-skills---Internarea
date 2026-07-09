const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  photo: String,
  uid: { type: String, unique: true },
  role: {
    type: String,
    enum: ["jobseeker", "recruiter", "admin"],
    default: "jobseeker",
  },
  plan: {
    type: String,
    enum: ["free", "bronze", "silver", "gold", "premium"],
    default: "free",
  },
  planExpiresAt: { type: Date, default: null },       // when the monthly plan expires
  applicationCount: { type: Number, default: 0 },     // applications submitted this month
  applicationCountResetAt: { type: Date, default: null }, // when the count was last reset
  password: { type: String },   // bcrypt hash — only set for admin accounts
  resume: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", default: null },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("User", UserSchema);
