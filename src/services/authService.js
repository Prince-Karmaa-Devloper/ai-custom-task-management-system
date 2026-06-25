import api from './api';

// Helper to get users from localStorage
const getUsersFromStorage = () => {
  const saved = localStorage.getItem('app_users');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing users from localStorage:', e);
    }
  }
  return [];
};

// Helper to normalize role to lowercase string without underscores
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

export const authService = {
  async login(email, password, tenantDomain) {
    try {
      console.log("authService login called with:", { email, password, tenantDomain });
      const response = await api.post('/auth/login', { email, password, tenantDomain });
      console.log("authService login response:", response.data);
      if (response.data.accessToken) {
        const user = { ...response.data.user };
        console.log("authService user before normalize role:", user);
        if (user.role) {
          user.role = normalizeRole(user.role);
        }
        console.log("authService user after normalize role:", user);
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        if (tenantDomain !== 'global') {
          localStorage.setItem('tenantDomain', tenantDomain);
        } else {
          localStorage.removeItem('tenantDomain');
        }
        return { ...response.data, user };
      }
      return response.data;
    } catch (error) {
      // Fallback to mock data if API fails
      console.warn('API login failed, using mock data:', error);
      const users = getUsersFromStorage();
      const user = users.find(u => u.email === email);
      if (user && password === user.password) {
        const mockUser = {
          ...user,
          tenantDomain: user.tenantId === 'global' ? 'global' : user.tenantId
        };
        if (mockUser.role) {
          mockUser.role = normalizeRole(mockUser.role);
        }
        localStorage.setItem('user', JSON.stringify(mockUser));
        if (mockUser.tenantDomain !== 'global') {
          localStorage.setItem('tenantDomain', mockUser.tenantDomain);
        } else {
          localStorage.removeItem('tenantDomain');
        }
        return { user: mockUser, accessToken: 'mock-token', refreshToken: 'mock-refresh' };
      }
      throw error;
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('API logout failed, continuing with local cleanup:', error);
    }
    const tenantDomain = localStorage.getItem('tenantDomain');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tenantDomain');
    return tenantDomain;
  },

  getCurrentUser() {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    const user = JSON.parse(userJson);
    if (user && user.role) {
      user.role = normalizeRole(user.role);
    }
    return user;
  },

  updateUser(user) {
    const updatedUser = { ...user };
    if (updatedUser.role) {
      updatedUser.role = normalizeRole(updatedUser.role);
    }
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }
};
