import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Box, Paper, Typography, Grid, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { dashboardService } from '../../services/dashboardService';
import DashboardStats from '../../components/Dashboard/DashboardStats';
import DashboardCharts from '../../components/Dashboard/DashboardCharts';

const Dashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [stats, setStats] = useState({});
  const [charts, setCharts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, chartsData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getCharts()
      ]);
      setStats(statsData);
      setCharts(chartsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <DashboardStats role={user.role} stats={stats} />
        </Grid>

        <Grid item xs={12}>
          <DashboardCharts role={user.role} charts={charts} />
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default Dashboard;
