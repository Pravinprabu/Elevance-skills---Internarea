const express = require("express");
const router = express.Router();
const Post = require("../Model/Post");
const Friend = require("../Model/Friend");
const User = require("../Model/User");
const Comment = require("../Model/Comment");

router.post("/post", async (req, res) => {
  const { uid, content, mediaUrl, mediaType } = req.body;
  try {
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Count accepted friends
    const friendCount = await Friend.countDocuments({
      $or: [{ requester: user._id }, { recipient: user._id }],
      status: "accepted",
    });

    if (friendCount === 0) {
      return res.status(403).json({ error: "You need at least 1 friend to post." });
    }

    // Determine daily post limit
    let dailyLimit = null; // null means unlimited
    if (friendCount === 1) dailyLimit = 1;
    else if (friendCount === 2) dailyLimit = 2;
    else if (friendCount > 2 && friendCount <= 10) dailyLimit = friendCount;
    // friendCount > 10 = unlimited (dailyLimit stays null)

    if (dailyLimit !== null) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const todayPostCount = await Post.countDocuments({
        userId: user._id,
        createdAt: { $gte: startOfDay },
      });
      if (todayPostCount >= dailyLimit) {
        return res.status(403).json({
          error: `You can only post ${dailyLimit} time(s) per day with ${friendCount} friend(s).`,
        });
      }
    }

    const post = new Post({
      userId: user._id,
      userName: user.name,
      userPhoto: user.photo,
      content,
      mediaUrl,
      mediaType: mediaUrl ? mediaType : "none",
    });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to create post" });
  }
});

router.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

router.post("/post/:postId/like", async (req, res) => {
  const { uid } = req.body;
  try {
    const user = await User.findOne({ uid });
    const post = await Post.findById(req.params.postId);
    const alreadyLiked = post.likes.includes(user._id);
    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== user._id.toString());
    } else {
      post.likes.push(user._id);
    }
    await post.save();
    res.status(200).json({ likes: post.likes.length, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle like" });
  }
});

router.post("/post/:postId/comment", async (req, res) => {
  const { uid, content } = req.body;
  try {
    const user = await User.findOne({ uid });
    const comment = new Comment({
      postId: req.params.postId,
      userId: user._id,
      userName: user.name,
      userPhoto: user.photo,
      content,
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

router.get("/post/:postId/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({ createdAt: 1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const self = await User.findOne({ uid: req.query.uid });
    const users = await User.find({ _id: { $ne: self._id } }).select("name email photo uid");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.post("/friend/request", async (req, res) => {
  const { requesterUid, recipientUid } = req.body;
  try {
    const requester = await User.findOne({ uid: requesterUid });
    const recipient = await User.findOne({ uid: recipientUid });
    const existing = await Friend.findOne({
      $or: [
        { requester: requester._id, recipient: recipient._id },
        { requester: recipient._id, recipient: requester._id },
      ],
    });
    if (existing) return res.status(400).json({ error: "Friend request already exists" });
    const friend = new Friend({ requester: requester._id, recipient: recipient._id });
    await friend.save();
    res.status(201).json(friend);
  } catch (error) {
    res.status(500).json({ error: "Failed to send request" });
  }
});

router.post("/friend/accept", async (req, res) => {
  const { friendshipId } = req.body;
  try {
    const friendship = await Friend.findByIdAndUpdate(
      friendshipId,
      { status: "accepted" },
      { new: true }
    );
    res.status(200).json(friendship);
  } catch (error) {
    res.status(500).json({ error: "Failed to accept request" });
  }
});

router.get("/friends", async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.query.uid });
    const friendships = await Friend.find({
      $or: [{ requester: user._id }, { recipient: user._id }],
    }).populate("requester recipient", "name email photo uid");
    res.status(200).json(friendships);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch friends" });
  }
});

module.exports = router;
