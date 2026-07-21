const express = require("express");
const router = express.Router();
const axios = require("axios");
const User = require("../Model/User");
const ResumeOtp = require("../Model/ResumeOtp");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Resume = require("../Model/Resume");

// POST: Send Resume OTP using EmailJS
router.post("/send-otp", async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: "UID is required in request body" });
  }

  try {
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.email) return res.status(400).json({ error: "User email missing" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Format readable expiry time (e.g., "12:45 PM")
    const formattedTime = expiresAt.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Clear previous unverified OTPs for this email
    await ResumeOtp.deleteMany({ email: user.email, verified: false });
    await ResumeOtp.create({ email: user.email, otp, expiresAt });

    // Send email using EmailJS REST API (Using Central Template)
    console.log(`[EmailJS] Dispatching Resume OTP to ${user.email}...`);

    await axios.post(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID, // 👈 Common template ID
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY,
        template_params: {
          email: user.email,        // Matches {{email}} in EmailJS template
          passcode: otp,           // Matches {{passcode}} in EmailJS template
          time: formattedTime,     // Matches {{time}} in EmailJS template
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`[EmailJS] Resume OTP sent successfully to ${user.email}`);
    return res.status(200).json({ message: "OTP sent to your email" });

  } catch (error) {
    console.error("❌ ====== EMAILJS RESUME OTP ERROR ====== ❌");
    console.error("Error Response:", error.response?.data || error.message);

    return res.status(500).json({
      error: "Failed to send OTP",
      details: error.response?.data || error.message,
    });
  }
});

// POST: Verify OTP
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

// POST: Create Razorpay Order
router.post("/create-order", async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: 5000,
      currency: "INR",
      receipt: `resume_${Date.now()}`,
    });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

// POST: Verify Payment & Save Resume
router.post("/verify-payment", async (req, res) => {
  const { uid, razorpay_order_id, razorpay_payment_id, razorpay_signature, resumeData } = req.body;
  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    const resume = new Resume({
      userId: user._id,
      ...resumeData,
      paymentId: razorpay_payment_id,
    });
    await resume.save();

    user.resume = resume._id;
    user.plan = "premium";
    await user.save();

    res.status(200).json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify payment and save resume" });
  }
});

// GET: Fetch User Resume
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