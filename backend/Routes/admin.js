const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../Model/User");

router.post("/adminlogin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, role: "admin" });
    if (!user) return res.status(401).json({ error: "Not an admin account" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid password" });
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
