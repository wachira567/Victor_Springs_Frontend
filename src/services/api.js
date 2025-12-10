import axios from 'axios';

// 1. Create a configured Axios instance
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Your Python Backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Add an interceptor to include the Token if logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;