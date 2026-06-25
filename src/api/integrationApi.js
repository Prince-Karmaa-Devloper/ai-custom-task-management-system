import axios from 'axios';
import { getAllIntegrations } from '../data/integrations';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getIntegrations = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const integrations = getAllIntegrations();
      resolve({ data: integrations });
    }, 500);
  });
};

export const connectIntegration = async (integrationId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { success: true, status: 'connected' } });
    }, 500);
  });
};

export const disconnectIntegration = async (integrationId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { success: true, status: 'disconnected' } });
    }, 500);
  });
};

export default api;
