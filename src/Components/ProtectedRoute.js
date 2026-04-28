import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const ProtectedRoute = () => {
  const { accessToken, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet/> ;
};

export default ProtectedRoute;
