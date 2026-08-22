import User from "../models/User.js";
import Notification from "../models/Notification.js";

// Scans text for @username mentions, finds matching real users, and creates
// a "mention" notification for each one found (skipping the author themselves
// and skipping duplicate mentions of the same user).
export const notifyMentions = async ({ text, authorId, authorName, post, comment }) => {
  if (!text) return;

  const handles = [...new Set((text.match(/@([a-zA-Z0-9_.]+)/g) || []).map((h) => h.slice(1).toLowerCase()))];
  if (handles.length === 0) return;

  const mentionedUsers = await User.find({ username: { $in: handles } }).select("_id");

  const notifications = mentionedUsers
    .filter((u) => u._id.toString() !== authorId.toString())
    .map((u) => ({
      recipient: u._id,
      sender: authorId,
      type: "mention",
      post,
      comment,
      text: `${authorName} mentioned you`,
    }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }
};
