import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { getMediaUrl } from "../utils/mediaUrl.js";
import FriendRequestCard from "../components/FriendRequestCard.jsx";

const Friends = () => {
  const [requests, setRequests] = useState([]);
  const [sent, setSent] = useState([]);

  const load = () => {
    api.get("/friends/requests").then((res) => setRequests(res.data));
    api.get("/friends/sent").then((res) => setSent(res.data));
  };

  useEffect(() => {
    load();
  }, []);

  const cancelSent = async (id) => {
    await api.delete(`/friends/cancel/${id}`);
    setSent(sent.filter((r) => r._id !== id));
  };

  return (
    <div className="max-w-lg mx-auto py-4 px-3">
      <h1 className="text-xl font-bold mb-4">Friend Requests</h1>

      {requests.length === 0 && <p className="text-gray-500 text-sm mb-6">No pending requests</p>}
      {requests.map((r) => (
        <FriendRequestCard
          key={r._id}
          request={r}
          onAction={(id) => setRequests(requests.filter((req) => req._id !== id))}
        />
      ))}

      {sent.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mt-6 mb-2">Sent Requests</h2>
          {sent.map((r) => (
            <div key={r._id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 mb-2">
              <img
                src={r.recipient.profilePicture ? getMediaUrl(r.recipient.profilePicture) : `https://api.dicebear.com/7.x/initials/svg?seed=${r.recipient.name}`}
                className="w-10 h-10 rounded-full object-cover"
                alt=""
              />
              <span className="text-sm font-medium">{r.recipient.name}</span>
              <span className="text-xs text-gray-400 ml-auto">Pending</span>
              <button
                onClick={() => cancelSent(r._id)}
                className="bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-lg"
              >
                Cancel
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Friends;
