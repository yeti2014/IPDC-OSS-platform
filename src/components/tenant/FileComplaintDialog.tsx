// src/components/tenant/FileComplaintDialog.tsx
// Complaint filing dialog for tenants based on Chinese Smart Park OSS platforms

import React, { useState } from 'react';
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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
} from '@mui/material';
import { complaintService } from '../../services/complaintService';
import { ComplaintCategory } from '../../types/complaint';
import { ServiceRequest } from '../../types';
import { FileUpload } from '../common/FileUpload';
import { UploadResult } from '../../services/fileUploadService';
import { useAuth } from '../../contexts/AuthContext';
import { queueFirestoreOperation } from '../../services/offlineQueue';

interface FileComplaintDialogProps {
  open: boolean;
  onClose: () => void;
  request: ServiceRequest;
  onSuccess: () => void;
}

const complaintCategories: { value: ComplaintCategory; label: string; description: string }[] = [
  { value: 'quality-issue', label: 'Quality Issue', description: 'Work quality did not meet expectations' },
  { value: 'incomplete-work', label: 'Incomplete Work', description: 'Service was not fully completed' },
  { value: 'delayed-service', label: 'Delayed Service', description: 'Service took longer than expected' },
  { value: 'wrong-service', label: 'Wrong Service', description: 'Different service was provided' },
  { value: 'damage-caused', label: 'Damage Caused', description: 'Property damage occurred during service' },
  { value: 'unfair-rejection', label: 'Unfair Rejection', description: 'Request was rejected without valid reason' },
  { value: 'incorrect-assessment', label: 'Incorrect Assessment', description: 'Admin misunderstood or incorrectly assessed the request' },
  { value: 'no-explanation', label: 'No Explanation Provided', description: 'Request was rejected without explanation' },
  { value: 'other', label: 'Other', description: 'Other issues not listed above' },
];

const severityLevels: { value: 'low' | 'medium' | 'high' | 'critical'; label: string; color: string }[] = [
  { value: 'low', label: 'Low - Minor inconvenience', color: 'info' },
  { value: 'medium', label: 'Medium - Moderate impact', color: 'warning' },
  { value: 'high', label: 'High - Significant impact', color: 'error' },
  { value: 'critical', label: 'Critical - Urgent attention required', color: 'error' },
];

