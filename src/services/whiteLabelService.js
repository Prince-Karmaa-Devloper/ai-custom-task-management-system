
import api from './api';

export const whiteLabelService = {
  async getSettings() {
    const response = await api.get('/whitelabel');
    return response.data;
  },
  async updateSettings(settings) {
    const response = await api.put('/whitelabel', settings);
    return response.data;
  }
};
