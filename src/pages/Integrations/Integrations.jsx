import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Grid,
  Avatar
} from '@mui/material';
import { Email, Chat, Sms, Link, LinkOff } from '@mui/icons-material';
import { motion } from 'framer-motion';

const defaultIntegrations = [
  { id: 1, name: 'Email', status: 'disconnected' },
  { id: 2, name: 'Slack', status: 'disconnected' },
  { id: 3, name: 'WhatsApp', status: 'disconnected' }
];

const Integrations = () => {
  const [integrationList, setIntegrationList] = useState(defaultIntegrations);

  const getIcon = (name) => {
    switch (name) {
      case 'Email':
        return <Email />;
      case 'Slack':
        return <Chat />;
      case 'WhatsApp':
        return <Sms />;
      default:
        return <Email />;
    }
  };

  const handleConnect = (id) => {
    setIntegrationList(integrationList.map(int =>
      int.id === id ? { ...int, status: 'connected', lastSync: new Date().toISOString() } : int
    ));
  };

  const handleDisconnect = (id) => {
    setIntegrationList(integrationList.map(int =>
      int.id === id ? { ...int, status: 'disconnected', lastSync: null } : int
    ));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Typography variant="h4" gutterBottom>Integrations</Typography>
      <Grid container spacing={3}>
        {integrationList.map((integration) => (
          <Grid item xs={12} md={6} key={integration.id}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2, bgcolor: integration.status === 'connected' ? 'success.main' : 'grey.500' }}>
                        {getIcon(integration.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{integration.name}</Typography>
                        <Chip
                          label={integration.status === 'connected' ? 'Connected' : 'Disconnected'}
                          color={integration.status === 'connected' ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Box>
                  {integration.lastSync && (
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Last sync: {new Date(integration.lastSync).toLocaleString()}
                    </Typography>
                  )}
                  <Box display="flex" gap={1}>
                    {integration.status === 'connected' ? (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<LinkOff />}
                        onClick={() => handleDisconnect(integration.id)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        startIcon={<Link />}
                        onClick={() => handleConnect(integration.id)}
                      >
                        Connect
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </motion.div>
  );
};

export default Integrations;
