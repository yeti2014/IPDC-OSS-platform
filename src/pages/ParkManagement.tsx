// src/pages/ParkManagement.tsx
import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { StatusBar, OfflineBanner } from '../components/common/StatusBar';
import ParkDialog from '../components/admin/ParkDialog';
import Toast from '../components/common/Toast';
import { useTranslation } from 'react-i18next';

interface IndustrialPark {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export const ParkManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [parks, setParks] = useState<IndustrialPark[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPark, setSelectedPark] = useState<IndustrialPark | null>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const q = query(collection(db, 'industrialParks'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const parksData: IndustrialPark[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          parksData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as IndustrialPark);
        });

        parksData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setParks(parksData);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading parks:', error);
        showToast('Failed to load industrial parks', 'error');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAdd = () => {
    setSelectedPark(null);
    setDialogOpen(true);
  };

  const handleEdit = (park: IndustrialPark) => {
    setSelectedPark(park);
    setDialogOpen(true);
  };

  const handleDelete = async (parkId: string, parkName: string) => {
    if (window.confirm(`Are you sure you want to delete "${parkName}"? This action cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, 'industrialParks', parkId));
        showToast('Industrial park deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting park:', error);
        showToast('Failed to delete industrial park', 'error');
      }
    }
  };

  const handleSuccess = () => {
    showToast(
      selectedPark
        ? 'Industrial park updated successfully'
        : 'Industrial park created successfully',
      'success'
    );
  };

  const showToast = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setToast({ open: true, message, severity });
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return 'error';
    if (rate >= 70) return 'warning';
    if (rate >= 50) return 'info';
    return 'success';
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <StatusBar />
      <OfflineBanner />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    Industrial Parks Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage industrial parks in the IPDC platform
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/dashboard')}
                  size="large"
                >
                  Back to Dashboard
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAdd}
                  size="large"
                >
                  Add New Park
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {loading ? (
          <Alert severity="info">Loading industrial parks...</Alert>
        ) : parks.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <BusinessIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Industrial Parks Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Get started by adding your first industrial park
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
                Add First Park
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {parks.map((park) => (
              <Grid item xs={12} md={6} lg={4} key={park.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
                        {park.name}
                      </Typography>
                      <Box>
                        <IconButton size="small" onClick={() => handleEdit(park)} color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(park.id, park.name)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      📍 {park.location}
                    </Typography>

                    <Typography variant="body2" sx={{ mb: 2, minHeight: 60 }}>
                      {park.description.length > 100
                        ? `${park.description.substring(0, 100)}...`
                        : park.description}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={`${(park.occupancyRate || 0).toFixed(0)}% Occupied`}
                        color={getOccupancyColor(park.occupancyRate || 0)}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip
                        label={`${park.currentTenants || 0}/${park.maxTenants || 0} Tenants`}
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip
                        label={`${(park.currentEmployees || 0).toLocaleString()} Employees`}
                        variant="outlined"
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    </Box>

                    <Typography variant="caption" display="block" color="text.secondary" gutterBottom>
                      <strong>Area:</strong> {park.totalArea || 0} hectares ({park.availableArea || 0} available)
                    </Typography>

                    <Typography variant="caption" display="block" color="text.secondary" gutterBottom>
                      <strong>Region:</strong> {park.region} | <strong>City:</strong> {park.city}
                    </Typography>

                    {park.primaryIndustries && park.primaryIndustries.length > 0 && (
                      <Typography variant="caption" display="block" color="text.secondary" gutterBottom>
                        <strong>Industries:</strong> {park.primaryIndustries.slice(0, 3).join(', ')}
                        {park.primaryIndustries.length > 3 && ` +${park.primaryIndustries.length - 3} more`}
                      </Typography>
                    )}

                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                      <strong>Contact:</strong> {park.contactPerson} ({park.contactEmail})
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <ParkDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleSuccess}
        park={selectedPark}
      />

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Box>
  );
};

export default ParkManagement;
