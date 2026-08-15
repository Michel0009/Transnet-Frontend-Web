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
import { initEcho } from "../Api/Echo";
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(localStorage.getItem("userRole") || null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

    const clearLocalSession = () => {
      const userId = localStorage.getItem("userId");
      if (window.Echo) {
        if (userId) {
          window.Echo.leave("admin-tracking");
          window.Echo.leave(`user-status.${userId}`);
        }
        window.Echo.disconnect();
        window.Echo = null;
      }
      localStorage.removeItem("was_logged_in");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
      setAccessToken(null);
      setRole(null);
      setLoading(false);
    };
  const setupBlockListener = () => {
    const userId = localStorage.getItem("userId");
    if (!window.Echo || !userId) return;
    window.Echo.private(`user-status.${userId}`).listen(
      ".user.blocked",
      () => {
        toast.error("تم حظر حسابك");
         clearLocalSession();
      },
    );
  };
  const logout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setLoading(true);

    try {
      await api.get(endpoints.auth.logout);
    } catch (error) {
      console.error("Logout failed on server, clearing local state.");
    } finally {
       clearLocalSession();
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const wasLoggedIn = localStorage.getItem("was_logged_in");
      if (wasLoggedIn === "true") {
        try {
          const token = await refreshTokenApi();
          setAccessToken(token);
          initEcho(token);
          setupBlockListener();
        } catch (error) {
          setAccessToken(null);
          setRole(null);
          localStorage.removeItem("was_logged_in");
          localStorage.removeItem("userRole");
          localStorage.removeItem("userId");
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
      initEcho(token);
      setupBlockListener();
    } else {
      localStorage.removeItem("was_logged_in");
      if (window.Echo) {
        window.Echo.disconnect();
        window.Echo = null;
      }
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
