import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Typography,
  Pagination,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  TableSortLabel,
  Alert,
  Snackbar,
  Grid
} from '@mui/material';
import {
  Search,
  Visibility,
  Edit,
  Delete,
  Add
} from '@mui/icons-material';
import { ticketService } from '../../services/ticketService';
import { userService } from '../../services/userService';
import { projectService } from '../../services/projectService';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

const Tickets = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [ticketToEdit, setTicketToEdit] = useState(null);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    status: 'Pending',
    priority: 'Medium',
    source: 'Manual',
    projectId: '',
    assignedTo: '',
    managedBy: '',
    emailSubject: '',
    basecampUrl: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsData, usersData, projectsData] = await Promise.all([
        ticketService.getTickets(),
        userService.getUsers(),
        projectService.getProjects()
      ]);
      setTickets(ticketsData);
      setUsers(usersData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setSnackbar({ open: true, message: 'Error loading data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (priorityFilter) filters.priority = priorityFilter;
      if (search) filters.search = search;
      
      const data = await ticketService.getTickets(filters);
      setTickets(data);
    } catch (error) {
      console.error('Error loading tickets:', error);
      setSnackbar({ open: true, message: 'Error loading tickets', severity: 'error' });
    }
  };

  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter]);

  const handleSort = (property) => {
    let direction = 'asc';
    if (sortConfig.key === property && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: property, direction });
  };

  const getUserName = (user) => user?.name || '-';

  const getSortedTickets = (data) => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      let aVal, bVal;
      
      // Handle nested properties
      if (sortConfig.key === 'projectName') {
        aVal = a.project?.name || '';
        bVal = b.project?.name || '';
      } else if (sortConfig.key === 'assignedTo') {
        aVal = getUserName(a.assignedToUser);
        bVal = getUserName(b.assignedToUser);
      } else if (sortConfig.key === 'managedBy') {
        aVal = getUserName(a.managedByUser);
        bVal = getUserName(b.managedByUser);
      } else if (sortConfig.key === 'createdAt') {
        aVal = new Date(a.createdAt);
        bVal = new Date(b.createdAt);
      } else {
        aVal = a[sortConfig.key];
        bVal = b[sortConfig.key];
      }
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredTickets = getSortedTickets(tickets.filter(ticket => {
    const matchesSearch = !search || 
      ticket.title.toLowerCase().includes(search.toLowerCase()) ||
      ticket.ticketId.toLowerCase().includes(search.toLowerCase()) ||
      ticket.project?.name.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  }));

  const paginatedTickets = filteredTickets.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

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

  const handleDelete = async () => {
    try {
      await ticketService.deleteTicket(ticketToDelete.id);
      setTickets(tickets.filter(t => t.id !== ticketToDelete.id));
      setSnackbar({ open: true, message: 'Ticket deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting ticket:', error);
      setSnackbar({ open: true, message: 'Error deleting ticket', severity: 'error' });
    }
  };

  const handleAddNew = () => {
    setNewTicket({
      title: '',
      description: '',
      status: 'Pending',
      priority: 'Medium',
      source: 'Manual',
      projectId: '',
      assignedTo: '',
      managedBy: '',
      emailSubject: '',
      basecampUrl: ''
    });
    setAddDialogOpen(true);
  };

  const handleEdit = (ticket) => {
    setTicketToEdit({
      ...ticket,
      projectId: ticket.project?.id || '',
      managedBy: ticket.managedByUser?.id || '',
      assignedTo: ticket.assignedToUser?.id || '',
      emailSubject: ticket.emailSubject || '',
      basecampUrl: ticket.basecampUrl || ''
    });
    setEditDialogOpen(true);
  };

  const handleUpdateTicket = async () => {
    try {
      if (!ticketToEdit.title || !ticketToEdit.description || !ticketToEdit.projectId) {
        setSnackbar({ open: true, message: 'Please fill in all required fields', severity: 'warning' });
        return;
      }

      await ticketService.updateTicket(ticketToEdit.id, {
        title: ticketToEdit.title,
        description: ticketToEdit.description,
        status: ticketToEdit.status,
        priority: ticketToEdit.priority,
        source: ticketToEdit.source,
        projectId: ticketToEdit.projectId,
        managedBy: ticketToEdit.managedBy,
        assignedTo: ticketToEdit.assignedTo,
        emailSubject: ticketToEdit.emailSubject,
        basecampUrl: ticketToEdit.basecampUrl
      });
      setEditDialogOpen(false);
      setSnackbar({ open: true, message: 'Ticket updated successfully', severity: 'success' });
      loadData();
    } catch (error) {
      console.error('Error updating ticket:', error);
      setSnackbar({ open: true, message: 'Error updating ticket', severity: 'error' });
    }
  };

  const handleCreateTicket = async () => {
    try {
      if (!newTicket.title || !newTicket.description || !newTicket.projectId) {
        setSnackbar({ open: true, message: 'Please fill in all required fields', severity: 'warning' });
        return;
      }

      await ticketService.createTicket(newTicket);
      setAddDialogOpen(false);
      setSnackbar({ open: true, message: 'Ticket created successfully', severity: 'success' });
      loadData();
    } catch (error) {
      console.error('Error creating ticket:', error);
      setSnackbar({ open: true, message: 'Error creating ticket', severity: 'error' });
    }
  };

  const managers = users.filter(u => u.role === 'manager');
  const employees = users.filter(u => u.role === 'employee' || u.role === 'manager');

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Tickets
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={handleAddNew}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
            },
            px: 3,
            py: 1,
            borderRadius: 2
          }}
        >
          New Ticket
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'primary.main' }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Posted">Posted</MenuItem>
              <MenuItem value="Reassigned">Reassigned</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              label="Priority"
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Critical">Critical</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Table>
          <TableHead sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={sortConfig.key === 'ticketId'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('ticketId')}
                  sx={{ color: 'white', '&:hover': { color: 'rgba(255,255,255,0.8)' } }}
                >
                  Ticket ID
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={sortConfig.key === 'title'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('title')}
                  sx={{ color: 'white', '&:hover': { color: 'rgba(255,255,255,0.8)' } }}
                >
                  Title
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={sortConfig.key === 'projectName'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('projectName')}
                  sx={{ color: 'white', '&:hover': { color: 'rgba(255,255,255,0.8)' } }}
                >
                  Project
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={sortConfig.key === 'status'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('status')}
                  sx={{ color: 'white', '&:hover': { color: 'rgba(255,255,255,0.8)' } }}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={sortConfig.key === 'priority'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('priority')}
                  sx={{ color: 'white', '&:hover': { color: 'rgba(255,255,255,0.8)' } }}
                >
                  Priority
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={sortConfig.key === 'managedBy'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('managedBy')}
                  sx={{ color: 'white', '&:hover': { color: 'rgba(255,255,255,0.8)' } }}
                >
                  Managed By
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={sortConfig.key === 'assignedTo'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('assignedTo')}
                  sx={{ color: 'white', '&:hover': { color: 'rgba(255,255,255,0.8)' } }}
                >
                  Assigned To
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <TableSortLabel
                  active={sortConfig.key === 'createdAt'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('createdAt')}
                  sx={{ color: 'white', '&:hover': { color: 'rgba(255,255,255,0.8)' } }}
                >
                  Created Date
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No tickets found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTickets.map((ticket) => (
                <TableRow 
                  key={ticket.id} 
                  hover
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(102, 126, 234, 0.04)'
                    },
                    transition: 'background-color 0.2s ease'
                  }}
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <TableCell sx={{ fontWeight: 500 }}>{ticket.ticketId}</TableCell>
                  <TableCell>{ticket.title}</TableCell>
                  <TableCell>{ticket.project?.name || '-'}</TableCell>
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
                  <TableCell>{getUserName(ticket.managedByUser)}</TableCell>
                  <TableCell>{getUserName(ticket.assignedToUser)}</TableCell>
                  <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                <Tooltip title="View">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/tickets/${ticket.id}`);
                    }}
                  >
                    <Visibility />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton 
                    size="small" 
                    color="info"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(ticket);
                    }}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTicketToDelete(ticket);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={Math.ceil(filteredTickets.length / rowsPerPage)}
          page={page}
          onChange={(e, newPage) => setPage(newPage)}
          color="primary"
        />
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this ticket?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Ticket</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Project</InputLabel>
                  <Select
                    value={newTicket.projectId}
                    label="Project"
                    onChange={(e) => setNewTicket({ ...newTicket, projectId: e.target.value })}
                    required
                  >
                    {projects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Source</InputLabel>
                  <Select
                    value={newTicket.source}
                    label="Source"
                    onChange={(e) => setNewTicket({ ...newTicket, source: e.target.value })}
                  >
                    <MenuItem value="Manual">Manual</MenuItem>
                    <MenuItem value="Email">Email</MenuItem>
                    <MenuItem value="Slack">Slack</MenuItem>
                    <MenuItem value="Basecamp">Basecamp</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {newTicket.source === 'Email' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Subject"
                    value={newTicket.emailSubject}
                    onChange={(e) => setNewTicket({ ...newTicket, emailSubject: e.target.value })}
                  />
                </Grid>
              )}
              {newTicket.source === 'Basecamp' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Basecamp URL"
                    value={newTicket.basecampUrl}
                    onChange={(e) => setNewTicket({ ...newTicket, basecampUrl: e.target.value })}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={newTicket.status}
                    label="Status"
                    onChange={(e) => setNewTicket({ ...newTicket, status: e.target.value })}
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Posted">Posted</MenuItem>
                    <MenuItem value="Reassigned">Reassigned</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={newTicket.priority}
                    label="Priority"
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Critical">Critical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Managed By</InputLabel>
                  <Select
                    value={newTicket.managedBy}
                    label="Managed By"
                    onChange={(e) => setNewTicket({ ...newTicket, managedBy: e.target.value })}
                  >
                    <MenuItem value="">None</MenuItem>
                    {managers.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Assigned To</InputLabel>
                  <Select
                    value={newTicket.assignedTo}
                    label="Assigned To"
                    onChange={(e) => setNewTicket({ ...newTicket, assignedTo: e.target.value })}
                  >
                    <MenuItem value="">None</MenuItem>
                    {employees.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTicket} color="primary" variant="contained">
            Create Ticket
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Ticket</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={ticketToEdit?.title || ''}
                  onChange={(e) => setTicketToEdit({ ...ticketToEdit, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={ticketToEdit?.description || ''}
                  onChange={(e) => setTicketToEdit({ ...ticketToEdit, description: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Project</InputLabel>
                  <Select
                    value={ticketToEdit?.projectId || ''}
                    label="Project"
                    onChange={(e) => setTicketToEdit({ ...ticketToEdit, projectId: e.target.value })}
                    required
                  >
                    {projects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Source</InputLabel>
                  <Select
                    value={ticketToEdit?.source || ''}
                    label="Source"
                    onChange={(e) => setTicketToEdit({ ...ticketToEdit, source: e.target.value })}
                  >
                    <MenuItem value="Manual">Manual</MenuItem>
                    <MenuItem value="Email">Email</MenuItem>
                    <MenuItem value="Slack">Slack</MenuItem>
                    <MenuItem value="Basecamp">Basecamp</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {ticketToEdit?.source === 'Email' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Subject"
                    value={ticketToEdit?.emailSubject || ''}
                    onChange={(e) => setTicketToEdit({ ...ticketToEdit, emailSubject: e.target.value })}
                  />
                </Grid>
              )}
              {ticketToEdit?.source === 'Basecamp' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Basecamp URL"
                    value={ticketToEdit?.basecampUrl || ''}
                    onChange={(e) => setTicketToEdit({ ...ticketToEdit, basecampUrl: e.target.value })}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={ticketToEdit?.status || ''}
                    label="Status"
                    onChange={(e) => setTicketToEdit({ ...ticketToEdit, status: e.target.value })}
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Posted">Posted</MenuItem>
                    <MenuItem value="Reassigned">Reassigned</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={ticketToEdit?.priority || ''}
                    label="Priority"
                    onChange={(e) => setTicketToEdit({ ...ticketToEdit, priority: e.target.value })}
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Critical">Critical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Managed By</InputLabel>
                  <Select
                    value={ticketToEdit?.managedBy || ''}
                    label="Managed By"
                    onChange={(e) => setTicketToEdit({ ...ticketToEdit, managedBy: e.target.value })}
                  >
                    <MenuItem value="">None</MenuItem>
                    {managers.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Assigned To</InputLabel>
                  <Select
                    value={ticketToEdit?.assignedTo || ''}
                    label="Assigned To"
                    onChange={(e) => setTicketToEdit({ ...ticketToEdit, assignedTo: e.target.value })}
                  >
                    <MenuItem value="">None</MenuItem>
                    {employees.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateTicket} color="primary" variant="contained">
            Update Ticket
          </Button>
        </DialogActions>
      </Dialog>

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

export default Tickets;
