import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Alert
} from '@mui/material';
import {
  getCreatableRoles,
  getEligibleParents,
  getDefaultParentId
} from '../../utils/userHierarchy';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: '',
  parentId: '',
  linkedin: '',
  skills: '',
  knowledge: '',
  companyName: '',
  domain: ''
};

const UserFormDialog = ({
  open,
  mode,
  currentUser,
  allUsers,
  initialUser,
  onClose,
  onSubmit
}) => {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isCreatingAdmin = form.role === 'admin';
  const showCompanyFields = isSuperAdmin && isCreatingAdmin && mode === 'add';

  const creatableRoles = useMemo(
    () => getCreatableRoles(currentUser?.role),
    [currentUser?.role]
  );

  const eligibleParents = useMemo(
    () => getEligibleParents(allUsers, currentUser, form.role),
    [allUsers, currentUser, form.role]
  );

  useEffect(() => {
    if (!open) return;

    if (mode === 'edit' && initialUser) {
      setForm({
        name: initialUser.name || '',
        email: initialUser.email || '',
        password: '',
        role: initialUser.role || '',
        parentId: initialUser.parentId || '',
        linkedin: initialUser.linkedin || '',
        skills: (initialUser.skills || []).join(', '),
        knowledge: (initialUser.knowledge || []).join(', '),
        companyName: initialUser.companyName || '',
        domain: initialUser.domain || ''
      });
    } else {
      const defaultRole = creatableRoles[0] || '';
      setForm({
        ...emptyForm,
        role: defaultRole,
        parentId: getDefaultParentId(allUsers, currentUser, defaultRole)
      });
    }
    setError('');
  }, [open, mode, initialUser, creatableRoles, allUsers, currentUser]);

  const handleRoleChange = (role) => {
    setForm((prev) => ({
      ...prev,
      role,
      parentId: getDefaultParentId(allUsers, currentUser, role)
    }));
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }

    if (mode === 'add' && !form.password.trim()) {
      setError('Password is required for new users.');
      return;
    }

    if (!form.role) {
      setError('Please select a role.');
      return;
    }

    if (showCompanyFields) {
      if (!form.companyName.trim()) {
        setError('Company Name is required for admin users.');
        return;
      }
      if (!form.domain.trim()) {
        setError('Domain Name is required for admin users.');
        return;
      }
    }

    if (eligibleParents.length > 0 && !form.parentId) {
      setError('Please select a reporting manager / upper hierarchy.');
      return;
    }

    onSubmit({
      ...form,
      skills: form.skills.split(',').map((item) => item.trim()).filter(Boolean),
      knowledge: form.knowledge.split(',').map((item) => item.trim()).filter(Boolean)
    });
  };

  const showParentField = ['admin', 'manager', 'employee'].includes(form.role) && eligibleParents.length > 0;
  const parentLabel =
    form.role === 'admin'
      ? 'Super Admin (reports to)'
      : form.role === 'manager'
        ? 'Admin (reports to)'
        : 'Manager (reports to)';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'edit' ? 'Edit User' : 'Add New User'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required={mode === 'add'}
              label={mode === 'edit' ? 'Password (leave blank to keep)' : 'Password'}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              select
              label="Role"
              value={form.role}
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              {creatableRoles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {showCompanyFields && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Company Name"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Domain Name"
                  placeholder="e.g. karma"
                  value={form.domain}
                  onChange={(e) => setForm({ ...form, domain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                />
              </Grid>
            </>
          )}

          {showParentField && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                select
                label={parentLabel}
                value={form.parentId}
                onChange={(e) => setForm({ ...form, parentId: Number(e.target.value) })}
              >
                {eligibleParents.map((parent) => (
                  <MenuItem key={parent.id} value={parent.id}>
                    {parent.name} ({parent.role})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="LinkedIn URL"
              value={form.linkedin}
              onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Skills (comma separated)"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Knowledge (comma separated)"
              value={form.knowledge}
              onChange={(e) => setForm({ ...form, knowledge: e.target.value })}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {mode === 'edit' ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormDialog;
