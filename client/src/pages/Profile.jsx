import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiCamera, FiMapPin, FiLink } from "react-icons/fi";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getMediaUrl } from "../utils/mediaUrl.js";
import PostCard from "../components/PostCard.jsx";

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, setUser: setCurrentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", location: "", website: "" });
  const [rel, setRel] = useState({ status: "none" }); // none | sent | received | friends
  const [actionError, setActionError] = useState("");

  const load = () => {
    api.get(`/users/${username}`).then((res) => {
      setProfile(res.data.user);
      setPosts(res.data.posts);
      setForm({
        name: res.data.user.name,
        bio: res.data.user.bio,
        location: res.data.user.location,
        website: res.data.user.website,
      });
      if (res.data.user.username !== currentUser?.username) {
        api
          .get(`/friends/status/${res.data.user._id}`)
          .then((r) => setRel(r.data))
          .catch(() => setRel({ status: "none" }));
      }
    });
  };

  useEffect(() => {
    load();
  }, [username]);

  const isOwnProfile = currentUser?.username === username;

  const saveProfile = async () => {
    const { data } = await api.put("/users/profile", form);
    setProfile({ ...profile, ...data });
    if (isOwnProfile) setCurrentUser({ ...currentUser, ...data });
    setEditing(false);
  };

  const uploadImage = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    const endpoint = field === "profilePicture" ? "profile-picture" : "cover-photo";
    const { data } = await api.put(`/users/${endpoint}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setProfile(data);
    if (isOwnProfile) setCurrentUser(data);
  };

  const runAction = async (fn) => {
    setActionError("");
    try {
      await fn();
      load(); // refresh friends list, count and relationship
    } catch (err) {
      setActionError(err.response?.data?.message || "Something went wrong");
    }
  };

  const sendFriendRequest = () => runAction(() => api.post(`/friends/request/${profile._id}`));
  const cancelRequest = () => runAction(() => api.delete(`/friends/cancel/${rel.requestId}`));
  const acceptRequest = () => runAction(() => api.put(`/friends/accept/${rel.requestId}`));
  const declineRequest = () => runAction(() => api.put(`/friends/decline/${rel.requestId}`));
  const unfriend = () => {
    if (!confirm(`Remove ${profile.name} from your friends?`)) return;
    runAction(() => api.delete(`/friends/${profile._id}`));
  };

  if (!profile) return <p className="text-center mt-10 text-gray-500">Loading profile...</p>;

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-primary-500 to-blue-300 rounded-b-xl overflow-hidden">
          {profile.coverPhoto && <img src={getMediaUrl(profile.coverPhoto)} className="w-full h-full object-cover" alt="" />}
        </div>
        {isOwnProfile && (
          <label className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow cursor-pointer">
            <FiCamera />
            <input type="file" accept="image/*" hidden onChange={(e) => uploadImage(e, "coverPhoto")} />
          </label>
        )}

        <div className="absolute -bottom-12 left-6">
          <div className="relative">
            <img
              src={profile.profilePicture ? getMediaUrl(profile.profilePicture) : `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`}
              className="w-24 h-24 rounded-full border-4 border-white object-cover"
              alt=""
            />
            {isOwnProfile && (
              <label className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow cursor-pointer">
                <FiCamera size={14} />
                <input type="file" accept="image/*" hidden onChange={(e) => uploadImage(e, "profilePicture")} />
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="mt-14 px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{profile.name}</h1>
            <p className="text-gray-500 text-sm">@{profile.username}</p>
          </div>
          {isOwnProfile ? (
            <button
              onClick={() => setEditing(!editing)}
              className="bg-gray-200 text-gray-800 text-sm px-4 py-1.5 rounded-lg font-medium"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              {rel.status === "none" && (
                <button
                  onClick={sendFriendRequest}
                  className="bg-primary-500 text-white text-sm px-4 py-1.5 rounded-lg font-medium"
                >
                  Add Friend
                </button>
              )}
              {rel.status === "sent" && (
                <button
                  onClick={cancelRequest}
                  className="bg-gray-200 text-gray-800 text-sm px-4 py-1.5 rounded-lg font-medium"
                >
                  Request Sent · Cancel
                </button>
              )}
              {rel.status === "received" && (
                <>
                  <button
                    onClick={acceptRequest}
                    className="bg-primary-500 text-white text-sm px-4 py-1.5 rounded-lg font-medium"
                  >
                    Accept
                  </button>
                  <button
                    onClick={declineRequest}
                    className="bg-gray-200 text-gray-800 text-sm px-4 py-1.5 rounded-lg font-medium"
                  >
                    Decline
                  </button>
                </>
              )}
              {rel.status === "friends" && (
                <button
                  onClick={unfriend}
                  className="bg-gray-200 text-gray-800 text-sm px-4 py-1.5 rounded-lg font-medium hover:bg-red-100 hover:text-red-600"
                >
                  Friends ✓ · Unfriend
                </button>
              )}
            </div>
          )}
        </div>
        {actionError && <p className="text-sm text-red-500 mt-2">{actionError}</p>}

        {editing ? (
          <div className="mt-4 space-y-2 bg-gray-50 p-4 rounded-xl">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Bio"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              rows={2}
            />
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Location"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <input
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="Website"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <button onClick={saveProfile} className="bg-primary-500 text-white text-sm px-4 py-1.5 rounded-lg">
              Save Changes
            </button>
          </div>
        ) : (
          <div className="mt-3 text-sm text-gray-700 space-y-1">
            {profile.bio && <p>{profile.bio}</p>}
            {profile.location && (
              <p className="flex items-center gap-1 text-gray-500"><FiMapPin size={14} /> {profile.location}</p>
            )}
            {profile.website && (
              <p className="flex items-center gap-1 text-primary-500">
                <FiLink size={14} />
                <a href={profile.website} target="_blank" rel="noreferrer">{profile.website}</a>
              </p>
            )}
            <p className="text-gray-500">{profile.friends?.length || 0} friends</p>
          </div>
        )}

        {profile.friends?.length > 0 && (
          <div className="mt-4">
            <h2 className="font-semibold mb-2">Friends</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {profile.friends.map((f) => (
                <Link key={f._id} to={`/profile/${f.username}`} className="text-center">
                  <img
                    src={f.profilePicture ? getMediaUrl(f.profilePicture) : `https://api.dicebear.com/7.x/initials/svg?seed=${f.name}`}
                    className="w-16 h-16 rounded-lg object-cover mx-auto"
                    alt=""
                  />
                  <p className="text-xs mt-1 truncate">{f.name}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <h2 className="font-semibold mb-2">Posts</h2>
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onUpdate={(u) => setPosts(posts.map((p) => (p._id === u._id ? u : p)))}
              onDelete={(id) => setPosts(posts.filter((p) => p._id !== id))}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
