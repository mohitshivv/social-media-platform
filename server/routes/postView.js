import express from "express";
import Post from "../models/Post.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @route   GET /api/post/:id  (a single post with author + comments, used by notification links)
router.get("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name username profilePicture")
      .populate({
        path: "comments",
        populate: { path: "author", select: "name username profilePicture" },
      });
    if (!post) return res.status(404).json({ message: "Post not found (it may have been deleted)" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Post not found" });
  }
});

export default router;
