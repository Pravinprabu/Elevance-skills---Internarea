const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../Model/User");
const trackLogin = require("../utils/trackLogin");
const LoginHistory = require("../Model/LoginHistory");
const ForgotPasswordOtp = require("../Model/ForgotPasswordOtp");
const sendOTPemail = require("../utils/sendOTPemail"); // 👈 Central EmailJS Helper

// POST: Register / Sync User & Check Login Tracking
router.post("/register", async (req, res) => {
  const { uid, name, email, photo, role } = req.body;
  try {
    let user = await User.findOne({ uid });
    if (!user) {
      // Fallback default to 'user' or 'jobseeker' if no role field is provided
      user = new User({ uid, name, email, photo, role: role || "jobseeker" });
      await user.save();
    }

    // Wrap tracking utility safely so a tracking error doesn't break registration entirely
    let loginCheck = { status: "allowed" };
    try {
      if (typeof trackLogin === "function") {
        loginCheck = await trackLogin(req, {
          userId: user._id,
          email: user.email,
          role: user.role,
        });
      }
    } catch (trackErr) {
      console.error("Login tracking utility failed gracefully:", trackErr);
    }

    if (loginCheck && loginCheck.status === "blocked") {
      return res.status(403).json({ error: loginCheck.blockReason || "Access denied" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Registration Failure Details:", error);
    res.status(500).json({ error: "Registration failed", details: error.message });
  }
});

// POST: Send Forgot Password OTP for User
router.post("/forgot-password/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "No user found with this email address" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Clear old unverified OTPs
    await ForgotPasswordOtp.deleteMany({ email, verified: false });

    // Save new OTP record
    await ForgotPasswordOtp.create({ email, otp, expiresAt });

    // Send email using central EmailJS helper
    await sendOTPemail(email, otp, 15);

    res.status(200).json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("User Forgot Password Send OTP Error:", error.message);
    res.status(500).json({ error: "Failed to send password reset OTP" });
  }
});

// POST: Verify Forgot Password OTP & Reset Password
router.post("/forgot-password/verify-and-reset", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: "Email, OTP, and new password are required" });
  }

  try {
    const record = await ForgotPasswordOtp.findOne({
      email,
      verified: false,
    }).sort({ createdAt: -1 });

    if (!record || record.expiresAt < new Date() || record.otp !== otp) {
      return res.status(400).json({ error: "Incorrect or expired OTP" });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    // Mark OTP as verified
    record.verified = true;
    await record.save();

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("User Verify & Reset Password Error:", error.message);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// GET: Fetch User Login History
router.get("/:uid/login-history", async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ error: "User not found" });
    const history = await LoginHistory.find({ userId: user._id }).sort({ loginAt: -1 }).limit(20);
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET: Fetch User Details by UID
router.get("/:uid", async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });

    // Enforce admin check directly against the fetched model role flag
    if (user) {
      if (user.role === "admin") {
        return res.status(403).json({ error: "Admin accounts must log in via the admin portal." });
      }
      return res.status(200).json(user);
    }

    // Fallback email query check for safety
    if (req.query.email) {
      const existingAdmin = await User.findOne({ email: req.query.email, role: "admin" });
      if (existingAdmin) {
        return res.status(403).json({ error: "Admin accounts must log in via the admin portal." });
      }
    }

    return res.status(404).json({ error: "User not found" });
  } catch (error) {
    console.error("GET user route failed:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;