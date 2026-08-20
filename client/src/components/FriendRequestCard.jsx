import { Link } from "react-router-dom";
import api from "../api/axios.js";

const FriendRequestCard = ({ request, onAction }) => {
  const respond = async (action) => {
    await api.put(`/friends/${action}/${request._id}`);
    onAction(request._id);
  };

  return (
    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200 mb-2">
      <Link to={`/profile/${request.sender.username}`} className="flex items-center gap-3">
        <img
          src={request.sender.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${request.sender.name}`}
          className="w-10 h-10 rounded-full object-cover"
          alt=""
        />
        <span className="font-medium text-sm">{request.sender.name}</span>
      </Link>
      <div className="flex gap-2">
        <button
          onClick={() => respond("accept")}
          className="bg-primary-500 text-white text-xs px-3 py-1.5 rounded-lg"
        >
          Accept
        </button>
        <button
          onClick={() => respond("decline")}
          className="bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-lg"
        >
          Decline
        </button>
      </div>
    </div>
  );
};

export default FriendRequestCard;
