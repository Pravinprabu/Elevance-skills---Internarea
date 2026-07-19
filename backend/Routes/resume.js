const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const User = require("../Model/User");
const ResumeOtp = require("../Model/ResumeOtp");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Resume = require("../Model/Resume");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

router.post("/send-otp", async (req, res) => {
  const { uid } = req.body;
  try {
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await ResumeOtp.create({ email: user.email, otp, expiresAt });

    await transporter.sendMail({
      from: `"InternArea" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Resume Builder OTP Verification",
      text: `Your OTP for resume creation is: ${otp}. Valid for 5 minutes.`,
    });

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {

    console.error("Otp route crashed details:", error);
    res.status(500).json({ error: "Failed to send OTP", details: error.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { uid, otp } = req.body;
  try {
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    const record = await ResumeOtp.findOne({ email: user.email, verified: false }).sort({ createdAt: -1 });
    if (!record || record.expiresAt < new Date() || record.otp !== otp) {
      return res.status(400).json({ error: "Incorrect or expired OTP" });
    }
    record.verified = true;
    await record.save();
    res.status(200).json({ verified: true });
  } catch (error) {
    res.status(500).json({ error: "OTP verification failed" });
  }
});

router.post("/create-order", async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: 5000,           // amount in paise — 5000 = ₹50
      currency: "INR",
      receipt: `resume_${Date.now()}`,
    });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

router.post("/verify-payment", async (req, res) => {
  const { uid, razorpay_order_id, razorpay_payment_id, razorpay_signature, resumeData } = req.body;
  try {
    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Payment is valid — save the resume
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    const resume = new Resume({
      userId: user._id,
      ...resumeData,
      paymentId: razorpay_payment_id,
    });
    await resume.save();

    // Attach resume to user profile
    user.resume = resume._id;
    await user.save();

    // Update plan to premium
    user.plan = "premium";
    await user.save();

    res.status(200).json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify payment and save resume" });
  }
});

router.get("/:uid", async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user || !user.resume) return res.status(404).json({ error: "No resume found" });
    const resume = await Resume.findById(user.resume);
    res.status(200).json(resume);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
