import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const login = async (credentials) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { success: true } });
    }, 500);
  });
};

export const logout = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { success: true } });
    }, 300);
  });
};

export const getCurrentUser = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = JSON.parse(localStorage.getItem('user'));
      resolve({ data: user });
    }, 300);
  });
};

export default api;
