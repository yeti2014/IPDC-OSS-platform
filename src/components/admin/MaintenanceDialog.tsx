// src/components/admin/MaintenanceDialog.tsx

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Alert,
  Typography,
  InputAdornment,
  Box,
  Chip
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { assetService } from '../../services/assetService';
import { Asset, MaintenanceType, MaintenanceRecord } from '../../types/asset';
import { useAuth } from '../../contexts/AuthContext';

interface MaintenanceDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  asset: Asset;
}

export const MaintenanceDialog = ({ open, onClose, onSuccess, asset }: MaintenanceDialogProps) => {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    type: 'preventive' as MaintenanceType,
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    title: '',
    description: '',
    procedure: '',
    scheduledDate: new Date(),
    estimatedCost: 0,
    estimatedDuration: 2,
    isRecurring: false,
    recurrencePattern: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    recurrenceInterval: 1
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async () => {
    if (!user || !userData) return;

    // Validation
    if (!formData.title || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const maintenanceRecord: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        assetId: asset.id,
        assetCode: asset.assetCode,
        assetName: asset.name,
        type: formData.type,
        status: 'scheduled',
        priority: formData.priority,
        scheduledDate: formData.scheduledDate,
        title: formData.title,
        description: formData.description,
        procedure: formData.procedure || undefined,
        estimatedCost: formData.estimatedCost > 0 ? formData.estimatedCost : undefined,
        estimatedDuration: formData.estimatedDuration > 0 ? formData.estimatedDuration : undefined,
        assignedTo: undefined,
        assignedToName: undefined,
        isRecurring: formData.isRecurring,
        recurrencePattern: formData.isRecurring ? formData.recurrencePattern : undefined,
        recurrenceInterval: formData.isRecurring ? formData.recurrenceInterval : undefined,
        createdBy: user.uid
      };

      const result = await assetService.createMaintenanceRecord(maintenanceRecord, user.uid);

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const maintenanceTypes: MaintenanceType[] = [
    'preventive',
    'corrective',
    'predictive',
    'inspection'
  ];

  const priorities = ['low', 'medium', 'high', 'urgent'] as const;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Schedule Maintenance
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Asset Information
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {asset.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Chip label={asset.assetCode} size="small" variant="outlined" />
            <Chip label={asset.category.toUpperCase()} size="small" />
            <Chip label={asset.location} size="small" color="primary" variant="outlined" />
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                select
                label="Maintenance Type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
              >
                {maintenanceTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.toUpperCase()}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Priority"
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
              >
                {priorities.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority.toUpperCase()}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Quarterly Preventive Maintenance"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe what needs to be done..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Procedure (Optional)"
                value={formData.procedure}
                onChange={(e) => handleChange('procedure', e.target.value)}
                placeholder="Step-by-step maintenance procedure..."
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Scheduled Date & Time"
                value={formData.scheduledDate}
                onChange={(date) => handleChange('scheduledDate', date || new Date())}
                slotProps={{
                  textField: { fullWidth: true, required: true }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Estimated Duration"
                value={formData.estimatedDuration}
                onChange={(e) => handleChange('estimatedDuration', parseFloat(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">hours</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Estimated Cost (Optional)"
                value={formData.estimatedCost}
                onChange={(e) => handleChange('estimatedCost', parseFloat(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>

            {/* Recurring Options */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                Recurrence (Optional)
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Is Recurring?"
                value={formData.isRecurring ? 'yes' : 'no'}
                onChange={(e) => handleChange('isRecurring', e.target.value === 'yes')}
              >
                <MenuItem value="no">No (One-time)</MenuItem>
                <MenuItem value="yes">Yes (Recurring)</MenuItem>
              </TextField>
            </Grid>

            {formData.isRecurring && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Recurrence Pattern"
                    value={formData.recurrencePattern}
                    onChange={(e) => handleChange('recurrencePattern', e.target.value)}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Recurrence Interval"
                    value={formData.recurrenceInterval}
                    onChange={(e) => handleChange('recurrenceInterval', parseInt(e.target.value))}
                    helperText={`Repeat every ${formData.recurrenceInterval} ${formData.recurrencePattern}`}
                    InputProps={{
                      inputProps: { min: 1 }
                    }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Scheduling...' : 'Schedule Maintenance'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MaintenanceDialog;
