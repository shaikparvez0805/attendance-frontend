import axios from "axios";

const api = axios.create({
     baseURL: import.meta.env.VITE_API_URL || "https://attendance-backend-v4e5.onrender.com"
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// If the session expired while logged in, go back to the login page.
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem("token")) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export const errMsg = (e) =>
  e.response?.data?.message || (e.request ? "Cannot reach the server. Please try again." : "Something went wrong");

export default api;
