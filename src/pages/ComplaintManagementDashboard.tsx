// src/pages/ComplaintManagementDashboard.tsx
// Admin complaint management dashboard based on Chinese Smart Park OSS platforms

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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  CheckCircle as ResolveIcon,
  Cancel as RejectIcon,
  Warning as WarningIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { complaintService } from '../services/complaintService';
import { Complaint, ComplaintStatus, ResolutionAction } from '../types/complaint';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar, OfflineBanner } from '../components/common/StatusBar';
import AnnouncementBanner from '../components/common/AnnouncementBanner';

export const ComplaintManagementDashboard = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    resolved: 0,
    rejected: 0,
    averageResolutionTime: 0,
  });

  const [resolveForm, setResolveForm] = useState({
    action: 'no-action' as ResolutionAction,
    resolutionNotes: '',
    refundAmount: 0,
  });

  const [rejectForm, setRejectForm] = useState({
    adminResponse: '',
  });

  useEffect(() => {
    loadComplaints();
    loadStats();
  }, []);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const data = await complaintService.getPendingComplaints();
      setComplaints(data);
    } catch (error) {
      console.error('Error loading complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await complaintService.getComplaintStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleViewDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setDetailsDialogOpen(true);
  };

  const handleOpenResolveDialog = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setResolveForm({
      action: 'no-action',
      resolutionNotes: '',
      refundAmount: 0,
    });
    setResolveDialogOpen(true);
  };

  const handleOpenRejectDialog = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setRejectForm({
      adminResponse: '',
    });
    setRejectDialogOpen(true);
  };

  const handleResolveComplaint = async () => {
    if (!selectedComplaint || !userData) return;

    if (!resolveForm.resolutionNotes.trim()) {
      alert('Please provide resolution notes');
      return;
    }

    if (
      (resolveForm.action === 'partial-refund' || resolveForm.action === 'compensation') &&
      resolveForm.refundAmount <= 0
    ) {
      alert('Please specify a valid refund/compensation amount');
      return;
    }

    try {
      const result = await complaintService.resolveComplaint({
        complaintId: selectedComplaint.id,
        action: resolveForm.action,
        resolutionNotes: resolveForm.resolutionNotes,
        refundAmount: resolveForm.refundAmount,
        resolvedBy: userData.uid,
        resolvedByName: userData.displayName || userData.email || 'Admin',
      });

      if (result.success) {
        alert('✅ Complaint resolved successfully');
        setResolveDialogOpen(false);
        loadComplaints();
        loadStats();
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error: any) {
      console.error('Error resolving complaint:', error);
      alert('Failed to resolve complaint');
    }
  };

  const handleRejectComplaint = async () => {
    if (!selectedComplaint || !userData) return;

    if (!rejectForm.adminResponse.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      const result = await complaintService.rejectComplaint({
        complaintId: selectedComplaint.id,
        adminResponse: rejectForm.adminResponse,
        resolvedBy: userData.uid,
        resolvedByName: userData.displayName || userData.email || 'Admin',
      });

      if (result.success) {
        alert('✅ Complaint rejected');
        setRejectDialogOpen(false);
        loadComplaints();
        loadStats();
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error: any) {
      console.error('Error rejecting complaint:', error);
      alert('Failed to reject complaint');
    }
  };

  const handleUpdateStatus = async (complaintId: string, status: ComplaintStatus) => {
    try {
      const result = await complaintService.updateComplaintStatus(complaintId, status);
      if (result.success) {
        loadComplaints();
        loadStats();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'under-review':
        return 'info';
      case 'resolved':
        return 'success';
      case 'rejected':
        return 'default';
      default:
        return 'default';
    }
  };

  const pendingComplaints = complaints.filter((c) => c.status === 'pending');
  const underReviewComplaints = complaints.filter((c) => c.status === 'under-review');
  const resolvedComplaints = complaints.filter((c) => c.status === 'resolved');
  const rejectedComplaints = complaints.filter((c) => c.status === 'rejected');

  const displayComplaints =
    tabValue === 0 ? pendingComplaints :
    tabValue === 1 ? underReviewComplaints :
    tabValue === 2 ? resolvedComplaints :
    rejectedComplaints;

  // Check for complaints approaching SLA deadline (48 hours)
  const urgentComplaints = complaints.filter((c) => {
    const hoursSinceCreation = (Date.now() - c.createdAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceCreation > 36 && c.status !== 'resolved' && c.status !== 'rejected';
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <StatusBar />
      <OfflineBanner />
      <AnnouncementBanner />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/dashboard')} color="primary">
            <BackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">
            Complaint Management
          </Typography>
        </Box>

        {urgentComplaints.length > 0 && (
          <Alert severity="error" icon={<WarningIcon />} sx={{ mb: 4 }}>
            <AlertTitle>SLA Alert</AlertTitle>
            {urgentComplaints.length} complaint(s) approaching 48-hour SLA deadline. Immediate
            attention required!
          </Alert>
        )}

        {/* Statistics Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(5, 1fr)',
            },
            gap: 3,
            mb: 4,
          }}
        >
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary.main" gutterBottom>
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Complaints
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning.main" gutterBottom>
                {stats.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Review
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h4" color="info.main" gutterBottom>
                {stats.underReview}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Under Review
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main" gutterBottom>
                {stats.resolved}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Resolved
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h4" color="text.primary" gutterBottom>
                {stats.averageResolutionTime.toFixed(1)}h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Resolution Time
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
            <Tab label={`Pending (${pendingComplaints.length})`} />
            <Tab label={`Under Review (${underReviewComplaints.length})`} />
            <Tab label={`Resolved (${resolvedComplaints.length})`} />
            <Tab label={`Rejected (${rejectedComplaints.length})`} />
          </Tabs>
        </Box>

        {loading ? (
          <Card>
            <CardContent>
              <Typography textAlign="center" py={4}>
                Loading complaints...
              </Typography>
            </CardContent>
          </Card>
        ) : displayComplaints.length === 0 ? (
          <Card>
            <CardContent>
              <Typography textAlign="center" py={4} color="text.secondary">
                {tabValue === 0 && 'No pending complaints'}
                {tabValue === 1 && 'No complaints under review'}
                {tabValue === 2 && 'No resolved complaints'}
                {tabValue === 3 && 'No rejected complaints'}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Request</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tenant</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Subject</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Severity</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Created</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayComplaints.map((complaint) => {
                  const hoursSinceCreation =
                    (Date.now() - complaint.createdAt.getTime()) / (1000 * 60 * 60);
                  const isUrgent = hoursSinceCreation > 36;

                  return (
                    <TableRow key={complaint.id} hover sx={{ bgcolor: isUrgent ? 'error.light' : 'inherit' }}>
                      <TableCell>
                        <Typography variant="caption">{complaint.id.substring(0, 8)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {complaint.requestTitle}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {complaint.serviceType.replace('-', ' ')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{complaint.tenantName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {complaint.tenantEmail}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {complaint.category.replace('-', ' ').toUpperCase()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{complaint.subject}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={complaint.severity.toUpperCase()}
                          color={getSeverityColor(complaint.severity)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={complaint.status.replace('-', ' ').toUpperCase()}
                          color={getStatusColor(complaint.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {formatDistanceToNow(complaint.createdAt, { addSuffix: true })}
                        </Typography>
                        {isUrgent && (
                          <Chip label="SLA Alert" color="error" size="small" sx={{ ml: 1 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleViewDetails(complaint)}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          {complaint.status === 'pending' && (
                            <Tooltip title="Mark Under Review">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleUpdateStatus(complaint.id, 'under-review')}
                              >
                                <WarningIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {(complaint.status === 'pending' || complaint.status === 'under-review') && (
                            <>
                              <Tooltip title="Resolve">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleOpenResolveDialog(complaint)}
                                >
                                  <ResolveIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleOpenRejectDialog(complaint)}
                                >
                                  <RejectIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Complaint Details</DialogTitle>
        <DialogContent>
          {selectedComplaint && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Complaint ID
                </Typography>
                <Typography variant="body1">{selectedComplaint.id}</Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Request Information
                </Typography>
                <Typography variant="body2">Title: {selectedComplaint.requestTitle}</Typography>
                <Typography variant="body2">
                  Service: {selectedComplaint.serviceType.replace('-', ' ')}
                </Typography>
                <Typography variant="body2">
                  Original Cost: {selectedComplaint.originalTokenCost} tokens
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Tenant Information
                </Typography>
                <Typography variant="body2">Name: {selectedComplaint.tenantName}</Typography>
                <Typography variant="body2">Email: {selectedComplaint.tenantEmail}</Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Operator Information
                </Typography>
                <Typography variant="body2">Name: {selectedComplaint.operatorName}</Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Complaint Details
                </Typography>
                <Typography variant="body2">
                  Category: {selectedComplaint.category.replace('-', ' ')}
                </Typography>
                <Typography variant="body2">Subject: {selectedComplaint.subject}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {selectedComplaint.description}
                </Typography>
                <Chip
                  label={`Severity: ${selectedComplaint.severity.toUpperCase()}`}
                  color={getSeverityColor(selectedComplaint.severity)}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>

              {selectedComplaint.evidence && selectedComplaint.evidence.length > 0 && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Evidence ({selectedComplaint.evidence.length} files)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {selectedComplaint.evidence.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.fileName}
                          component="a"
                          href={file.url}
                          target="_blank"
                          clickable
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                </>
              )}

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Timeline
                </Typography>
                <Typography variant="body2">
                  Created: {format(selectedComplaint.createdAt, 'PPpp')}
                </Typography>
                <Typography variant="body2">
                  Updated: {format(selectedComplaint.updatedAt, 'PPpp')}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog
        open={resolveDialogOpen}
        onClose={() => setResolveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Resolve Complaint</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Alert severity="info">
              Resolving this complaint will notify the tenant and operator via email.
            </Alert>

            <TextField
              select
              label="Resolution Action"
              value={resolveForm.action}
              onChange={(e) =>
                setResolveForm((prev) => ({ ...prev, action: e.target.value as ResolutionAction }))
              }
              fullWidth
              required
            >
              <MenuItem value="no-action">No Action Required</MenuItem>
              <MenuItem value="full-refund">Full Refund (for completed work)</MenuItem>
              <MenuItem value="partial-refund">Partial Refund (for completed work)</MenuItem>
              <MenuItem value="rework-required">Rework Required (for completed work)</MenuItem>
              <MenuItem value="compensation">Compensation</MenuItem>
              <MenuItem value="request-approved">Approve Request (for rejected requests)</MenuItem>
              <MenuItem value="re-evaluate">Re-evaluate Request (for rejected requests)</MenuItem>
            </TextField>

            {(resolveForm.action === 'partial-refund' || resolveForm.action === 'compensation') && (
              <TextField
                type="number"
                label="Refund/Compensation Amount (tokens)"
                value={resolveForm.refundAmount}
                onChange={(e) =>
                  setResolveForm((prev) => ({ ...prev, refundAmount: parseInt(e.target.value) }))
                }
                fullWidth
                required
                inputProps={{ min: 1, max: selectedComplaint?.originalTokenCost || 100 }}
                helperText={`Original cost: ${selectedComplaint?.originalTokenCost || 0} tokens`}
              />
            )}

            <TextField
              label="Resolution Notes"
              value={resolveForm.resolutionNotes}
              onChange={(e) =>
                setResolveForm((prev) => ({ ...prev, resolutionNotes: e.target.value }))
              }
              fullWidth
              required
              multiline
              rows={4}
              placeholder="Explain how the complaint was resolved and what actions were taken..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleResolveComplaint} variant="contained" color="success">
            Resolve Complaint
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Complaint</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Alert severity="warning">
              Rejecting this complaint will close it without any action. The tenant will be notified
              via email.
            </Alert>

            <TextField
              label="Admin Response"
              value={rejectForm.adminResponse}
              onChange={(e) => setRejectForm((prev) => ({ ...prev, adminResponse: e.target.value }))}
              fullWidth
              required
              multiline
              rows={4}
              placeholder="Explain why this complaint is being rejected..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRejectComplaint} variant="contained" color="error">
            Reject Complaint
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComplaintManagementDashboard;
