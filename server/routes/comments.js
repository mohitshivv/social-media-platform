import express from "express";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @route   POST /api/comments/:postId
router.post("/:postId", protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text is required" });

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await Comment.create({
      post: post._id,
      author: req.user._id,
      text,
    });

    post.comments.push(comment._id);
    await post.save();

    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: "comment",
        post: post._id,
        comment: comment._id,
        text: `${req.user.name} commented on your post`,
      });
    }

    const populated = await comment.populate("author", "name username profilePicture");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/comments/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this comment" });
    }
    comment.text = req.body.text ?? comment.text;
    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/comments/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }
    await Post.findByIdAndUpdate(comment.post, { $pull: { comments: comment._id } });
    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/comments/:id/like  (toggle)
router.put("/:id/like", protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const alreadyLiked = comment.likes.some((id) => id.toString() === req.user._id.toString());
    if (alreadyLiked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== req.user._id.toString());
    } else {
      comment.likes.push(req.user._id);
    }
    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
