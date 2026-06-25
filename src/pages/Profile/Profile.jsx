import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  TextField,
  Button,
  Chip,
  Grid,
  Divider,
  Link,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import { Person, LinkedIn, Edit, Add, Delete } from '@mui/icons-material';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user } = useSelector(state => state.auth);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    ...user,
    skills: [...(user.skills || [])],
    knowledge: [...(user.knowledge || [])]
  });
  const [newSkill, setNewSkill] = useState('');
  const [newKnowledge, setNewKnowledge] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSave = () => {
    setSnackbar({
      open: true,
      message: 'Profile saved successfully (Demo mode)',
      severity: 'success'
    });
    setEditing(false);
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index)
    });
  };

  const addKnowledge = () => {
    if (newKnowledge.trim()) {
      setFormData({
        ...formData,
        knowledge: [...formData.knowledge, newKnowledge.trim()]
      });
      setNewKnowledge('');
    }
  };

  const removeKnowledge = (index) => {
    setFormData({
      ...formData,
      knowledge: formData.knowledge.filter((_, i) => i !== index)
    });
  };

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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          My Profile
        </Typography>
        <Button 
          variant={editing ? "contained" : "outlined"} 
          startIcon={<Edit />}
          onClick={() => editing ? handleSave() : setEditing(true)}
          sx={{
            background: editing ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            '&:hover': {
              background: editing ? 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)' : 'transparent',
            },
            px: 3,
            py: 1,
            borderRadius: 2
          }}
        >
          {editing ? 'Save' : 'Edit'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 4, 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            textAlign: 'center'
          }}>
            <Avatar sx={{ 
              width: 120, 
              height: 120, 
              margin: '0 auto', 
              marginBottom: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontSize: '3rem'
            }}>
              {formData.avatar}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              {formData.name}
            </Typography>
            <Chip
              label={formData.role}
              color={getRoleColor(formData.role)}
              sx={{ mb: 2, textTransform: 'capitalize' }}
            />
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {formData.email}
            </Typography>
            
            {formData.linkedin && (
              <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
                <LinkedIn sx={{ color: '#0077b5' }} />
                <Link href={formData.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn Profile
                </Link>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Column - Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Profile Information
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                {editing ? (
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                ) : (
                  <>
                    <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                    <Typography variant="body1">{formData.name}</Typography>
                  </>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {editing ? (
                  <TextField
                    fullWidth
                    label="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                ) : (
                  <>
                    <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{formData.email}</Typography>
                  </>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {editing ? (
                  <TextField
                    fullWidth
                    label="LinkedIn URL"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  />
                ) : (
                  <>
                    <Typography variant="subtitle2" color="text.secondary">LinkedIn</Typography>
                    <Typography variant="body1">
                      {formData.linkedin ? (
                        <Link href={formData.linkedin} target="_blank" rel="noopener noreferrer">
                          {formData.linkedin}
                        </Link>
                      ) : 'Not provided'}
                    </Typography>
                  </>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <>
                  <Typography variant="subtitle2" color="text.secondary">Role</Typography>
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>{formData.role}</Typography>
                </>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Skills
            </Typography>
            {editing ? (
              <Box>
                <Box display="flex" gap={1} mb={2}>
                  <TextField
                    label="Add Skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={addSkill}
                    sx={{ alignSelf: 'flex-end' }}
                  >
                    Add
                  </Button>
                </Box>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {formData.skills.map((skill, i) => (
                    <Chip
                      key={i}
                      label={skill}
                      onDelete={() => removeSkill(i)}
                      deleteIcon={<Delete />}
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                  ))}
                </Box>
              </Box>
            ) : (
              <Box display="flex" gap={1} flexWrap="wrap" sx={{ mb: 3 }}>
                {formData.skills.length > 0 ? (
                  formData.skills.map((skill, i) => (
                    <Chip
                      key={i}
                      label={skill}
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No skills added yet</Typography>
                )}
              </Box>
            )}

            <Typography variant="h6" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              Knowledge Areas
            </Typography>
            {editing ? (
              <Box>
                <Box display="flex" gap={1} mb={2}>
                  <TextField
                    label="Add Knowledge Area"
                    value={newKnowledge}
                    onChange={(e) => setNewKnowledge(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addKnowledge()}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={addKnowledge}
                    sx={{ alignSelf: 'flex-end' }}
                  >
                    Add
                  </Button>
                </Box>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {formData.knowledge.map((area, i) => (
                    <Chip
                      key={i}
                      label={area}
                      variant="outlined"
                      onDelete={() => removeKnowledge(i)}
                      deleteIcon={<Delete />}
                      sx={{ fontWeight: 500 }}
                    />
                  ))}
                </Box>
              </Box>
            ) : (
              <Box display="flex" gap={1} flexWrap="wrap">
                {formData.knowledge.length > 0 ? (
                  formData.knowledge.map((area, i) => (
                    <Chip
                      key={i}
                      label={area}
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No knowledge areas added yet</Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

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

export default Profile;
