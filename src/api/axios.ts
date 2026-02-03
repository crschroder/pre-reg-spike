// src/api/axios.ts
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;// || 'http://localhost:4000';
const api = axios.create({
  baseURL: baseURL, // adjust if your backend differs
  headers: { 'Content-Type': 'application/json' },
});

// Attach API key to every request
api.interceptors.request.use((config) => {
  config.headers['x-api-key'] = import.meta.env.VITE_API_KEY;
  return config;
});


export default api;