import axios from "axios";
import { endpoints } from "./Endpoints";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export const refreshTokenApi = async () => {
  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribeTokenRefresh((token) => resolve(token));
    });
  }

  isRefreshing = true;

  try {
    const res = await axios.post(
      `${API_BASE_URL}${endpoints.auth.refresh}`,
      {},
      {
        withCredentials: true,
        headers: { "X-Remember-Me": "true" },
      },
    );

    const newToken = res.data.access_token;
    onRefreshed(newToken);
    return newToken;
  } catch (err) {
    refreshSubscribers = [];
    throw err;
  } finally {
    isRefreshing = false;
  }
};

export const setupInterceptors = (accessToken, setAccessToken, logout) => {
  const requestInterceptor = api.interceptors.request.use((config) => {
    if (config._retry) {
      return config;
    }
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  const responseInterceptor = api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const status = error.response?.status;
      const message = error.response?.data?.message;
      if (
        status === 401 &&
        (message === "البريد الإلكتروني غير صحيح، يرجى المحاولة مرة أخرى" ||
          message ===
            "الرجاء تغيير كلمة المرور لكي تكون مختلفة عن كلمة المرور القديمة")
      ) {
        return Promise.reject(error);
      }
      if (status === 403 && (message === "frozen" || message === "banned")) {
        logout();
        return Promise.reject(error);
      }
      if (status === 401 && message === "Invalid refresh token") {
        logout();
        return Promise.reject(error);
      }

      if (status === 401 && !originalRequest._retry) {
        if (
          message ===
          "البريد الإلكتروني لا يتطابق مع كلمة المرور، يرجى المحاولة مرة أخرى"
        ) {
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          const newToken = await refreshTokenApi();
          setAccessToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          logout();
          return Promise.reject(refreshErr);
        }
      }

      return Promise.reject(error);
    },
  );

  return () => {
    api.interceptors.request.eject(requestInterceptor);
    api.interceptors.response.eject(responseInterceptor);
  };
};

export default api;
