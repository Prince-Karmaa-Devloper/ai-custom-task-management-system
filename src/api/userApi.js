import axios from 'axios';
import { getAllUsers, getUserById } from '../data/users';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getUsers = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getAllUsers();
      resolve({ data: users });
    }, 500);
  });
};

export const getUserByIdApi = async (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = getUserById(userId);
      resolve({ data: user });
    }, 300);
  });
};

export const createUser = async (userData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { success: true, user: { ...userData, id: Date.now() } } });
    }, 500);
  });
};

export const updateUser = async (userId, userData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { success: true, user: { ...userData, id: userId } } });
    }, 500);
  });
};

export const deleteUser = async (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { success: true } });
    }, 500);
  });
};

export default api;
