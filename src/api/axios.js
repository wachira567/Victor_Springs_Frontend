import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log("Axios interceptor: Error response", error.response?.status, error.response?.config?.url);
        if (error.response?.status === 401) {
            // Token expired or invalid
            console.log("Axios interceptor: Clearing token due to 401");
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('user_id');
            window.location.href = '/login';
        } else if (error.response?.status === 422) {
            // Unprocessable entity - check if it's auth-related
            console.log("Axios interceptor: 422 error details:", error.response?.data);
            // For now, don't auto-clear on 422 - might be validation errors
        }
        return Promise.reject(error);
    }
);

export default api;