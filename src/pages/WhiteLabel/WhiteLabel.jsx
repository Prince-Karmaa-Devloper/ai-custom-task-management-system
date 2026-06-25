import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { Palette, Upload } from '@mui/icons-material';
import { fetchWhiteLabelSettings, updateWhiteLabelSettings } from '../../store/whiteLabelSlice';
import { motion } from 'framer-motion';

const WhiteLabel = () => {
  const dispatch = useDispatch();
  const saved = useSelector((state) => state.whiteLabel);

  const [companyName, setCompanyName] = useState(saved.companyName);
  const [dashboardTitle, setDashboardTitle] = useState(saved.dashboardTitle);
  const [primaryColor, setPrimaryColor] = useState(saved.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(saved.secondaryColor);
  const [logoUrl, setLogoUrl] = useState(saved.logoUrl);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    dispatch(fetchWhiteLabelSettings());
  }, [dispatch]);

  useEffect(() => {
    setCompanyName(saved.companyName);
    setDashboardTitle(saved.dashboardTitle);
    setPrimaryColor(saved.primaryColor);
    setSecondaryColor(saved.secondaryColor);
    setLogoUrl(saved.logoUrl);
  }, [saved]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setLogoUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      await dispatch(updateWhiteLabelSettings({
        companyName,
        dashboardTitle,
        primaryColor,
        secondaryColor,
        logoUrl
      })).unwrap();
      setSnackbar({ open: true, message: 'White label settings saved and applied across the app.', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to save white label settings.', severity: 'error' });
    }
  };

  if (saved.loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Typography variant="h4" gutterBottom>
        <Palette sx={{ mr: 1, verticalAlign: 'middle' }} />
        White Label Settings
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Branding</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Dashboard Title"
              value={dashboardTitle}
              onChange={(e) => setDashboardTitle(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>Logo</Typography>
            <Box display="flex" alignItems="center" gap={2}>
              {logoUrl ? (
                <Avatar src={logoUrl} sx={{ width: 64, height: 64 }} variant="rounded" />
              ) : (
                <Avatar sx={{ width: 64, height: 64 }} variant="rounded">
                  <Palette />
                </Avatar>
              )}
              <Button variant="outlined" component="label" startIcon={<Upload />}>
                Upload Logo
                <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Logo appears on the login page, sidebar, and top bar after saving.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Colors</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box sx={{ width: 40, height: 40, bgcolor: primaryColor, borderRadius: 1, border: '1px solid', borderColor: 'divider' }} />
              <TextField fullWidth label="Primary Color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
              <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ width: 40, height: 40, border: 'none', cursor: 'pointer' }} />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box sx={{ width: 40, height: 40, bgcolor: secondaryColor, borderRadius: 1, border: '1px solid', borderColor: 'divider' }} />
              <TextField fullWidth label="Secondary Color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
              <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} style={{ width: 40, height: 40, border: 'none', cursor: 'pointer' }} />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button variant="contained" onClick={handleSave}>Save Settings</Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>Preview</Typography>
        <Box sx={{ p: 3, background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`, color: 'white', borderRadius: 2, textAlign: 'center' }}>
          {logoUrl && (
            <Box component="img" src={logoUrl} alt="Logo preview" sx={{ height: 48, mb: 2, objectFit: 'contain' }} />
          )}
          <Typography variant="h5">{companyName}</Typography>
          <Typography variant="subtitle1">{dashboardTitle}</Typography>
        </Box>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ open: false, message: '' })}>
        <Alert severity="success" onClose={() => setSnackbar({ open: false, message: '' })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default WhiteLabel;
