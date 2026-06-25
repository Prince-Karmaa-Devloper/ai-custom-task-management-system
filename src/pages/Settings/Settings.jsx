import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  TextField,
  Button,
  Grid
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

const Settings = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Typography variant="h4" gutterBottom>
        <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Settings
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Notification Settings</Typography>
        <Divider sx={{ mb: 2 }} />
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Email notifications"
        />
        <br />
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Push notifications"
        />
        <br />
        <FormControlLabel
          control={<Switch />}
          label="SMS notifications"
        />
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Preferences</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Language"
              select
              defaultValue="en"
              SelectProps={{ native: true }}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Timezone"
              select
              defaultValue="UTC"
              SelectProps={{ native: true }}
            >
              <option value="UTC">UTC</option>
              <option value="EST">EST</option>
              <option value="PST">PST</option>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Security</Typography>
        <Divider sx={{ mb: 2 }} />
        <Button variant="outlined">Change Password</Button>
        <br />
        <Button variant="outlined" sx={{ mt: 1 }}>Enable Two-Factor Authentication</Button>
      </Paper>
    </motion.div>
  );
};

export default Settings;
