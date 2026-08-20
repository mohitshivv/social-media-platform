import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { FiThumbsUp, FiMessageCircle, FiTrash2, FiEdit2 } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import CommentSection from "./CommentSection.jsx";

const PostCard = ({ post, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(post.text);

  const isOwner = post.author._id === user._id;
  const liked = post.likes.includes(user._id);

  const toggleLike = async () => {
    const { data } = await api.put(`/posts/${post._id}/like`);
    onUpdate(data);
  };

  const saveEdit = async () => {
    const { data } = await api.put(`/posts/${post._id}`, { text });
    onUpdate({ ...post, text: data.text });
    setEditing(false);
  };

  const deletePost = async () => {
    if (!confirm("Delete this post?")) return;
    await api.delete(`/posts/${post._id}`);
    onDelete(post._id);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={post.author.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${post.author.name}`}
            className="w-10 h-10 rounded-full object-cover"
            alt=""
          />
          <div>
            <p className="font-semibold text-sm">{post.author.name}</p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        {isOwner && (
          <div className="flex gap-2 text-gray-400">
            <button onClick={() => setEditing(!editing)} className="hover:text-primary-500">
              <FiEdit2 size={16} />
            </button>
            <button onClick={deletePost} className="hover:text-red-500">
              <FiTrash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="mb-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
            rows={3}
          />
          <button onClick={saveEdit} className="mt-2 bg-primary-500 text-white text-sm px-3 py-1 rounded-lg">
            Save
          </button>
        </div>
      ) : (
        post.text && <p className="text-sm mb-3 whitespace-pre-wrap">{post.text}</p>
      )}

      {post.media?.length > 0 && (
        <div className={`grid gap-1 mb-3 rounded-lg overflow-hidden ${post.media.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {post.media.map((m, i) =>
            m.type === "video" ? (
              <video key={i} src={m.url} controls className="w-full max-h-96 object-cover bg-black" />
            ) : (
              <img key={i} src={m.url} className="w-full max-h-96 object-cover" alt="" />
            )
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-2">
        <span>{post.likes.length} likes</span>
        <span>{post.comments.length} comments</span>
      </div>

      <div className="flex border-t border-gray-100 mt-2 pt-2">
        <button
          onClick={toggleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 ${
            liked ? "text-primary-500" : "text-gray-600"
          }`}
        >
          <FiThumbsUp /> Like
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          <FiMessageCircle /> Comment
        </button>
      </div>

      {showComments && <CommentSection post={post} onUpdate={onUpdate} />}
    </div>
  );
};

export default PostCard;
