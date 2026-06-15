const express = require("express");
const router = express.Router();
const User = require("../Model/User");

router.post("/register", async (req, res) => {
  const { uid, name, email, photo, role } = req.body;
  try {
    let user = await User.findOne({ uid });
    if (user) return res.status(200).json(user);
    user = new User({ uid, name, email, photo, role });
    await user.save();
    res.status(201).json(user);
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

module.exports = router;
