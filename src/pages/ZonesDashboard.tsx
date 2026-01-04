// src/pages/ZonesDashboard.tsx
import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  AlertTitle,
  Chip,
  LinearProgress,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Factory as FactoryIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Logout as LogoutIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { StatusBar, OfflineBanner } from '../components/common/StatusBar';
import { useAuth } from '../contexts/AuthContext';
import AnnouncementBanner from '../components/common/AnnouncementBanner';
import { IndustrialPark } from '../types/industrialPark';
import { seedIndustrialParks } from '../scripts/seedIndustrialParks';

export const ZonesDashboard = () => {
  const { userData, logOut } = useAuth();
  const [parks, setParks] = useState<IndustrialPark[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPark, setSelectedPark] = useState<IndustrialPark | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Load parks from Firestore
  useEffect(() => {
    loadParks();
  }, []);

  const loadParks = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'industrialParks'),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log('⚠️  No parks found. You may need to seed the database.');
      }

      const parksData: IndustrialPark[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as IndustrialPark;
      });

      setParks(parksData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading parks:', error);
      setLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    try {
      setSeeding(true);
      const result = await seedIndustrialParks();
      if (result.success) {
        alert(`✅ ${result.message}`);
        loadParks(); // Reload parks
      } else {
        alert(`⚠️  ${result.message}`);
      }
    } catch (error) {
      console.error('Error seeding:', error);
      alert('❌ Failed to seed database');
    } finally {
      setSeeding(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleViewDetails = (park: IndustrialPark) => {
    setSelectedPark(park);
    setDetailsDialogOpen(true);
  };

  const totalTenants = parks.reduce((sum, park) => sum + (park.currentTenants || 0), 0);
  const totalEmployees = parks.reduce((sum, park) => sum + (park.currentEmployees || 0), 0);
  const avgOccupancy = parks.length > 0
    ? parks.reduce((sum, park) => sum + (park.occupancyRate || 0), 0) / parks.length
    : 0;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <StatusBar />
      <OfflineBanner />
      <AnnouncementBanner />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert
          severity="info"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                size="small"
                onClick={() => window.location.href = '/dashboard'}
              >
                Back to Dashboard
              </Button>
              <Button
                color="inherit"
                size="small"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Box>
          }
          sx={{ mb: 4 }}
        >
          <AlertTitle>Ethiopian Industrial Parks Overview</AlertTitle>
          Real-time statistics across all special economic zones
        </Alert>

        {parks.length === 0 && !loading && (
          <Alert severity="warning" sx={{ mb: 4 }} action={
            <Button
              color="inherit"
              size="small"
              onClick={handleSeedDatabase}
              disabled={seeding}
            >
              {seeding ? 'Seeding...' : 'Seed Database'}
            </Button>
          }>
            <AlertTitle>No Industrial Parks Found</AlertTitle>
            The database appears to be empty. Click "Seed Database" to populate with Ethiopian Industrial Parks data.
          </Alert>
        )}


        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <FactoryIcon sx={{ fontSize: 48, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Industrial Parks Dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {parks.length} Active Industrial Parks
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={loadParks}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant="h3" color="primary.main" gutterBottom>
                    {totalTenants}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Total Tenant Companies
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant="h3" color="success.main" gutterBottom>
                    {(totalEmployees || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Total Employees
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant="h3" color="info.main" gutterBottom>
                    {(avgOccupancy || 0).toFixed(0)}%
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Average Occupancy Rate
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
          Industrial Parks
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {parks.map((park) => (
              <Grid item xs={12} md={6} lg={4} key={park.id}>
                <Card
                  sx={{
                    height: '100%',
                    '&:hover': { boxShadow: 6, cursor: 'pointer' },
                    transition: 'all 0.3s'
                  }}
                  onClick={() => handleViewDetails(park)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {park.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          📍 {park.location.city}, {park.location.region}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${park.occupancyRate}%`}
                        color={park.occupancyRate > 80 ? 'success' : park.occupancyRate > 60 ? 'warning' : 'default'}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                        Occupancy Rate
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={park.occupancyRate || 0}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessIcon color="primary" />
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              {park.currentTenants || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Tenants
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PeopleIcon color="success" />
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              {park.currentEmployees?.toLocaleString() || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Employees
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TrendingUpIcon color="warning" />
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              {park.statistics?.activeRequests || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Active Requests
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            ✅
                          </Box>
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              {park.statistics?.completedRequests || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Completed
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {park.primaryIndustries?.slice(0, 2).map((industry, idx) => (
                        <Chip
                          key={idx}
                          label={industry}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Park Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedPark && (
          <>
            <DialogTitle>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {selectedPark.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedPark.location.city}, {selectedPark.location.region}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedPark.description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Area
                  </Typography>
                  <Typography variant="h6">{selectedPark.totalArea} hectares</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Available Area
                  </Typography>
                  <Typography variant="h6">{selectedPark.availableArea} hectares</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Rent Rate
                  </Typography>
                  <Typography variant="h6">${selectedPark.rentPerSqm}/m² per month</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tax Holiday
                  </Typography>
                  <Typography variant="h6">{selectedPark.incentives.taxHoliday} years</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Primary Industries
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {selectedPark.primaryIndustries.map((industry, idx) => (
                  <Chip key={idx} label={industry} color="primary" />
                ))}
              </Box>

              <Typography variant="h6" gutterBottom>
                Available Services
              </Typography>
              <List dense>
                {selectedPark.availableServices.slice(0, 6).map((service, idx) => (
                  <ListItem key={idx}>
                    <ListItemText primary={`• ${service}`} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Contact Information
              </Typography>
              <Typography variant="body2">
                Phone: {selectedPark.contactInfo.phone}
              </Typography>
              <Typography variant="body2">
                Email: {selectedPark.contactInfo.email}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ZonesDashboard;