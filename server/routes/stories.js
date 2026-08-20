import express from "express";
import Story from "../models/Story.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// @route   POST /api/stories  (create a story - photo, video, or text)
router.post("/", protect, upload.single("media"), async (req, res) => {
  try {
    const { text, backgroundColor } = req.body;
    let mediaUrl = "";
    let mediaType = "text";

    if (req.file) {
      mediaUrl = `/uploads/${req.file.filename}`;
      mediaType = req.file.mimetype.startsWith("video/") ? "video" : "image";
    }

    const story = await Story.create({
      author: req.user._id,
      mediaUrl,
      mediaType,
      text: text || "",
      backgroundColor: backgroundColor || "#1877f2",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    const populated = await story.populate("author", "name username profilePicture");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/stories  (active stories from self + friends, grouped by author)
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const authorIds = [user._id, ...user.friends];

    const stories = await Story.find({
      author: { $in: authorIds },
      expiresAt: { $gt: new Date() },
    })
      .populate("author", "name username profilePicture")
      .sort({ createdAt: 1 });

    // Group by author
    const grouped = {};
    stories.forEach((story) => {
      const authorId = story.author._id.toString();
      if (!grouped[authorId]) {
        grouped[authorId] = { author: story.author, stories: [] };
      }
      grouped[authorId].stories.push(story);
    });

    res.json(Object.values(grouped));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/stories/:id/view
router.put("/:id/view", protect, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: "Story not found or expired" });

    if (!story.viewers.some((id) => id.toString() === req.user._id.toString())) {
      story.viewers.push(req.user._id);
      await story.save();
    }
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/stories/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: "Story not found" });
    if (story.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this story" });
    }
    await story.deleteOne();
    res.json({ message: "Story deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
