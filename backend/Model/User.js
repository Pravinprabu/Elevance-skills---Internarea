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
    enum: ["free", "premium"],
    default: "free",
  },
  password: { type: String },   // bcrypt hash — only set for admin accounts
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("User", UserSchema);
