import React, { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Edit, Delete, Add, LinkedIn, Business } from '@mui/icons-material';
import { getHierarchyUsers } from "../../utils/userHierarchy";
import { fetchUsers, addUser, updateUser, deleteUser } from '../../store/userSlice';
import { fetchTenants, addTenant, toggleTenantActive } from '../../store/tenantSlice';
import UserFormDialog from '../../components/Users/UserFormDialog';
import { getInitials, resolveTenantId } from '../../utils/userHierarchy';
import { motion } from 'framer-motion';

const Users = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  console.log("Users page currentUser:", currentUser);
  const allUsers = useSelector((state) => state.users.users);
  console.log("Users page allUsers:", allUsers);
  const allTenants = useSelector((state) => state.tenants.tenants);
  console.log("Users page allTenants:", allTenants);

  useEffect(() => {
    console.log("Users page useEffect, calling fetchUsers and fetchTenants");
    dispatch(fetchUsers());
    if (currentUser?.role === 'superadmin') {
      dispatch(fetchTenants());
    }
  }, [dispatch, currentUser]);

  const usersData = useMemo(() => {
    // Fallback: if allUsers is empty, add currentUser with proper tenantId
    const usersToUse = [...allUsers];
    if (currentUser && !usersToUse.find(u => u.id === currentUser.id)) {
      // Ensure user has tenantId (use tenantDomain if available)
      const userWithTenant = {
        ...currentUser,
        tenantId: currentUser.tenantId || currentUser.tenantDomain || 'unknown'
      };
      usersToUse.push(userWithTenant);
    }
    return getHierarchyUsers(currentUser, usersToUse);
  }, [currentUser, allUsers]);

  // Group users by tenant and calculate stats dynamically
  const tenantStats = useMemo(() => {
    const stats = {};
    
    // Initialize stats for all tenants
    allTenants.forEach((tenant) => {
      if (tenant.domain !== 'global') {
        stats[tenant.domain] = {
          id: tenant.id,
          tenantId: tenant.domain,
          companyName: tenant.companyName,
          isActive: tenant.isActive ?? true,
          admin: 0,
          manager: 0,
          employee: 0,
          total: 0
        };
      }
    });

    // Increment role counters from user list
    allUsers.forEach((user) => {
      if (user.tenantId && user.tenantId !== 'global') {
        if (!stats[user.tenantId]) {
          stats[user.tenantId] = {
            id: null,
            tenantId: user.tenantId,
            companyName: user.tenantId.charAt(0).toUpperCase() + user.tenantId.slice(1),
            isActive: true,
            admin: 0,
            manager: 0,
            employee: 0,
            total: 0
          };
        }
        if (stats[user.tenantId].hasOwnProperty(user.role)) {
          stats[user.tenantId][user.role]++;
        }
        stats[user.tenantId].total++;
      }
    });

    return Object.values(stats);
  }, [allUsers, allTenants]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  const getRoleColor = (role) => {
    switch (role) {
      case 'superadmin':
        return 'error';
      case 'admin':
        return 'warning';
      case 'manager':
        return 'info';
      case 'employee':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleAdd = () => {
    setCurrentAction('add');
    setSelectedUser(null);
    setFormOpen(true);
  };

  const handleEdit = (user) => {
    setCurrentAction('edit');
    setSelectedUser(user);
    setFormOpen(true);
  };

  const handleDelete = (user) => {
    setCurrentAction('delete');
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    const isSuperAdmin = currentUser?.role === 'superadmin';
    const isCreatingAdmin = formData.role === 'admin' && currentAction === 'add';

    try {
      setLoading(true);
      
      if (isSuperAdmin && isCreatingAdmin && formData.companyName && formData.domain) {
        await dispatch(addTenant({
          companyName: formData.companyName,
          domain: formData.domain,
          adminEmail: formData.email,
          adminPassword: formData.password,
          adminName: formData.name
        })).unwrap();

        setSnackbar({ open: true, message: 'Company and Admin created successfully', severity: 'success' });
        // Refresh users
        dispatch(fetchUsers());
      } else {
        const parentId = formData.parentId ? Number(formData.parentId) : null;
        const tenantId = formData.domain || resolveTenantId(allUsers, parentId, currentUser);

        if (currentAction === 'add') {
          await dispatch(addUser({
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
            role: formData.role,
            parentId,
            tenantId,
            linkedin: formData.linkedin.trim(),
            skills: formData.skills,
            knowledge: formData.knowledge
          })).unwrap();
          setSnackbar({ open: true, message: 'User created successfully', severity: 'success' });
        } else if (selectedUser) {
          await dispatch(updateUser({
            id: selectedUser.id,
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password || undefined,
            role: formData.role,
            parentId,
            tenantId,
            linkedin: formData.linkedin.trim(),
            skills: formData.skills,
            knowledge: formData.knowledge
          })).unwrap();
          setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
        }
      }

      setFormOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error in user form submit:', err);
      setSnackbar({ open: true, message: typeof err === 'string' ? err : 'Error performing user action', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTenantActive = async (tenant) => {
    try {
      await dispatch(toggleTenantActive({ 
        id: tenant.id, 
        domain: tenant.tenantId, 
        isActive: !tenant.isActive 
      })).unwrap();

      setSnackbar({ 
        open: true, 
        message: `${tenant.companyName} is now ${!tenant.isActive ? 'Active' : 'Inactive'}`, 
        severity: 'success' 
      });
    } catch (err) {
      console.error('Failed to toggle tenant:', err);
      setSnackbar({ open: true, message: 'Failed to update company status', severity: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (selectedUser) {
      try {
        await dispatch(deleteUser({ id: selectedUser.id, tenantId: selectedUser.tenantId })).unwrap();
        setSnackbar({
          open: true,
          message: `User ${selectedUser.name} deleted successfully`,
          severity: 'success'
        });
      } catch (err) {
        console.error('Failed to delete user:', err);
        setSnackbar({ open: true, message: 'Failed to delete user', severity: 'error' });
      }
    }
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const canDeleteUser = (user) => {
    if (user.id === currentUser.id) return false;
    if (currentUser.role === 'superadmin') return user.role !== 'superadmin';
    if (currentUser.role === 'admin' && ['manager', 'employee'].includes(user.role)) return true;
    if (currentUser.role === 'manager' && user.role === 'employee') return true;
    return false;
  };

  const canManageUser = (user) => user.id !== currentUser.id && user.role !== 'superadmin';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {currentUser?.role === 'superadmin' ? 'Users & Companies' : 'Users'}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAdd}
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
          {currentUser?.role === 'superadmin' && (
            <Typography sx={{ mr: 1 }}>New</Typography>
          )}
          User
        </Button>
      </Box>

      {currentUser?.role === 'superadmin' && (
        <Box mb={4}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
            Company Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Business sx={{ color: 'white', fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {tenantStats.length}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Total Companies
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            {tenantStats.map((tenant) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={tenant.tenantId}>
                <Card sx={{ 
                  borderRadius: 3, 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  opacity: tenant.isActive ? 1 : 0.6
                }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {tenant.companyName}
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={tenant.isActive}
                            onChange={() => handleToggleTenantActive(tenant)}
                            color="primary"
                          />
                        }
                        label={tenant.isActive ? 'Active' : 'Inactive'}
                        labelPlacement="top"
                        sx={{ margin: 0, '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
                      />
                    </Box>
                    <Grid container spacing={1} sx={{ mb: 1 }}>
                      <Grid item xs={6}>
                        <Chip label={`${tenant.admin} Admin`} color="warning" size="small" />
                      </Grid>
                      <Grid item xs={6}>
                        <Chip label={`${tenant.manager} Manager`} color="info" size="small" />
                      </Grid>
                      <Grid item xs={6}>
                        <Chip label={`${tenant.employee} Employee`} color="success" size="small" />
                      </Grid>
                      <Grid item xs={6}>
                        <Chip label={`Total: ${tenant.total}`} variant="outlined" size="small" />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Table>
          <TableHead sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Profile</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Role</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Reports To</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tenant/Company</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Skills</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usersData.map((user) => {
              const manager = allUsers.find((u) => u.id === user.parentId);
              return (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        {user.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{user.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {user.linkedin && (
                      <Tooltip title={user.linkedin}>
                        <IconButton
                          size="small"
                          color="primary"
                          component="a"
                          href={user.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <LinkedIn />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={getRoleColor(user.role)}
                      size="small"
                      sx={{ fontWeight: 500, textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {manager ? `${manager.name} (${manager.role})` : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {user.tenantId === 'global' ? (
                      <Chip
                        label="Super Admin"
                        color="error"
                        size="small"
                      />
                    ) : (
                      <Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {(user.tenantId || user.tenantDomain || 'unknown').charAt(0).toUpperCase() + (user.tenantId || user.tenantDomain || 'unknown').slice(1)}
                          </Typography>
                          {currentUser?.role === 'superadmin' && tenantStats.find(t => t.tenantId === user.tenantId) && (
                            <Chip 
                              label={tenantStats.find(t => t.tenantId === user.tenantId).isActive ? 'Active' : 'Inactive'} 
                              size="small" 
                              color={tenantStats.find(t => t.tenantId === user.tenantId).isActive ? 'success' : 'default'} 
                              variant="outlined" 
                            />
                          )}
                        </Box>
                        {currentUser?.role === 'superadmin' && (
                          <Box sx={{ mt: 0.5 }}>
                            {tenantStats.find(t => t.tenantId === user.tenantId) && (
                              <Box display="flex" gap={0.5} flexWrap="wrap">
                                <Chip
                                  label={`${tenantStats.find(t => t.tenantId === user.tenantId).admin}A`}
                                  size="small"
                                  color="warning"
                                  sx={{ fontSize: '0.65rem' }}
                                />
                                <Chip
                                  label={`${tenantStats.find(t => t.tenantId === user.tenantId).manager}M`}
                                  size="small"
                                  color="info"
                                  sx={{ fontSize: '0.65rem' }}
                                />
                                <Chip
                                  label={`${tenantStats.find(t => t.tenantId === user.tenantId).employee}E`}
                                  size="small"
                                  color="success"
                                  sx={{ fontSize: '0.65rem' }}
                                />
                                <Chip
                                  label={`T:${tenantStats.find(t => t.tenantId === user.tenantId).total}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.65rem' }}
                                />
                              </Box>
                            )}
                          </Box>
                        )}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {(user.knowledge || []).slice(0, 3).map((skill, i) => (
                        <Chip key={i} label={skill} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {canManageUser(user) && (
                      <Tooltip title="Edit">
                        <IconButton size="small" color="info" onClick={() => handleEdit(user)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canDeleteUser(user) && (
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(user)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <UserFormDialog
        open={formOpen}
        mode={currentAction}
        currentUser={currentUser}
        allUsers={allUsers}
        initialUser={selectedUser}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          Are you sure you want to delete user {selectedUser?.name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
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

export default Users;
