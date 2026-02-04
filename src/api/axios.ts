// src/api/axios.ts
import axios from 'axios';

// Use relative paths - the server will proxy /api/* requests to the backend
const api = axios.create({
  headers: { 'Content-Type': 'application/json' },
});

// Attach API key to every request
api.interceptors.request.use((config) => {
  const apiKey = import.meta.env.VITE_API_KEY;
  console.log('API Key from env:', apiKey);
  config.headers['x-api-key'] = apiKey;
  return config;
});


export default api;