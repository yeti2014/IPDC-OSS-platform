// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  AlertTitle,
  Fab,
  Tabs,
  Tab,
  Chip,
  Stack,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Add as AddIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Map as MapIcon,
  Campaign,
} from '@mui/icons-material';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { StatusBar, OfflineBanner } from '../components/common/StatusBar';
import { useAuth } from '../contexts/AuthContext';
import { useDeviceDetection } from '../hooks/useDeviceDetection';
import { useOfflineStorage } from '../hooks/useOfflineStorage';
import { ServiceRequest } from '../types';
import CreateRequestForm from '../components/tenant/CreateRequestForm';
import RequestsList from '../components/common/RequestsList';
import RequestDetailsDialog from '../components/common/RequestDetailsDialog';
import RequestsChart from '../components/common/RequestsChart';
import RequestsFilter, { FilterState } from '../components/common/RequestsFilter';
import { RequestListSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import Toast from '../components/common/Toast';
import AnnouncementBanner from '../components/common/AnnouncementBanner';
import ParkRecommendation from '../components/tenant/ParkRecommendation';
import TokenDashboard from '../components/tenant/TokenDashboard';
import UserProfile from '../components/common/UserProfile';
import FileComplaintDialog from '../components/tenant/FileComplaintDialog';
import ServiceTierSelector from '../components/tenant/ServiceTierSelector';
import TenantLifecycleTimeline from '../components/tenant/TenantLifecycleTimeline';
import { useTranslation } from 'react-i18next';
import { complaintService } from '../services/complaintService';
import { useNavigate } from 'react-router-dom';
// Lazy-load ParksMap so Leaflet's module-level code doesn't run at import time
// (Leaflet crashes on mobile if executed during Dashboard module initialization)
const ParksMap = React.lazy(() => import('../components/map/ParksMap'));
import ParkDetailsModal from '../components/map/ParkDetailsModal';
import { IndustrialPark } from '../data/ethiopianParks';

// Local error boundary for the map — prevents the entire app crashing if
// Leaflet fails to initialize on mobile/PWA environments.
class MapErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: 400, flexDirection: 'column', gap: 2,
            bgcolor: 'grey.100', borderRadius: 2,
          }}
        >
          <Typography color="text.secondary" fontWeight="medium">
            Parks Map unavailable on this device
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" px={3}>
            Your browser does not support the interactive map.
            Please open the platform in a desktop browser for the full map experience.
          </Typography>
        </Box>
      );
    }
    return this.props.children;
  }
}

