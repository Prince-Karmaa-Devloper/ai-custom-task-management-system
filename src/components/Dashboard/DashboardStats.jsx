import React from 'react';
import { Box, Paper, Typography, Grid, Chip } from '@mui/material';
import { motion } from 'framer-motion';

const DashboardStats = ({ stats }) => {
  const getStats = () => {
    if (!stats) return [];
    
    if (stats.totalCompanies !== undefined) {
      return [
        { label: 'Total Companies', value: stats.totalCompanies, color: '#667eea' },
        { label: 'Total Users', value: stats.totalUsers, color: '#764ba2' },
        { label: 'Total Managers', value: stats.totalManagers, color: '#f093fb' },
        { label: 'Total Employees', value: stats.totalEmployees, color: '#f5576c' }
      ];
    }
    
    if (stats.totalEmployees !== undefined) {
      return [
        { label: 'Employees', value: stats.totalEmployees, color: '#667eea' },
        { label: 'Managers', value: stats.totalManagers, color: '#764ba2' },
        { label: 'Projects', value: stats.totalProjects, color: '#f093fb' },
        { label: 'Tickets', value: stats.totalTickets, color: '#f5576c' }
      ];
    }

    if (stats.teamMembers !== undefined) {
      return [
        { label: 'Team Members', value: stats.teamMembers, color: '#667eea' },
        { label: 'Assigned Tickets', value: stats.assignedTickets, color: '#764ba2' },
        { label: 'Completed Tickets', value: stats.completedTickets, color: '#4facfe' }
      ];
    }

    return [
      { label: 'Assigned Tasks', value: stats.assignedTickets, color: '#667eea' },
      { label: 'Completed Tasks', value: stats.completedTickets, color: '#764ba2' },
      { label: 'Pending Tasks', value: stats.pendingTickets, color: '#f093fb' },
      { label: 'AI Productivity', value: `${stats.aiProductivityScore || 85}/100`, color: '#f5576c' }
    ];
  };

  const statsData = getStats();

  return (
    <Box>
      <Grid container spacing={3}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}10 100%)`
                }}
              >
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {stat.label}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: stat.color }}>
                  {stat.value}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardStats;
