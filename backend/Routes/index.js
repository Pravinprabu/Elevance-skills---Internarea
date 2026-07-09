const express = require("express");
const router = express.Router();
const admin = require("./admin");
const intern = require("./internship");
const job = require("./job");
const application=require("./application")
const user = require("./user");

router.use("/admin", admin);
router.use("/internship", intern);
router.use("/job", job);
router.use("/application", application);
router.use("/user", user);
router.use("/language", require("./language"));
router.use("/community", require("./community"));
router.use("/resume", require("./resume"));
router.use("/subscription", require("./subscription"));

module.exports = router;
