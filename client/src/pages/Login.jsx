import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold text-primary-500 text-center mb-1">Connectify</h1>
        <p className="text-center text-gray-500 mb-6 text-sm">Log in to your account</p>

        {error && <div className="bg-red-50 text-red-600 text-sm p-2 rounded-lg mb-4">{error}</div>}

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-primary-500"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-primary-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 text-white py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="text-center mt-4 text-sm">
          <Link to="/forgot-password" className="text-primary-500">Forgot password?</Link>
        </div>
        <div className="text-center mt-2 text-sm text-gray-600">
          Don't have an account? <Link to="/register" className="text-primary-500 font-medium">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
