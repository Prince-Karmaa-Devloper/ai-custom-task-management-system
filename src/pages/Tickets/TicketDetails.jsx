import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Grid,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  ArrowBack,
  AutoAwesome,
  AccountTree,
  Description
} from '@mui/icons-material';
import { ticketService } from '../../services/ticketService';
import { generateAISuggestion, generateWorkflow, generateReport } from '../../services/aiService';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

const TicketDetails = () => {
  const { ticketId: id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Dialog states
  const [suggestionDialog, setSuggestionDialog] = useState({ open: false, content: '', loading: false });
  const [workflowDialog, setWorkflowDialog] = useState({ open: false, content: [], loading: false });
  const [reportDialog, setReportDialog] = useState({ open: false, content: '', loading: false });

  useEffect(() => {
    loadTicket();
  }, [id]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getTicketById(id);
      setTicket(data);
      if (data) setStatus(data.status);
    } catch (error) {
      console.error('Error loading ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setStatus(newStatus);
      await ticketService.updateTicket(ticket.id, { status: newStatus });
      setSnackbar({
        open: true,
        message: 'Status updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating ticket:', error);
      setSnackbar({
        open: true,
        message: 'Error updating status',
        severity: 'error'
      });
    }
  };

  const handleGenerateSuggestion = async () => {
    try {
      setSuggestionDialog({ open: true, content: '', loading: true });
      const result = await generateAISuggestion(ticket);
      setSuggestionDialog({ open: true, content: result.suggestion, loading: false });
    } catch (error) {
      console.error('Error generating suggestion:', error);
      setSnackbar({ open: true, message: 'Failed to generate suggestion', severity: 'error' });
      setSuggestionDialog({ open: false, content: '', loading: false });
    }
  };

  const handleGenerateWorkflow = async () => {
    try {
      setWorkflowDialog({ open: true, content: [], loading: true });
      const result = await generateWorkflow(ticket);
      setWorkflowDialog({ open: true, content: result.workflow, loading: false });
    } catch (error) {
      console.error('Error generating workflow:', error);
      setSnackbar({ open: true, message: 'Failed to generate workflow', severity: 'error' });
      setWorkflowDialog({ open: false, content: [], loading: false });
    }
  };

  const handleGenerateReport = async () => {
    try {
      setReportDialog({ open: true, content: '', loading: true });
      const result = await generateReport(ticket);
      setReportDialog({ open: true, content: result.report, loading: false });
    } catch (error) {
      console.error('Error generating report:', error);
      setSnackbar({ open: true, message: 'Failed to generate report', severity: 'error' });
      setReportDialog({ open: false, content: '', loading: false });
    }
  };

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!ticket) {
    return (
      <Box>
        <Typography variant="h4">Ticket not found</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/tickets')}>
          Back to Tickets
        </Button>
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Box mb={3} display="flex" alignItems="center">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/tickets')}
          sx={{ mr: 2 }}
        >
          Back to Tickets
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {ticket.title}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {ticket.title}
              </Typography>
              <Box display="flex" gap={1}>
                <Chip label={ticket.ticketId} color="primary" />
                <Chip label={ticket.priority} color={getPriorityColor(ticket.priority)} />
              </Box>
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {ticket.description}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Project</Typography>
                <Typography variant="body1">{ticket.project?.name || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Assigned To</Typography>
                <Typography variant="body1">{ticket.assignedToUser?.name || 'Unassigned'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Managed By</Typography>
                <Typography variant="body1">{ticket.managedByUser?.name || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Created Date</Typography>
                <Typography variant="body1">{new Date(ticket.createdAt).toLocaleDateString()}</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box mb={3}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>Status</Typography>
              <FormControl fullWidth>
                <Select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Posted">Posted</MenuItem>
                  <MenuItem value="Reassigned">Reassigned</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Divider sx={{ my: 3 }} />

            {ticket.source && (
              <Box mb={3}>
                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  Source: {ticket.source}
                </Typography>
                {ticket.emailSubject && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Email Subject</Typography>
                    <Typography variant="body1" sx={{ p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                      {ticket.emailSubject}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {ticket.basecampUrl && (
              <Box mb={3}>
                <Typography variant="subtitle2" color="text.secondary">Basecamp URL</Typography>
                <Link href={ticket.basecampUrl} target="_blank" rel="noopener noreferrer">
                  {ticket.basecampUrl}
                </Link>
              </Box>
            )}

            {ticket.websiteUrl && (
              <Box mb={3}>
                <Typography variant="subtitle2" color="text.secondary">Website URL</Typography>
                <Link href={ticket.websiteUrl} target="_blank" rel="noopener noreferrer">
                  {ticket.websiteUrl}
                </Link>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mb: 3 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <AutoAwesome sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                AI Assistant
              </Typography>
            </Box>

            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="contained"
                startIcon={<AutoAwesome />}
                onClick={handleGenerateSuggestion}
                fullWidth
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                  },
                }}
              >
                Generate Suggestion
              </Button>

              <Button
                variant="contained"
                startIcon={<AccountTree />}
                onClick={handleGenerateWorkflow}
                fullWidth
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                  },
                }}
              >
                Generate Workflow
              </Button>

              <Button
                variant="contained"
                startIcon={<Description />}
                onClick={handleGenerateReport}
                fullWidth
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                  },
                }}
              >
                Generate Report
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Suggestion Dialog */}
      <Dialog
        open={suggestionDialog.open}
        onClose={() => setSuggestionDialog({ open: false, content: '', loading: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>AI Suggestions</DialogTitle>
        <DialogContent>
          {suggestionDialog.loading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          ) : (
            <Typography
              variant="body1"
              whiteSpace="pre-line"
            >
              {suggestionDialog.content}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuggestionDialog({ open: false, content: '', loading: false })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Workflow Dialog */}
      <Dialog
        open={workflowDialog.open}
        onClose={() => setWorkflowDialog({ open: false, content: [], loading: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Workflow Suggestion</DialogTitle>
        <DialogContent>
          {workflowDialog.loading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {workflowDialog.content.map((step, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`Step ${step.step}: ${step.title}`}
                    secondary={step.description}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWorkflowDialog({ open: false, content: [], loading: false })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Dialog */}
      <Dialog
        open={reportDialog.open}
        onClose={() => setReportDialog({ open: false, content: '', loading: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Ticket Report</DialogTitle>
        <DialogContent>
          {reportDialog.loading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          ) : (
            <Typography
              variant="body1"
              whiteSpace="pre-line"
            >
              {reportDialog.content}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialog({ open: false, content: '', loading: false })}>
            Close
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

export default TicketDetails;
