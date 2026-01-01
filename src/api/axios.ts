// src/api/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000', // adjust if your backend differs
  headers: { 'Content-Type': 'application/json' },
});

export default api;