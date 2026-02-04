// src/api/axios.ts
import axios from 'axios';

// Use the API URL from environment variables
const baseURL = import.meta.env.VITE_API_URL || '';
const api = axios.create({
  baseURL: baseURL,
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