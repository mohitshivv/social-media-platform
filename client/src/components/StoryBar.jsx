import { useEffect, useState, useRef } from "react";
import { FiPlus } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import StoryViewer from "./StoryViewer.jsx";

const StoryBar = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const fileInputRef = useRef();

  const loadStories = () => {
    api.get("/stories").then((res) => setGroups(res.data));
  };

  useEffect(() => {
    loadStories();
  }, []);

  const handleCreate = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("media", file);
    await api.post("/stories", formData, { headers: { "Content-Type": "multipart/form-data" } });
    loadStories();
  };

  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide bg-white rounded-xl border border-gray-200 p-3 mb-4">
      <div className="flex flex-col items-center flex-shrink-0 w-20">
        <button
          onClick={() => fileInputRef.current.click()}
          className="w-16 h-16 rounded-full border-2 border-dashed border-primary-500 flex items-center justify-center text-primary-500"
        >
          <FiPlus size={22} />
        </button>
        <input ref={fileInputRef} type="file" accept="image/*,video/*" hidden onChange={handleCreate} />
        <span className="text-xs mt-1 text-center">Add story</span>
      </div>

      {groups.map((g) => (
        <button
          key={g.author._id}
          onClick={() => setActiveGroup(g)}
          className="flex flex-col items-center flex-shrink-0 w-20"
        >
          <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-primary-500 to-pink-500">
            <img
              src={g.author.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${g.author.name}`}
              className="w-full h-full rounded-full object-cover border-2 border-white"
              alt=""
            />
          </div>
          <span className="text-xs mt-1 truncate w-full text-center">
            {g.author._id === user._id ? "Your story" : g.author.name.split(" ")[0]}
          </span>
        </button>
      ))}

      {activeGroup && (
        <StoryViewer group={activeGroup} onClose={() => setActiveGroup(null)} />
      )}
    </div>
  );
};

export default StoryBar;
