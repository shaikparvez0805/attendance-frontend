import axios from "axios";

const api = axios.create({
  baseURL: "https://attendance-backend-v4e5.onrender.com",
});

export default api;