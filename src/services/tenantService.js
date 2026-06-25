import api from './api';

const normalizeTenant = (tenant) => ({
  ...tenant,
  companyName: tenant.name || tenant.companyName
});

export const tenantService = {
  async getPublicTenant(domain) {
    try {
      const response = await api.get(`/tenants/public/${domain}`);
      return normalizeTenant(response.data);
    } catch (error) {
      // Fallback to mock data
      console.warn('API getPublicTenant failed, using mock data:', error);
      const mockTenants = {
        admin1: { domain: 'admin1', companyName: 'Admin 1 Company', name: 'Admin 1 Company' },
        admin2: { domain: 'admin2', companyName: 'Admin 2 Company', name: 'Admin 2 Company' },
        admin3: { domain: 'admin3', companyName: 'Admin 3 Company', name: 'Admin 3 Company' },
        global: { domain: 'global', companyName: 'AI Task Manager', name: 'Global Platform' }
      };
      return mockTenants[domain] || { domain, companyName: domain.charAt(0).toUpperCase() + domain.slice(1), name: domain.charAt(0).toUpperCase() + domain.slice(1) };
    }
  },

  async createTenant(data) {
    const response = await api.post('/tenants/create', data);
    return { ...response.data, company: normalizeTenant(response.data.company) };
  },

  async getTenants() {
    const response = await api.get('/tenants');
    return response.data.map(normalizeTenant);
  },

  async toggleTenantStatus(companyId, isActive) {
    const response = await api.put(`/tenants/${companyId}/status`, { isActive });
    return { ...response.data, company: normalizeTenant(response.data.company) };
  }
};
