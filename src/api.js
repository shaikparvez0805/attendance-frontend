import axios from "axios";

const api = axios.create({
  baseURL: "https://attendance-backend-v4e5.onrender.com",
});

export default api;

export function errMsg(ex) {
  return (
    ex?.response?.data?.message ||
    ex?.response?.data?.error ||
    ex?.message ||
    "Something went wrong. Please try again."
  );
}
