import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiX, FiChevronLeft, FiChevronRight, FiTrash2 } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import { getMediaUrl } from "../utils/mediaUrl.js";

const StoryViewer = ({ group, onClose, onChanged }) => {
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  const story = group.stories[index];
  const isOwn = group.author._id === user._id;

  useEffect(() => {
    if (story && !isOwn) api.put(`/stories/${story._id}/view`).catch(() => {});
  }, [story]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (index < group.stories.length - 1) setIndex(index + 1);
      else onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [index]);

  const deleteStory = async () => {
    if (!confirm("Delete this story?")) return;
    try {
      await api.delete(`/stories/${story._id}`);
      onChanged?.();
      onClose();
    } catch {
      alert("Could not delete story");
    }
  };

  if (!story) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center">
      <button onClick={onClose} className="absolute top-4 right-4 text-white text-2xl z-10">
        <FiX />
      </button>

      <div className="absolute top-3 left-3 right-14 flex gap-1">
        {group.stories.map((_, i) => (
          <div key={i} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
            <div className={`h-full bg-white ${i <= index ? "w-full" : "w-0"} transition-all`} />
          </div>
        ))}
      </div>

      <div className="absolute top-8 left-3 flex items-center gap-2 text-white z-10">
        <Link to={`/profile/${group.author.username}`} onClick={onClose} className="flex items-center gap-2">
          <img
            src={group.author.profilePicture ? getMediaUrl(group.author.profilePicture) : `https://api.dicebear.com/7.x/initials/svg?seed=${group.author.name}`}
            className="w-8 h-8 rounded-full object-cover"
            alt=""
          />
          <span className="text-sm font-semibold">{isOwn ? "Your story" : group.author.name}</span>
        </Link>
        <span className="text-xs text-white/70">
          {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}
        </span>
        {isOwn && (
          <button onClick={deleteStory} className="ml-2 text-white/80 hover:text-red-400" title="Delete story">
            <FiTrash2 size={16} />
          </button>
        )}
      </div>

      {index > 0 && (
        <button onClick={() => setIndex(index - 1)} className="absolute left-4 text-white text-3xl">
          <FiChevronLeft />
        </button>
      )}
      {index < group.stories.length - 1 && (
        <button onClick={() => setIndex(index + 1)} className="absolute right-4 text-white text-3xl">
          <FiChevronRight />
        </button>
      )}

      <div
        className="w-full max-w-md h-[80vh] rounded-xl flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: story.backgroundColor || "#1877f2" }}
      >
        {story.mediaType === "video" && (
          <video src={getMediaUrl(story.mediaUrl)} autoPlay className="max-h-full max-w-full" />
        )}
        {story.mediaType === "image" && (
          <img src={getMediaUrl(story.mediaUrl)} className="max-h-full max-w-full object-contain" alt="" />
        )}
        {story.mediaType === "text" && (
          <p className="text-white text-2xl font-semibold text-center p-8 whitespace-pre-wrap">{story.text}</p>
        )}
      </div>
    </div>
  );
};

export default StoryViewer;
