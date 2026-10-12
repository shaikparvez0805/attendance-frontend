
import axios from "axios";

const api = axios.create({
  baseURL: "https://attendance-backend-v4e5.onrender.com",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

export function errMsg(ex) {
  return (
    ex?.response?.data?.message ||
    ex?.response?.data?.error ||
    ex?.message ||
    "Something went wrong. Please try again."
  );
}
