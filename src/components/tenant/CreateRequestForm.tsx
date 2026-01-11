// src/components/tenant/CreateRequestForm.tsx
import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { ServiceType, RequestPriority } from '../../types';
import { notificationService } from '../../services/notificationService';
import { tokenService } from '../../services/tokenService';
import { FileUpload } from '../common/FileUpload';
import { UploadResult } from '../../services/fileUploadService';
import { queueFirestoreOperation } from '../../services/offlineQueue';

interface CreateRequestFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const serviceTypes: { value: ServiceType; label: string; icon: string }[] = [
  { value: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { value: 'utilities', label: 'Utilities', icon: '💡' },
  { value: 'security', label: 'Security', icon: '🔒' },
  { value: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { value: 'it-support', label: 'IT Support', icon: '💻' },
  { value: 'waste-management', label: 'Waste Management', icon: '♻️' },
  { value: 'other', label: 'Other', icon: '📋' },
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
        Create New Service Request
        {!navigator.onLine && (
          <Chip
            label="Offline Mode"
            color="warning"
            size="small"
            sx={{ ml: 2 }}
          />
        )}
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
              label="Service Type"
              value={formData.serviceType}
              onChange={handleChange('serviceType')}
              fullWidth
              required
            >
              {serviceTypes.map((type) => (
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