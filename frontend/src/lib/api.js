
// src/lib/api.js
import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export const ABS = (rel) =>
  `${API_BASE_URL}/${String(rel || '').replace(/^\//, '')}`; // /uploads/x.png -> http://localhost:3000/uploads/x.png

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const t = localStorage.getItem('token');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export default api;
