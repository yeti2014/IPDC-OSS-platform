// src/components/tenant/CreateRequestForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Alert,
  Box,
  CircularProgress,
  Typography,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import { CheckCircle, TrendingUp, Schedule, Lightbulb } from '@mui/icons-material';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { ServiceType, RequestPriority } from '../../types';
import { notificationService } from '../../services/notificationService';
import { tokenService } from '../../services/tokenService';
import { FileUpload } from '../common/FileUpload';
import { UploadResult } from '../../services/fileUploadService';
import { queueFirestoreOperation } from '../../services/offlineQueue';
import { aiApiClient, ServiceClassificationResponse } from '../../services/aiApiService';

interface CreateRequestFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Tier 2: Facility Management Services (Token-Based)
// For existing tenants already located in IPDC premises
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

export const CreateRequestForm: React.FC<CreateRequestFormProps> = ({ open, onClose, onSuccess }) => {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadResult[]>([]);
  const [formData, setFormData] = useState({
    serviceType: 'maintenance' as ServiceType,
    title: '',
    description: '',
    priority: 'medium' as RequestPriority,
    location: '',
  });

  // AI Classification State
  const [aiClassifying, setAiClassifying] = useState(false);
  const [aiClassification, setAiClassification] = useState<ServiceClassificationResponse['data'] | null>(null);
  const [showAiInsights, setShowAiInsights] = useState(false);

  // Load token balance and calculate cost
  useEffect(() => {
    if (open && userData?.uid) {
      loadTokenBalance();
    }
  }, [open, userData]);

  useEffect(() => {
    if (userData?.uid) {
      calculateCost();
    }
  }, [formData.serviceType, formData.priority]);

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

  // AI Service Classification
  const classifyService = useCallback(async () => {
    // Only classify if we have both title and description
    if (!formData.title.trim() || !formData.description.trim()) {
      setAiClassification(null);
      setShowAiInsights(false);
      return;
    }

    // Don't classify if title is too short
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

        // Auto-update priority based on AI recommendation
        setFormData(prev => ({
          ...prev,
          priority: response.data.priority
        }));
      }
    } catch (error) {
      console.error('AI classification error:', error);
      // Silently fail - don't block the user
    } finally {
      setAiClassifying(false);
    }
  }, [formData.title, formData.description]);

  // Trigger AI classification when title/description changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (navigator.onLine) {
        classifyService();
      }
    }, 1000); // Wait 1 second after user stops typing

    return () => clearTimeout(timer);
  }, [formData.title, formData.description, classifyService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData) return;

    const errors: string[] = [];
    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.description.trim()) errors.push('Description is required');

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('📝 Creating request...');

      const isOnline = navigator.onLine;
      console.log(`📶 Connection status: ${isOnline ? 'Online' : 'Offline'}`);

      // Calculate estimated cost without actually deducting tokens yet in offline mode
      const estimatedTokenCost = tokenService.calculateServiceCost(
        formData.serviceType,
        formData.priority
      );

      const requestData = {
        tenantId: userData.uid,
        tenantName: userData.displayName || userData.email,
        tenantEmail: userData.email,
        serviceType: formData.serviceType,
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        location: formData.location.trim(),
        status: 'pending' as const,
        tokenCost: estimatedTokenCost,
        tokensReserved: true,
        tokensDeducted: false,
        attachments: uploadedFiles.map(f => ({
          url: f.url,
          fileName: f.fileName,
          size: f.size,
          type: f.type,
          path: f.path
        })),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        notes: '',
      };

      if (!isOnline) {
        // OFFLINE MODE: Queue the request for later sync
        console.log('📴 Offline mode: Queuing request for sync...');

        await queueFirestoreOperation(
          'create',
          'serviceRequests',
          requestData
        );

        console.log('✅ Request queued successfully (will sync when online)');
        alert(
          `📴 Offline Mode\n\n` +
          `Your request has been saved and will be submitted when you're back online.\n\n` +
          `Estimated cost: ${estimatedTokenCost} tokens\n` +
          `Title: ${formData.title}`
        );

        // Reset form
        setFormData({
          serviceType: 'maintenance',
          title: '',
          description: '',
          priority: 'medium',
          location: '',
        });
        setUploadedFiles([]);

        onSuccess();
        onClose();
        return;
      }

      // ONLINE MODE: Check balance and reserve tokens (don't deduct yet)
      console.log('🌐 Online mode: Creating request immediately...');

      // Check if tenant has sufficient balance
      const tokenAccount = await tokenService.getTokenAccount(userData.uid);
      const currentBalance = tokenAccount?.balance || 0;

      if (currentBalance < estimatedTokenCost) {
        setError(`Insufficient tokens. You need ${estimatedTokenCost} tokens but only have ${currentBalance} tokens.`);
        setLoading(false);
        return;
      }

      // Mark tokens as reserved (not deducted - will deduct on completion)
      requestData.tokenCost = estimatedTokenCost;
      requestData.tokensReserved = true;
      requestData.tokensDeducted = false;

      console.log('📤 Sending to Firestore...');
      const docRef = await addDoc(collection(db, 'serviceRequests'), requestData);

      console.log('✅ Request created successfully:', docRef.id);
      console.log(`🔒 Tokens reserved: ${estimatedTokenCost} tokens (will be deducted on completion)`);

      // Send email notification to tenant
      try {
        await notificationService.notifyRequestCreated(
          userData.uid,
          userData.email || '',
          userData.displayName || userData.email || 'User',
          docRef.id,
          formData.title,
          formData.serviceType,
          formData.priority
        );
        console.log('📧 Email notification sent');
      } catch (emailError) {
        console.error('Email notification failed (non-critical):', emailError);
        // Don't block the request creation if email fails
      }

      // Reset form
      setFormData({
        serviceType: 'maintenance',
        title: '',
        description: '',
        priority: 'medium',
        location: '',
      });
      setUploadedFiles([]);

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('❌ Error creating request:', err);

      // If error is network-related and we're offline, try queuing
      if (!navigator.onLine && (err.code === 'unavailable' || err.message?.includes('network'))) {
        console.log('📴 Network error detected, switching to offline mode...');

        const fallbackCost = tokenService.calculateServiceCost(
          formData.serviceType,
          formData.priority
        );

        try {
          await queueFirestoreOperation(
            'create',
            'serviceRequests',
            {
              tenantId: userData.uid,
              tenantName: userData.displayName || userData.email,
              tenantEmail: userData.email,
              serviceType: formData.serviceType,
              title: formData.title.trim(),
              description: formData.description.trim(),
              priority: formData.priority,
              location: formData.location.trim(),
              status: 'pending' as const,
              tokenCost: fallbackCost,
              tokensReserved: true,
              tokensDeducted: false,
              attachments: uploadedFiles.map(f => ({
                url: f.url,
                fileName: f.fileName,
                size: f.size,
                type: f.type,
                path: f.path
              })),
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
              notes: '',
            }
          );

          alert(
            `📴 Connection Lost\n\n` +
            `Your request has been saved and will be submitted when you're back online.\n\n` +
            `Estimated cost: ${fallbackCost} tokens\n` +
            `Title: ${formData.title}`
          );

          // Reset form
          setFormData({
            serviceType: 'maintenance',
            title: '',
            description: '',
            priority: 'medium',
            location: '',
          });
          setUploadedFiles([]);

          onSuccess();
          onClose();
        } catch (queueError) {
          setError('Failed to save request offline. Please try again.');
        }
      } else {
        setError(err.message || 'Failed to create request');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" component="span">
            Facility Management Service Request
          </Typography>
          {!navigator.onLine && (
            <Chip
              label="Offline Mode"
              color="warning"
              size="small"
            />
          )}
        </Box>
        <Typography variant="caption" color="text.secondary">
          Tier 2: Token-based services for existing tenants in IPDC premises
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!navigator.onLine && (
              <Alert severity="info">
                You're working offline. Your request will be saved and submitted automatically when you're back online.
              </Alert>
            )}
            {error && <Alert severity="error">{error}</Alert>}

            {/* Token Balance & Cost Display */}
            <Alert severity="info" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  Your Token Balance: {tokenBalance.toLocaleString()} tokens
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Estimated cost: {estimatedCost} tokens
                </Typography>
              </Box>
              <Chip
                label={tokenBalance >= estimatedCost ? 'Sufficient' : 'Insufficient'}
                color={tokenBalance >= estimatedCost ? 'success' : 'error'}
                size="small"
              />
            </Alert>

            <TextField
              select
              label="Facility Management Service (Tier 2)"
              value={formData.serviceType}
              onChange={handleChange('serviceType')}
              fullWidth
              required
              helperText="Token-based services for existing tenants"
            >
              {facilityServices.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Title"
              value={formData.title}
              onChange={handleChange('title')}
              fullWidth
              required
              placeholder="Brief description of the issue"
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={handleChange('description')}
              fullWidth
              required
              multiline
              rows={4}
              placeholder="Provide detailed information about your request"
            />

            {/* AI Classification Insights - Tier 1: Admin Services (Informational Only) */}
            {aiClassifying && (
              <Alert severity="info" icon={<CircularProgress size={20} />}>
                AI analyzing request for administrative service classification...
              </Alert>
            )}

            <Collapse in={showAiInsights && !!aiClassification}>
              {aiClassification && (
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    border: '2px solid',
                    borderColor: 'info.main',
                    bgcolor: 'info.lighter'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Lightbulb sx={{ color: 'info.main', mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold" color="info.main">
                      Tier 1: Admin Services Classification
                    </Typography>
                    <Chip
                      label="Informational"
                      size="small"
                      color="info"
                      variant="outlined"
                      sx={{ ml: 'auto' }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    AI-detected administrative service type for new tenant registration (not token-based)
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                      <Typography variant="body2">
                        <strong>Service:</strong> {aiClassification.service_type_display}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp sx={{ color: 'warning.main', fontSize: 20 }} />
                      <Typography variant="body2">
                        <strong>Priority:</strong> {aiClassification.priority.toUpperCase()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule sx={{ color: 'info.main', fontSize: 20 }} />
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
                        {aiClassification.recommendations.slice(0, 3).map((rec, idx) => (
                          <ListItem key={idx}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <CheckCircle sx={{ color: 'success.main', fontSize: 18 }} />
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
              select
              label="Priority"
              value={formData.priority}
              onChange={handleChange('priority')}
              fullWidth
              required
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

            {/* File Upload */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Attachments (Optional)
              </Typography>
              <FileUpload
                onFilesUploaded={(results) => {
                  setUploadedFiles(prev => [...prev, ...results]);
                }}
                maxFiles={5}
                storagePath={`service-requests/${userData?.uid}`}
                existingFiles={uploadedFiles}
                onFileRemoved={(file) => {
                  setUploadedFiles(prev => prev.filter(f => f.path !== file.path));
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || tokenBalance < estimatedCost}
          >
            {loading ? <CircularProgress size={24} /> : `Create Request (${estimatedCost} tokens)`}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateRequestForm;