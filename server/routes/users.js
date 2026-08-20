import express from "express";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// @route   GET /api/users/:username  (profile view)
router.get("/:username", protect, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate("friends", "name username profilePicture");
    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({ author: user._id })
      .populate("author", "name username profilePicture")
      .sort({ createdAt: -1 });

    res.json({ user, posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/profile
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, bio, location, website } = req.body;
    const user = await User.findById(req.user._id);

    user.name = name ?? user.name;
    user.bio = bio ?? user.bio;
    user.location = location ?? user.location;
    user.website = website ?? user.website;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/profile-picture
router.put("/profile-picture", protect, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const user = await User.findById(req.user._id);
    user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/cover-photo
router.put("/cover-photo", protect, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const user = await User.findById(req.user._id);
    user.coverPhoto = `/uploads/${req.file.filename}`;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users?search=query
router.get("/", protect, async (req, res) => {
  try {
    const { search } = req.query;
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { username: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const users = await User.find(filter).select("name username profilePicture").limit(20);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
