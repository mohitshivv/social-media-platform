import { useEffect, useState } from "react";
import api from "../api/axios.js";
import CreatePost from "../components/CreatePost.jsx";
import PostCard from "../components/PostCard.jsx";
import StoryBar from "../components/StoryBar.jsx";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/posts/feed")
      .then((res) => setPosts(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleCreated = (post) => setPosts([post, ...posts]);
  const handleUpdate = (updated) => setPosts(posts.map((p) => (p._id === updated._id ? updated : p)));
  const handleDelete = (id) => setPosts(posts.filter((p) => p._id !== id));

  return (
    <div className="max-w-xl mx-auto py-4 px-3">
      <StoryBar />
      <CreatePost onCreated={handleCreated} />

      {loading && <p className="text-center text-gray-500">Loading feed...</p>}
      {!loading && posts.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No posts yet. Add friends or create your first post!
        </p>
      )}

      {posts.map((post) => (
        <PostCard key={post._id} post={post} onUpdate={handleUpdate} onDelete={handleDelete} />
      ))}
    </div>
  );
};

export default Feed;
