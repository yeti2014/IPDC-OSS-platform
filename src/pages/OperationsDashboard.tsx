// src/pages/OperationsDashboard.tsx
import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
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
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Visibility as ViewIcon,
  Logout as LogoutIcon,
  Build as BuildIcon,
  Campaign as CampaignIcon,
} from '@mui/icons-material';
import { collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { StatusBar, OfflineBanner } from '../components/common/StatusBar';
import { useAuth } from '../contexts/AuthContext';
import { ServiceRequest } from '../types';
import RequestDetailsDialog from '../components/common/RequestDetailsDialog';
import { notificationService } from '../services/notificationService';
import { tokenService } from '../services/tokenService';
import { formatDistanceToNow } from 'date-fns';
import AnnouncementBanner from '../components/common/AnnouncementBanner';
import { useTranslation } from 'react-i18next';

export const OperationsDashboard = () => {
  const { userData, logOut } = useAuth();
  const { t } = useTranslation();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (!userData) return;

    // Load approved, in-progress, and completed requests
    const q = query(
      collection(db, 'serviceRequests'),
      where('status', 'in', ['approved', 'in-progress', 'completed'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData: ServiceRequest[]  = [];
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

  const handleStartWork = async (request: ServiceRequest) => {
    try {
      await updateDoc(doc(db, 'serviceRequests', request.id), {
        status: 'in-progress',
        assignedTo: userData?.uid,
        assignedToName: userData?.displayName || userData?.email,
        updatedAt: serverTimestamp(),
      });

      // Notify tenant about status change
      if (request.tenantId && request.tenantEmail && request.tenantName) {
        await notificationService.notifyRequestStatusChanged(
          request.tenantId,
          request.tenantEmail,
          request.tenantName,
          request.id,
          request.title,
          'approved',
          'in-progress',
          userData?.displayName || userData?.email || 'Operations Team'
        );
      }
    } catch (error) {
      console.error('Error starting work:', error);
    }
  };

  const handleComplete = async (request: ServiceRequest) => {
    try {
      // Check if tokens were already deducted (prevent double charging)
      if ((request as any).tokensDeducted) {
        alert('⚠️ Tokens have already been deducted for this request.');

        // Just update status without deducting again
        await updateDoc(doc(db, 'serviceRequests', request.id), {
          status: 'completed',
          completedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        return;
      }

      // Calculate the cost first
      const estimatedCost = (request as any).tokenCost || tokenService.calculateServiceCost(
        request.serviceType || 'other',
        request.priority || 'medium'
      );

      // Show confirmation dialog with cost information
      const confirmed = window.confirm(
        `Complete this request?\n\n` +
        `Request: ${request.title}\n` +
        `Service: ${(request.serviceType || 'other').replace('-', ' ')}\n` +
        `Priority: ${(request.priority || 'medium').toUpperCase()}\n` +
        `\nToken Cost: ${estimatedCost} tokens\n\n` +
        `This will deduct ${estimatedCost} tokens from ${request.tenantName}'s account.\n\n` +
        `${(request as any).tokensReserved ? '(Tokens were reserved when request was created)' : ''}\n\n` +
        `Do you want to proceed?`
      );

      if (!confirmed) {
        return; // User cancelled
      }

      // Deduct tokens from tenant account
      const deductResult = await tokenService.deductTokens(
        request.tenantId,
        request.serviceType || 'other',
        request.priority || 'medium',
        request.id,
        `Service completed: ${request.title}`
      );

      if (!deductResult.success) {
        console.error('Failed to deduct tokens:', deductResult.message);
        alert(deductResult.message || 'Failed to deduct tokens from tenant account');
        return;
      }

      await updateDoc(doc(db, 'serviceRequests', request.id), {
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tokensCost: deductResult.cost,
        tokensDeducted: true,
        tokensReserved: false, // Clear reserved flag
      });

      console.log(`✅ Tokens deducted: ${deductResult.cost} tokens. New balance: ${deductResult.newBalance}`);

      // Notify tenant about completion WITH TOKEN INFORMATION
      if (request.tenantId && request.tenantEmail && request.tenantName) {
        await notificationService.notifyRequestStatusChanged(
          request.tenantId,
          request.tenantEmail,
          request.tenantName,
          request.id,
          request.title,
          'in-progress',
          'completed',
          userData?.displayName || userData?.email || 'Operations Team',
          undefined, // notes
          { cost: deductResult.cost, newBalance: deductResult.newBalance } // token info
        );
      }

      // Notify Admin about task completion
      try {
        await notificationService.notifyAdminTaskCompleted(
          request.tenantName,
          request.id,
          request.title,
          userData?.displayName || userData?.email || 'Operations Team',
          deductResult.cost
        );
        console.log('📧 Admin notified about task completion');
      } catch (adminNotifError) {
        console.error('Admin notification failed (non-critical):', adminNotifError);
      }

      // Show success message
      alert(`✅ Request completed successfully!\n\nTokens deducted: ${deductResult.cost}\nTenant's new balance: ${deductResult.newBalance} tokens`);
    } catch (error) {
      console.error('Error completing request:', error);
      alert('Failed to complete request. Please try again.');
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

  const approvedRequests = requests.filter(r => r.status === 'approved');
  const inProgressRequests = requests.filter(r => r.status === 'in-progress');
  const completedRequests = requests.filter(r => r.status === 'completed');
  const myTasks = inProgressRequests.filter(r => r.assignedTo === userData?.uid);

  const displayRequests = tabValue === 0 ? approvedRequests :
                          tabValue === 1 ? inProgressRequests :
                          tabValue === 2 ? myTasks :
                          completedRequests;

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
          Manage approved service requests and track your tasks
        </Alert>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <BuildIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                  Service Requests Workflow
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {approvedRequests.length} approved • {inProgressRequests.length} in progress • {completedRequests.length} completed • {myTasks.length} assigned to you
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning.main" gutterBottom>
                {approvedRequests.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('requests.approved')}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h4" color="info.main" gutterBottom>
                {inProgressRequests.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('requests.inProgress')}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main" gutterBottom>
                {completedRequests.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary.main" gutterBottom>
                {myTasks.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                My Active Tasks
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(_e, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label={`${t('requests.approved')} (${approvedRequests.length})`} />
            <Tab label={`${t('requests.inProgress')} (${inProgressRequests.length})`} />
            <Tab label={`My Tasks (${myTasks.length})`} />
            <Tab label={`Completed (${completedRequests.length})`} />
            <Tab label={t('nav.announcements')} />
          </Tabs>
        </Box>

        {tabValue !== 4 && (
          loading ? (
            <Card>
              <CardContent>
                <Typography textAlign="center" py={4}>
                  {t('common.loading')}
                </Typography>
              </CardContent>
            </Card>
          ) : displayRequests.length === 0 ? (
            <Card>
              <CardContent>
                <Typography textAlign="center" py={4} color="text.secondary">
                  {tabValue === 0 && 'No approved requests'}
                  {tabValue === 1 && 'No requests in progress'}
                  {tabValue === 2 && 'No tasks assigned to you'}
                  {tabValue === 3 && 'No completed requests'}
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
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tenant</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Priority</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Location</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayRequests.map((request) => (
                    <TableRow key={request.id} hover>
                      <TableCell>{request.serviceType}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {request.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(request.createdAt, { addSuffix: true })}
                        </Typography>
                      </TableCell>
                      <TableCell>{request.tenantName}</TableCell>
                      <TableCell>
                        <Chip
                          label={(request.priority || 'medium').toUpperCase()}
                          color={getPriorityColor(request.priority || 'medium')}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{request.location || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={(request.status || 'pending').replace('-', ' ').toUpperCase()}
                          color={request.status === 'approved' ? 'warning' : request.status === 'completed' ? 'success' : 'info'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleViewRequest(request)}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          {request.status === 'approved' && (
                            <Tooltip title="Start Work">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleStartWork(request)}
                              >
                                <StartIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {request.status === 'in-progress' && request.assignedTo === userData?.uid && (
                            <Tooltip title="Mark Complete">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleComplete(request)}
                              >
                                <CompleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        )}

        {tabValue === 4 && (
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
    </Box>
  );
};

export default OperationsDashboard;