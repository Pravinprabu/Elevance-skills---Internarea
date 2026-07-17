const express = require("express");
const router = express.Router();
const User = require("../Model/User");
const trackLogin = require("../utils/trackLogin");
const LoginHistory = require("../Model/LoginHistory");

router.post("/register", async (req, res) => {
  const { uid, name, email, photo, role } = req.body;
  try {
    let user = await User.findOne({ uid });
    if (!user) {
      // Fallback fallback default to 'user' if no role field is provided
      user = new User({ uid, name, email, photo, role: role || "user" });
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
    // CRITICAL: Log out the exact validation error so you can see it in Render logs
    console.error("Registration Failure Details:", error);
    res.status(500).json({ error: "Registration failed", details: error.message });
  }
});

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

router.get("/:uid", async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    
    // If user document is found, enforce admin check directly against the fetched model role flag
    if (user) {
      if (user.role === "admin") {
        return res.status(403).json({ error: "Admin accounts must log in via the admin portal." });
      }
      return res.status(200).json(user);
    }

    // If the account document does not exist, look up query string parameters for safety checks
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