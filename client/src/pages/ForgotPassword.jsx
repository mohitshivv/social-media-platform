import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setMessage("A password reset link/token has been generated.");
      // In production this token is emailed to the user rather than shown here.
      setResetToken(data.resetToken);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Reset your password</h1>

        {error && <div className="bg-red-50 text-red-600 text-sm p-2 rounded-lg mb-4">{error}</div>}
        {message && <div className="bg-green-50 text-green-600 text-sm p-2 rounded-lg mb-4">{message}</div>}

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Your account email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-primary-500"
          />
          <button type="submit" className="w-full bg-primary-500 text-white py-2 rounded-lg font-medium">
            Send reset link
          </button>
        </form>

        {resetToken && (
          <p className="text-xs text-gray-500 mt-4 break-all">
            Dev token (would normally be emailed):{" "}
            <Link to={`/reset-password/${resetToken}`} className="text-primary-500 underline">
              Reset now
            </Link>
          </p>
        )}

        <div className="text-center mt-4 text-sm">
          <Link to="/login" className="text-primary-500">Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
