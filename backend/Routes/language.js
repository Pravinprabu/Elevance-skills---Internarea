const express = require("express");
const router = express.Router();
const axios = require("axios");
const LanguageOtp = require("../Model/LanguageOtp");

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 15 minutes from now
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Format readable expiry time (e.g., "01:25 PM")
    const formattedTime = expiresAt.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Remove old unverified OTP records for this email
    await LanguageOtp.deleteMany({ email, verified: false });

    // Save new OTP to DB
    await LanguageOtp.create({
      email,
      otp,
      expiresAt,
    });

    // Send email using EmailJS REST API (Using Common Template)
    console.log(`[EmailJS] Dispatching Language Change OTP to ${email}...`);

    await axios.post(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID, // 👈 Common template ID
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY,
        template_params: {
          email: email,             // Matches {{email}} in EmailJS template
          passcode: otp,            // Matches {{passcode}} in EmailJS template
          time: formattedTime,      // Matches {{time}} in EmailJS template
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`[EmailJS] Language OTP sent successfully to ${email}`);
    return res.json({ success: true, message: "OTP sent successfully" });

  } catch (error) {
    console.error("❌ ====== EMAILJS LANGUAGE OTP ERROR ====== ❌");
    console.error("Error Response:", error.response?.data || error.message);

    return res.status(500).json({ 
      success: false, 
      message: "Failed to send OTP",
      details: error.response?.data || error.message 
    });
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