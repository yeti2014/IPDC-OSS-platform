// src/pages/AdminDashboard.tsx
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Campaign as CampaignIcon,
  Business as BusinessIcon,
  ReportProblem as ComplaintIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { StatusBar, OfflineBanner } from '../components/common/StatusBar';
import { useAuth } from '../contexts/AuthContext';
import { ServiceRequest } from '../types';
import RequestDetailsDialog from '../components/common/RequestDetailsDialog';
import { notificationService } from '../services/notificationService';
import { complaintService } from '../services/complaintService';
import { formatDistanceToNow } from 'date-fns';
import CreateAnnouncementDialog from '../components/admin/CreateAnnouncementDialog';
import AnnouncementBanner from '../components/common/AnnouncementBanner';
import TenantManagement from '../components/admin/TenantManagement';
import AssetManagement from '../components/admin/AssetManagement';
import CreateStaffAccount from '../components/admin/CreateStaffAccount';
import { useTranslation } from 'react-i18next';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { userData, logOut } = useAuth();
  const { t } = useTranslation();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [complaintStats, setComplaintStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    resolved: 0,
    rejected: 0,
    averageResolutionTime: 0,
  });

  useEffect(() => {
    if (!userData) return;

    // Load complaint statistics
    loadComplaintStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(loadComplaintStats, 30000);
    return () => clearInterval(interval);
  }, [userData]);

  useEffect(() => {
    if (!userData) return;

    const q = query(
      collection(db, 'serviceRequests'),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData: ServiceRequest[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        requestsData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as ServiceRequest);
      });
      
      requestsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setRequests(requestsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData]);

  const loadComplaintStats = async () => {
    try {
      const stats = await complaintService.getComplaintStats();
      setComplaintStats(stats);
    } catch (error) {
      console.error('Error loading complaint stats:', error);
    }
  };

  const handleApprove = async (request: ServiceRequest) => {
    try {
      await updateDoc(doc(db, 'serviceRequests', request.id), {
        status: 'approved',
        updatedAt: serverTimestamp(),
      });

      // Notify tenant about approval
      await notificationService.notifyRequestStatusChanged(
        request.tenantId,
        request.tenantEmail,
        request.tenantName,
        request.id,
        request.title,
        'pending',
        'approved',
        userData?.displayName || userData?.email || 'Admin'
      );

      // Notify Operations team about new approved request
      try {
        await notificationService.notifyOperationsRequestApproved(
          request.tenantName,
          request.id,
          request.title,
          request.serviceType || 'Service Request',
          request.priority || 'medium',
          request.location || 'Not specified'
        );
        console.log('📧 Operations notified about approved request');
      } catch (opsNotifError) {
        console.error('Operations notification failed (non-critical):', opsNotifError);
      }
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleReject = async (request: ServiceRequest) => {
    try {
      await updateDoc(doc(db, 'serviceRequests', request.id), {
        status: 'rejected',
        updatedAt: serverTimestamp(),
        notes: 'Rejected by administrator',
      });

      await notificationService.notifyRequestStatusChanged(
        request.tenantId,
        request.tenantEmail,
        request.tenantName,
        request.id,
        request.title,
        'pending',
        'rejected',
        userData?.displayName || userData?.email || 'Admin'
      );
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleViewRequest = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setDetailsDialogOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <StatusBar />
      <OfflineBanner />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert
          severity="info"
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
          <AlertTitle>{t('nav.dashboard')}</AlertTitle>
          Review and approve pending service requests
        </Alert>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DashboardIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4" gutterBottom fontWeight="bold">
                    Admin Control Panel
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage requests, tenants, and announcements
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <CreateStaffAccount />
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<ComplaintIcon />}
                  onClick={() => navigate('/admin/complaints')}
                >
                  Complaints {complaintStats.pending > 0 && `(${complaintStats.pending})`}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<CampaignIcon />}
                  onClick={() => setAnnouncementDialogOpen(true)}
                >
                  {t('nav.announcements')}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<BusinessIcon />}
                  onClick={() => navigate('/zones')}
                >
                  {t('nav.zones')}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<BusinessIcon />}
                  onClick={() => navigate('/parks')}
                >
                  Manage Parks
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Complaint Statistics Card */}
        {(complaintStats.pending > 0 || complaintStats.underReview > 0) && (
          <Alert severity="warning" sx={{ mb: 4 }}>
            <AlertTitle>Pending Complaints</AlertTitle>
            {complaintStats.pending} pending and {complaintStats.underReview} under review complaints
            require your attention. Average resolution time: {complaintStats.averageResolutionTime.toFixed(1)} hours
            {complaintStats.averageResolutionTime > 48 && ' (exceeds 48-hour SLA)'}
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                color="inherit"
                onClick={() => navigate('/admin/complaints')}
              >
                View All Complaints
              </Button>
            </Box>
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="primary.main" gutterBottom>
                  {requests.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('requests.pending')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="error.main" gutterBottom>
                  {complaintStats.pending}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Complaints
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="warning.main" gutterBottom>
                  {complaintStats.underReview}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Under Review
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="success.main" gutterBottom>
                  {complaintStats.resolved}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Resolved Complaints
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label={`${t('requests.pending')} (${requests.length})`} />
            <Tab label="Tenant Management" />
            <Tab label={t('assets.title')} />
            <Tab label={t('nav.announcements')} />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          loading ? (
            <Card>
              <CardContent>
                <Typography textAlign="center" py={4}>
                  {t('common.loading')}
                </Typography>
              </CardContent>
            </Card>
          ) : requests.length === 0 ? (
            <Card>
              <CardContent>
                <Typography textAlign="center" py={4} color="text.secondary">
                  {t('common.noData')}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Title</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{t('auth.tenant')}</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{t('requests.priority')}</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Created</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id} hover>
                      <TableCell>{request.serviceType || 'N/A'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {request.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.description?.substring(0, 50) || 'No description'}...
                        </Typography>
                      </TableCell>
                      <TableCell>{request.tenantName || 'Unknown'}</TableCell>
                      <TableCell>
                        <Chip
                          label={(request.priority || 'medium').toUpperCase()}
                          color={getPriorityColor(request.priority || 'medium')}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {formatDistanceToNow(request.createdAt, { addSuffix: true })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleViewRequest(request)}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleApprove(request)}
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleReject(request)}
                            >
                              <RejectIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        )}

        {tabValue === 1 && <TenantManagement />}

        {tabValue === 2 && <AssetManagement />}

        {tabValue === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CampaignIcon />
              {t('nav.announcements')}
            </Typography>
            <AnnouncementBanner />
          </Box>
        )}
      </Container>

      <RequestDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        request={selectedRequest}
      />

      <CreateAnnouncementDialog
        open={announcementDialogOpen}
        onClose={() => setAnnouncementDialogOpen(false)}
      />
    </Box>
  );
};

export default AdminDashboard;