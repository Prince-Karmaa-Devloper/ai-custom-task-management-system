import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const useTenantPath = () => {
  const { tenantDomain } = useParams();
  const authTenant = useSelector((state) => state.auth.tenantDomain);
  const slug = tenantDomain || authTenant;

  return (path = '') => {
    if (!slug) {
      if (!path || path === '/') return `/`;
      const normalized = path.startsWith('/') ? path : `/${path}`;
      return normalized;
    }
    if (!path || path === '/') return `/${slug}`;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `/${slug}${normalized}`;
  };
};

export default useTenantPath;
