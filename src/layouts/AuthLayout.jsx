import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Box, Container, Paper } from '@mui/material';
import { tenantService } from '../services/tenantService';

const AuthLayout = ({ children }) => {
  const { tenantDomain } = useParams();
  const defaultColors = useSelector((state) => state.whiteLabel);
  const [tenantBranding, setTenantBranding] = useState(null);

  useEffect(() => {
    const fetchTenantBranding = async () => {
      if (tenantDomain) {
        try {
          const data = await tenantService.getPublicTenant(tenantDomain);
          setTenantBranding(data.branding);
        } catch (err) {
          console.error('Failed to fetch tenant branding:', err);
        }
      }
    };
    fetchTenantBranding();
  }, [tenantDomain]);

  const effectivePrimary = tenantBranding?.primaryColor || defaultColors.primaryColor;
  const effectiveSecondary = tenantBranding?.secondaryColor || defaultColors.secondaryColor;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${effectivePrimary} 0%, ${effectiveSecondary} 100%)`,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 2,
          }}
        >
          {children}
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;
