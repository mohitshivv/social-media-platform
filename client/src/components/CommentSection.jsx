import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { FiTrash2 } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import { getMediaUrl } from "../utils/mediaUrl.js";

const CommentSection = ({ post, onUpdate }) => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [comments, setComments] = useState(post.comments || []);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const { data } = await api.post(`/comments/${post._id}`, { text });
    const updated = [...comments, data];
    setComments(updated);
    onUpdate({ ...post, comments: updated });
    setText("");
  };

  const deleteComment = async (id) => {
    await api.delete(`/comments/${id}`);
    const updated = comments.filter((c) => c._id !== id);
    setComments(updated);
    onUpdate({ ...post, comments: updated });
  };

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      {comments.map((c) => (
        <div key={c._id} className="flex items-start gap-2 mb-2">
          <img
            src={c.author?.profilePicture ? getMediaUrl(c.author.profilePicture) : `https://api.dicebear.com/7.x/initials/svg?seed=${c.author?.name}`}
            className="w-7 h-7 rounded-full object-cover"
            alt=""
          />
          <div className="bg-gray-100 rounded-2xl px-3 py-1.5 flex-1">
            <p className="text-xs font-semibold">{c.author?.name}</p>
            <p className="text-sm">{c.text}</p>
          </div>
          {c.author?._id === user._id && (
            <button onClick={() => deleteComment(c._id)} className="text-gray-400 hover:text-red-500 mt-2">
              <FiTrash2 size={13} />
            </button>
          )}
        </div>
      ))}

      <form onSubmit={submitComment} className="flex items-center gap-2 mt-2">
        <img
          src={user.profilePicture ? getMediaUrl(user.profilePicture) : `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
          className="w-7 h-7 rounded-full object-cover"
          alt=""
        />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-sm outline-none"
        />
      </form>
    </div>
  );
};

export default CommentSection;
