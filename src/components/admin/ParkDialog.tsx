// src/components/admin/ParkDialog.tsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  Typography,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useTranslation } from 'react-i18next';

interface IndustrialPark {
  id?: string;
  name: string;
  location: string;
  description: string;
  totalArea: number;
  availableArea: number;
  currentTenants: number;
  maxTenants: number;
  currentEmployees: number;
  occupancyRate: number;
  establishedYear: number;
  primaryIndustries: string[];
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  region: string;
  facilities: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface ParkDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  park?: IndustrialPark | null;
}

export const ParkDialog = ({ open, onClose, onSuccess, park }: ParkDialogProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<IndustrialPark>({
    name: '',
    location: '',
    description: '',
    totalArea: 0,
    availableArea: 0,
    currentTenants: 0,
    maxTenants: 100,
    currentEmployees: 0,
    occupancyRate: 0,
    establishedYear: new Date().getFullYear(),
    primaryIndustries: [],
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    city: '',
    region: '',
    facilities: [],
  });

  const [industriesInput, setIndustriesInput] = useState('');
  const [facilitiesInput, setFacilitiesInput] = useState('');

  useEffect(() => {
    if (park) {
      setFormData(park);
      setIndustriesInput(park.primaryIndustries?.join(', ') || '');
      setFacilitiesInput(park.facilities?.join(', ') || '');
    } else {
      // Reset form
      setFormData({
        name: '',
        location: '',
        description: '',
        totalArea: 0,
        availableArea: 0,
        currentTenants: 0,
        maxTenants: 100,
        currentEmployees: 0,
        occupancyRate: 0,
        establishedYear: new Date().getFullYear(),
        primaryIndustries: [],
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        city: '',
        region: '',
        facilities: [],
      });
      setIndustriesInput('');
      setFacilitiesInput('');
    }
  }, [park, open]);

  const handleChange = (field: keyof IndustrialPark, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');

    // Auto-calculate occupancy rate
    if (field === 'currentTenants' || field === 'maxTenants') {
      const tenants = field === 'currentTenants' ? value : formData.currentTenants;
      const max = field === 'maxTenants' ? value : formData.maxTenants;
      if (max > 0) {
        setFormData(prev => ({
          ...prev,
          [field]: value,
          occupancyRate: (tenants / max) * 100,
        }));
      }
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.location || !formData.description) {
      setError('Please fill in all required fields (Name, Location, Description)');
      return;
    }

    if (formData.totalArea <= 0) {
      setError('Total area must be greater than zero');
      return;
    }

    if (!formData.contactEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Parse comma-separated values
      const industries = industriesInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const facilities = facilitiesInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const parkData = {
        ...formData,
        primaryIndustries: industries,
        facilities: facilities,
        updatedAt: new Date(),
      };

      if (park?.id) {
        // Update existing park
        const parkRef = doc(db, 'industrialParks', park.id);
        await updateDoc(parkRef, parkData);
      } else {
        // Create new park
        await addDoc(collection(db, 'industrialParks'), {
          ...parkData,
          createdAt: new Date(),
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the park');
    } finally {
      setLoading(false);
    }
  };

  const ethiopianRegions = [
    'Addis Ababa',
    'Oromia',
    'Amhara',
    'Tigray',
    'Somali',
    'SNNPR',
    'Afar',
    'Benishangul-Gumuz',
    'Gambela',
    'Harari',
    'Dire Dawa',
    'Sidama',
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {park ? 'Edit Industrial Park' : 'Add New Industrial Park'}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Basic Information
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Park Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Hawassa Industrial Park"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g., Hawassa, SNNPR"
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
              placeholder="Describe the industrial park..."
            />
          </Grid>

          {/* Location Details */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
              Location Details
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              label="City"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              select
              label="Region"
              value={formData.region}
              onChange={(e) => handleChange('region', e.target.value)}
            >
              {ethiopianRegions.map((region) => (
                <MenuItem key={region} value={region}>
                  {region}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Established Year"
              value={formData.establishedYear}
              onChange={(e) => handleChange('establishedYear', parseInt(e.target.value))}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Full address of the park"
            />
          </Grid>

          {/* Capacity Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
              Capacity Information
            </Typography>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              required
              type="number"
              label="Total Area"
              value={formData.totalArea}
              onChange={(e) => handleChange('totalArea', parseFloat(e.target.value))}
              InputProps={{
                endAdornment: <InputAdornment position="end">hectares</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Available Area"
              value={formData.availableArea}
              onChange={(e) => handleChange('availableArea', parseFloat(e.target.value))}
              InputProps={{
                endAdornment: <InputAdornment position="end">hectares</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Current Tenants"
              value={formData.currentTenants}
              onChange={(e) => handleChange('currentTenants', parseInt(e.target.value))}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Max Tenants"
              value={formData.maxTenants}
              onChange={(e) => handleChange('maxTenants', parseInt(e.target.value))}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Current Employees"
              value={formData.currentEmployees}
              onChange={(e) => handleChange('currentEmployees', parseInt(e.target.value))}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              disabled
              label="Occupancy Rate"
              value={formData.occupancyRate.toFixed(1)}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              helperText="Auto-calculated based on current/max tenants"
            />
          </Grid>

          {/* Industries and Facilities */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
              Industries & Facilities
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Primary Industries"
              value={industriesInput}
              onChange={(e) => setIndustriesInput(e.target.value)}
              placeholder="e.g., Textile, Leather, Manufacturing (comma-separated)"
              helperText="Enter industries separated by commas"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Facilities"
              value={facilitiesInput}
              onChange={(e) => setFacilitiesInput(e.target.value)}
              placeholder="e.g., Water treatment, Power station, Warehouse (comma-separated)"
              helperText="Enter facilities separated by commas"
            />
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
              Contact Information
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              label="Contact Person"
              value={formData.contactPerson}
              onChange={(e) => handleChange('contactPerson', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              type="email"
              label="Contact Email"
              value={formData.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              label="Contact Phone"
              value={formData.contactPhone}
              onChange={(e) => handleChange('contactPhone', e.target.value)}
              placeholder="+251..."
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? t('common.loading') : park ? t('common.edit') : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ParkDialog;
