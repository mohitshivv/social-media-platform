import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/axios.js";
import PostCard from "../components/PostCard.jsx";

const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setPost(null);
    setError("");
    api
      .get(`/post/${id}`)
      .then((res) => setPost(res.data))
      .catch((err) => setError(err.response?.data?.message || "Post not found"));
  }, [id]);

  return (
    <div className="max-w-xl mx-auto py-4 px-3">
      <Link to="/notifications" className="text-sm text-primary-500 mb-3 inline-block">
        ← Back to notifications
      </Link>
      {error && <p className="text-center text-gray-500 mt-10">{error}</p>}
      {!post && !error && <p className="text-center text-gray-500 mt-10">Loading post...</p>}
      {post && <PostCard post={post} onUpdate={setPost} onDelete={() => navigate("/")} />}
    </div>
  );
};

export default PostPage;
