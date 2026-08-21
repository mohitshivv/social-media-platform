import { useState } from "react";
import { FiImage, FiVideo, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import { getMediaUrl } from "../utils/mediaUrl.js";

const CreatePost = ({ onCreated }) => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [posting, setPosting] = useState(false);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreviews(selected.map((f) => ({ url: URL.createObjectURL(f), type: f.type.startsWith("video") ? "video" : "image" })));
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) return;
    setPosting(true);
    try {
      const formData = new FormData();
      formData.append("text", text);
      files.forEach((f) => formData.append("media", f));
      const { data } = await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onCreated(data);
      setText("");
      setFiles([]);
      setPreviews([]);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <form onSubmit={submit}>
        <div className="flex items-start gap-3">
          <img
            src={user.profilePicture ? getMediaUrl(user.profilePicture) : `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
            className="w-10 h-10 rounded-full object-cover"
            alt=""
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`What's on your mind, ${user.name.split(" ")[0]}?`}
            className="flex-1 resize-none outline-none text-sm bg-gray-100 rounded-2xl px-4 py-2.5"
            rows={2}
          />
        </div>

        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {previews.map((p, i) => (
              <div key={i} className="relative">
                {p.type === "video" ? (
                  <video src={p.url} className="w-full h-24 object-cover rounded-lg" />
                ) : (
                  <img src={p.url} className="w-full h-24 object-cover rounded-lg" alt="" />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                >
                  <FiX size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-3 border-t border-gray-100 pt-3">
          <label className="flex items-center gap-1 text-sm text-gray-600 cursor-pointer hover:text-primary-500">
            <FiImage /> Photo
            <input type="file" accept="image/*" multiple hidden onChange={handleFiles} />
          </label>
          <label className="flex items-center gap-1 text-sm text-gray-600 cursor-pointer hover:text-primary-500">
            <FiVideo /> Video
            <input type="file" accept="video/*" multiple hidden onChange={handleFiles} />
          </label>
          <button
            type="submit"
            disabled={posting}
            className="bg-primary-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg disabled:opacity-50"
          >
            {posting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
