import express from "express";
import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @route   POST /api/friends/request/:userId
router.post("/request/:userId", protect, async (req, res) => {
  try {
    const recipientId = req.params.userId;
    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't send a friend request to yourself" });
    }

    const existing = await FriendRequest.findOne({
      $or: [
        { sender: req.user._id, recipient: recipientId },
        { sender: recipientId, recipient: req.user._id },
      ],
    });
    if (existing) {
      return res.status(400).json({ message: "A friend request already exists between you two" });
    }

    const request = await FriendRequest.create({
      sender: req.user._id,
      recipient: recipientId,
    });

    await Notification.create({
      recipient: recipientId,
      sender: req.user._id,
      type: "friend_request",
      text: `${req.user.name} sent you a friend request`,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/friends/accept/:requestId
router.put("/accept/:requestId", protect, async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: "Friend request not found" });
    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = "accepted";
    await request.save();

    await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.recipient } });
    await User.findByIdAndUpdate(request.recipient, { $addToSet: { friends: request.sender } });

    await Notification.create({
      recipient: request.sender,
      sender: req.user._id,
      type: "friend_accept",
      text: `${req.user.name} accepted your friend request`,
    });

    res.json({ message: "Friend request accepted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/friends/decline/:requestId
router.put("/decline/:requestId", protect, async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: "Friend request not found" });
    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    request.status = "declined";
    await request.save();
    res.json({ message: "Friend request declined" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/friends/:userId  (unfriend)
router.delete("/:userId", protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { friends: req.params.userId } });
    await User.findByIdAndUpdate(req.params.userId, { $pull: { friends: req.user._id } });
    await FriendRequest.deleteMany({
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id },
      ],
    });
    res.json({ message: "Friend removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/friends/requests  (pending requests received)
router.get("/requests", protect, async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      recipient: req.user._id,
      status: "pending",
    }).populate("sender", "name username profilePicture");
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/friends/sent  (pending requests sent by me)
router.get("/sent", protect, async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      sender: req.user._id,
      status: "pending",
    }).populate("recipient", "name username profilePicture");
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
