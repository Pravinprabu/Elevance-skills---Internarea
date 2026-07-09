const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../Model/User");
const Subscription = require("../Model/Subscription");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const PLAN_DETAILS = {
  bronze: { amount: 10000, label: "Bronze Plan", applications: 3 },   // paise
  silver: { amount: 30000, label: "Silver Plan", applications: 5 },
  gold:   { amount: 100000, label: "Gold Plan", applications: "Unlimited" },
};

// POST /api/subscription/create-order
router.post("/create-order", async (req, res) => {
  const { uid, plan } = req.body;

  // Time restriction — only 10:00 AM to 11:00 AM IST
  // IST = UTC + 5:30
  const now = new Date();
  const istHour = (now.getUTCHours() + 5) % 24 + (now.getUTCMinutes() >= 30 ? 1 : 0);
  const istMinute = (now.getUTCMinutes() + 30) % 60;
  const timeInMinutes = istHour * 60 + istMinute;
  const start = 10 * 60;       // 10:00 AM = 600 minutes
  const end = 11 * 60;         // 11:00 AM = 660 minutes

  if (timeInMinutes < start || timeInMinutes >= end) {
    return res.status(403).json({
      error: "Payments are only allowed between 10:00 AM and 11:00 AM IST. Please try again during that window.",
    });
  }

  if (!PLAN_DETAILS[plan]) {
    return res.status(400).json({ error: "Invalid plan selected" });
  }

  try {
    const order = await razorpay.orders.create({
      amount: PLAN_DETAILS[plan].amount,
      currency: "INR",
      receipt: `sub_${plan}_${Date.now()}`,
    });
    res.status(200).json({ order, plan, amount: PLAN_DETAILS[plan].amount });
  } catch (error) {
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

// POST /api/subscription/verify-payment
router.post("/verify-payment", async (req, res) => {
  const { uid, plan, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    // Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Update user plan — expires in 30 days, reset application count
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const user = await User.findOneAndUpdate(
      { uid },
      {
        plan,
        planExpiresAt: expiresAt,
        applicationCount: 0,
        applicationCountResetAt: new Date(),
      },
      { new: true }
    );

    // Save subscription record
    await Subscription.create({
      userId: user._id,
      plan,
      amount: PLAN_DETAILS[plan].amount / 100,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      expiresAt,
      invoiceSentAt: new Date(),
    });

    // Send invoice email
    const planLabel = PLAN_DETAILS[plan].label;
    const amount = PLAN_DETAILS[plan].amount / 100;
    const applications = PLAN_DETAILS[plan].applications;
    await transporter.sendMail({
      from: `"InternArea" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Invoice — ${planLabel} Subscription`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563EB;">InternArea — Subscription Invoice</h2>
          <hr/>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Thank you for subscribing. Your payment was successful.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f3f4f6;">
              <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Plan</strong></td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${planLabel}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Amount Paid</strong></td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">₹${amount}</td>
            </tr>
            <tr style="background: #f3f4f6;">
              <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Applications Allowed</strong></td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${applications} per month</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Valid Until</strong></td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${expiresAt.toDateString()}</td>
            </tr>
            <tr style="background: #f3f4f6;">
              <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Payment ID</strong></td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${razorpay_payment_id}</td>
            </tr>
          </table>
          <p>You can now apply for internships as per your plan limits.</p>
          <p style="color: #6b7280; font-size: 12px;">This is an auto-generated invoice. Please do not reply to this email.</p>
        </div>
      `,
    });

    res.status(200).json({ success: true, plan, expiresAt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

// GET /api/subscription/status/:uid — get current plan and usage
router.get("/status/:uid", async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Auto-reset application count if a new month has started
    const now = new Date();
    const resetAt = user.applicationCountResetAt;
    const monthPassed = !resetAt || (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear());
    if (monthPassed) {
      user.applicationCount = 0;
      user.applicationCountResetAt = now;
      await user.save();
    }

    // Auto-expire plan if past expiry date
    if (user.planExpiresAt && now > user.planExpiresAt && user.plan !== "free") {
      user.plan = "free";
      user.planExpiresAt = null;
      user.applicationCount = 0;
      await user.save();
    }

    const limits = { free: 1, bronze: 3, silver: 5, gold: Infinity };
    const limit = limits[user.plan];

    res.status(200).json({
      plan: user.plan,
      planExpiresAt: user.planExpiresAt,
      applicationCount: user.applicationCount,
      applicationLimit: limit === Infinity ? "Unlimited" : limit,
      canApply: limit === Infinity || user.applicationCount < limit,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
