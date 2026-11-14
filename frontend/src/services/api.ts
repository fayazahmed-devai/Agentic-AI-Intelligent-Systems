import axios from 'axios';

const rawBase =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  '';

let baseURL = '/api';
if (rawBase && rawBase.trim()) {
  const trimmed = rawBase.trim().replace(/\/+$/, '');
  baseURL = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 120000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexusmind_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRedirecting = false;

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nexusmind_token');
      localStorage.removeItem('nexusmind_user');
      window.dispatchEvent(new Event('nexusmind_unauthorized'));
      const path = window.location.pathname;
      if (!isRedirecting && path !== '/login' && path !== '/register' && path !== '/') {
        isRedirecting = true;
        setTimeout(() => {
          isRedirecting = false;
          window.location.href = '/login';
        }, 150);
      }
    }
    let message = error.response?.data?.message || error.message || 'An error occurred';
    if (error.response?.status === 404 && (!error.response?.data || typeof error.response.data === 'string' || !error.response.data.message)) {
      message = 'Backend API endpoint not reachable (404). Please ensure your Render backend is running and linked via VITE_API_URL in Vercel.';
    }
    return Promise.reject(new Error(message));
  }
);

export default api;

