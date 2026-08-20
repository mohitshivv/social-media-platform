import express from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @route   GET /api/notifications
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "name username profilePicture")
      .populate("post", "text")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/notifications/:id/read
router.put("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/notifications/read-all
router.put("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
