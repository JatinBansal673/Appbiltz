import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_APP_BACKEND_URL}/api/v1`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = token;
  return config;
});

export default api;