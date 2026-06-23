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
      user = new User({ uid, name, email, photo, role });
      await user.save();
    }

    const loginCheck = await trackLogin(req, {
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    if (loginCheck.status === "blocked") {
      return res.status(403).json({ error: loginCheck.blockReason });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

router.get("/:uid", async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
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

module.exports = router;
