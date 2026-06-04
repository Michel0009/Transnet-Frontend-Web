import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useLayoutEffect,
} from "react";
import api, { setupInterceptors, refreshTokenApi } from "../Api/Api";
import LoadingScreen from "../Components/LoadingScreen";
import { endpoints } from "../Api/Endpoints";
import { toast } from "react-toastify";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(localStorage.getItem("userRole") || null);
  const logout = async () => {
    setLoading(true);
    try {
      await api.get(endpoints.auth.logout);
    } catch (error) {
      console.error("Logout failed on server, clearing local state.");
    } finally {
      toast.success("تم تسجيل الخروج بنجاح");
      localStorage.removeItem("was_logged_in");
      localStorage.removeItem("userRole");
      setAccessToken(null);
      setRole(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const wasLoggedIn = localStorage.getItem("was_logged_in");
      if (wasLoggedIn === "true") {
        try {
          const token = await refreshTokenApi();
          setAccessToken(token);
        } catch (error) {
          setAccessToken(null);
          setRole(null);
          localStorage.removeItem("was_logged_in");
          localStorage.removeItem("userRole");
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);
  useLayoutEffect(() => {
    const cleanup = setupInterceptors(accessToken, setAccessToken, logout);
    return () => cleanup();
  }, [accessToken]);
  const handleSetAccessToken = (token) => {
    if (token) {
      localStorage.setItem("was_logged_in", "true");
    } else {
      localStorage.removeItem("was_logged_in");
    }
    setAccessToken(token);
  };
  const handleSetRole = (newRole) => {
    if (newRole) {
      localStorage.setItem("userRole", newRole);
    } else {
      localStorage.removeItem("userRole");
    }
    setRole(newRole);
  };
  const value = {
    accessToken,
    setAccessToken: handleSetAccessToken,
    role,
    setRole: handleSetRole,
    loading,
    logout,
    isAuthenticated: !!accessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <LoadingScreen />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
