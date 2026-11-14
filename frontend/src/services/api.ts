import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;

