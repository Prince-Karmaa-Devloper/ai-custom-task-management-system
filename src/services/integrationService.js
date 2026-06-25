import { getAllIntegrations } from '../data/integrations';

export const fetchIntegrations = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getAllIntegrations());
    }, 500);
  });
};

export const connectIntegration = (integrationId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, status: 'connected', lastSync: new Date().toISOString() });
    }, 800);
  });
};

export const disconnectIntegration = (integrationId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, status: 'disconnected' });
    }, 800);
  });
};
