import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/axios.js";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.put(`/auth/reset-password/${token}`, { password });
      localStorage.setItem("token", data.token);
      navigate("/");
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Set new password</h1>
        {error && <div className="bg-red-50 text-red-600 text-sm p-2 rounded-lg mb-4">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            required
            minLength={6}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-primary-500"
          />
          <button type="submit" className="w-full bg-primary-500 text-white py-2 rounded-lg font-medium">
            Reset password
          </button>
        </form>
        <div className="text-center mt-4 text-sm">
          <Link to="/login" className="text-primary-500">Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
