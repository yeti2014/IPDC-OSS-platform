// src/components/admin/CreateAnnouncementDialog.tsx
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
} from '@mui/material';
import { AnnouncementService } from '../../services/announcementService';
import { useAuth } from '../../contexts/AuthContext';

interface CreateAnnouncementDialogProps {
  open: boolean;
  onClose: () => void;
}

export const CreateAnnouncementDialog: React.FC<CreateAnnouncementDialogProps> = ({ open, onClose }) => {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    targetAudience: 'all' as 'all' | 'tenants' | 'operations' | 'admin',
    expiresInDays: 7,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    setLoading(true);
    setError('');

    try {
      await AnnouncementService.createAnnouncement(
        formData.title,
        formData.message,
        formData.priority,
        formData.targetAudience,
        userData.uid,
        userData.displayName || userData.email || 'Admin',
        formData.expiresInDays
      );

      setFormData({
        title: '',
        message: '',
        priority: 'medium',
        targetAudience: 'all',
        expiresInDays: 7,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Announcement</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Title"
              value={formData.title}
              onChange={handleChange('title')}
              fullWidth
              required
            />

            <TextField
              label="Message"
              value={formData.message}
              onChange={handleChange('message')}
              fullWidth
              required
              multiline
              rows={4}
            />

            <TextField
              select
              label="Priority"
              value={formData.priority}
              onChange={handleChange('priority')}
              fullWidth
              required
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </TextField>

            <TextField
              select
              label="Target Audience"
              value={formData.targetAudience}
              onChange={handleChange('targetAudience')}
              fullWidth
              required
            >
              <MenuItem value="all">All Users</MenuItem>
              <MenuItem value="tenants">Tenants Only</MenuItem>
              <MenuItem value="operations">Operations Staff</MenuItem>
              <MenuItem value="admin">Administrators</MenuItem>
            </TextField>

            <TextField
              label="Expires In (Days)"
              type="number"
              value={formData.expiresInDays}
              onChange={handleChange('expiresInDays')}
              fullWidth
              inputProps={{ min: 1, max: 365 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Create Announcement'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateAnnouncementDialog;