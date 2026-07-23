const express = require("express");
const router = express.Router();
const application = require("../Model/Application");
const User = require("../Model/User");

router.post("/", async (req, res) => {
  try {
    // Check plan limit if a uid is provided
    const uid = req.body.user?.uid;
    if (uid) {
      const user = await User.findOne({ uid });
      if (user && user.role === "jobseeker") {
        const limits = { free: 1, bronze: 3, silver: 5, gold: Infinity };
        const limit = limits[user.plan] || 1;

        // Reset count if new month
        const now = new Date();
        const resetAt = user.applicationCountResetAt;
        const monthPassed = !resetAt || (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear());
        if (monthPassed) {
          user.applicationCount = 0;
          user.applicationCountResetAt = now;
        }

        const currentCount = user.applicationCount || 0;

        if (limit !== Infinity && currentCount >= limit) {
          return res.status(403).json({
            error: `You have reached your ${user.plan} plan limit of ${limit} application(s) per month. Upgrade your plan to apply for more internships.`,
            upgradeRequired: true,
          });
        }

        // Increment count
        user.applicationCount = currentCount + 1;
        await user.save();
      }
    }

    // Existing save logic — no changes needed below this point
    const applicationipdata = new application({
      company: req.body.company,
      category: req.body.category,
      coverLetter: req.body.coverLetter,
      resume: req.body.resume,
      user: req.body.user,
      Application: req.body.Application,
      body: req.body.body,
      jobOwner: req.body.jobOwner,
    });
    await applicationipdata.save();
    res.send(applicationipdata);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to submit application" });
  }
});
router.get("/", async (req, res) => {
  try {
    const data = await application.find();
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "internal server error" });
  }
});
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  
  // Validate if id is a valid ObjectId
  const mongoose = require("mongoose");
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid application ID format" });
  }

  try {
    const data = await application.findById(id);
    if (!data) {
      return res.status(404).json({ error: "application not found" });
    }
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "internal server error" });
  }
});
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  let status;
  if (action === "accepted") {
    status = "accepted";
  } else if (action === "rejected") {
    status = "rejected";
  } else {
    res.status(404).json({ error: "Invalid action" });
    return;
  }
  try {
    const updateapplication = await application.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );
    if (!updateapplication) {
      res.status(404).json({ error: "Not able to update the application" });
      return;
    }
    res.status(200).json({ sucess: true, data: updateapplication });
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
});
module.exports = router;