export const Dashboard = () => {
  const { userData, logOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useDeviceDetection();
  const { localRequests } = useOfflineStorage(userData?.uid, userData?.role);

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [complaintDialogOpen, setComplaintDialogOpen] = useState(false);
  const [complaintRequest, setComplaintRequest] = useState<ServiceRequest | null>(null);
  const [tabValue, setTabValue] = useState(1); // Default to Service Requests (map crashes on mobile)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    priority: 'all',
    serviceType: 'all',
  });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as const });
  const [complaints, setComplaints] = useState<any[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);

  // Parks Map state
  const [selectedPark, setSelectedPark] = useState<IndustrialPark | null>(null);
  const [parkModalOpen, setParkModalOpen] = useState(false);

  // Load from Firestore
  useEffect(() => {
    if (!userData) return;

    let q;
    
    if (userData.role === 'tenant') {
      q = query(
        collection(db, 'serviceRequests'),
        where('tenantId', '==', userData.uid)
      );
    } else {
      q = query(collection(db, 'serviceRequests'));
    }

    const toDate = (ts: any): Date => {
      if (!ts) return new Date();
      if (typeof ts.toDate === 'function') return ts.toDate();
      if (ts.seconds) return new Date(ts.seconds * 1000);
      return new Date();
    };

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const requestsData: ServiceRequest[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          requestsData.push({
            id: doc.id,
            ...data,
            createdAt: toDate(data.createdAt),
            updatedAt: toDate(data.updatedAt),
            completedAt: data.completedAt ? toDate(data.completedAt) : undefined,
          } as ServiceRequest);
        });
        
        requestsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setRequests(requestsData);
        setLoading(false);
      },
      (error) => {
        console.error('❌ Firestore error:', error);
        setLoading(false);
        showToast('Failed to load requests', 'error');
      }
    );

    return () => unsubscribe();
  }, [userData]);

  // Merge with local storage
  useEffect(() => {
    if (localRequests.length === 0) return;

    setRequests(prevRequests => {
      const existingIds = new Set(prevRequests.map(r => r.id));
      const newRequests = localRequests.filter(r => !existingIds.has(r.id));
      
      const combined = [...prevRequests, ...newRequests];
      combined.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return combined;
    });
  }, [localRequests]);

  // Real-time complaints listener for tenant — fires immediately and stays in sync
  useEffect(() => {
    if (!userData || userData.role !== 'tenant') return;

    setComplaintsLoading(true);
    const q = query(
      collection(db, 'complaints'),
      where('tenantId', '==', userData.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        data.push({
          id: doc.id,
          ...d,
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : new Date(),
          updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate() : new Date(),
          resolvedAt: d.resolvedAt?.toDate ? d.resolvedAt.toDate() : undefined,
        });
      });
      data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setComplaints(data);
      setComplaintsLoading(false);
    }, (error) => {
      console.error('Error loading complaints:', error);
      setComplaintsLoading(false);
    });

    return () => unsubscribe();
  }, [userData]);

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Logout failed:', error);
      showToast('Logout failed', 'error');
    }
  };

  const handleViewRequest = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setDetailsDialogOpen(true);
  };

  // Compute tenant journey stage dynamically from their actual service requests
  const computeTenantStatus = () => {
    const entryRequests = requests.filter(r => r.serviceType === 'other');
    const facilityRequests = requests.filter(r => r.serviceType !== 'other');
    const completedEntry = entryRequests.filter(r => r.status === 'completed');
    const completedFacility = facilityRequests.filter(r => r.status === 'completed');

    // Determine stage: new → applying → approved → settled → active
    let stage: 'new' | 'applying' | 'approved' | 'settled' | 'active';
    if (completedFacility.length > 0) {
      stage = 'active';
    } else if (facilityRequests.length > 0) {
      stage = 'settled';
    } else if (completedEntry.length > 0) {
      stage = 'approved';
    } else if (entryRequests.length > 0) {
      stage = 'applying';
    } else {
      stage = 'new';
    }

    // Check which specific entry services have been completed (keyword matching)
    const hasCompleted = (keywords: string[]) =>
      completedEntry.some(r =>
        keywords.some(kw => r.title?.toLowerCase().includes(kw))
      );

    return {
      stage,
      completedServices: {
        investmentPermit: hasCompleted(['investment permit', 'investment']),
        businessLicense: hasCompleted(['business license', 'business registration', 'license']),
        workPermit: hasCompleted(['work permit']),
        taxRegistration: hasCompleted(['tax registration', 'tax']),
      },
    };
  };

  const handleRequestCreated = () => {
    showToast('Request created successfully!', 'success');
  };

  const handleFileComplaint = async (request: ServiceRequest) => {
    // Check if complaint can be filed
    const eligibility = await complaintService.canFileComplaint(request.id);

    if (!eligibility.canFile) {
      showToast(eligibility.reason || 'Cannot file complaint for this request', 'error');
      return;
    }

    setComplaintRequest(request);
    setComplaintDialogOpen(true);
  };

  const handleComplaintSuccess = () => {
    showToast('Complaint filed successfully! Admin will review within 48 hours.', 'success');
    setComplaintDialogOpen(false);
    setComplaintRequest(null);
    // onSnapshot listener automatically reflects the new complaint — no manual reload needed
  };

  const showToast = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setToast({ open: true, message, severity });
  };

  const handleParkClick = (park: IndustrialPark) => {
    setSelectedPark(park);
    setParkModalOpen(true);
  };

  const handleParkModalClose = () => {
    setParkModalOpen(false);
    setTimeout(() => setSelectedPark(null), 300);
  };

  // Apply filters
  const filteredRequests = requests.filter((request) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        request.title.toLowerCase().includes(searchLower) ||
        request.description.toLowerCase().includes(searchLower) ||
        request.tenantName.toLowerCase().includes(searchLower) ||
        (request.location && request.location.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    if (filters.status !== 'all' && request.status !== filters.status) {
      return false;
    }

    if (filters.priority !== 'all' && request.priority !== filters.priority) {
      return false;
    }

    if (filters.serviceType !== 'all' && request.serviceType !== filters.serviceType) {
      return false;
    }

    return true;
  });

  const stats = {
    total: filteredRequests.length,
    pending: filteredRequests.filter((r) => r.status === 'pending').length,
    inProgress: filteredRequests.filter((r) => r.status === 'in-progress').length,
    completed: filteredRequests.filter((r) => r.status === 'completed').length,
  };

  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.serviceType !== 'all';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <StatusBar />
      <OfflineBanner />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert
          severity="success"
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              {t('nav.logout')}
            </Button>
          }
          sx={{ mb: 4 }}
        >
          <AlertTitle>{t('dashboard.welcome')}, {userData?.displayName || 'User'}!</AlertTitle>
          You're logged in as <strong>{userData?.role}</strong>
        </Alert>

        {userData?.role === 'tenant' && (
          <>
            {/* Tenant Lifecycle Status Timeline */}
            <TenantLifecycleTimeline status={computeTenantStatus()} />

            {/* Section Header for New Service Requests */}
            <Box sx={{ mb: 3, mt: 2 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Create New Service Request
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select the type of service you need from the options below
              </Typography>
            </Box>

            {/* Two-Tier Service Selector */}
            <ServiceTierSelector
              onSelectTier={(tier) => {
                if (tier === 'entry') {
                  navigate('/services/entry');
                } else {
                  navigate('/services/facility');
                }
              }}
            />
          </>
        )}

        {/* Tabs Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label="Parks Map" icon={<MapIcon />} iconPosition="start" />
            <Tab label="Service Requests" />
            <Tab label="Basic Analytics" />
            {userData?.role === 'tenant' && <Tab label="Token Balance" />}
            {userData?.role === 'tenant' && <Tab label="My Complaints" />}
            <Tab label="Announcements" />
          </Tabs>
        </Box>

        {/* PARKS MAP TAB */}
        {tabValue === 0 && (
          <Box sx={{ height: '600px', width: '100%' }}>
            <MapErrorBoundary>
              <React.Suspense fallback={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              }>
                <ParksMap onParkClick={handleParkClick} selectedPark={selectedPark} />
              </React.Suspense>
            </MapErrorBoundary>
          </Box>
        )}

        {/* SERVICE REQUESTS TAB */}
        {tabValue === 1 && (
          <>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <DashboardIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        My Service Requests
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Track and manage your submitted service requests
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {userData?.role === 'tenant' && (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                        size="medium"
                      >
                        Create New Request
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {stats.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Service Requests
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="warning.main" gutterBottom>
                      {stats.pending}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="info.main" gutterBottom>
                      {stats.inProgress}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      In Progress
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="success.main" gutterBottom>
                      {stats.completed}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <RequestsFilter onFilterChange={setFilters} />

            {loading ? (
              <RequestListSkeleton count={5} />
            ) : filteredRequests.length === 0 ? (
              <Card>
                <CardContent>
                  <EmptyState
                    title={hasActiveFilters ? "No matching requests" : "No requests yet"}
                    description={
                      hasActiveFilters
                        ? "Try adjusting your filters to see more results"
                        : userData?.role === 'tenant'
                        ? "Create your first service request to get started"
                        : "No service requests have been created yet"
                    }
                    actionLabel={userData?.role === 'tenant' && !hasActiveFilters ? "Create Request" : undefined}
                    onAction={userData?.role === 'tenant' && !hasActiveFilters ? () => setCreateDialogOpen(true) : undefined}
                  />
                </CardContent>
              </Card>
            ) : (
              <RequestsList
                requests={filteredRequests}
                onViewRequest={handleViewRequest}
                onFileComplaint={userData?.role === 'tenant' ? handleFileComplaint : undefined}
                emptyMessage="No requests found"
              />
            )}
          </>
        )}

        {/* BASIC ANALYTICS TAB */}
        {tabValue === 2 && (
          <RequestsChart requests={filteredRequests} />
        )}

        {/* TOKEN BALANCE TAB */}
        {tabValue === 3 && userData?.role === 'tenant' && (
          <TokenDashboard />
        )}

        {/* MY COMPLAINTS TAB */}
        {tabValue === 4 && userData?.role === 'tenant' && (
          complaintsLoading ? (
            <Card>
              <CardContent>
                <Typography textAlign="center" py={4}>Loading complaints...</Typography>
              </CardContent>
            </Card>
          ) : complaints.length === 0 ? (
            <Card>
              <CardContent>
                <EmptyState
                  title="No complaints filed"
                  description="You haven't filed any complaints yet. You can file a complaint for completed or rejected requests."
                />
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={2}>
              {complaints.map((complaint) => (
                <Card key={complaint.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {complaint.subject}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Request: {complaint.requestTitle}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, my: 2 }}>
                          <Chip
                            label={complaint.status.replace('-', ' ').toUpperCase()}
                            color={
                              complaint.status === 'resolved' ? 'success' :
                              complaint.status === 'rejected' ? 'error' :
                              complaint.status === 'under-review' ? 'info' : 'warning'
                            }
                            size="small"
                          />
                          <Chip label={complaint.severity.toUpperCase()} size="small" />
                          <Chip label={complaint.category.replace('-', ' ')} variant="outlined" size="small" />
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                          Filed: {new Date(complaint.createdAt).toLocaleString()}
                          {complaint.resolvedAt && ` • Resolved: ${new Date(complaint.resolvedAt).toLocaleString()}`}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )
        )}

        {/* ANNOUNCEMENTS TAB */}
        {tabValue === (userData?.role === 'tenant' ? 5 : 3) && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
              📢 Announcements
            </Typography>
            <AnnouncementBanner />
          </Box>
        )}

      </Container>

      {userData?.role === 'tenant' && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => setCreateDialogOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', sm: 'none' },
          }}
        >
          <AddIcon />
        </Fab>
      )}

      <CreateRequestForm
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleRequestCreated}
      />

      <RequestDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        request={selectedRequest}
      />

      {complaintRequest && (
        <FileComplaintDialog
          open={complaintDialogOpen}
          onClose={() => {
            setComplaintDialogOpen(false);
            setComplaintRequest(null);
          }}
          request={complaintRequest}
          onSuccess={handleComplaintSuccess}
        />
      )}

      <ParkDetailsModal
        park={selectedPark}
        open={parkModalOpen}
        onClose={handleParkModalClose}
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

export default Dashboard;
