import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/authSlice';
import { tenantService } from '../../services/tenantService';
import useTenantPath from '../../hooks/useTenantPath';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';

const TENANT_CREDENTIALS = {
  global: { email: 'superadmin@test.com', password: '123456', label: 'Super Admin' },
  admin1: { email: 'admin1@test.com', password: '123456', label: 'Admin 1' },
  admin2: { email: 'admin2@test.com', password: '123456', label: 'Admin 2' },
  admin3: { email: 'admin3@test.com', password: '123456', label: 'Admin 3' }
};

const TENANT_FALLBACKS = {
  global: { companyName: 'AI Task Manager', name: 'Global Platform' },
  admin1: { companyName: 'Admin 1 Company', name: 'Admin 1 Company' },
  admin2: { companyName: 'Admin 2 Company', name: 'Admin 2 Company' },
  admin3: { companyName: 'Admin 3 Company', name: 'Admin 3 Company' }
};

const DEFAULT_COMPANY_NAME = 'AI Task Manager';

const Login = () => {
  const { tenantDomain } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tenantPath = useTenantPath();
  const { loading } = useSelector((state) => state.auth);
  const whiteLabel = useSelector((state) => state.whiteLabel);
  const allTenants = useSelector((state) => state.tenants.tenants);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [tenantInfo, setTenantInfo] = useState(null);
  const [tenantMissing, setTenantMissing] = useState(false);

  const isSuperAdminLogin = !tenantDomain;
  const effectiveTenantDomain = isSuperAdminLogin ? 'global' : tenantDomain;

  const hasCustomBranding =
    whiteLabel.companyName !== DEFAULT_COMPANY_NAME ||
    Boolean(whiteLabel.logoUrl) ||
    whiteLabel.primaryColor !== '#667eea' ||
    whiteLabel.secondaryColor !== '#764ba2';

  const fallbackTenant = TENANT_FALLBACKS[effectiveTenantDomain];
  const companyName = hasCustomBranding
    ? whiteLabel.companyName
    : (tenantInfo?.companyName || fallbackTenant?.companyName || whiteLabel.companyName);
  const logoUrl = tenantInfo?.branding?.logoUrl || whiteLabel.logoUrl || null;
  const primaryColor = tenantInfo?.branding?.primaryColor || whiteLabel.primaryColor || '#667eea';
  const secondaryColor = tenantInfo?.branding?.secondaryColor || whiteLabel.secondaryColor || '#764ba2';
  const demoCredentials = isSuperAdminLogin 
    ? { email: 'superadmin@test.com', password: '123456', label: 'Super Admin' }
    : TENANT_CREDENTIALS[tenantDomain];

  useEffect(() => {
    const loadTenant = async () => {
      if (isSuperAdminLogin) {
        setTenantMissing(false);
        return;
      }

      if (TENANT_FALLBACKS[tenantDomain]) {
        setTenantMissing(false);
      }

      try {
        const data = await tenantService.getPublicTenant(tenantDomain);
        setTenantInfo(data);
        setTenantMissing(false);
      } catch (requestError) {
        if (!TENANT_FALLBACKS[tenantDomain]) {
          setTenantMissing(true);
        }
        if (requestError.response?.status === 404) {
          setTenantMissing(true);
        }
      }
    };

    loadTenant();
  }, [tenantDomain, isSuperAdminLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (tenantMissing) {
      setError('This tenant portal does not exist.');
      return;
    }

    // Check if tenant is active (only for non-super admin logins)
    if (!isSuperAdminLogin) {
      const tenant = allTenants.find(t => t.domain === tenantDomain);
      if (tenant && !tenant.isActive) {
        setError('This company account is currently inactive. Please contact support.');
        return;
      }
    }

    const result = await dispatch(login({ email, password, tenantDomain: effectiveTenantDomain }));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate(tenantPath('/dashboard'));
    } else {
      setError(result.payload || 'Login failed. Please try again.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 420, borderRadius: 3 }}>
          <Box textAlign="center" mb={4}>
            {logoUrl ? (
              <Box
                component="img"
                src={logoUrl}
                alt={`${companyName} logo`}
                sx={{ height: 72, mb: 2, objectFit: 'contain' }}
              />
            ) : (
              <LockOutlined sx={{ fontSize: 48, color: primaryColor, mb: 2 }} />
            )}
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              {companyName}
            </Typography>
            {!isSuperAdminLogin && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Portal: /{tenantDomain}
              </Typography>
            )}

          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {tenantMissing && !error && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Could not verify this portal with the server. Start the backend and try again.
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button
              variant="contained"
              type="submit"
              fullWidth
              disabled={loading || tenantMissing}
              sx={{
                py: 1.5,
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  filter: 'brightness(0.95)',
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>

          {demoCredentials && (
            <Box mt={3} textAlign="center">
              <Typography variant="caption" color="text.secondary">
                Demo {demoCredentials.label}:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {demoCredentials.email} / {demoCredentials.password}
              </Typography>
            </Box>
          )}

          {!isSuperAdminLogin && (
            <Box mt={2} textAlign="center">
              <Typography variant="caption" color="text.secondary">
                Managers and employees for this company also use this same URL.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </motion.div>
  );
};

export default Login;
