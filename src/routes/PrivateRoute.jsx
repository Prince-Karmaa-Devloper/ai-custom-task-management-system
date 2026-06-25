import { Navigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, tenantDomain } = useSelector((state) => state.auth);
  const { tenantDomain: routeTenant } = useParams();
  const slug = routeTenant || tenantDomain;

  if (!isAuthenticated) {
    return <Navigate to={slug ? `/${slug}/login` : '/login'} replace />;
  }

  return children;
};

export default PrivateRoute;
