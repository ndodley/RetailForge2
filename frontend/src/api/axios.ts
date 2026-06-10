import axios from 'axios';

// Create a dedicated axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
    withCredentials: true, // REQUIRED for Spring Session cookies
});

// Optional: Add interceptors (recommended for real apps)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // You can add global error handling here later
        return Promise.reject(error);
    }
);

export default api;
