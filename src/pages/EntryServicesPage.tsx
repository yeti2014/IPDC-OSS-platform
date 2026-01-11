/**
 * Entry Services Page (Tier 1)
 * Administrative & Registration Services for New Enterprises
 * AI-Powered Classification - No Token System
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Stack,
  Breadcrumbs,
  Link,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Home as HomeIcon,
  ChevronRight as ChevronIcon,
  Lightbulb as LightbulbIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  TrendingUp as PriorityIcon,
  Business as BusinessIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { StatusBar, OfflineBanner } from '../components/common/StatusBar';
import { aiApiClient, ServiceClassificationResponse } from '../services/aiApiService';

export const EntryServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = useState({
    companyName: '',
    title: '',
    description: '',
    contactPerson: '',
    email: '',
    phone: '',
  });

  const [aiClassifying, setAiClassifying] = useState(false);
  const [aiClassification, setAiClassification] = useState<ServiceClassificationResponse['data'] | null>(null);
  const [showAiInsights, setShowAiInsights] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // AI Classification
  const classifyService = useCallback(async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      setAiClassification(null);
      setShowAiInsights(false);
      return;
    }

    if (formData.title.trim().length < 5 || formData.description.trim().length < 10) {
      return;
    }

    setAiClassifying(true);

    try {
      const response = await aiApiClient.classifyService({
        title: formData.title.trim(),
        description: formData.description.trim(),
      });

      if (response.success) {
        setAiClassification(response.data);
        setShowAiInsights(true);
      }
    } catch (error) {
      console.error('AI classification error:', error);
    } finally {
      setAiClassifying(false);
    }
  }, [formData.title, formData.description]);

  // Debounced AI classification
  useEffect(() => {
    const timer = setTimeout(() => {
      if (navigator.onLine) {
        classifyService();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData.title, formData.description, classifyService]);

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: string[] = [];
    if (!formData.companyName.trim()) errors.push('Company name is required');
    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (!formData.email.trim()) errors.push('Email is required');

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Simulate submission (in real implementation, send to backend)
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert(
        `Entry Service Application Submitted!\n\n` +
        `Company: ${formData.companyName}\n` +
        `Service Type: ${aiClassification?.service_type_display || 'Not classified'}\n` +
        `Priority: ${aiClassification?.priority?.toUpperCase() || 'Normal'}\n` +
        `Est. Processing: ${aiClassification?.estimated_processing_days || 'TBD'} days\n\n` +
        `An IPDC administrator will contact you shortly.`
      );

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <StatusBar />
      <OfflineBanner />

      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 4 } }}>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<ChevronIcon fontSize="small" />} sx={{ mb: 3 }}>
          <Link href="/dashboard" underline="hover" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} color="inherit">
            <HomeIcon fontSize="small" />
            Dashboard
          </Link>
          <Link href="/services" underline="hover" color="inherit">
            Service Request
          </Link>
          <Typography color="text.primary">Entry Services</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <BusinessIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'info.main' }} />
            <Box>
              <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold">
                Entry Services Application
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tier 1: Administrative & Registration Services for New Enterprises
              </Typography>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>AI-Assisted Service:</strong> Our system will automatically classify your request and provide guidance.
              No token payment required - administrative processing by IPDC staff.
            </Typography>
          </Alert>
        </Paper>

        {/* Form */}
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="Company Name"
                value={formData.companyName}
                onChange={handleChange('companyName')}
                fullWidth
                required
                placeholder="e.g., ABC Manufacturing Co."
              />

              <TextField
                label="Service Request Title"
                value={formData.title}
                onChange={handleChange('title')}
                fullWidth
                required
                placeholder="e.g., Investment Permit Application for Textile Factory"
              />

              <TextField
                label="Detailed Description"
                value={formData.description}
                onChange={handleChange('description')}
                fullWidth
                required
                multiline
                rows={4}
                placeholder="Provide detailed information about your request..."
              />

              {/* AI Classification Loading */}
              {aiClassifying && (
                <Alert severity="info" icon={<CircularProgress size={20} />}>
                  AI analyzing your request for classification...
                </Alert>
              )}

              {/* AI Insights Panel */}
              <Collapse in={showAiInsights && !!aiClassification}>
                {aiClassification && (
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      border: '2px solid',
                      borderColor: 'success.main',
                      bgcolor: 'success.lighter',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LightbulbIcon sx={{ color: 'success.main', mr: 1 }} />
                      <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                        AI Service Classification
                      </Typography>
                      <Chip
                        label={`${Math.round(aiClassification.confidence_score * 100)}% confident`}
                        size="small"
                        color="success"
                        sx={{ ml: 'auto' }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
                        <Typography variant="body2">
                          <strong>Service:</strong> {aiClassification.service_type_display}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PriorityIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                        <Typography variant="body2">
                          <strong>Priority:</strong> {aiClassification.priority.toUpperCase()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ScheduleIcon sx={{ color: 'info.main', fontSize: 20 }} />
                        <Typography variant="body2">
                          <strong>Est. Processing:</strong> {aiClassification.estimated_processing_days} days
                        </Typography>
                      </Box>
                    </Box>

                    {aiClassification.recommendations && aiClassification.recommendations.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                          Recommendations:
                        </Typography>
                        <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                          {aiClassification.recommendations.slice(0, 4).map((rec, idx) => (
                            <ListItem key={idx}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <CheckIcon sx={{ color: 'success.main', fontSize: 18 }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={rec}
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Paper>
                )}
              </Collapse>

              <TextField
                label="Contact Person"
                value={formData.contactPerson}
                onChange={handleChange('contactPerson')}
                fullWidth
                placeholder="Full name"
              />

              <TextField
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                fullWidth
                required
                placeholder="contact@company.com"
              />

              <TextField
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange('phone')}
                fullWidth
                placeholder="+251 xxx xxx xxx"
              />

              {/* Submit Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/services')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
                  disabled={submitting}
                  size="large"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </Box>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default EntryServicesPage;
