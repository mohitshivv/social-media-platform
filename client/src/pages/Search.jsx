import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios.js";
import { getMediaUrl } from "../utils/mediaUrl.js";

const Search = () => {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (q) api.get(`/users?search=${encodeURIComponent(q)}`).then((res) => setResults(res.data));
  }, [q]);

  return (
    <div className="max-w-lg mx-auto py-4 px-3">
      <h1 className="text-xl font-bold mb-4">Search results for "{q}"</h1>
      {results.length === 0 && <p className="text-gray-500">No users found</p>}
      {results.map((u) => (
        <Link
          to={`/profile/${u.username}`}
          key={u._id}
          className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 mb-2"
        >
          <img
            src={u.profilePicture ? getMediaUrl(u.profilePicture) : `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
            className="w-10 h-10 rounded-full object-cover"
            alt=""
          />
          <div>
            <p className="text-sm font-medium">{u.name}</p>
            <p className="text-xs text-gray-500">@{u.username}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Search;
