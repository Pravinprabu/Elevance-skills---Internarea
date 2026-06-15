const mongoose = require("mongoose");
const Applicationipschema = new mongoose.Schema({
  company: String,
  body: String,
  category: String,
  coverLetter: String,
  resume: String,
  user: Object,
  jobOwner: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["accepted", "pending", "rejected"],
    default: "pending",
  },
  Application: Object,
});
module.exports = mongoose.model("Application", Applicationipschema);
