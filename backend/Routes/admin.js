const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../Model/User");
const UAParser = require("ua-parser-js");
const trackLogin = require("../utils/trackLogin");
const AdminLoginOtp = require("../Model/AdminLoginOtp");
const ForgotPasswordOtp = require("../Model/ForgotPasswordOtp");
const Application = require("../Model/Application");
const Job = require("../Model/Job");
const Internship = require("../Model/Internship");
const sendOTPemail = require("../utils/sendOTPemail"); // 👈 Central EmailJS Helper

router.post("/adminlogin", async (req, res) => {
  const { email, password, otp } = req.body;
  try {
    const user = await User.findOne({ email, role: "admin" });
    if (!user) return res.status(401).json({ error: "Not an admin account" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid password" });

    const parser = new UAParser(req.headers["user-agent"]);
    const browserName = parser.getResult().browser.name || "";

    // Rule: Chrome requires OTP verification
    if (browserName.toLowerCase().includes("chrome")) {
      if (!otp) {
        // First pass — generate and send OTP, don't log in yet
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins to align with common template

        // Clear old unverified OTPs
        await AdminLoginOtp.deleteMany({ email, verified: false });
        await AdminLoginOtp.create({ email, otp: generatedOtp, expiresAt });

        // Send OTP via EmailJS Helper
        await sendOTPemail(email, generatedOtp, 15);

        return res.status(200).json({ otpRequired: true, message: "OTP sent to your email" });
      } else {
        // Second pass — verify OTP before completing login
        const record = await AdminLoginOtp.findOne({ email, verified: false }).sort({ createdAt: -1 });
        if (!record || record.expiresAt < new Date() || record.otp !== otp) {
          return res.status(400).json({ error: "Incorrect or expired OTP" });
        }
        record.verified = true;
        await record.save();
      }
    }

    const loginCheck = await trackLogin(req, { userId: user._id, email: user.email, role: "admin" });
    if (loginCheck.status === "blocked") {
      return res.status(403).json({ error: loginCheck.blockReason });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Admin Login Error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/adminregister", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) return res.status(400).json({ error: "Email already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role: "admin", uid: `admin_${email}` });
    await user.save();
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/forgot-password/send-otp", async (req, res) => {
  const { email } = req.body;
  try {
    // Check if admin account exists
    const user = await User.findOne({ email, role: "admin" });
    if (!user) return res.status(404).json({ error: "No admin account found with this email." });

    // One per day rule
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayRequest = await ForgotPasswordOtp.findOne({
      email,
      usedAt: { $gte: startOfDay },
    });
    if (todayRequest) {
      return res.status(429).json({ error: "You can use this option only once per day." });
    }

    // Generate and send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Clear previous unverified OTPs
    await ForgotPasswordOtp.deleteMany({ email, verified: false });
    await ForgotPasswordOtp.create({ email, otp, expiresAt });

    // Send OTP via EmailJS Helper
    await sendOTPemail(email, otp, 15);

    res.status(200).json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error("Admin Forgot Password Error:", error.message);
    res.status(500).json({ error: "Failed to send OTP." });
  }
});

router.post("/forgot-password/verify-and-reset", async (req, res) => {
  const { email, otp } = req.body;
  try {
    // Verify OTP
    const record = await ForgotPasswordOtp.findOne({
      email,
      verified: false,
    }).sort({ usedAt: -1 });

    if (!record || record.expiresAt < new Date() || record.otp !== otp) {
      return res.status(400).json({ error: "Incorrect or expired OTP." });
    }

    // Generate new password — uppercase + lowercase only, no numbers or special chars
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let newPassword = "";
    for (let i = 0; i < 12; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Hash and save
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email, role: "admin" }, { password: hashedPassword });

    // Mark OTP as used
    record.verified = true;
    await record.save();

    res.status(200).json({
      success: true,
      newPassword, // Send back to display on screen — admin must note this down
      message: "Password reset successful.",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to reset password." });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const totalApplications = await Application.countDocuments();
    const activeJobs = await Job.countDocuments();
    const activeInternships = await Internship.countDocuments();
    const acceptedApplications = await Application.countDocuments({ status: "accepted" });

    // Conversion rate = accepted / total * 100
    const conversionRate = totalApplications > 0
      ? ((acceptedApplications / totalApplications) * 100).toFixed(2)
      : "0.00";

    res.status(200).json({
      totalApplications,
      activeJobs,
      activeInternships,
      conversionRate: `${conversionRate}%`,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.post("/change-password", async (req, res) => {
  const { uid, currentPassword, newPassword } = req.body;
  try {
    const user = await User.findOne({ uid, role: "admin" });
    if (!user) return res.status(404).json({ error: "Admin not found" });

    // Verify current password first
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ error: "Current password is incorrect" });

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to change password" });
  }
});

module.exports = router;

