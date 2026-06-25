import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTickets } from '../../store/ticketSlice';
import { fetchUsers } from '../../store/userSlice';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Reports = () => {
  const { user } = useSelector(state => state.auth);
  const { tickets, loading: ticketsLoading } = useSelector(state => state.tickets);
  const { users, loading: usersLoading } = useSelector(state => state.users);
  const dispatch = useDispatch();
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    dispatch(fetchTickets());
    dispatch(fetchUsers());
  }, [dispatch]);

  // Apply filters
  const filteredTickets = tickets.filter(ticket => {
    let matches = true;
    if (employeeFilter) {
      matches = matches && ticket.assignedTo === parseInt(employeeFilter);
    }
    if (projectFilter) {
      matches = matches && ticket.project?.name === projectFilter;
    }
    return matches;
  });

  const handleExport = (format) => {
    if (format === 'CSV') {
      // Implement CSV export
      const headers = ['Ticket ID', 'Title', 'Project', 'Assigned To', 'Status', 'Priority', 'Created Date', 'Est. Hours'];
      const rows = filteredTickets.map(ticket => [
        ticket.ticketId,
        ticket.title,
        ticket.project?.name || 'N/A',
        ticket.assignedToUser?.name || 'Unassigned',
        ticket.status,
        ticket.priority,
        ticket.createdAt ? new Date(ticket.createdAt).toISOString().split('T')[0] : 'N/A',
        ticket.estimatedHours || 0
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reports-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSnackbar({
        open: true,
        message: 'Report exported as CSV successfully!',
        severity: 'success'
      });
    } else {
      setSnackbar({
        open: true,
        message: `Exporting report as ${format} (Demo mode)`,
        severity: 'info'
      });
    }
  };

  // Prepare data for charts from filtered tickets
  const statusData = [
    { name: 'Pending', value: filteredTickets.filter(t => t.status === 'Pending').length },
    { name: 'In Progress', value: filteredTickets.filter(t => t.status === 'In Progress').length },
    { name: 'Completed', value: filteredTickets.filter(t => t.status === 'Completed').length },
    { name: 'Posted', value: filteredTickets.filter(t => t.status === 'Posted').length },
    { name: 'Reassigned', value: filteredTickets.filter(t => t.status === 'Reassigned').length }
  ].filter(item => item.value > 0);

  const priorityData = [
    { name: 'Low', value: filteredTickets.filter(t => t.priority === 'Low').length },
    { name: 'Medium', value: filteredTickets.filter(t => t.priority === 'Medium').length },
    { name: 'High', value: filteredTickets.filter(t => t.priority === 'High').length },
    { name: 'Critical', value: filteredTickets.filter(t => t.priority === 'Critical').length }
  ];

  // User performance data
  const userPerformanceData = users
    .filter(u => u.role === 'employee')
    .map(u => ({
      name: u.name,
      assigned: filteredTickets.filter(t => t.assignedTo === u.id).length,
      completed: filteredTickets.filter(t => t.assignedTo === u.id && t.status === 'Completed').length
    }));

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'error';
      case 'High':
        return 'warning';
      case 'Medium':
        return 'info';
      case 'Low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'primary';
      case 'Pending':
        return 'warning';
      case 'Posted':
        return 'info';
      case 'Reassigned':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getEmployeeName = (id) => {
    const emp = users.find(u => u.id === id);
    return emp ? emp.name : 'Unknown';
  };

  if (ticketsLoading || usersLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Reports & Analytics
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Employee</InputLabel>
              <Select
                value={employeeFilter}
                label="Employee"
                onChange={(e) => setEmployeeFilter(e.target.value)}
              >
                <MenuItem value="">All Employees</MenuItem>
                {users.filter(u => u.role === 'employee').map(u => (
                  <MenuItem key={u.id} value={u.id.toString()}>{u.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Project</InputLabel>
              <Select
                value={projectFilter}
                label="Project"
                onChange={(e) => setProjectFilter(e.target.value)}
              >
                <MenuItem value="">All Projects</MenuItem>
                {Array.from(new Set(tickets.map(t => t.project?.name).filter(Boolean))).map((p, i) => (
                  <MenuItem key={i} value={p}>{p}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <Box display="flex" gap={1} justifyContent="flex-end">
              <Button
                variant="contained"
                startIcon={<FileDownload />}
                onClick={() => handleExport('CSV')}
                sx={{ flex: 1, maxWidth: 200 }}
              >
                CSV
              </Button>
              <Button
                variant="contained"
                startIcon={<FileDownload />}
                onClick={() => handleExport('Excel')}
                sx={{ flex: 1, maxWidth: 200 }}
              >
                Excel
              </Button>
              <Button
                variant="contained"
                startIcon={<FileDownload />}
                onClick={() => handleExport('PDF')}
                sx={{ flex: 1, maxWidth: 200 }}
              >
                PDF
              </Button>
            </Box>
          </Grid>
        </Grid>
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Typography variant="body2" color="text.secondary">
            Showing {filteredTickets.length} of {tickets.length} tickets
          </Typography>
        </Box>
      </Paper>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Tickets by Status</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Tickets by Priority</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Employee Performance</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="assigned" fill="#8884d8" radius={[8, 8, 0, 0]} />
                <Bar dataKey="completed" fill="#00C49F" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Tickets Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Table>
          <TableHead sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ticket ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Project</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Assigned To</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Priority</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Created Date</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Est. Hours</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTickets.slice(0, 15).map((ticket) => (
              <TableRow key={ticket.ticketId || ticket.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{ticket.ticketId}</TableCell>
                <TableCell>{ticket.title}</TableCell>
                <TableCell>{ticket.project?.name || 'N/A'}</TableCell>
                <TableCell>{getEmployeeName(ticket.assignedTo)}</TableCell>
                <TableCell>
                  <Chip
                    label={ticket.status}
                    color={getStatusColor(ticket.status)}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={ticket.priority}
                    color={getPriorityColor(ticket.priority)}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell>{ticket.createdAt ? new Date(ticket.createdAt).toISOString().split('T')[0] : 'N/A'}</TableCell>
                <TableCell>{ticket.estimatedHours || 0}h</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default Reports;
