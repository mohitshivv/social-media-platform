import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiX } from "react-icons/fi";
import api from "../api/axios.js";
import { getMediaUrl } from "../utils/mediaUrl.js";

const LikesModal = ({ postId, onClose }) => {
  const [likers, setLikers] = useState(null);

  useEffect(() => {
    api.get(`/posts/${postId}/likes`).then((res) => setLikers(res.data));
  }, [postId]);

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center px-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl w-full max-w-sm max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold">Liked by</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FiX size={18} />
          </button>
        </div>

        <div className="p-2">
          {likers === null && <p className="text-center text-gray-500 text-sm py-4">Loading...</p>}
          {likers?.length === 0 && <p className="text-center text-gray-500 text-sm py-4">No likes yet</p>}
          {likers?.map((u) => (
            <Link
              key={u._id}
              to={`/profile/${u.username}`}
              onClick={onClose}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
            >
              <img
                src={u.profilePicture ? getMediaUrl(u.profilePicture) : `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                className="w-9 h-9 rounded-full object-cover"
                alt=""
              />
              <span className="text-sm font-medium">{u.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LikesModal;
