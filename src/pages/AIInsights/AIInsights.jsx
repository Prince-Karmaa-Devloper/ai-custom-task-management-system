import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import { SmartToy, Lightbulb, Build, Note } from '@mui/icons-material';
import * as aiService from '../../services/aiService';
import { motion } from 'framer-motion';

const AIInsights = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeSection, setActiveSection] = useState(null);

  const handleTaskGuidance = async () => {
    if (!query) return;
    setLoading(true);
    setActiveSection('guidance');
    try {
      const data = await aiService.getTaskGuidance(query);
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflowRecommendation = async () => {
    setLoading(true);
    setActiveSection('workflow');
    try {
      const data = await aiService.getWorkflowRecommendation('software');
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWritingImprovement = async () => {
    if (!query) return;
    setLoading(true);
    setActiveSection('writing');
    try {
      const data = await aiService.improveWriting(query);
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Typography variant="h4" gutterBottom>
        <SmartToy sx={{ mr: 1, verticalAlign: 'middle' }} />
        AI Insights
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Lightbulb sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Task Guidance</Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Ask for task guidance..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" onClick={handleTaskGuidance} disabled={loading}>
                Get Guidance
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Build sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Workflow Recommendation</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Get AI-recommended workflow for your projects
              </Typography>
              <Button variant="contained" onClick={handleWorkflowRecommendation} disabled={loading}>
                Get Recommendation
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Note sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Writing Assistant</Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Enter text to improve..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" onClick={handleWritingImprovement} disabled={loading}>
                Improve Writing
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {(result || loading) && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>AI Response</Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box>
                  {activeSection === 'guidance' && (
                    <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                      {result.guidance}
                    </Typography>
                  )}
                  {activeSection === 'workflow' && (
                    <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                      {result.recommendation}
                    </Typography>
                  )}
                  {activeSection === 'writing' && (
                    <Box>
                      <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                        {result.improved}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </motion.div>
  );
};

export default AIInsights;
