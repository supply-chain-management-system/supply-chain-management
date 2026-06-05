import axios from "axios";
console.log("MY ENV URL IS:", import.meta.env.VITE_API_BASE_URL);
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});


api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

let isRefreshing = false;
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
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/refresh")
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

      if (!isPublicPath) {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);

    } finally {
      isRefreshing = false;
    }
  }
);

export default api;