export const FileComplaintDialog: React.FC<FileComplaintDialogProps> = ({
  open,
  onClose,
  request,
  onSuccess,
}) => {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadResult[]>([]);
  const [formData, setFormData] = useState({
    category: 'quality-issue' as ComplaintCategory,
    subject: '',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData || !request) return;

    const errors: string[] = [];
    if (!formData.subject.trim()) errors.push('Subject is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (formData.description.trim().length < 20) {
      errors.push('Description must be at least 20 characters');
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('📝 Filing complaint...');

      const isOnline = navigator.onLine;
      console.log(`📶 Connection status: ${isOnline ? 'Online' : 'Offline'}`);

      const complaintData = {
        requestId: request.id,
        requestTitle: request.title,
        serviceType: request.serviceType || 'other',
        tenantId: userData.uid,
        tenantName: userData.displayName || userData.email || 'Unknown',
        tenantEmail: userData.email || '',
        operatorId: request.assignedTo || '',
        operatorName: request.assignedToName || 'Unknown Operator',
        category: formData.category,
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        severity: formData.severity,
        evidence: uploadedFiles.map((file) => ({
          type: file.type.startsWith('image/') ? 'image' : 'document',
          url: file.url,
          fileName: file.fileName,
          description: '',
          uploadedAt: new Date(),
        })),
        originalTokenCost: (request as any).tokensCost || 0,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!isOnline) {
        // OFFLINE MODE: Queue the complaint for later sync
        console.log('📴 Offline mode: Queuing complaint for sync...');

        await queueFirestoreOperation('create', 'complaints', complaintData);

        console.log('✅ Complaint queued successfully (will sync when online)');
        setSuccess('📴 Offline Mode: Complaint saved and will be submitted when you\'re back online.');

        // Reset form
        setFormData({
          category: 'quality-issue',
          subject: '',
          description: '',
          severity: 'medium',
        });
        setUploadedFiles([]);

        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
        return;
      }

      // ONLINE MODE: Submit complaint immediately
      console.log('🌐 Online mode: Filing complaint immediately...');

      const result = await complaintService.fileComplaint(complaintData);

      if (result.success) {
        setSuccess(result.message || 'Complaint filed successfully');
        console.log('✅ Complaint filed:', result.complaintId);

        // Reset form
        setFormData({
          category: 'quality-issue',
          subject: '',
          description: '',
          severity: 'medium',
        });
        setUploadedFiles([]);

        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setError(result.message || 'Failed to file complaint');
      }
    } catch (err: any) {
      console.error('❌ Error filing complaint:', err);

      // If error is network-related and we're offline, try queuing
      if (!navigator.onLine && (err.code === 'unavailable' || err.message?.includes('network'))) {
        console.log('📴 Network error detected, switching to offline mode...');

        try {
          await queueFirestoreOperation('create', 'complaints', {
            requestId: request.id,
            requestTitle: request.title,
            serviceType: request.serviceType || 'other',
            tenantId: userData.uid,
            tenantName: userData.displayName || userData.email || 'Unknown',
            tenantEmail: userData.email || '',
            operatorId: request.assignedTo || '',
            operatorName: request.assignedToName || 'Unknown Operator',
            category: formData.category,
            subject: formData.subject.trim(),
            description: formData.description.trim(),
            severity: formData.severity,
            evidence: uploadedFiles.map((file) => ({
              type: file.type.startsWith('image/') ? 'image' : 'document',
              url: file.url,
              fileName: file.fileName,
              description: '',
              uploadedAt: new Date(),
            })),
            originalTokenCost: (request as any).tokensCost || 0,
            status: 'pending' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          setSuccess('📴 Connection Lost: Complaint saved and will be submitted when you\'re back online.');

          // Reset form
          setFormData({
            category: 'quality-issue',
            subject: '',
            description: '',
            severity: 'medium',
          });
          setUploadedFiles([]);

          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
        } catch (queueError) {
          setError('Failed to save complaint offline. Please try again.');
        }
      } else {
        setError(err.message || 'Failed to file complaint');
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        File Complaint
        {!navigator.onLine && (
          <Chip
            label="Offline Mode"
            color="warning"
            size="small"
            sx={{ ml: 2 }}
          />
        )}
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
          Request: {request?.title || 'N/A'}
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {!navigator.onLine && (
              <Alert severity="info">
                You're working offline. Your complaint will be saved and submitted automatically when you're back online.
              </Alert>
            )}
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <Alert severity="info">
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Service Level Agreement (SLA)
              </Typography>
              <Typography variant="caption">
                Your complaint will be reviewed by our admin team within 48 hours. You will be
                notified of the resolution via email.
              </Typography>
            </Alert>

            {/* Request Information */}
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Request Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Service: {request?.serviceType?.replace('-', ' ') || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Operator: {request?.assignedToName || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Token Cost: {(request as any)?.tokensCost || 0} tokens
              </Typography>
            </Box>

            {/* Complaint Category */}
            <TextField
              select
              label="Complaint Category"
              value={formData.category}
              onChange={handleChange('category')}
              fullWidth
              required
              helperText="Select the category that best describes your complaint"
            >
              {complaintCategories.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  <Box>
                    <Typography variant="body2">{category.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {category.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            {/* Subject */}
            <TextField
              label="Subject"
              value={formData.subject}
              onChange={handleChange('subject')}
              fullWidth
              required
              placeholder="Brief summary of your complaint"
              helperText="Provide a clear, concise subject line"
            />

            {/* Description */}
            <TextField
              label="Detailed Description"
              value={formData.description}
              onChange={handleChange('description')}
              fullWidth
              required
              multiline
              rows={6}
              placeholder="Explain in detail what went wrong, what you expected, and how this affected you..."
              helperText={`${formData.description.length}/500 characters (minimum 20 characters)`}
              inputProps={{ maxLength: 500 }}
            />

            {/* Severity Level */}
            <FormControl component="fieldset">
              <FormLabel component="legend">Severity Level</FormLabel>
              <RadioGroup
                value={formData.severity}
                onChange={handleChange('severity')}
              >
                {severityLevels.map((level) => (
                  <FormControlLabel
                    key={level.value}
                    value={level.value}
                    control={<Radio />}
                    label={level.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            {/* Evidence Upload */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Evidence (Photos, Documents, Videos)
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Upload photos or documents that support your complaint. This helps us resolve your
                issue faster.
              </Typography>
              <FileUpload
                onFilesUploaded={(results) => {
                  setUploadedFiles((prev) => [...prev, ...results]);
                }}
                maxFiles={10}
                storagePath={`complaints/${userData?.uid}/${request?.id}`}
                existingFiles={uploadedFiles}
                onFileRemoved={(file) => {
                  setUploadedFiles((prev) => prev.filter((f) => f.path !== file.path));
                }}
              />
            </Box>

            <Alert severity="warning">
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Important Notice
              </Typography>
              <Typography variant="caption">
                • False or fraudulent complaints may result in account suspension
                <br />
                • All complaints are reviewed by our admin team
                <br />
                • Resolution may include refund, rework, or compensation
                <br />• You will be notified of the outcome via email
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="error" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'File Complaint'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FileComplaintDialog;
