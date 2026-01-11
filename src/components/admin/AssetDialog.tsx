// src/components/admin/AssetDialog.tsx
// @ts-nocheck - MUI v7 Grid migration in progress

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Alert,
  Typography,
  InputAdornment,
  Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { assetService } from '../../services/assetService';
import { Asset, AssetCategory, AssetStatus, AssetCondition } from '../../types/asset';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface AssetDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  asset?: Asset | null;
}

export const AssetDialog = ({ open, onClose, onSuccess, asset }: AssetDialogProps) => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    assetCode: '',
    name: '',
    description: '',
    category: 'machinery' as AssetCategory,
    status: 'operational' as AssetStatus,
    condition: 'good' as AssetCondition,
    parkId: 'hawassa-park',
    parkName: 'Hawassa Industrial Park',
    location: '',
    purchaseDate: new Date(),
    purchaseCost: 0,
    depreciationRate: 10,
    manufacturer: '',
    model: '',
    serialNumber: '',
    maintenanceInterval: 90,
    warrantyExpiry: undefined as Date | undefined,
    notes: ''
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        assetCode: asset.assetCode,
        name: asset.name,
        description: asset.description,
        category: asset.category,
        status: asset.status,
        condition: asset.condition,
        parkId: asset.parkId,
        parkName: asset.parkName,
        location: asset.location,
        purchaseDate: asset.purchaseDate,
        purchaseCost: asset.purchaseCost,
        depreciationRate: asset.depreciationRate,
        manufacturer: asset.manufacturer || '',
        model: asset.model || '',
        serialNumber: asset.serialNumber || '',
        maintenanceInterval: asset.maintenanceInterval || 90,
        warrantyExpiry: asset.warrantyExpiry || undefined,
        notes: asset.notes || ''
      });
    }
  }, [asset]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async () => {
    if (!currentUser) return;

    // Validation
    if (!formData.name || !formData.description || !formData.location) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.purchaseCost <= 0) {
      setError('Purchase cost must be greater than zero');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result;

      if (asset) {
        // Update existing asset
        result = await assetService.updateAsset(asset.id, formData);
      } else {
        // Create new asset
        result = await assetService.createAsset(formData as any, currentUser.uid);
      }

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

  const categories: AssetCategory[] = [
    'machinery',
    'vehicle',
    'infrastructure',
    'it-equipment',
    'furniture',
    'tool',
    'safety-equipment',
    'utility',
    'other'
  ];

  const statuses: AssetStatus[] = [
    'operational',
    'maintenance',
    'repair',
    'retired',
    'reserved',
    'damaged'
  ];

  const conditions: AssetCondition[] = [
    'excellent',
    'good',
    'fair',
    'poor',
    'critical'
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {asset ? t('common.edit') + ' ' + t('assets.title') : t('assets.addAsset')}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('assets.assetCode')}
                value={formData.assetCode}
                onChange={(e) => handleChange('assetCode', e.target.value)}
                placeholder="Auto-generated if empty"
                helperText="Leave empty for auto-generation"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label={t('assets.name')}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                multiline
                rows={2}
                label={t('requests.description')}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                required
                select
                label={t('assets.category')}
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat.replace('-', ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                select
                label={t('assets.status')}
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.toUpperCase()}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                select
                label={t('assets.condition')}
                value={formData.condition}
                onChange={(e) => handleChange('condition', e.target.value)}
              >
                {conditions.map((condition) => (
                  <MenuItem key={condition} value={condition}>
                    {condition.toUpperCase()}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Location */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                {t('requests.location')}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Park Name"
                value={formData.parkName}
                onChange={(e) => handleChange('parkName', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label={t('requests.location')}
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g., Building A, Floor 2"
              />
            </Grid>

            {/* Financial Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                Financial Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <DatePicker
                label="Purchase Date"
                value={formData.purchaseDate}
                onChange={(date) => handleChange('purchaseDate', date || new Date())}
                slotProps={{
                  textField: { fullWidth: true, required: true }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                required
                type="number"
                label="Purchase Cost"
                value={formData.purchaseCost}
                onChange={(e) => handleChange('purchaseCost', parseFloat(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Depreciation Rate"
                value={formData.depreciationRate}
                onChange={(e) => handleChange('depreciationRate', parseFloat(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">% / year</InputAdornment>
                }}
              />
            </Grid>

            {/* Specifications */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                Specifications
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Manufacturer"
                value={formData.manufacturer}
                onChange={(e) => handleChange('manufacturer', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Model"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Serial Number"
                value={formData.serialNumber}
                onChange={(e) => handleChange('serialNumber', e.target.value)}
              />
            </Grid>

            {/* Maintenance */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                Maintenance
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Maintenance Interval"
                value={formData.maintenanceInterval}
                onChange={(e) => handleChange('maintenanceInterval', parseInt(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">days</InputAdornment>
                }}
                helperText="How often maintenance is required"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Warranty Expiry (Optional)"
                value={formData.warrantyExpiry}
                onChange={(date) => handleChange('warrantyExpiry', date)}
                slotProps={{
                  textField: { fullWidth: true }
                }}
              />
            </Grid>

            {/* Notes */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? t('common.loading') : asset ? t('common.edit') : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssetDialog;
