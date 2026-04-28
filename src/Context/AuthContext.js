import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useLayoutEffect,
} from "react";
import api, { setupInterceptors, refreshTokenApi } from "../Api/Api";
import LoadingScreen from "../Components/LoadingScreen";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await api.get("/logout");
    } catch (error) {
      console.error("Logout failed on server, clearing local state.");
    } finally {
      localStorage.removeItem("was_logged_in");
      setAccessToken(null);
      window.location.href = "/login";
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
          localStorage.removeItem("was_logged_in");
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
  const value = {
    accessToken,
    setAccessToken: handleSetAccessToken,
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
