import { useEffect, useState, useRef } from "react";
import { FiPlus, FiImage, FiType, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import { getMediaUrl } from "../utils/mediaUrl.js";
import StoryViewer from "./StoryViewer.jsx";

const COLORS = ["#1877f2", "#e11d48", "#16a34a", "#9333ea", "#ea580c", "#0f172a"];

const StoryBar = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [textOpen, setTextOpen] = useState(false);
  const [storyText, setStoryText] = useState("");
  const [bgColor, setBgColor] = useState(COLORS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  const loadStories = () => {
    api
      .get("/stories")
      .then((res) => setGroups(res.data))
      .catch(() => {});
  };

  // Load on open, then refresh every 30 seconds so friends' new stories appear without a reload
  useEffect(() => {
    loadStories();
    const timer = setInterval(loadStories, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = ""; // allow choosing the same file again later
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("media", file);
      await api.post("/stories", formData, { headers: { "Content-Type": "multipart/form-data" } });
      loadStories();
    } catch (err) {
      setError(err.response?.data?.message || "Story upload failed. Try a smaller photo/video.");
    } finally {
      setBusy(false);
    }
  };

  const postTextStory = async () => {
    if (!storyText.trim()) return;
    setError("");
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("text", storyText);
      formData.append("backgroundColor", bgColor);
      await api.post("/stories", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setStoryText("");
      setTextOpen(false);
      loadStories();
    } catch (err) {
      setError(err.response?.data?.message || "Could not post story");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex gap-3 overflow-x-auto scrollbar-hide bg-white rounded-xl border border-gray-200 p-3">
        <div className="flex flex-col items-center flex-shrink-0 w-20 relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            disabled={busy}
            className="w-16 h-16 rounded-full border-2 border-dashed border-primary-500 flex items-center justify-center text-primary-500 disabled:opacity-50"
          >
            <FiPlus size={22} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" hidden onChange={handleFile} />
          <span className="text-xs mt-1 text-center">{busy ? "Posting..." : "Add story"}</span>
        </div>

        {groups.map((g) => (
          <button
            key={g.author._id}
            onClick={() => setActiveGroup(g)}
            className="flex flex-col items-center flex-shrink-0 w-20"
          >
            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-primary-500 to-pink-500">
              <img
                src={g.author.profilePicture ? getMediaUrl(g.author.profilePicture) : `https://api.dicebear.com/7.x/initials/svg?seed=${g.author.name}`}
                className="w-full h-full rounded-full object-cover border-2 border-white"
                alt=""
              />
            </div>
            <span className="text-xs mt-1 truncate w-full text-center">
              {g.author._id === user._id ? "Your story" : g.author.name.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>

      {menuOpen && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => {
              setMenuOpen(false);
              fileInputRef.current.click();
            }}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <FiImage /> Photo / Video
          </button>
          <button
            onClick={() => {
              setMenuOpen(false);
              setTextOpen(true);
            }}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <FiType /> Text
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

      {textOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center px-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Create text story</h2>
              <button onClick={() => setTextOpen(false)} className="text-gray-500">
                <FiX />
              </button>
            </div>

            <div
              className="rounded-xl h-48 flex items-center justify-center p-4 mb-3"
              style={{ backgroundColor: bgColor }}
            >
              <textarea
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                maxLength={200}
                placeholder="Type your story..."
                className="w-full h-full bg-transparent text-white text-xl font-semibold text-center outline-none resize-none placeholder-white/70"
              />
            </div>

            <div className="flex items-center gap-2 mb-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setBgColor(c)}
                  className={`w-7 h-7 rounded-full border-2 ${bgColor === c ? "border-gray-800" : "border-white"}`}
                  style={{ backgroundColor: c }}
                  aria-label="Choose color"
                />
              ))}
            </div>

            <button
              onClick={postTextStory}
              disabled={busy || !storyText.trim()}
              className="w-full bg-primary-500 text-white py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {busy ? "Posting..." : "Share to story"}
            </button>
          </div>
        </div>
      )}

      {activeGroup && (
        <StoryViewer group={activeGroup} onClose={() => setActiveGroup(null)} onChanged={loadStories} />
      )}
    </div>
  );
};

export default StoryBar;
