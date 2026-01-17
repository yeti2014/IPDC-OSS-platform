/**
 * Facility Services Page (Tier 2)
 * Operational Services for Existing Tenants
 * Token-Based System with Credit/Deduction
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Breadcrumbs,
  Link,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Home as HomeIcon,
  ChevronRight as ChevronIcon,
  Build as BuildIcon,
  Token as TokenIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { StatusBar, OfflineBanner } from '../components/common/StatusBar';
import { useAuth } from '../contexts/AuthContext';
import { tokenService } from '../services/tokenService';
import { ServiceType, RequestPriority } from '../types';

const facilityServices: { value: ServiceType; label: string; icon: string }[] = [
  { value: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { value: 'utilities', label: 'Utilities', icon: '💡' },
  { value: 'security', label: 'Security', icon: '🔒' },
  { value: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { value: 'it-support', label: 'IT Support', icon: '💻' },
  { value: 'waste-management', label: 'Waste Management', icon: '♻️' },
  { value: 'other', label: 'Other Facility Services', icon: '📋' },
];

const priorities: { value: RequestPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const FacilityServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { userData } = useAuth();

  const [formData, setFormData] = useState({
    serviceType: 'maintenance' as ServiceType,
    title: '',
    description: '',
    priority: 'medium' as RequestPriority,
    location: '',
  });

  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  // Load token balance
  useEffect(() => {
    if (userData?.uid) {
      loadTokenBalance();
    }
  }, [userData]);

  // Calculate cost when service type or priority changes
  useEffect(() => {
    if (userData?.uid) {
      calculateCost();
    }
  }, [formData.serviceType, formData.priority, userData]);

  const loadTokenBalance = async () => {
    try {
      const account = await tokenService.getTokenAccount(userData!.uid);
      setTokenBalance(account?.balance || 0);
    } catch (error) {
      console.error('Error loading token balance:', error);
    }
  };

  const calculateCost = async () => {
    try {
      const account = await tokenService.getTokenAccount(userData!.uid);
      const cost = tokenService.calculateServiceCost(
        formData.serviceType,
        formData.priority,
        account?.tier || 'basic'
      );
      setEstimatedCost(cost);
    } catch (error) {
      console.error('Error calculating cost:', error);
    }
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: string[] = [];
    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.description.trim()) errors.push('Description is required');

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    if (tokenBalance < estimatedCost) {
      setError(`Insufficient tokens. You need ${estimatedCost} tokens but only have ${tokenBalance} tokens.`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Simulate submission (in real implementation, create service request in Firestore)
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert(
        `Facility Service Request Created!\n\n` +
        `Service: ${facilityServices.find(s => s.value === formData.serviceType)?.label}\n` +
        `Token Cost: ${estimatedCost} tokens (reserved)\n` +
        `Current Balance: ${tokenBalance} tokens\n` +
        `New Balance: ${tokenBalance - estimatedCost} tokens (after completion)\n\n` +
        `Your request has been submitted successfully!`
      );

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create request');
    } finally {
      setSubmitting(false);
    }
  };

  const hasSufficientTokens = tokenBalance >= estimatedCost;

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
          <Typography color="text.primary">Facility Management</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <BuildIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main' }} />
            <Box>
              <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold">
                Facility Management Services
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tier 2: Token-Based Services for Settled Tenants
              </Typography>
            </Box>
          </Box>

          {/* Token Balance Display - Only visible in Tier 2 */}
          <Alert
            severity={hasSufficientTokens ? 'success' : 'warning'}
            icon={<TokenIcon />}
            sx={{ mt: 2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  Your Token Balance: {tokenBalance.toLocaleString()} tokens
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Estimated cost: {estimatedCost} tokens
                </Typography>
              </Box>
              <Chip
                label={hasSufficientTokens ? 'Sufficient' : 'Insufficient'}
                color={hasSufficientTokens ? 'success' : 'error'}
                size="small"
              />
            </Box>
          </Alert>
        </Paper>

        {/* Form */}
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                select
                label="Facility Service Type"
                value={formData.serviceType}
                onChange={handleChange('serviceType')}
                fullWidth
                required
                helperText="Token-based operational services"
              >
                {facilityServices.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Service Request Title"
                value={formData.title}
                onChange={handleChange('title')}
                fullWidth
                required
                placeholder="Brief description of the issue"
              />

              <TextField
                label="Detailed Description"
                value={formData.description}
                onChange={handleChange('description')}
                fullWidth
                required
                multiline
                rows={4}
                placeholder="Provide detailed information about your request"
              />

              <TextField
                select
                label="Priority Level"
                value={formData.priority}
                onChange={handleChange('priority')}
                fullWidth
                required
                helperText="Higher priority = higher token cost"
              >
                {priorities.map((priority) => (
                  <MenuItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Location"
                value={formData.location}
                onChange={handleChange('location')}
                fullWidth
                placeholder="Building, floor, room number"
              />

              {/* File Attachments */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Attachments (Optional)
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AttachFileIcon />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Upload Files (Photos, Documents)
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </Button>

                {attachments.length > 0 && (
                  <Stack spacing={1}>
                    {attachments.map((file, index) => (
                      <Paper
                        key={index}
                        elevation={0}
                        sx={{
                          p: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          bgcolor: 'grey.50',
                          border: '1px solid',
                          borderColor: 'grey.300',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                          <AttachFileIcon fontSize="small" color="action" />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{ fontWeight: 500 }}
                            >
                              {file.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {(file.size / 1024).toFixed(1)} KB
                            </Typography>
                          </Box>
                        </Box>
                        <Button
                          size="small"
                          onClick={() => handleRemoveFile(index)}
                          sx={{ minWidth: 'auto', p: 0.5 }}
                        >
                          <CloseIcon fontSize="small" />
                        </Button>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>

              {/* Token Cost Summary */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: 'primary.lighter',
                  border: '1px solid',
                  borderColor: 'primary.main',
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Token Cost Breakdown
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Base Cost ({formData.serviceType}):</Typography>
                  <Typography variant="body2" fontWeight="bold">{Math.floor(estimatedCost * 0.7)} tokens</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Priority ({formData.priority}):</Typography>
                  <Typography variant="body2" fontWeight="bold">+{Math.floor(estimatedCost * 0.3)} tokens</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body1" fontWeight="bold">Total Cost:</Typography>
                  <Typography variant="body1" fontWeight="bold" color="primary.main">{estimatedCost} tokens</Typography>
                </Box>
              </Paper>

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
                  disabled={submitting || !hasSufficientTokens}
                  size="large"
                >
                  {submitting ? 'Creating...' : `Create Request (${estimatedCost} tokens)`}
                </Button>
              </Box>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default FacilityServicesPage;
