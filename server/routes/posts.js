import express from "express";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import { notifyMentions } from "../utils/notifyMentions.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// @route   POST /api/posts   (create post, with optional media files)
router.post("/", protect, upload.array("media", 10), async (req, res) => {
  try {
    const { text } = req.body;
    if (!text && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ message: "Post must have text or media" });
    }

    const media = (req.files || []).map((file) => ({
      url: `/uploads/${file.filename}`,
      type: file.mimetype.startsWith("video/") ? "video" : "image",
    }));

    const post = await Post.create({ author: req.user._id, text, media });
    const populated = await post.populate("author", "name username profilePicture");

    await notifyMentions({ text, authorId: req.user._id, authorName: req.user.name, post: post._id });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/posts/feed
// Basic feed ranking: posts from self + friends, newest first,
// with a simple engagement-boosted sort (likes + comments count as recency weight).
router.get("/feed", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const authorIds = [user._id, ...user.friends];

    const posts = await Post.find({ author: { $in: authorIds } })
      .populate("author", "name username profilePicture")
      .populate({
        path: "comments",
        populate: { path: "author", select: "name username profilePicture" },
      })
      .sort({ createdAt: -1 })
      .limit(100);

    // Simple ranking: recency + engagement score
    const now = Date.now();
    const ranked = posts
      .map((p) => {
        const ageHours = (now - p.createdAt.getTime()) / 3600000;
        const engagement = p.likes.length * 2 + p.comments.length * 3;
        const score = engagement - ageHours * 0.5; // decay older posts
        return { post: p, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.post);

    res.json(ranked);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/posts/:id  (edit post text)
router.put("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }
    post.text = req.body.text ?? post.text;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/posts/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/posts/:id/like  (toggle like)
router.put("/:id/like", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.some((id) => id.toString() === req.user._id.toString());

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
      if (post.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.author,
          sender: req.user._id,
          type: "like",
          post: post._id,
          text: `${req.user.name} liked your post`,
        });
      }
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/posts/:id/likes  (who liked)
router.get("/:id/likes", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "likes",
      "name username profilePicture"
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post.likes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/posts/:id/media/:mediaId  (remove a single photo/video from a post)
router.delete("/:id/media/:mediaId", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }

    const mediaItem = post.media.id(req.params.mediaId);
    if (!mediaItem) return res.status(404).json({ message: "Media not found" });

    // Remove the underlying file from disk (best-effort; ignore if already gone)
    const filePath = path.join(process.cwd(), mediaItem.url.replace(/^\//, ""));
    fs.unlink(filePath, () => {});

    post.media.pull(req.params.mediaId);
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
