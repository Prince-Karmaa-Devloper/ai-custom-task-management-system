import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    console.log('API Request interceptor:', config.url);
    const token = localStorage.getItem('accessToken');
    console.log('Token in localStorage:', token ? 'present' : 'missing');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Added Authorization header:', config.headers.Authorization);
    } else {
      console.warn('No accessToken found in localStorage!');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token expiration
api.interceptors.response.use(
  (response) => {
    console.log('API Response received:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    const originalRequest = error.config;
    
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', response.data.accessToken);
        api.defaults.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        const tenantDomain = localStorage.getItem('tenantDomain') || 'global';
        localStorage.removeItem('tenantDomain');
        window.location.href = `/${tenantDomain}/login`;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
