import axios from "axios";

console.log("MY ENV URL IS:", import.meta.env.VITE_API_BASE_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch (e) {
    return true;
  }
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      if (isTokenExpired(token)) {
        localStorage.removeItem("token");
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Only attempt the GET /me request if a valid token or session exists
    if (config.url === "/me" || config.url?.endsWith("/me")) {
      const hasSession = 
        (token && !isTokenExpired(token)) || 
        localStorage.getItem("has_session") === "true" ||
        document.cookie.includes("access_token");

      if (!hasSession) {
        return Promise.reject({
          message: "No active session or token found. Skipping /me request.",
          isLocalCancellation: true,
          config,
        });
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let isRedirecting = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    isRedirecting = false;
    return response;
  },

  async (error) => {
    // If it's a client-side cancelled / local validation failure, do not redirect or refresh
    if (error.isLocalCancellation) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/refresh") ||
      originalRequest.url?.includes("/login") ||
      originalRequest.url?.includes("/signup")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await api.post("/refresh");
      isRedirecting = false;
      processQueue(null);
      return api(originalRequest);

    } catch (refreshError) {
      processQueue(refreshError);

      const isPublicPath = [
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
        "/invite",
        "/pricing",
        "/contact-sales"
      ].some(path => window.location.pathname.startsWith(path)) || window.location.pathname === "/";

      // If no token is found, or if request returns 401, do not trigger automatic redirect if already on /login
      const isAlreadyOnLoginPage = window.location.pathname.includes("/login");

      if (!isPublicPath && !isAlreadyOnLoginPage && !isRedirecting) {
        isRedirecting = true;
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);

    } finally {
      isRefreshing = false;
    }
  }
);

export default api;