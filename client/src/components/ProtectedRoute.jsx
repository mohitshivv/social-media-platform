import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center mt-20 text-gray-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
