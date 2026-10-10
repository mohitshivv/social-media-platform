import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import api from "../api/axios.js";
import { getMediaUrl } from "../utils/mediaUrl.js";

const typeText = {
  like: "liked your post",
  comment: "commented on your post",
  friend_request: "sent you a friend request",
  friend_accept: "accepted your friend request",
  mention: "mentioned you",
};

// Where each kind of notification should take the user
const targetFor = (n) => {
  if (n.type === "friend_request") return "/friends";
  if (["like", "comment", "mention"].includes(n.type) && n.post?._id) return `/post/${n.post._id}`;
  return `/profile/${n.sender.username}`;
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get("/notifications").then((res) => setNotifications(res.data));
    api.put("/notifications/read-all");
  }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(notifications.map((n) => (n._id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="max-w-lg mx-auto py-4 px-3">
      <h1 className="text-xl font-bold mb-4">Notifications</h1>

      {notifications.length === 0 && <p className="text-gray-500 text-center mt-10">No notifications yet</p>}

      {notifications.map((n) => (
        <Link
          to={targetFor(n)}
          key={n._id}
          onClick={() => markRead(n._id)}
          className={`flex items-center gap-3 p-3 rounded-xl mb-2 border ${
            n.read ? "bg-white border-gray-200" : "bg-primary-50 border-primary-100"
          }`}
        >
          <img
            src={n.sender.profilePicture ? getMediaUrl(n.sender.profilePicture) : `https://api.dicebear.com/7.x/initials/svg?seed=${n.sender.name}`}
            className="w-10 h-10 rounded-full object-cover"
            alt=""
          />
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-semibold">{n.sender.name}</span> {typeText[n.type] || n.text}
            </p>
            {n.post?.text && (
              <p className="text-xs text-gray-500 truncate max-w-[16rem]">"{n.post.text}"</p>
            )}
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Notifications;
