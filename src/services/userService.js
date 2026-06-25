import api from './api';

const normalizeRole = (role) => {
  if (!role) return '';
  let roleStr;
  if (typeof role === 'object' && role.name) {
    roleStr = role.name;
  } else {
    roleStr = String(role);
  }
  return roleStr.toLowerCase().replace(/_/g, '');
};

const normalizeUser = (user) => {
  if (!user) return user;
  const normalized = { ...user };
  if (normalized.role) {
    normalized.role = normalizeRole(normalized.role);
  }
  // Ensure avatar exists (backend might not send it for super admins)
  if (!normalized.avatar) {
    normalized.avatar = normalized.name ? normalized.name.charAt(0).toUpperCase() : 'U';
  }
  return normalized;
};

export const userService = {
  async getUsers() {
    const response = await api.get('/users');
    if (Array.isArray(response.data)) {
      return response.data.map(normalizeUser);
    }
    return response.data;
  },

  async getUserById(id) {
    const response = await api.get(`/users/${id}`);
    return normalizeUser(response.data);
  },

  async createUser(data) {
    const response = await api.post('/users', data);
    return normalizeUser(response.data);
  },

  async updateUser(id, data) {
    const response = await api.put(`/users/${id}`, data);
    return normalizeUser(response.data);
  },

  async deleteUser(id, tenantId) {
    const response = await api.delete(`/users/${id}${tenantId ? `?tenantId=${tenantId}` : ''}`);
    return response.data;
  }
};
