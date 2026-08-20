import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiHome, FiBell, FiUsers, FiLogOut, FiSearch } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    api
      .get("/notifications")
      .then((res) => setUnread(res.data.filter((n) => !n.read).length))
      .catch(() => {});
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search)}`);
  };

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-primary-500 font-bold text-2xl">Connectify</Link>
        <form onSubmit={handleSearch} className="hidden sm:flex items-center bg-gray-100 rounded-full px-3 py-1.5">
          <FiSearch className="text-gray-500 mr-2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people..."
            className="bg-transparent outline-none text-sm w-40"
          />
        </form>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <Link to="/" className="text-gray-600 hover:text-primary-500 text-xl"><FiHome /></Link>
        <Link to="/friends" className="text-gray-600 hover:text-primary-500 text-xl"><FiUsers /></Link>
        <Link to="/notifications" className="relative text-gray-600 hover:text-primary-500 text-xl">
          <FiBell />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
              {unread}
            </span>
          )}
        </Link>
        <Link to={`/profile/${user.username}`}>
          <img
            src={user.profilePicture ? user.profilePicture : "https://api.dicebear.com/7.x/initials/svg?seed=" + user.name}
            alt="profile"
            className="w-8 h-8 rounded-full object-cover border border-gray-300"
          />
        </Link>
        <button onClick={logout} className="text-gray-500 hover:text-red-500 text-xl" title="Logout">
          <FiLogOut />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
