import { Navigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, tenantDomain } = useSelector((state) => state.auth);
  const { tenantDomain: routeTenant } = useParams();
  const slug = routeTenant || tenantDomain;

  if (!isAuthenticated) {
    return <Navigate to={slug ? `/${slug}/login` : '/login'} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={slug ? `/${slug}/dashboard` : '/dashboard'} replace />;
  }

  return children;
};

export default RoleRoute;
