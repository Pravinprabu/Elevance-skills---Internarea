const mongoose = require("mongoose");
const PostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: String,
  userPhoto: String,
  content: String,
  mediaUrl: String,           // base64 string for photo or video
  mediaType: { type: String, enum: ["image", "video", "none"], default: "none" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Post", PostSchema);
