import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!user) return <Navigate to="/login" />;

  // 🔥 Role check
  if (role && user.role !== role) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;