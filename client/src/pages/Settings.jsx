import { useState } from "react";
import api from "../api/axios.js";

const Settings = () => {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords don't match");
      return;
    }
    if (form.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setMessage("Password updated successfully");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto py-8 px-4">
      <h1 className="text-xl font-bold mb-4">Change Password</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {error && <div className="bg-red-50 text-red-600 text-sm p-2 rounded-lg mb-3">{error}</div>}
        {message && <div className="bg-green-50 text-green-600 text-sm p-2 rounded-lg mb-3">{message}</div>}

        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            required
            placeholder="Current password"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-primary-500"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="New password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-primary-500"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Confirm new password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-primary-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 text-white py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
