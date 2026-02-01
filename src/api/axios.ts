// src/api/axios.ts
import axios from 'axios';


const api = axios.create({
  baseURL: 'http://localhost:4000', // adjust if your backend differs
  headers: { 'Content-Type': 'application/json' },
});

// Attach API key to every request
api.interceptors.request.use((config) => {
  config.headers['x-api-key'] = import.meta.env.VITE_API_KEY;
  return config;
});


export default api;