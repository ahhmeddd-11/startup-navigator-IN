import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper functions for token storage
export const getAccessToken = () => localStorage.getItem("accessToken");
export const getRefreshToken = () => localStorage.getItem("refreshToken");

export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
};

export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

// Request interceptor to attach JWT access tokens
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auto-refreshing JWTs
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Auth endpoints (login, register) return 401 for invalid credentials.
    // Do NOT treat those as expired sessions — let the error propagate
    // to the calling code (login/register handlers) which display it properly.
    const isAuthEndpoint =
      originalRequest?.url?.includes("/api/auth/login/") ||
      originalRequest?.url?.includes("/api/auth/register/") ||
      originalRequest?.url?.includes("/api/auth/refresh/");

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // If unauthorized and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refresh = getRefreshToken();
      if (!refresh) {
        clearTokens();
        isRefreshing = false;
        if (typeof window !== "undefined" && window.location.pathname !== "/") {
          sessionStorage.setItem("session_expired", "1");
          window.location.href = "/";
        }
        return Promise.reject(error);
      }

      try {
        // Direct axios post call to avoid using the interceptor headers for refreshing
        const res = await axios.post(`${API_URL}/api/auth/refresh/`, {
          refresh,
        });

        if (res.data?.success && res.data?.data?.access) {
          const newAccess = res.data.data.access;
          // Rotate tokens: if response also returns a new refresh token, store both
          const newRefresh = res.data.data.refresh || refresh;
          setTokens(newAccess, newRefresh);

          api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;

          processQueue(null, newAccess);
          isRefreshing = false;

          return api(originalRequest);
        } else {
          throw new Error("Token rotation response invalid");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        isRefreshing = false;
        if (typeof window !== "undefined" && window.location.pathname !== "/") {
          sessionStorage.setItem("session_expired", "1");
          window.location.href = "/";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

