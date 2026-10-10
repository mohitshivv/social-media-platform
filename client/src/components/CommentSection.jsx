import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiTrash2, FiHeart, FiEdit2 } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import { getMediaUrl } from "../utils/mediaUrl.js";

const avatarOf = (u) =>
  u?.profilePicture ? getMediaUrl(u.profilePicture) : `https://api.dicebear.com/7.x/initials/svg?seed=${u?.name}`;

const CommentSection = ({ post, onUpdate }) => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [comments, setComments] = useState(null); // null = still loading
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState("");

  // Always load the comments from the server so they are complete (with authors),
  // no matter which page (feed / profile / single post) the post came from.
  useEffect(() => {
    api
      .get(`/comments/post/${post._id}`)
      .then((res) => setComments(res.data))
      .catch(() => setComments([]));
  }, [post._id]);

  const sync = (updated) => {
    setComments(updated);
    onUpdate({ ...post, comments: updated });
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setError("");
    try {
      const { data } = await api.post(`/comments/${post._id}`, { text });
      sync([...comments, data]);
      setText("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not post comment");
    }
  };

  const deleteComment = async (id) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await api.delete(`/comments/${id}`);
      sync(comments.filter((c) => c._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete comment");
    }
  };

  const startEdit = (c) => {
    setEditingId(c._id);
    setEditText(c.text);
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;
    try {
      const { data } = await api.put(`/comments/${id}`, { text: editText });
      sync(comments.map((c) => (c._id === id ? { ...c, text: data.text } : c)));
      setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.message || "Could not edit comment");
    }
  };

  const toggleCommentLike = async (id) => {
    try {
      const { data } = await api.put(`/comments/${id}/like`);
      sync(comments.map((c) => (c._id === id ? { ...c, likes: data.likes } : c)));
    } catch (err) {
      setError(err.response?.data?.message || "Could not like comment");
    }
  };

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      {comments === null && <p className="text-xs text-gray-500 mb-2">Loading comments...</p>}

      {comments?.map((c) => {
        const commentLiked = c.likes?.includes(user._id);
        const mine = c.author?._id === user._id;
        return (
          <div key={c._id} className="flex items-start gap-2 mb-2">
            <Link to={`/profile/${c.author?.username}`}>
              <img src={avatarOf(c.author)} className="w-7 h-7 rounded-full object-cover" alt="" />
            </Link>
            <div className="flex-1">
              {editingId === c._id ? (
                <div className="flex items-center gap-2">
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-sm outline-none"
                    autoFocus
                  />
                  <button onClick={() => saveEdit(c._id)} className="text-xs text-primary-500 font-medium">
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-xs text-gray-500">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-2xl px-3 py-1.5 inline-block">
                  <Link to={`/profile/${c.author?.username}`} className="text-xs font-semibold hover:underline">
                    {c.author?.name}
                  </Link>
                  <p className="text-sm">{c.text}</p>
                </div>
              )}

              <div className="flex items-center gap-3 mt-0.5 pl-3">
                <button
                  onClick={() => toggleCommentLike(c._id)}
                  className={`flex items-center gap-1 text-xs font-medium ${
                    commentLiked ? "text-primary-500" : "text-gray-500"
                  } hover:text-primary-500`}
                >
                  <FiHeart size={12} className={commentLiked ? "fill-current" : ""} />
                  {c.likes?.length > 0 && c.likes.length}
                </button>
                {mine && editingId !== c._id && (
                  <>
                    <button onClick={() => startEdit(c)} className="text-gray-400 hover:text-primary-500" title="Edit">
                      <FiEdit2 size={12} />
                    </button>
                    <button onClick={() => deleteComment(c._id)} className="text-gray-400 hover:text-red-500" title="Delete">
                      <FiTrash2 size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {error && <p className="text-xs text-red-500 mb-1">{error}</p>}

      <form onSubmit={submitComment} className="flex items-center gap-2 mt-2">
        <img src={avatarOf(user)} className="w-7 h-7 rounded-full object-cover" alt="" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment... (press Enter)"
          className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-sm outline-none"
        />
      </form>
    </div>
  );
};

export default CommentSection;
