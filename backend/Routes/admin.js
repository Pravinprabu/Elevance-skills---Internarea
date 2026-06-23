const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../Model/User");
const UAParser = require("ua-parser-js");
const trackLogin = require("../utils/trackLogin");
const AdminLoginOtp = require("../Model/AdminLoginOtp");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

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
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
        await AdminLoginOtp.create({ email, otp: generatedOtp, expiresAt });
        await transporter.sendMail({
          from: `"Internarea Admin" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Admin Login OTP",
          text: `Your OTP for admin login is: ${generatedOtp}. Valid for 2 minutes.`,
        });
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

module.exports = router;
