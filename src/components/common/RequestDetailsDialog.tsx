
// src/components/common/RequestDetailsDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ServiceRequest, RequestStatus } from '../../types';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notificationService';
import { PDFExport } from './PDFExport';
import { tokenService } from '../../services/tokenService';

interface RequestDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  request: ServiceRequest | null;
  onUpdate?: () => void;
}

const statusOptions: { value: RequestStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

const statusColors: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  pending: 'warning',
  approved: 'info',
  'in-progress': 'info',
  completed: 'success',
  rejected: 'error',
};

export const RequestDetailsDialog: React.FC<RequestDetailsDialogProps> = ({
  open,
  onClose,
  request,
  onUpdate,
}) => {
  const { userData } = useAuth();
  const [editing, setEditing] = useState(false);
  const [newStatus, setNewStatus] = useState<RequestStatus>('pending');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canEdit = userData?.role === 'admin' || userData?.role === 'operations';

  const handleStartEdit = () => {
    if (request) {
      setNewStatus(request.status);
      setNotes(request.notes || '');
      setEditing(true);
    }
  };

  const handleSaveStatus = async () => {
    if (!request) return;

    setError('');
    setLoading(true);

    try {
      // If marking as completed, show confirmation dialog first
      if (newStatus === 'completed' && request.status !== 'completed') {
        // Check if tokens were already deducted
        if ((request as any).tokensDeducted) {
          const confirmStatusOnly = window.confirm(
            `⚠️ Tokens have already been deducted for this request.\n\n` +
            `Do you want to mark it as completed anyway?`
          );

          if (!confirmStatusOnly) {
            setLoading(false);
            return;
          }

          // Just update status, don't deduct tokens again
          const updateData: any = {
            status: newStatus,
            notes: notes,
            updatedAt: serverTimestamp(),
            completedAt: serverTimestamp(),
          };

          await updateDoc(doc(db, 'serviceRequests', request.id), updateData);

          setEditing(false);
          if (onUpdate) onUpdate();
          onClose();
          return;
        }

        // Calculate the cost first
        const estimatedCost = (request as any).tokenCost || tokenService.calculateServiceCost(
          request.serviceType || 'other',
          request.priority || 'medium'
        );

        // Show confirmation dialog
        const confirmed = window.confirm(
          `Mark this request as completed?\n\n` +
          `Request: ${request.title || 'Untitled'}\n` +
          `Service: ${(request.serviceType || 'other').replace('-', ' ')}\n` +
          `Priority: ${(request.priority || 'medium').toUpperCase()}\n` +
          `\nToken Cost: ${estimatedCost} tokens\n\n` +
          `This will deduct ${estimatedCost} tokens from ${request.tenantName || 'tenant'}'s account.\n\n` +
          `${(request as any).tokensReserved ? '(Tokens were reserved when request was created)' : ''}\n\n` +
          `Do you want to proceed?`
        );

        if (!confirmed) {
          setLoading(false);
          return; // User cancelled
        }
      }

      const updateData: any = {
        status: newStatus,
        notes: notes,
        updatedAt: serverTimestamp(),
      };

      if (newStatus === 'completed' && request.status !== 'completed' && !(request as any).tokensDeducted) {
        updateData.completedAt = serverTimestamp();

        // Deduct tokens from tenant account
        const deductResult = await tokenService.deductTokens(
          request.tenantId,
          request.serviceType || 'other',
          request.priority || 'medium',
          request.id,
          `Service completed: ${request.title}`
        );

        if (!deductResult.success) {
          setError(deductResult.message || 'Failed to deduct tokens from tenant account');
          setLoading(false);
          return;
        }

        updateData.tokensCost = deductResult.cost;
        updateData.tokensDeducted = true;
        updateData.tokensReserved = false; // Clear reserved flag

        console.log(`✅ Tokens deducted: ${deductResult.cost} tokens. New balance: ${deductResult.newBalance}`);
      }

      await updateDoc(doc(db, 'serviceRequests', request.id), updateData);

      // Send notification to tenant
      await notificationService.notifyRequestStatusChanged(
        request.tenantId,
        request.tenantEmail,
        request.tenantName,
        request.id,
        request.title,
        request.status,
        newStatus,
        userData?.displayName || userData?.email || 'Admin',
        notes
      );

      setEditing(false);
      if (onUpdate) onUpdate();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update request');
    } finally {
      setLoading(false);
    }
  };

  if (!request) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Service Request Details</Typography>
          <Chip
            label={(request.status || 'pending').replace('-', ' ').toUpperCase()}
            color={statusColors[request.status || 'pending']}
            size="small"
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Request ID
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {request.id?.substring(0, 8) || 'N/A'}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="caption" color="text.secondary">
              Title
            </Typography>
            <Typography variant="h6">{request.title || 'Untitled Request'}</Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body1">{request.description || 'No description provided'}</Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Service Type
              </Typography>
              <Typography variant="body1" textTransform="capitalize">
                {request.serviceType?.replace('-', ' ') || 'N/A'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Priority
              </Typography>
              <Typography variant="body1" textTransform="capitalize">
                {request.priority || 'N/A'}
              </Typography>
            </Box>

            {request.location && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body1">{request.location}</Typography>
              </Box>
            )}
          </Box>

          <Divider />

          <Box>
            <Typography variant="caption" color="text.secondary">
              Submitted By
            </Typography>
            <Typography variant="body1">
              {request.tenantName || 'Unknown'} ({request.tenantEmail || 'N/A'})
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body2">
                {request.createdAt ? format(request.createdAt, 'PPpp') : 'N/A'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body2">
                {request.updatedAt ? format(request.updatedAt, 'PPpp') : 'N/A'}
              </Typography>
            </Box>
          </Box>

          {canEdit && editing ? (
            <>
              <Divider />
              <TextField
                select
                label="Update Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as RequestStatus)}
                fullWidth
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                rows={3}
                fullWidth
                placeholder="Add notes about this request"
              />
            </>
          ) : request.notes ? (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Notes
              </Typography>
              <Typography variant="body2">{request.notes}</Typography>
            </Box>
          ) : null}
        </Box>
      </DialogContent>

      <DialogActions>
        <PDFExport type="request" request={request} variant="outlined" size="small" />
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={onClose} disabled={loading}>
          Close
        </Button>
        {canEdit && !editing && (
          <Button variant="contained" onClick={handleStartEdit}>
            Update Status
          </Button>
        )}
        {canEdit && editing && (
          <>
            <Button onClick={() => setEditing(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveStatus}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RequestDetailsDialog;