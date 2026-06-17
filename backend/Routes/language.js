const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const LanguageOtp = require("../Model/LanguageOtp");

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail", // You can use other services or host/port configs
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 2 minutes from now
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    // Save to DB
    await LanguageOtp.create({
      email,
      otp,
      expiresAt,
    });

    // Send email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP for Language Change",
        text: `Your OTP for changing the language to French is: ${otp}. It is valid for 2 minutes.`,
      });
    } else {
      console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
    }

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required" });
  }

  try {
    // Find the latest unverified OTP for this email
    const record = await LanguageOtp.findOne({ email, verified: false }).sort({ createdAt: -1 });

    if (!record) {
      return res.status(400).json({ success: false, message: "No active OTP found" });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "Incorrect or expired code" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: "Incorrect or expired code" });
    }

    // Mark as verified
    record.verified = true;
    await record.save();

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
});

module.exports = router;
