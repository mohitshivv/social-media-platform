import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold text-primary-500 text-center mb-1">Connectify</h1>
        <p className="text-center text-gray-500 mb-6 text-sm">Create your account</p>

        {error && <div className="bg-red-50 text-red-600 text-sm p-2 rounded-lg mb-4">{error}</div>}

        <form onSubmit={submit} className="space-y-3">
          <input
            required
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-primary-500"
          />
          <input
            required
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, "") })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-primary-500"
          />
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
            minLength={6}
            placeholder="Password (min 6 characters)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-primary-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 text-white py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-primary-500 font-medium">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
