import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { accessToken, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "employee") {
    return <Navigate to="/not-found" replace />;
    }
  }
  return <Outlet />;
};

export default ProtectedRoute;
